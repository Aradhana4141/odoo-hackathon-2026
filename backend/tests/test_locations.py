import pytest
from pydantic import ValidationError
from app.models import FleetLocationIn
from app.services.locations import FleetLocationStore,random_gps_coordinate


def test_location_coordinate_validation():
    with pytest.raises(ValidationError):
        FleetLocationIn.model_validate({"vehicleId":"v1","latitude":91,"longitude":77})


@pytest.mark.asyncio
async def test_location_store_keeps_latest_fix_only():
    store=FleetLocationStore()
    await store.update({"vehicleId":"v1","latitude":10})
    await store.update({"vehicleId":"v1","latitude":11})
    result=await store.list()
    assert len(result)==1 and result[0]["latitude"]==11


def test_random_gps_coordinate_stays_near_base():
    lat,lon=random_gps_coordinate(12.9716,77.5946,250)
    assert abs(lat-12.9716)<0.003 and abs(lon-77.5946)<0.003
