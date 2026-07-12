from pydantic import BaseModel
from typing import Optional


class FuelLogCreate(BaseModel):
    vehicle: str
    litres: float
    cost: float
    odometer: int


class FuelLogUpdate(BaseModel):
    litres: Optional[float] = None
    cost: Optional[float] = None
    odometer: Optional[int] = None