from fastapi import APIRouter
from app.api.dependencies import User
from app.services.pocketbase import pb
from app.services.mappers import vehicle,driver,trip

router=APIRouter(prefix="/dashboard",tags=["Dashboards"])

@router.get("/general")
async def general(user:User,region:str|None=None):
    vehicles=await pb.full_list("Vehicles"); drivers=await pb.full_list("Drivers",expand="user")
    trips=await pb.full_list("Trips",sort="-created",expand="vehicle,driver,driver.user")
    counts={status:sum(v.get("status")==status for v in vehicles) for status in ("Available","On_Trip","In_Shop","Retired")}
    usable=max(1,len(vehicles)-counts["Retired"])
    return {"kpis":{"activeVehicles":len(vehicles)-counts["Retired"],"availableVehicles":counts["Available"],
        "vehiclesInMaintenance":counts["In_Shop"],"activeTrips":sum(t.get("status")=="Dispatched" for t in trips),
        "pendingTrips":sum(t.get("status")=="Draft" for t in trips),"driversOnDuty":sum(d.get("status")=="On_Trip" for d in drivers),
        "fleetUtilizationPercent":round(100*counts["On_Trip"]/usable,2)},
        "vehicleStatusChart":[{"label":k.upper(),"value":v} for k,v in counts.items()],"recentTrips":[trip(t) for t in trips[:5]]}

@router.get("/dispatcher")
async def dispatcher(user:User):
    trips=await pb.full_list("Trips",sort="-created",expand="vehicle,driver,driver.user")
    vehicles=await pb.full_list("Vehicles",filter='status="Available"'); drivers=await pb.full_list("Drivers",filter='status="Available"',expand="user")
    return {"draftedTrips":[trip(x) for x in trips if x.get("status")=="Draft"],"activeTrips":[trip(x) for x in trips if x.get("status")=="Dispatched"],
        "completedTrips":[trip(x) for x in trips if x.get("status")=="Completed"],"availableVehicles":[vehicle(x) for x in vehicles],
        "availableDrivers":[driver(x) for x in drivers]}
