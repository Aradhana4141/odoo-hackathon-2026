"""Gemini fleet assistant and vehicle-document extraction endpoints."""
from __future__ import annotations

import json
import re
import tempfile
from datetime import date
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from google import genai
from google.genai import types

from app.api.dependencies import FleetManager, User
from app.config import get_settings
from app.models import FleetAssistantRequest
from app.services.pocketbase import pb

router = APIRouter(prefix="/llm", tags=["Gemini LLM"])
settings = get_settings()
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024
DOCUMENT_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
DOCUMENT_TYPES = {"RC":"Registration", "REGISTRATION":"Registration", "INSURANCE":"Insurance", "PERMIT":"Permit", "PUC":"Puc", "POLLUTION CERTIFICATE":"Puc", "FITNESS":"Fitness Certificate", "FITNESS CERTIFICATE":"Fitness Certificate", "OTHER":"Other"}
VEHICLE_TYPES = {"TRUCK":"Truck", "MINI TRUCK":"Mini Truck", "VAN":"Van", "PICKUP":"Pickup", "TRAILER":"Trailer"}

FLEET_ASSISTANT_PROMPT = """
You are a fleet-management assistant. Answer using ONLY the provided vehicle
records and today's date. For expiry windows, compare dates exactly. Identify
vehicles by registrationNumber and include matching dates. Skip missing values,
never guess, and say clearly when nothing matches. Be concise and do not mention
JSON or databases.
"""

DOCUMENT_PROMPT = """
Parse this vehicle RC, insurance, permit, PUC, or fitness document. Return only
one JSON object containing exactly these string fields: documentType,
registrationNumber, manufacturer, model, vehicleType, fuelType,
registrationDate, insuranceExpiry, permitExpiry, fitnessExpiry,
pollutionExpiry. Use YYYY-MM-DD dates when possible and empty strings for
unavailable values. Never invent data.
"""


def _client() -> genai.Client:
    if not settings.gemini_api_key:
        raise HTTPException(503, "GEMINI_API_KEY is not configured")
    return genai.Client(api_key=settings.gemini_api_key)


def _clean_json(text: str) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        value = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(502, "Gemini returned invalid document JSON") from exc
    if not isinstance(value, dict):
        raise HTTPException(502, "Gemini document response was not an object")
    return value


# def _generate_answer(prompt: str) -> str:
#     response = _client().models.generate_content(model=settings.gemini_model, contents=prompt)
#     if not response.text:
#         raise HTTPException(502, "Gemini returned an empty answer")
#     return response.text.strip()

def _generate_answer(prompt: str) -> str:
    client = _client()

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty answer",
            )

        return response.text.strip()

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini request failed: {type(exc).__name__}: {exc}",
        ) from exc

    finally:
        client.close()

def _extract_document(path: str, mime_type: str) -> dict[str, Any]:
    client = _client()
    uploaded = client.files.upload(file=path, config={"mime_type": mime_type})
    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[DOCUMENT_PROMPT, uploaded],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        if not response.text:
            raise HTTPException(502, "Gemini returned no extracted document data")
        return _clean_json(response.text)
    finally:
        try:
            client.files.delete(name=uploaded.name)
        except Exception:
            pass


def _iso_date(value: Any) -> str | None:
    raw = str(value or "").strip()[:10]
    try:
        return date.fromisoformat(raw).isoformat()
    except ValueError:
        return None


@router.post("/fleet-assistant/chat")
async def fleet_assistant_chat(payload: FleetAssistantRequest, user: User):
    vehicles = await pb.full_list("Vehicles", sort="registrationNumber")
    keys = ("id", "registrationNumber", "model", "manufacturer", "vehileType", "capacityKg", "odometer", "status", "insuranceExpiry", "registrationExpiry")
    compact = [{key: item.get(key) for key in keys} for item in vehicles]
    prompt = f"{FLEET_ASSISTANT_PROMPT}\nToday's date: {date.today().isoformat()}\nVehicle records: {json.dumps(compact, default=str)}\nQuestion: {payload.question}"
    answer = await run_in_threadpool(_generate_answer, prompt)
    return {"answer": answer, "vehicleCount": len(compact), "model": settings.gemini_model}


@router.post("/vehicle-documents/extract")
async def extract_vehicle_document(user: FleetManager, file: UploadFile = File(...), saveToPocketBase: bool = Form(True)):
    if file.content_type not in DOCUMENT_MIME_TYPES:
        raise HTTPException(415, "Upload a PDF, JPEG, PNG, or WebP document")
    content = await file.read(MAX_DOCUMENT_SIZE + 1)
    if len(content) > MAX_DOCUMENT_SIZE:
        raise HTTPException(413, "Document exceeds the 10 MB limit")
    temp_path = ""
    try:
        suffix = Path(file.filename or "document.pdf").suffix or ".bin"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary:
            temporary.write(content)
            temp_path = temporary.name
        extracted = await run_in_threadpool(_extract_document, temp_path, file.content_type)
    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)

    registration = str(extracted.get("registrationNumber") or "").strip().upper()
    if not registration:
        raise HTTPException(422, "The document does not contain a registration number")
    if not saveToPocketBase:
        return {"success":True, "saved":False, "document":extracted, "model":settings.gemini_model}

    matches = await pb.list("Vehicles", filter=f'registrationNumber="{registration}"', perPage=1)
    update: dict[str, Any] = {}
    if extracted.get("manufacturer"): update["manufacturer"] = extracted["manufacturer"]
    if extracted.get("model"): update["model"] = extracted["model"]
    normalized_type = VEHICLE_TYPES.get(str(extracted.get("vehicleType") or "").strip().upper())
    if normalized_type: update["vehileType"] = normalized_type
    insurance_expiry = _iso_date(extracted.get("insuranceExpiry"))
    if insurance_expiry: update["insuranceExpiry"] = insurance_expiry

    if matches.get("items"):
        vehicle_id = matches["items"][0]["id"]
        if update: await pb.update("Vehicles", vehicle_id, update)
        vehicle_created = False
    else:
        create_data = {"registrationNumber":registration, "model":extracted.get("model") or "Pending document review", "manufacturer":extracted.get("manufacturer") or "", "vehileType":normalized_type or "Van", "capacityKg":1, "acquisitionCost":0, "odometer":0, "status":"Available", **update}
        vehicle_id = (await pb.create("Vehicles", create_data))["id"]
        vehicle_created = True

    expiry = insurance_expiry or _iso_date(extracted.get("permitExpiry")) or _iso_date(extracted.get("fitnessExpiry")) or _iso_date(extracted.get("pollutionExpiry"))
    document_data = {"vehicle":vehicle_id, "documentType":DOCUMENT_TYPES.get(str(extracted.get("documentType") or "OTHER").strip().upper(), "Other")}
    if expiry: document_data["expiryDate"] = expiry
    document = await pb.create_multipart("Documents", document_data, [("file", (file.filename or "vehicle-document", content, file.content_type))])
    return {"success":True, "saved":True, "vehicleId":vehicle_id, "vehicleCreated":vehicle_created, "documentRecordId":document.get("id"), "document":extracted, "model":settings.gemini_model}
