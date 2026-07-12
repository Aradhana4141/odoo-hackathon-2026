from app.api.llm import _clean_json,_iso_date
from app.main import app


def test_clean_json_accepts_markdown_fence():
    assert _clean_json('```json\n{"documentType":"RC"}\n```')["documentType"]=="RC"


def test_iso_date_normalizes_timestamp_and_rejects_invalid():
    assert _iso_date("2027-01-02T00:00:00Z")=="2027-01-02"
    assert _iso_date("unknown") is None


def test_llm_routes_are_registered():
    paths=app.openapi()["paths"]
    assert "/api/llm/fleet-assistant/chat" in paths
    assert "/api/llm/vehicle-documents/extract" in paths
