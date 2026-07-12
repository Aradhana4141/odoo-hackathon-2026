from fastapi import APIRouter
from app.api.dependencies import User

router=APIRouter(prefix="/auth",tags=["Authentication"])

@router.get("/me")
async def me(user:User):
    return {k:user.get(k) for k in ("id","email","name","role","phone","isActive")}
