from asyncio import Lock
from datetime import datetime, timezone
import random
from typing import Any


class FleetLocationStore:
    """Latest GPS fix per vehicle.

    This hackathon implementation is process-local because Fleet_Locations is
    not present in the supplied PocketBase schema. Replace these methods with
    PocketBase create/list calls when that collection is added.
    """

    def __init__(self) -> None:
        self._positions: dict[str, dict[str, Any]] = {}
        self._lock = Lock()

    async def update(self, data: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            self._positions[data["vehicleId"]] = data
            return data.copy()

    async def list(self) -> list[dict[str, Any]]:
        async with self._lock:
            return [position.copy() for position in self._positions.values()]


locations = FleetLocationStore()


def random_gps_coordinate(latitude:float=12.9716,longitude:float=77.5946,max_offset_meters:float=250)->tuple[float,float]:
    """Return a believable random point near a base coordinate for demos."""
    lat_delta=random.uniform(-max_offset_meters,max_offset_meters)/111_320
    lon_scale=max(0.1,abs(__import__("math").cos(__import__("math").radians(latitude))))
    lon_delta=random.uniform(-max_offset_meters,max_offset_meters)/(111_320*lon_scale)
    return round(latitude+lat_delta,6),round(longitude+lon_delta,6)
