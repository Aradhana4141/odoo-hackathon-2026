from typing import Annotated
from fastapi import APIRouter,Depends,status
from app.api.common import paging,with_defaults
from app.api.dependencies import DriverManager,User
from app.models import DriverIn,DriverStatusIn
from app.services.pocketbase import pb
from app.services.mappers import PB_DRIVER_STATUS,driver,paginated

router=APIRouter(prefix="/drivers",tags=["Drivers"])

@router.get("")
async def list_drivers(user:User,params:Annotated[dict,Depends(paging)]):
    return paginated(await pb.list("Drivers",**with_defaults(params,expand="user")),driver)

@router.post("",status_code=status.HTTP_201_CREATED)
async def create_driver(body:DriverIn,user:DriverManager):
    data={"licenseNumber":body.license_number,"licenseCategory":body.license_category,"expiryDate":body.expiry_date.isoformat(),
          "status":"Available","safetyScore":100,"address":body.name,"emergencyContact":body.contact}
    return driver(await pb.create("Drivers",data,expand="user"))

@router.get("/{id}")
async def get_driver(id:str,user:User): return driver(await pb.get("Drivers",id,expand="user"))

@router.put("/{id}")
async def update_driver(id:str,body:DriverIn,user:DriverManager):
    data={"licenseNumber":body.license_number,"licenseCategory":body.license_category,"expiryDate":body.expiry_date.isoformat(),"address":body.name,"emergencyContact":body.contact}
    return driver(await pb.update("Drivers",id,data,expand="user"))

@router.patch("/{id}/status")
async def change_status(id:str,body:DriverStatusIn,user:DriverManager):
    return driver(await pb.update("Drivers",id,{"status":PB_DRIVER_STATUS[body.status.value]},expand="user"))

@router.delete("/{id}",status_code=204)
async def delete_driver(id:str,user:DriverManager):
    record=await pb.get("Drivers",id)
    if record.get("status")=="On_Trip":
        from fastapi import HTTPException
        raise HTTPException(409,"An on-trip driver cannot be deleted")
    await pb.delete("Drivers",id)
