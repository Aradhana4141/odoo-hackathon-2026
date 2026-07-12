import pytest
from pydantic import ValidationError
from app.models import CompleteTripIn,TripIn,VehicleIn


def test_openapi_aliases_are_accepted():
    item=TripIn.model_validate({"source":"A","destination":"B","vehicleId":"v","driverId":"d","cargoWeight":10,"plannedDistance":20})
    assert item.vehicle_id=="v" and item.cargo_weight==10


def test_negative_capacity_is_rejected():
    with pytest.raises(ValidationError):
        VehicleIn.model_validate({"registrationNumber":"X","model":"M","type":"Van","capacityKg":-1,"acquisitionCost":1})


def test_zero_fuel_is_rejected_to_avoid_division_by_zero():
    with pytest.raises(ValidationError):
        CompleteTripIn.model_validate({"finalOdometer":2,"fuelConsumed":0,"fuelCost":0})
