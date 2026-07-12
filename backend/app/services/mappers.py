from typing import Any
from app.normalizers import DRIVER_STATUSES as PB_DRIVER_STATUS, EXPENSE_TYPES as PB_EXPENSE_TYPE, TRIP_STATUSES as PB_TRIP_STATUS, VEHICLE_STATUSES as PB_VEHICLE_STATUS, api_enum

_api_status=api_enum


def vehicle(record: dict[str, Any]) -> dict[str, Any]:
    return {"id":record.get("id"), "registrationNumber":record.get("registrationNumber"), "model":record.get("model"),
            "type":record.get("vehileType"), "capacityKg":record.get("capacityKg",0), "odometer":record.get("odometer",0),
            "acquisitionCost":record.get("acquisitionCost",0), "status":_api_status(record.get("status"))}


def driver(record: dict[str, Any]) -> dict[str, Any]:
    user = record.get("expand",{}).get("user",{})
    return {"id":record.get("id"), "name":user.get("name") or record.get("address") or "", "licenseNumber":record.get("licenseNumber"),
            "licenseCategory":record.get("licenseCategory"), "expiryDate":record.get("expiryDate","")[:10],
            "contact":user.get("phone") or record.get("emergencyContact") or "", "safetyScore":record.get("safetyScore",100),
            "status":_api_status(record.get("status"))}


def trip(record: dict[str, Any]) -> dict[str, Any]:
    expand=record.get("expand",{})
    return {"id":record.get("id"), "source":record.get("source"), "destination":record.get("destination"),
            "vehicle":vehicle(expand.get("vehicle",{})) if expand.get("vehicle") else {"id":record.get("vehicle")},
            "driver":driver(expand.get("driver",{})) if expand.get("driver") else {"id":record.get("driver")},
            "cargoWeight":record.get("cargoWeight",0), "plannedDistance":record.get("plannedDistance",0),
            "status":_api_status(record.get("status")), "dispatchTime":record.get("dispatchTime") or None,
            "completeTime":record.get("completionTime") or None, "etaMinutes":record.get("etaMinutes")}


def maintenance(record: dict[str, Any]) -> dict[str, Any]:
    expanded=record.get("expand",{}).get("vehicle")
    return {"id":record.get("id"), "vehicle":vehicle(expanded) if expanded else {"id":record.get("vehicle")},
            "serviceType":record.get("serviceType"), "cost":record.get("finalCost") or record.get("expectedCost") or 0,
            "date":(record.get("startDate") or record.get("created") or "")[:10], "status":_api_status(record.get("status"))}


def expense(record: dict[str, Any]) -> dict[str, Any]:
    return {"id":record.get("id"), "vehicleId":record.get("vehicle"), "tripId":record.get("trip") or None,
            "type":_api_status(record.get("type")), "amount":record.get("amount",0), "liters":record.get("liters"),
            "date":(record.get("date") or record.get("created") or "")[:10], "notes":record.get("notes")}


def paginated(raw: dict[str, Any], mapper) -> dict[str, Any]:
    return {"meta":{k:int(raw.get(k,0)) for k in ("page","perPage","totalItems","totalPages")},
            "items":[mapper(item) for item in raw.get("items",[])]}
