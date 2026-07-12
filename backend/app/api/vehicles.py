from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.common import paging
from app.api.dependencies import FleetManager,User
from app.models import VehicleIn
from app.services.pocketbase import pb
from app.services.mappers import PB_VEHICLE_STATUS, paginated, vehicle

router=APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("")
async def list_vehicles(user: User, params: Annotated[dict,Depends(paging)]):
    return paginated(await pb.list("Vehicles",**params),vehicle)

@router.post("",status_code=status.HTTP_201_CREATED)
async def create_vehicle(body: VehicleIn,user: FleetManager):
    duplicate=await pb.list("Vehicles",filter=f'registrationNumber="{body.registration_number}"',perPage=1)
    if duplicate.get("totalItems",0): raise HTTPException(409,"Registration number already exists")
    data={"registrationNumber":body.registration_number,"model":body.model,"vehileType":body.type,"capacityKg":body.capacity_kg,
          "odometer":body.odometer,"acquisitionCost":body.acquisition_cost,"status":"Available"}
    return vehicle(await pb.create("Vehicles",data))

@router.get("/{id}")
async def get_vehicle(id:str,user:User): return vehicle(await pb.get("Vehicles",id))

@router.put("/{id}")
async def update_vehicle(id:str,body:VehicleIn,user:FleetManager):
    duplicate=await pb.list("Vehicles",filter=f'registrationNumber="{body.registration_number}" && id!="{id}"',perPage=1)
    if duplicate.get("totalItems",0): raise HTTPException(409,"Registration number already exists")
    return vehicle(await pb.update("Vehicles",id,{"registrationNumber":body.registration_number,"model":body.model,"vehileType":body.type,
        "capacityKg":body.capacity_kg,"odometer":body.odometer,"acquisitionCost":body.acquisition_cost}))

@router.delete("/{id}",status_code=204)
async def delete_vehicle(id:str,user:FleetManager):
    record=await pb.get("Vehicles",id)
    if record.get("status") in ("On_Trip","In_Shop"):
        raise HTTPException(409,"On-trip or in-shop vehicles cannot be deleted")
    active=await pb.list("Trips",filter=f'vehicle="{id}" && (status="Draft" || status="Dispatched")',perPage=1)
    if active.get("totalItems",0): raise HTTPException(409,"Vehicle has an active trip")
    await pb.delete("Vehicles",id)
