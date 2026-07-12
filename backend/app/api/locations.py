import asyncio,json,random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.api.dependencies import Dispatcher, User
from app.config import get_settings
from app.models import FleetLocationIn
from app.services.locations import locations,random_gps_coordinate
from app.services.pocketbase import pb

router = APIRouter(prefix="/fleet-locations", tags=["Fleet GPS"])
settings=get_settings()


@router.post("", status_code=202)
async def publish_location(body: FleetLocationIn, user: Dispatcher):
    """Publish the latest GPS fix from a driver's phone or vehicle tracker."""
    vehicle = await pb.get("Vehicles", body.vehicle_id)
    recorded_at = body.recorded_at or datetime.now(timezone.utc)
    position = {
        "vehicleId": body.vehicle_id,
        "registrationNumber": vehicle.get("registrationNumber"),
        "model": vehicle.get("model"),
        "status": (vehicle.get("status") or "").upper(),
        "latitude": body.latitude,
        "longitude": body.longitude,
        "speedKph": body.speed_kph,
        "heading": body.heading,
        "accuracyMeters": body.accuracy_meters,
        "recordedAt": recorded_at.astimezone(timezone.utc).isoformat(),
        "receivedAt": datetime.now(timezone.utc).isoformat(),
        "reportedBy": user.get("id"),
    }
    return await locations.update(position)


@router.get("")
async def list_fleet_locations(user: User, activeOnly: bool = Query(False)):
    """Return one latest position per vehicle for a five-second map poll."""
    positions = await locations.list()
    if activeOnly:
        positions = [item for item in positions if item.get("status") == "ON_TRIP"]
    now = datetime.now(timezone.utc)
    for item in positions:
        recorded = datetime.fromisoformat(item["recordedAt"].replace("Z", "+00:00"))
        age = max(0, int((now - recorded).total_seconds()))
        item["ageSeconds"] = age
        item["isStale"] = age > 30
    return {"refreshAfterSeconds": settings.gps_refresh_seconds, "count": len(positions), "items": positions}


@router.post("/simulate")
async def simulate_locations(
    user:Dispatcher,vehicleId:str|None=None,latitude:float=Query(12.9716,ge=-90,le=90),longitude:float=Query(77.5946,ge=-180,le=180)
):
    """Generate demo positions; replace this publisher with IoT input later."""
    vehicles=[await pb.get("Vehicles",vehicleId)] if vehicleId else await pb.full_list("Vehicles")
    now=datetime.now(timezone.utc).isoformat(); generated=[]
    for index,vehicle in enumerate(vehicles):
        lat,lon=random_gps_coordinate(latitude+index*0.002,longitude+index*0.002)
        item={"vehicleId":vehicle["id"],"registrationNumber":vehicle.get("registrationNumber"),"model":vehicle.get("model"),
              "status":(vehicle.get("status") or "").upper(),"latitude":lat,"longitude":lon,"speedKph":round(random.uniform(0,65),1),
              "heading":round(random.uniform(0,359),1),"accuracyMeters":8,"recordedAt":now,"receivedAt":now,"reportedBy":user.get("id"),"source":"SIMULATOR"}
        generated.append(await locations.update(item))
    return {"generated":len(generated),"items":generated}


@router.get("/stream")
async def stream_fleet_locations(user:User):
    """Server-Sent Events stream emitting the latest fleet snapshot."""
    async def events():
        while True:
            items=await locations.list()
            payload={"count":len(items),"items":items,"sentAt":datetime.now(timezone.utc).isoformat()}
            yield f"event: fleet-location\ndata: {json.dumps(payload)}\n\n"
            await asyncio.sleep(settings.gps_refresh_seconds)
    return StreamingResponse(events(),media_type="text/event-stream",headers={"Cache-Control":"no-cache","X-Accel-Buffering":"no"})


@router.get("/{vehicle_id}")
async def get_vehicle_location(vehicle_id: str, user: User):
    positions = await locations.list()
    position = next((item for item in positions if item["vehicleId"] == vehicle_id), None)
    if position is None:
        raise HTTPException(404, "No GPS fix has been received for this vehicle")
    return position
