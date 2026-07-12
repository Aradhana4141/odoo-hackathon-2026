from typing import Any, Annotated
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.services.pocketbase import pb

bearer = HTTPBearer(auto_error=False)


async def current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]) -> dict[str, Any]:
    if credentials is None:
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    try:
        result = await pb.verify_user(credentials.credentials)
    except HTTPException as exc:
        if exc.status_code in (400, 401, 403):
            raise HTTPException(401, "Invalid or expired token", headers={"WWW-Authenticate": "Bearer"}) from exc
        raise
    return result.get("record", result)


User = Annotated[dict[str, Any], Depends(current_user)]


def require_roles(*roles: str):
    async def dependency(user: User) -> dict[str, Any]:
        if user.get("role") not in roles:
            raise HTTPException(403, f"Requires one of these roles: {', '.join(roles)}")
        return user
    return dependency


FleetManager = Annotated[dict[str, Any], Depends(require_roles("FLEET_MANAGER", "ADMIN"))]
DriverManager = Annotated[dict[str, Any], Depends(require_roles("FLEET_MANAGER", "SAFETY_OFFICER", "ADMIN"))]
Dispatcher = Annotated[dict[str, Any], Depends(require_roles("FLEET_MANAGER", "DISPATCHER", "DRIVER", "ADMIN"))]
Finance = Annotated[dict[str, Any], Depends(require_roles("FLEET_MANAGER", "FINANCIAL_ANALYST", "ADMIN"))]
