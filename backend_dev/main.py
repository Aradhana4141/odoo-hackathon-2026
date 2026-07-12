from fastapi import FastAPI

from routes.vehicle import router as vehicle_router
from routes.driver import router as driver_router
from routes.trip import router as trip_router
from routes.maintenance import router as maintenance_router
from routes.fuel import router as fuel_router
from routes.expense import router as expense_router
from routes.dashboard import router as dashboard_router

app = FastAPI(
    title="TransitOps API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "TransitOps Backend Running 🚚"
    }


app.include_router(vehicle_router)
app.include_router(driver_router)
app.include_router(trip_router)
app.include_router(maintenance_router)
app.include_router(fuel_router)
app.include_router(expense_router)
app.include_router(dashboard_router)