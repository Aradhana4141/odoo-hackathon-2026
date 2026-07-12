import pytest
from datetime import date
from app.api import reports
from app.api.dependencies import current_user
from app.main import app
from fastapi.testclient import TestClient


class FakePB:
    async def full_list(self, collection, **kwargs):
        return {
            "Vehicles":[{"id":"v1","registrationNumber":"KA-1","model":"Van","vehileType":"Van","capacityKg":100,"odometer":0,"acquisitionCost":10000,"status":"Available"}],
            "Expenses":[{"vehicle":"v1","trip":"t1","type":"Fuel","amount":100,"date":"2026-07-10"},{"vehicle":"v1","type":"Maintenance","amount":50,"date":"2026-07-10","notes":"Oil"}],
            "Fuel_Logs":[{"vehicle":"v1","liters":10,"filledAt":"2026-07-10"}],
            "Trips":[{"id":"t1","tripNumber":"T-1","vehicle":"v1","source":"A","destination":"B","status":"Completed","actualDistance":100,"completionTime":"2026-07-10"}],
        }[collection]


@pytest.mark.asyncio
async def test_analytics_uses_completed_distance_revenue(monkeypatch):
    monkeypatch.setattr(reports,"pb",FakePB())
    result=await reports.analytics(user={"role":"ADMIN"},month="2026-07")
    assert result["kpis"]["totalRevenue"]==5000
    assert result["kpis"]["fuelEfficiencyAvg"]==10
    assert result["vehicleROI"][0]["roiPercent"]==48.5
    assert result["vehicleRevenue"][0]["revenue"]==5000
    assert result["vehicleRevenue"][0]["completedTrips"]==1


def test_csv_formula_values_are_escaped():
    assert reports._csv_safe("=HYPERLINK('bad')").startswith("'")
    assert reports._csv_safe("Normal") == "Normal"


def test_custom_revenue_range():
    start,end=reports._resolve_range("custom",date(2026,7,1),date(2026,7,12),None)
    assert reports._within("2026-07-05T12:00:00Z",start,end)
    assert not reports._within("2026-07-20T12:00:00Z",start,end)


def test_all_revenue_range_has_no_bounds():
    assert reports._resolve_range("all",None,None,None)==(None,None)


def test_csv_includes_expenses_and_net_profit(monkeypatch):
    monkeypatch.setattr(reports,"pb",FakePB())
    async def admin(): return {"id":"u1","role":"ADMIN"}
    app.dependency_overrides[current_user]=admin
    try:
        response=TestClient(app).get("/api/reports/export/csv?period=all",headers={"Authorization":"Bearer test"})
        assert response.status_code==200
        assert "Total Expenses,Net Profit" in response.text
        assert "TRIP,T-1,KA-1" in response.text
        assert "100.0,4900.0" in response.text
        assert "UNASSIGNED_EXPENSE" in response.text
        assert "50.0,-50.0" in response.text
    finally:
        app.dependency_overrides.clear()
