from datetime import date,datetime
from fastapi import APIRouter
from app.api.dependencies import User
from app.services.pocketbase import pb

router=APIRouter(prefix="/ai",tags=["AI Readiness"])

@router.get("/fleet-readiness/{vehicle_id}")
async def fleet_readiness(vehicle_id:str,user:User):
    vehicle=await pb.get("Vehicles",vehicle_id)
    logs=await pb.full_list("Maintenance",filter=f'vehicle="{vehicle_id}"',sort="-completedDate")
    incidents=await pb.full_list("Incidents",filter=f'vehicle="{vehicle_id}" && status!="Resolved"')
    score=100; reasons=[]
    if vehicle.get("status") in ("In_Shop","Retired"): score-=70; reasons.append(f"vehicle status is {vehicle.get('status')}")
    active=[x for x in logs if x.get("status")=="Active"]
    if active: score-=50; reasons.append("active maintenance exists")
    latest=next((x for x in logs if x.get("status")=="Completed"),None)
    if latest:
        raw=(latest.get("completedDate") or "")[:10]
        if raw:
            age=(date.today()-date.fromisoformat(raw)).days
            if age>180: score-=25; reasons.append(f"last service was {age} days ago")
    else: score-=20; reasons.append("no completed maintenance history")
    score-=min(30,len(incidents)*10)
    if incidents: reasons.append(f"{len(incidents)} unresolved incident(s)")
    score=max(0,score)
    return {"vehicleId":vehicle_id,"safeToDispatch":score>=70 and vehicle.get("status")=="Available","readinessScore":score,
            "riskLevel":"LOW" if score>=80 else "MEDIUM" if score>=50 else "HIGH","reasons":reasons or ["no material risk indicators"],
            "model":"rules-v1","extensionPoint":"Replace app/api/ai.py scoring with an ML/LLM provider when training data is available."}

@router.get("/driver-risk/{driver_id}")
async def driver_risk(driver_id:str,user:User):
    driver=await pb.get("Drivers",driver_id); incidents=await pb.full_list("Incidents",filter=f'driver="{driver_id}"')
    expiry=(driver.get("expiryDate") or "")[:10]; days=(date.fromisoformat(expiry)-date.today()).days if expiry else -1
    risk=max(0,100-float(driver.get("safetyScore") or 0))+min(40,len(incidents)*8)+(50 if days<0 else 20 if days<30 else 0)
    return {"driverId":driver_id,"riskScore":min(100,round(risk,1)),"licenseDaysRemaining":days,"incidentCount":len(incidents),"model":"rules-v1"}
