from __future__ import annotations
from datetime import date as Date, datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class Model(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class VehicleStatus(str, Enum):
    AVAILABLE="AVAILABLE"; ON_TRIP="ON_TRIP"; IN_SHOP="IN_SHOP"; RETIRED="RETIRED"
class DriverStatus(str, Enum):
    AVAILABLE="AVAILABLE"; ON_TRIP="ON_TRIP"; OFF_DUTY="OFF_DUTY"; SUSPENDED="SUSPENDED"
class TripStatus(str, Enum):
    DRAFT="DRAFT"; DISPATCHED="DISPATCHED"; COMPLETED="COMPLETED"; CANCELLED="CANCELLED"
class ExpenseType(str, Enum):
    FUEL="FUEL"; TOLL="TOLL"; MAINTENANCE="MAINTENANCE"; OTHER="OTHER"


class VehicleIn(Model):
    registration_number: str = Field(alias="registrationNumber", min_length=1)
    model: str
    type: str
    capacity_kg: float = Field(alias="capacityKg", gt=0)
    odometer: int = Field(default=0, ge=0)
    acquisition_cost: float = Field(alias="acquisitionCost", ge=0)


class DriverIn(Model):
    name: str
    license_number: str = Field(alias="licenseNumber")
    license_category: str = Field(alias="licenseCategory")
    expiry_date: Date = Field(alias="expiryDate")
    contact: str


class DriverStatusIn(Model):
    status: DriverStatus


class TripIn(Model):
    source: str
    destination: str
    vehicle_id: str = Field(alias="vehicleId")
    driver_id: str = Field(alias="driverId")
    cargo_weight: float = Field(alias="cargoWeight", gt=0)
    planned_distance: float = Field(alias="plannedDistance", gt=0)


class CompleteTripIn(Model):
    final_odometer: int = Field(alias="finalOdometer", ge=0)
    fuel_consumed: float = Field(alias="fuelConsumed", gt=0)
    fuel_cost: float = Field(alias="fuelCost", ge=0)
    toll_expenses: float = Field(default=0, alias="tollExpenses", ge=0)


class MaintenanceIn(Model):
    vehicle_id: str = Field(alias="vehicleId")
    service_type: str = Field(alias="serviceType")
    expected_cost: float = Field(alias="expectedCost", ge=0)
    date: Date | None = None


class CompleteMaintenanceIn(Model):
    final_cost: float = Field(alias="finalCost", ge=0)
    notes: str | None = None


class ExpenseIn(Model):
    vehicle_id: str = Field(alias="vehicleId")
    trip_id: str | None = Field(default=None, alias="tripId")
    type: ExpenseType
    amount: float = Field(ge=0)
    liters: float | None = Field(default=None, gt=0)
    date: Date
    notes: str | None = None


class FleetLocationIn(Model):
    vehicle_id: str = Field(alias="vehicleId")
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    speed_kph: float | None = Field(default=None, alias="speedKph", ge=0)
    heading: float | None = Field(default=None, ge=0, lt=360)
    accuracy_meters: float | None = Field(default=None, alias="accuracyMeters", ge=0)
    recorded_at: datetime | None = Field(default=None, alias="recordedAt")


class FleetAssistantRequest(Model):
    question: str = Field(min_length=3, max_length=1000)
