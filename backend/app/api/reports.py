from collections import defaultdict
from fastapi import APIRouter
from app.api.dependencies import Finance
from app.services.pocketbase import pb
from app.services.mappers import vehicle

router=APIRouter(prefix="/reports",tags=["Reports"])

@router.get("/analytics")
async def analytics(user:Finance,month:str|None=None):
    vehicles=await pb.full_list("Vehicles"); expenses=await pb.full_list("Expenses"); fuels=await pb.full_list("Fuel_Logs"); trips=await pb.full_list("Trips")
    if month:
        expenses=[x for x in expenses if (x.get("date") or x.get("created") or "").startswith(month)]
        fuels=[x for x in fuels if (x.get("filledAt") or x.get("created") or "").startswith(month)]
        trips=[x for x in trips if (x.get("completionTime") or x.get("created") or "").startswith(month)]
    cost=defaultdict(float); revenue=defaultdict(float)
    for item in expenses: cost[item.get("vehicle")]+=float(item.get("amount") or 0)
    total_distance=sum(float(x.get("actualDistance") or 0) for x in trips if x.get("status")=="Completed")
    total_liters=sum(float(x.get("liters") or 0) for x in fuels)
    active=sum(x.get("status")=="On_Trip" for x in vehicles); usable=max(1,sum(x.get("status")!="Retired" for x in vehicles))
    monthly=defaultdict(float)
    for stat in await pb.full_list("Dashboard_Stats"):
        monthly[stat.get("month")]+=float(stat.get("totalRevenue") or 0)
    rois=[]
    for item in vehicles:
        acquisition=float(item.get("acquisitionCost") or 0); net=revenue[item.get("id")]-cost[item.get("id")]
        rois.append({"vehicle":vehicle(item),"roiPercent":round(100*net/acquisition,2) if acquisition else 0})
    return {"kpis":{"fuelEfficiencyAvg":round(total_distance/total_liters,2) if total_liters else 0,
        "fleetUtilization":round(100*active/usable,2),"totalOperationalCost":round(sum(cost.values()),2),"totalRevenue":round(sum(monthly.values()),2)},
        "monthlyRevenueChart":[{"label":k,"value":v} for k,v in sorted(monthly.items())],
        "costliestVehiclesChart":[{"label":next((v.get("registrationNumber") for v in vehicles if v.get("id")==k),k),"value":v} for k,v in sorted(cost.items(),key=lambda x:x[1],reverse=True)[:10]],
        "vehicleROI":rois}
