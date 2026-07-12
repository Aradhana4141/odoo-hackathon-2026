"""
AI Document Extraction Feature (Vehicle RC / Insurance / Permit / PUC / Fitness)
----------------------------------------------------------------------------------
Drop this file into the root of the backend project, then in main.py add:

    from ai_feature import router as ai_router
    app.include_router(ai_router)

Requirements to add to requirements.txt:
    google-generativeai
    python-dotenv
    pocketbase
    python-multipart   (needed by FastAPI for UploadFile)

Env vars needed in .env:
    GEMINI_API_KEY=your_key_here
"""

import json
import os
import shutil

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File
from pocketbase import PocketBase


load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

PB_URL = "https://db-clarity.arinji.com"
pb_client = PocketBase(PB_URL)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

PROMPT = """
You are an expert document parser.

The uploaded document may be:
- Vehicle RC
- Insurance
- Permit
- Pollution Certificate (PUC)
- Fitness Certificate

Extract ONLY the following JSON.

Return ONLY valid JSON.
Do not explain anything.

{
    "documentType":"",
    "registrationNumber":"",
    "manufacturer":"",
    "model":"",
    "vehicleType":"",
    "fuelType":"",
    "registrationDate":"",
    "insuranceExpiry":"",
    "permitExpiry":"",
    "fitnessExpiry":"",
    "pollutionExpiry":""
}

If a field is unavailable, return "".
"""

FIELD_MAPPING = {
    "manufacturer": "manufacturer",
    "model": "model",
    "vehicleType": "vehicleType",
    "fuelType": "fuelType",
    "insuranceExpiry": "insuranceExpiry",
    "permitExpiry": "permitExpiry",
    "fitnessExpiry": "fitnessExpiry",
    "pollutionExpiry": "pollutionExpiry",
    "registrationDate": "registrationDate",
}



def extract_document_data(file_path: str) -> dict:
    uploaded_file = genai.upload_file(file_path)

    response = model.generate_content([PROMPT, uploaded_file])

    text = response.text.strip()
    text = text.replace("```json", "").replace("```", "")

    return json.loads(text)



def save_vehicle(document: dict) -> str:
    registration = document.get("registrationNumber", "")

    try:
        vehicle = pb_client.collection("Vehicles").get_first_list_item(
            f'registrationNumber="{registration}"'
        )

        update_data = {}
        for ai_key, pb_key in FIELD_MAPPING.items():
            value = document.get(ai_key)
            if value:
                update_data[pb_key] = value

        if update_data:
            pb_client.collection("Vehicles").update(vehicle.id, update_data)

        return vehicle.id

    except Exception:
        create_data = {"registrationNumber": registration}
        for ai_key, pb_key in FIELD_MAPPING.items():
            value = document.get(ai_key)
            if value:
                create_data[pb_key] = value

        vehicle = pb_client.collection("Vehicles").create(create_data)
        return vehicle.id


router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filepath = os.path.join(UPLOAD_DIR, file.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted = extract_document_data(filepath)
    vehicle_id = save_vehicle(extracted)

    expiry = (
        extracted.get("insuranceExpiry")
        or extracted.get("permitExpiry")
        or extracted.get("fitnessExpiry")
        or extracted.get("pollutionExpiry")
    )

    with open(filepath, "rb") as f:
        pb_client.collection("Documents").create(
            body={
                "vehicle": vehicle_id,
                "documentType": extracted.get("documentType"),
                "expiryDate": expiry,
            },
            files={"file": f},
        )

    return {
        "success": True,
        "vehicleId": vehicle_id,
        "document": extracted,
    }
