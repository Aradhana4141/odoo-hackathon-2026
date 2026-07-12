from fastapi import APIRouter
from app.api import ai,auth,dashboard,drivers,expenses,locations,maintenance,reports,trips,uploads,vehicles

router=APIRouter()
for child in (auth,dashboard,vehicles,drivers,trips,maintenance,expenses,reports,uploads,locations,ai): router.include_router(child.router)
