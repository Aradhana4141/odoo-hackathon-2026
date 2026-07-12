from pydantic import BaseModel
from typing import Optional


class MaintenanceCreate(BaseModel):
    vehicle: str
    issue: str
    description: str
    status: str = "Pending"


class MaintenanceUpdate(BaseModel):
    issue: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None