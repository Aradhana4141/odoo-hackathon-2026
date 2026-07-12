from pydantic import BaseModel
from typing import Optional
from datetime import date


class DriverCreate(BaseModel):
    name: str
    phone: str
    licenseNumber: str
    licenseExpiry: date
    status: str = "Available"


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    licenseNumber: Optional[str] = None
    licenseExpiry: Optional[date] = None
    status: Optional[str] = None