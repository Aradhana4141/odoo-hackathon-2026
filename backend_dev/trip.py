from pydantic import BaseModel
from typing import Optional


class TripCreate(BaseModel):
    tripNumber: str
    vehicle: str
    driver: str
    origin: str
    destination: str
    cargoWeight: float
    status: str = "Scheduled"


class TripUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    cargoWeight: Optional[float] = None
    status: Optional[str] = None