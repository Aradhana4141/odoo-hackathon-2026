from pydantic import BaseModel, Field
from typing import Optional


class VehicleCreate(BaseModel):
    registrationNumber: str = Field(..., min_length=3)
    vehicleType: str
    model: str
    manufacturer: str
    capacity: int
    fuelType: str
    status: str = "Available"


class VehicleUpdate(BaseModel):
    registrationNumber: Optional[str] = None
    vehicleType: Optional[str] = None
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    capacity: Optional[int] = None
    fuelType: Optional[str] = None
    status: Optional[str] = None