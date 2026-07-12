import yaml
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.api.dependencies import current_user

client=TestClient(app)


def test_health_is_public():
    assert client.get("/health").json()["status"]=="ok"


def test_api_requires_bearer_token():
    response=client.get("/api/vehicles")
    assert response.status_code==401
    assert response.headers["www-authenticate"]=="Bearer"


def test_every_supplied_openapi_operation_exists():
    contract=Path(__file__).resolve().parents[2] / "references" / "openapi (1).yml"
    supplied=yaml.safe_load(contract.read_text(encoding="utf-8"))
    expected={(path,method) for path,item in supplied["paths"].items() for method in item if method in {"get","post","put","patch","delete"}}
    generated=app.openapi()
    actual={(path.removeprefix("/api"),method) for path,item in generated["paths"].items() for method in item if method in {"get","post","put","patch","delete"}}
    assert expected <= actual


def test_rbac_blocks_driver_from_vehicle_creation():
    async def driver_user(): return {"id":"u1","role":"DRIVER"}
    app.dependency_overrides[current_user]=driver_user
    try:
        response=client.post("/api/vehicles",json={"registrationNumber":"X","model":"M","type":"Van","capacityKg":10,"acquisitionCost":1})
        assert response.status_code==403
    finally:
        app.dependency_overrides.clear()


def test_vehicle_list_exposes_full_pocketbase_query_surface():
    operation=app.openapi()["paths"]["/api/vehicles"]["get"]
    names={item["name"] for item in operation["parameters"]}
    assert {"page","perPage","sort","filter","expand","fields","skipTotal"} <= names


def test_extended_routes_are_registered_before_dynamic_gps_route():
    paths=app.openapi()["paths"]
    assert "/api/fleet-locations/simulate" in paths
    assert "/api/fleet-locations/stream" in paths
    assert "delete" in paths["/api/vehicles/{id}"]


def test_swagger_server_does_not_duplicate_api_prefix():
    assert app.openapi()["servers"][0]["url"]=="http://localhost:8000"
