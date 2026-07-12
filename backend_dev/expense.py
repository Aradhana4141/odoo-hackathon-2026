from pydantic import BaseModel
from typing import Optional


class ExpenseCreate(BaseModel):
    vehicle: str
    amount: float
    expenseType: str
    description: str


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    expenseType: Optional[str] = None
    description: Optional[str] = None