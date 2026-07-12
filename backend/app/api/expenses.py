from typing import Annotated
from fastapi import APIRouter,Depends,status
from app.api.common import paging
from app.api.dependencies import Finance,User
from app.models import ExpenseIn
from app.services.pocketbase import pb
from app.services.mappers import PB_EXPENSE_TYPE,expense,paginated

router=APIRouter(prefix="/expenses",tags=["Expenses"])

@router.get("")
async def list_expenses(user:User,params:Annotated[dict,Depends(paging)]): return paginated(await pb.list("Expenses",**params),expense)

@router.post("",status_code=status.HTTP_201_CREATED)
async def create_expense(body:ExpenseIn,user:Finance):
    data={"vehicle":body.vehicle_id,"trip":body.trip_id,"type":PB_EXPENSE_TYPE[body.type.value],"amount":body.amount,
          "liters":body.liters,"date":body.date.isoformat(),"notes":body.notes}
    return expense(await pb.create("Expenses",data))
