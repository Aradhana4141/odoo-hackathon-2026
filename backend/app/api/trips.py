from datetime import datetime,timezone
from typing import Annotated
from uuid import uuid4
from fastapi import APIRouter,Depends,HTTPException,status
from app.api.common import paging,with_defaults
from app.api.dependencies import Dispatcher,User
from app.models import TripIn,CompleteTripIn
from app.services.pocketbase import pb
from app.services.mappers import paginated,trip

router=APIRouter(prefix="/trips",tags=["Trips"])
EXPAND="vehicle,driver,driver.user"

async def details(id:str): return trip(await pb.get("Trips",id,expand=EXPAND))

@router.get("")
async def list_trips(user:User,params:Annotated[dict,Depends(paging)]):
    return paginated(await pb.list("Trips",**with_defaults(params,expand=EXPAND)),trip)

@router.post("",status_code=status.HTTP_201_CREATED)
async def create_trip(body:TripIn,user:Dispatcher):
    vehicle=await pb.get("Vehicles",body.vehicle_id); driver=await pb.get("Drivers",body.driver_id)
    if body.cargo_weight>float(vehicle.get("capacityKg",0)): raise HTTPException(400,"Cargo weight exceeds vehicle capacity")
    if vehicle.get("status") in ("In_Shop","Retired"): raise HTTPException(400,"Vehicle cannot be selected for dispatch")
    record=await pb.create("Trips",{"tripNumber":f"TRIP-{uuid4().hex[:8].upper()}","source":body.source,"destination":body.destination,
        "vehicle":body.vehicle_id,"driver":body.driver_id,"dispatcher":user.get("id"),"cargoWeight":body.cargo_weight,
        "plannedDistance":body.planned_distance,"status":"Draft"},expand=EXPAND)
    return trip(record)

@router.get("/{id}")
async def get_trip(id:str,user:User): return await details(id)

@router.post("/{id}/dispatch")
async def dispatch_trip(id:str,user:Dispatcher):
    record=await pb.get("Trips",id); vehicle=await pb.get("Vehicles",record["vehicle"]); driver=await pb.get("Drivers",record["driver"])
    if record.get("status")!="Draft": raise HTTPException(400,"Only draft trips can be dispatched")
    if vehicle.get("status")!="Available": raise HTTPException(400,"Vehicle is not available")
    if driver.get("status")!="Available": raise HTTPException(400,"Driver is not available")
    expiry=(driver.get("expiryDate") or "")[:10]
    if not expiry or expiry < datetime.now(timezone.utc).date().isoformat(): raise HTTPException(400,"Driver license is expired")
    if float(record.get("cargoWeight",0))>float(vehicle.get("capacityKg",0)): raise HTTPException(400,"Cargo weight exceeds vehicle capacity")
    # PocketBase REST has no multi-record transaction; update resources first and
    # compensate if a later write fails.
    trip_update={"status":"Dispatched","dispatchTime":datetime.now(timezone.utc).isoformat()}
    if pb.settings.pb_batch_enabled:
        await pb.batch([pb.batch_update("Vehicles",vehicle["id"],{"status":"On_Trip"}),pb.batch_update("Drivers",driver["id"],{"status":"On_Trip"}),pb.batch_update("Trips",id,trip_update)])
        return await details(id)
    await pb.update("Vehicles",vehicle["id"],{"status":"On_Trip"})
    try:
        await pb.update("Drivers",driver["id"],{"status":"On_Trip"})
        await pb.update("Trips",id,trip_update)
    except Exception:
        await pb.update("Vehicles",vehicle["id"],{"status":"Available"})
        await pb.update("Drivers",driver["id"],{"status":"Available"})
        raise
    return await details(id)

@router.post("/{id}/complete")
async def complete_trip(id:str,body:CompleteTripIn,user:Dispatcher):
    record=await pb.get("Trips",id); vehicle=await pb.get("Vehicles",record["vehicle"])
    if record.get("status")!="Dispatched": raise HTTPException(400,"Only dispatched trips can be completed")
    if body.final_odometer<int(vehicle.get("odometer",0)): raise HTTPException(400,"Final odometer cannot decrease")
    now=datetime.now(timezone.utc).isoformat(); actual=body.final_odometer-int(vehicle.get("odometer",0))
    fuel={"vehicle":record["vehicle"],"driver":record["driver"],"trip":id,"liters":body.fuel_consumed,"pricePerLiter":body.fuel_cost/body.fuel_consumed,"totalCost":body.fuel_cost,"odometer":body.final_odometer,"filledAt":now}
    fuel_expense={"vehicle":record["vehicle"],"trip":id,"type":"Fuel","amount":body.fuel_cost,"liters":body.fuel_consumed,"date":now}
    requests=[pb.batch_create("Fuel_Logs",fuel),pb.batch_create("Expenses",fuel_expense)]
    if body.toll_expenses: requests.append(pb.batch_create("Expenses",{"vehicle":record["vehicle"],"trip":id,"type":"Toll","amount":body.toll_expenses,"date":now}))
    requests.extend([pb.batch_update("Trips",id,{"status":"Completed","completionTime":now,"actualDistance":actual}),pb.batch_update("Vehicles",record["vehicle"],{"status":"Available","odometer":body.final_odometer}),pb.batch_update("Drivers",record["driver"],{"status":"Available"})])
    if pb.settings.pb_batch_enabled: await pb.batch(requests)
    else:
        await pb.create("Fuel_Logs",fuel); await pb.create("Expenses",fuel_expense)
        if body.toll_expenses: await pb.create("Expenses",{"vehicle":record["vehicle"],"trip":id,"type":"Toll","amount":body.toll_expenses,"date":now})
        await pb.update("Trips",id,{"status":"Completed","completionTime":now,"actualDistance":actual}); await pb.update("Vehicles",record["vehicle"],{"status":"Available","odometer":body.final_odometer}); await pb.update("Drivers",record["driver"],{"status":"Available"})
    return await details(id)

@router.post("/{id}/cancel")
async def cancel_trip(id:str,user:Dispatcher):
    record=await pb.get("Trips",id)
    if record.get("status") in ("Completed","Cancelled"): raise HTTPException(400,"Trip cannot be cancelled")
    if record.get("status")=="Dispatched":
        await pb.update("Vehicles",record["vehicle"],{"status":"Available"}); await pb.update("Drivers",record["driver"],{"status":"Available"})
    await pb.update("Trips",id,{"status":"Cancelled"})
    return await details(id)
