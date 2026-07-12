from fastapi import HTTPException

VEHICLE_STATUSES={"AVAILABLE":"Available","ON_TRIP":"On_Trip","IN_SHOP":"In_Shop","RETIRED":"Retired"}
DRIVER_STATUSES={"AVAILABLE":"Available","ON_TRIP":"On_Trip","OFF_DUTY":"Off_Duty","SUSPENDED":"Suspended"}
TRIP_STATUSES={"DRAFT":"Draft","DISPATCHED":"Dispatched","COMPLETED":"Completed","CANCELLED":"Cancelled"}
EXPENSE_TYPES={"FUEL":"Fuel","TOLL":"Toll","MAINTENANCE":"Maintenance","OTHER":"Other"}
VEHICLE_TYPES={"TRUCK":"Truck","MINI_TRUCK":"Mini Truck","VAN":"Van","PICKUP":"Pickup","TRAILER":"Trailer"}


def normalize(value: str, mapping: dict[str,str], field: str) -> str:
    key=value.strip().upper().replace(" ","_")
    if key not in mapping:
        raise HTTPException(422,f"{field} must be one of: {', '.join(mapping)}")
    return mapping[key]


def vehicle_status(value:str)->str: return normalize(value,VEHICLE_STATUSES,"vehicle status")
def driver_status(value:str)->str: return normalize(value,DRIVER_STATUSES,"driver status")
def trip_status(value:str)->str: return normalize(value,TRIP_STATUSES,"trip status")
def expense_type(value:str)->str: return normalize(value,EXPENSE_TYPES,"expense type")
def vehicle_type(value:str)->str: return normalize(value,VEHICLE_TYPES,"vehicle type")


def api_enum(value: str | None) -> str | None:
    return value.upper().replace(" ","_") if value else value
