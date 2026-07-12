"""
Fleet AI Assistant Feature
----------------------------------------------------------------------------------
Ask natural-language questions about the fleet (e.g. "which vehicles have
insurance renewal in the next month?") and get answers grounded in live
PocketBase data.

Drop this file into the root of the backend project, then in main.py add:

    from ai_assistant import router as assistant_router
    app.include_router(assistant_router)

Requirements to add to requirements.txt:
    google-generativeai
    python-dotenv
    pocketbase

Env vars needed in .env:
    GEMINI_API_KEY=your_key_here

Note: if ai_feature.py (the document upload feature) is already in the same
project, GEMINI_API_KEY / PocketBase are configured independently here so
this file works standalone too - no cross-file dependency.
"""

import json
import os
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter
from pocketbase import PocketBase
from pydantic import BaseModel

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

PB_URL = "https://db-clarity.arinji.com"
pb_client = PocketBase(PB_URL)

SYSTEM_PROMPT = """
You are a fleet management assistant. You will be given:
1. Today's date
2. A JSON array of vehicle records from the database
3. A question from a fleet manager

Answer the question using ONLY the vehicle data provided. Rules:
- When asked about expiries/renewals "in the next month/week/N days", compare
  the relevant expiry date field to today's date and use that exact window.
- Always list vehicles by their registrationNumber when relevant, plus the
  specific date that matches the question (e.g. insuranceExpiry).
- If a date field is missing or empty for a vehicle, skip that vehicle for
  that specific question rather than guessing.
- If no vehicles match, say so clearly instead of inventing data.
- Be concise. Use a short list format when returning multiple vehicles.
- Do not mention JSON, databases, or that you were given data - just answer
  like a knowledgeable assistant.
"""


def fetch_all_vehicles() -> list[dict]:
    records = pb_client.collection("Vehicles").get_full_list()

    vehicles = []
    for r in records:
        data = r.__dict__.copy() if hasattr(r, "__dict__") else dict(r)
        # Drop noisy internal fields Gemini doesn't need
        data.pop("collection_id", None)
        data.pop("collection_name", None)
        vehicles.append(data)

    return vehicles


def ask_fleet_assistant(question: str) -> str:
    vehicles = fetch_all_vehicles()
    today = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""{SYSTEM_PROMPT}

Today's date: {today}

Vehicle data:
{json.dumps(vehicles, indent=2, default=str)}

Question: {question}
"""

    response = model.generate_content(prompt)
    return response.text.strip()


router = APIRouter(prefix="/assistant", tags=["Fleet Assistant"])


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    answer = ask_fleet_assistant(payload.question)
    return ChatResponse(answer=answer)
