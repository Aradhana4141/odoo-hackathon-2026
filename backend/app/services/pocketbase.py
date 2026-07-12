from __future__ import annotations
from typing import Any
import httpx
from fastapi import HTTPException
from app.config import get_settings


class PocketBase:
    """Small async PocketBase REST client.

    Authentication and data access are deliberately separate: frontend JWTs are
    verified against users/auth-refresh; locked operational collections use the
    backend-only PB_ADMIN_TOKEN from the environment.
    """

    def __init__(self) -> None:
        self.settings = get_settings()

    def _headers(self, token: str | None = None) -> dict[str, str]:
        value = token or self.settings.pb_admin_token
        if not value:
            raise HTTPException(503, "PB_ADMIN_TOKEN is required for locked TransitOps collections")
        return {"Authorization": value if value.lower().startswith("bearer ") else f"Bearer {value}"}

    async def _request(self, method: str, path: str, *, token: str | None = None, **kwargs: Any) -> Any:
        try:
            async with httpx.AsyncClient(base_url=self.settings.pb_api_url, timeout=20) as client:
                response = await client.request(method, path, headers=self._headers(token), **kwargs)
        except httpx.RequestError as exc:
            raise HTTPException(503, f"PocketBase unavailable: {exc}") from exc
        if response.status_code == 404:
            raise HTTPException(404, "Record not found")
        if response.is_error:
            try:
                detail = response.json()
            except ValueError:
                detail = response.text
            raise HTTPException(response.status_code, detail)
        if response.status_code == 204 or not response.content:
            return None
        return response.json()

    async def verify_user(self, token: str) -> dict[str, Any]:
        return await self._request("POST", f"/collections/{self.settings.auth_collection}/auth-refresh", token=token)

    async def list(self, collection: str, **params: Any) -> dict[str, Any]:
        params = {k: v for k, v in params.items() if v not in (None, "")}
        return await self._request("GET", f"/collections/{collection}/records", params=params)

    async def full_list(self, collection: str, *, filter: str | None = None, sort: str | None = None, expand: str | None = None) -> list[dict[str, Any]]:
        result = await self.list(collection, page=1, perPage=500, filter=filter, sort=sort, expand=expand)
        return result.get("items", [])

    async def get(self, collection: str, record_id: str, *, expand: str | None = None, fields: str | None = None) -> dict[str, Any]:
        return await self._request("GET", f"/collections/{collection}/records/{record_id}", params={k:v for k,v in {"expand":expand,"fields":fields}.items() if v})

    async def create(self, collection: str, data: dict[str, Any], *, expand: str | None = None, fields: str | None = None) -> dict[str, Any]:
        return await self._request("POST", f"/collections/{collection}/records", json=data, params={k:v for k,v in {"expand":expand,"fields":fields}.items() if v})

    async def update(self, collection: str, record_id: str, data: dict[str, Any], *, expand: str | None = None, fields: str | None = None) -> dict[str, Any]:
        return await self._request("PATCH", f"/collections/{collection}/records/{record_id}", json=data, params={k:v for k,v in {"expand":expand,"fields":fields}.items() if v})

    async def delete(self, collection: str, record_id: str) -> None:
        await self._request("DELETE", f"/collections/{collection}/records/{record_id}")

    async def upload(self, collection: str, record_id: str, files: list[tuple[str, tuple[str, bytes, str]]], *, expand: str | None = None) -> dict[str, Any]:
        return await self._request("PATCH", f"/collections/{collection}/records/{record_id}", files=files, params={"expand":expand} if expand else None)

    async def create_multipart(self, collection: str, data: dict[str, Any], files: list[tuple[str, tuple[str, bytes, str]]], *, expand: str | None = None) -> dict[str, Any]:
        return await self._request("POST",f"/collections/{collection}/records",data=data,files=files,params={"expand":expand} if expand else None)

    async def batch(self, requests: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not self.settings.pb_batch_enabled:
            raise HTTPException(503, "PocketBase batch API is disabled; set PB_BATCH_ENABLED=true after enabling it in PocketBase settings")
        return await self._request("POST", "/batch", json={"requests":requests})

    @staticmethod
    def batch_update(collection: str, record_id: str, body: dict[str, Any]) -> dict[str, Any]:
        return {"method":"PATCH","url":f"/api/collections/{collection}/records/{record_id}","body":body}

    @staticmethod
    def batch_create(collection: str, body: dict[str, Any]) -> dict[str, Any]:
        return {"method":"POST","url":f"/api/collections/{collection}/records","body":body}


pb = PocketBase()
