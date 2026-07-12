from datetime import date,datetime,timezone
from typing import Annotated
from fastapi import APIRouter,Depends,HTTPException,status
from app.api.common import paging,with_defaults
from app.api.dependencies import FleetManager,User
from app.models import MaintenanceIn,CompleteMaintenanceIn
from app.services.pocketbase import pb
from app.services.mappers import maintenance,paginated

router=APIRouter(prefix="/maintenance",tags=["Maintenance"])

@router.get("")
async def list_maintenance(user:User,params:Annotated[dict,Depends(paging)]): return paginated(await pb.list("Maintenance",**with_defaults(params,expand="vehicle")),maintenance)

@router.post("",status_code=status.HTTP_201_CREATED)
async def start_maintenance(body:MaintenanceIn,user:FleetManager):
    vehicle=await pb.get("Vehicles",body.vehicle_id)
    if vehicle.get("status") in ("On_Trip","Retired"): raise HTTPException(400,"On-trip or retired vehicles cannot enter maintenance")
    active=await pb.list("Maintenance",filter=f'vehicle="{body.vehicle_id}" && status="Active"',perPage=1)
    if active.get("totalItems",0): raise HTTPException(409,"Vehicle already has active maintenance")
    await pb.update("Vehicles",body.vehicle_id,{"status":"In_Shop"})
    record=await pb.create("Maintenance",{"vehicle":body.vehicle_id,"serviceType":body.service_type,"status":"Active",
        "expectedCost":body.expected_cost,"startDate":(body.date or date.today()).isoformat()},expand="vehicle")
    return maintenance(record)

@router.post("/{id}/complete")
async def complete_maintenance(id:str,body:CompleteMaintenanceIn,user:FleetManager):
    record=await pb.get("Maintenance",id)
    if record.get("status")!="Active": raise HTTPException(400,"Maintenance is already closed")
    now=datetime.now(timezone.utc).isoformat()
    updated=await pb.update("Maintenance",id,{"status":"Completed","finalCost":body.final_cost,"completedDate":now,"notes":body.notes or record.get("notes")},expand="vehicle")
    vehicle=await pb.get("Vehicles",record["vehicle"])
    if vehicle.get("status")!="Retired": await pb.update("Vehicles",record["vehicle"],{"status":"Available"})
    await pb.create("Expenses",{"vehicle":record["vehicle"],"type":"Maintenance","amount":body.final_cost,"date":now,"notes":body.notes})
    return maintenance(updated)
