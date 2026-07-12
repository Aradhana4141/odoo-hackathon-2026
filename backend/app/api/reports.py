from collections import defaultdict
import csv
from datetime import date, timedelta
from io import StringIO
from typing import Literal

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.api.dependencies import Finance
from app.config import get_settings
from app.services.mappers import vehicle
from app.services.pocketbase import pb

router = APIRouter(prefix="/reports", tags=["Reports"])
settings = get_settings()


def _csv_safe(value):
    """Prevent spreadsheet formula execution in exported text cells."""
    text = "" if value is None else str(value)
    return f"'{text}" if text.startswith(("=", "+", "-", "@")) else text


def _resolve_range(
    period: Literal["day", "week", "month", "all", "custom"],
    date_from: date | None,
    date_to: date | None,
    legacy_month: str | None,
) -> tuple[date | None, date | None]:
    if legacy_month:
        year, month_number = map(int, legacy_month.split("-"))
        start = date(year, month_number, 1)
        end = date(year + (month_number == 12), 1 if month_number == 12 else month_number + 1, 1) - timedelta(days=1)
        return start, end
    today = date.today()
    if period == "all": return None, None
    if period == "day": return today, today
    if period == "week": return today - timedelta(days=today.weekday()), today
    if period == "month": return today.replace(day=1), today
    if not date_from or not date_to:
        from fastapi import HTTPException
        raise HTTPException(422, "dateFrom and dateTo are required when period=custom")
    if date_from > date_to:
        from fastapi import HTTPException
        raise HTTPException(422, "dateFrom cannot be after dateTo")
    return date_from, date_to


def _within(value: str | None, start: date | None, end: date | None) -> bool:
    if start is None and end is None: return True
    try: item_date = date.fromisoformat((value or "")[:10])
    except ValueError: return False
    return (start is None or item_date >= start) and (end is None or item_date <= end)


@router.get("/analytics")
async def analytics(
    user: Finance,
    period: Literal["day", "week", "month", "all", "custom"] = Query("month"),
    dateFrom: date | None = None,
    dateTo: date | None = None,
    month: str | None = Query(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
):
    vehicles = await pb.full_list("Vehicles")
    expenses = await pb.full_list("Expenses")
    fuels = await pb.full_list("Fuel_Logs")
    trips = await pb.full_list("Trips")

    range_start, range_end = _resolve_range(period, dateFrom, dateTo, month)
    expenses = [x for x in expenses if _within(x.get("date") or x.get("created"), range_start, range_end)]
    fuels = [x for x in fuels if _within(x.get("filledAt") or x.get("created"), range_start, range_end)]
    trips = [x for x in trips if _within(x.get("completionTime") or x.get("created"), range_start, range_end)]

    cost = defaultdict(float)
    revenue = defaultdict(float)
    distance_by_vehicle = defaultdict(float)
    trips_by_vehicle = defaultdict(int)
    monthly_revenue = defaultdict(float)

    for expense in expenses:
        vehicle_id = expense.get("vehicle")
        if vehicle_id:
            cost[vehicle_id] += float(expense.get("amount") or 0)

    completed_trips = [trip for trip in trips if trip.get("status") == "Completed"]
    for trip in completed_trips:
        vehicle_id = trip.get("vehicle")
        distance = float(trip.get("actualDistance") or trip.get("plannedDistance") or 0)
        trip_revenue = distance * settings.revenue_rate_per_km
        if vehicle_id:
            revenue[vehicle_id] += trip_revenue
            distance_by_vehicle[vehicle_id] += distance
            trips_by_vehicle[vehicle_id] += 1
        date_value = trip.get("completionTime") or trip.get("created") or ""
        month_key = date_value[:7]
        if month_key:
            monthly_revenue[month_key] += trip_revenue

    total_distance = sum(float(trip.get("actualDistance") or trip.get("plannedDistance") or 0) for trip in completed_trips)
    total_liters = sum(float(fuel.get("liters") or 0) for fuel in fuels)
    active = sum(vehicle_record.get("status") == "On_Trip" for vehicle_record in vehicles)
    usable = max(1, sum(vehicle_record.get("status") != "Retired" for vehicle_record in vehicles))

    rois = []
    vehicle_revenue = []
    for item in vehicles:
        vehicle_id = item.get("id")
        acquisition = float(item.get("acquisitionCost") or 0)
        net = revenue[vehicle_id] - cost[vehicle_id]
        roi = round((net / acquisition) * 100, 2) if acquisition > 0 else 0
        rois.append({"vehicle": vehicle(item), "roiPercent": roi})
        vehicle_revenue.append({"vehicle":vehicle(item), "revenue":round(revenue[vehicle_id],2), "completedTrips":trips_by_vehicle[vehicle_id], "distance":round(distance_by_vehicle[vehicle_id],2)})

    costliest = []
    for vehicle_id, amount in sorted(cost.items(), key=lambda entry: entry[1], reverse=True)[:10]:
        registration = next((item.get("registrationNumber") for item in vehicles if item.get("id") == vehicle_id), vehicle_id)
        costliest.append({"label": registration, "value": round(amount, 2)})

    return {
        "kpis": {
            "fuelEfficiencyAvg": round(total_distance / total_liters, 2) if total_liters else 0,
            "fleetUtilization": round(100 * active / usable, 2),
            "totalOperationalCost": round(sum(cost.values()), 2),
            "totalRevenue": round(sum(revenue.values()), 2),
        },
        "monthlyRevenueChart": [
            {"label": month_key, "value": round(amount, 2)}
            for month_key, amount in sorted(monthly_revenue.items())
        ],
        "costliestVehiclesChart": costliest,
        "vehicleROI": rois,
        "vehicleRevenue": sorted(vehicle_revenue, key=lambda item:item["revenue"], reverse=True),
        "revenueRatePerKm": settings.revenue_rate_per_km,
        "period": {"type":"month" if month else period, "dateFrom":range_start.isoformat() if range_start else None, "dateTo":range_end.isoformat() if range_end else None},
    }


@router.get("/export/csv")
async def export_trips_csv(
    user: Finance,
    period: Literal["day", "week", "month", "all", "custom"] = Query("month"),
    dateFrom: date | None = None,
    dateTo: date | None = None,
):
    trips = await pb.full_list("Trips", sort="-created")
    vehicles = await pb.full_list("Vehicles")
    expenses = await pb.full_list("Expenses", sort="-date")
    range_start, range_end = _resolve_range(period, dateFrom, dateTo, None)
    trips = [trip for trip in trips if _within(trip.get("completionTime") or trip.get("created"), range_start, range_end)]
    expenses = [expense for expense in expenses if _within(expense.get("date") or expense.get("created"), range_start, range_end)]
    registrations = {item.get("id"):item.get("registrationNumber") for item in vehicles}
    expenses_by_trip = defaultdict(list)
    for expense in expenses:
        if expense.get("trip"):
            expenses_by_trip[expense["trip"]].append(expense)
    output = StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["Record Type", "Trip Number", "Vehicle Registration", "Source", "Destination", "Status", "Date", "Distance (km)", "Rate Per Km", "Revenue", "Fuel Expense", "Toll Expense", "Maintenance Expense", "Other Expense", "Total Expenses", "Net Profit", "Notes"])

    for trip in trips:
        distance = float(trip.get("actualDistance") or trip.get("plannedDistance") or 0)
        revenue = distance * settings.revenue_rate_per_km if trip.get("status") == "Completed" else 0
        breakdown = defaultdict(float)
        for expense in expenses_by_trip.get(trip.get("id"), []):
            breakdown[str(expense.get("type") or "Other")] += float(expense.get("amount") or 0)
        total_expenses = sum(breakdown.values())
        writer.writerow([
            "TRIP",
            _csv_safe(trip.get("tripNumber")),
            _csv_safe(registrations.get(trip.get("vehicle"), trip.get("vehicle"))),
            _csv_safe(trip.get("source")),
            _csv_safe(trip.get("destination")),
            _csv_safe(trip.get("status")),
            _csv_safe(trip.get("completionTime") or ""),
            distance,
            settings.revenue_rate_per_km,
            round(revenue, 2),
            round(breakdown["Fuel"], 2),
            round(breakdown["Toll"], 2),
            round(breakdown["Maintenance"], 2),
            round(breakdown["Other"], 2),
            round(total_expenses, 2),
            round(revenue - total_expenses, 2),
            _csv_safe(trip.get("remarks")),
        ])

    for expense in (item for item in expenses if not item.get("trip")):
        amount = float(expense.get("amount") or 0)
        expense_type = str(expense.get("type") or "Other")
        breakdown = {"Fuel":0.0, "Toll":0.0, "Maintenance":0.0, "Other":0.0}
        breakdown[expense_type if expense_type in breakdown else "Other"] = amount
        writer.writerow([
            "UNASSIGNED_EXPENSE", "", _csv_safe(registrations.get(expense.get("vehicle"), expense.get("vehicle"))),
            "", "", _csv_safe(expense_type), _csv_safe(expense.get("date") or expense.get("created")),
            0, settings.revenue_rate_per_km, 0,
            round(breakdown["Fuel"],2), round(breakdown["Toll"],2), round(breakdown["Maintenance"],2), round(breakdown["Other"],2),
            round(amount,2), round(-amount,2), _csv_safe(expense.get("notes")),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="trips.csv"'},
    )
