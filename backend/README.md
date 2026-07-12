# TransitOps FastAPI backend

Backend for the TransitOps hackathon brief. It follows the supplied OpenAPI contract under `/api`, uses the supplied PocketBase collections, verifies frontend PocketBase JWTs, and enforces dispatch/maintenance business rules in the service layer.

The original hackathon brief, OpenAPI contract, PocketBase schema, auth notes, screenshots, and sample code are kept separately in the repository-level `references/` directory.

## Setup

```powershell
Copy-Item .env.example .env
# Add the PocketBase superuser token to .env
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn main:app --reload --port 8000
```

Open Swagger at `http://localhost:8000/docs`. The React app should send `Authorization: Bearer <PocketBase user JWT>` to every `/api` request.

## PocketBase authentication model

The frontend owns login. FastAPI forwards the JWT to `POST /collections/users/auth-refresh` to verify it and obtain the user record. Operational calls use `PB_ADMIN_TOKEN` because the supplied schema has `null` API rules for every TransitOps base collection (PocketBase treats these as locked). Never expose that admin token to React.

If you later add authenticated access rules to all operational collections, the data client can instead forward the user's JWT. Mutation routes already enforce a practical role matrix in `app/api/dependencies.py`: fleet/admin for assets and maintenance; fleet/safety/admin for driver changes; fleet/dispatcher/driver/admin for trip workflows; and fleet/finance/admin for expense creation and analytics. Adjust these aliases if the team changes responsibilities.

## Schema compatibility notes

- PocketBase spells vehicle type as `vehileType`; the API exposes the OpenAPI field `type`.
- Driver name/contact are represented by `Drivers.address` and `Drivers.emergencyContact` when no related user is present. When `Drivers.user` exists, the expanded user's `name` and `phone` take precedence.
- Dashboard `region` is accepted for OpenAPI compatibility, but the supplied collections contain no region field, so it cannot filter yet.
- Revenue is only available from `Dashboard_Stats`; trips have no revenue field. Per-vehicle ROI therefore reports costs correctly and assumes zero vehicle revenue until a revenue field/collection is added.
- Multi-record transitions use compensating updates because PocketBase REST does not expose a cross-record transaction. For production, move dispatch/complete workflows into PocketBase hooks or a transactional server extension.

## Routes

All supplied routes are implemented: dashboards; vehicle and driver CRUD/status; trip creation, dispatch, completion, and cancellation; maintenance start/completion; expenses; and analytics. Additional routes are:

- `GET /api/auth/me` - current verified user
- `GET /api/ai/fleet-readiness/{vehicle_id}` - explainable maintenance/incident readiness score
- `GET /api/ai/driver-risk/{driver_id}` - license, safety-score, and incident risk
- `POST /api/fleet-locations` - publish a vehicle/device GPS fix
- `GET /api/fleet-locations` - latest coordinates for every vehicle; poll every five seconds
- `GET /api/fleet-locations/{vehicle_id}` - latest fix for one vehicle
- `GET /health` - unauthenticated service health

The AI endpoints currently use deterministic rules so demos are stable. Replace the scoring internals later without changing frontend contracts.

Gemini-backed features are available at `POST /api/llm/fleet-assistant/chat` and `POST /api/llm/vehicle-documents/extract`. Set `GEMINI_API_KEY` in `.env`; `GEMINI_MODEL` defaults to `gemini-2.5-flash`. The document endpoint accepts PDF/JPEG/PNG/WebP up to 10 MB and can extract without saving by setting multipart field `saveToPocketBase=false`.

All paginated list endpoints accept PocketBase-compatible `page`, `perPage`, `sort`, `filter`, `expand`, `fields`, and `skipTotal` parameters. Vehicle and driver delete routes enforce active-workflow safeguards. Vehicle images and documents can be uploaded with multipart requests under `/api/vehicles/{vehicle_id}/image` and `/api/vehicles/{vehicle_id}/documents`.

Reports calculate completed-trip revenue as distance multiplied by `REVENUE_RATE_PER_KM` (default `50`). Analytics and CSV support `period=day|week|month|all|custom`; custom ranges use `dateFrom` and `dateTo`. Analytics includes revenue per vehicle. `GET /api/reports/export/csv` includes revenue, expense categories, total expenses, and net profit; unassigned vehicle expenses are exported as separate rows.

Set `PB_BATCH_ENABLED=true` only after enabling PocketBase's batch Web API in its dashboard. Dispatch and trip-completion transitions will then use transactional batch requests; otherwise the tested sequential fallback is used.

## Live fleet map

The supplied PocketBase schema has no GPS collection, so the latest positions are currently held in process memory and reset when the API restarts. For deployment, add a `Fleet_Locations` collection with vehicle, latitude, longitude, speedKph, heading, accuracyMeters, and recordedAt fields, then replace `app/services/locations.py` with PocketBase calls.

React should publish browser/device GPS fixes to `POST /api/fleet-locations`, then poll `GET /api/fleet-locations` every 5000 ms. The response contains `refreshAfterSeconds`, vehicle details, coordinate timestamps, age, and an `isStale` flag. Use `activeOnly=true` to show only vehicles currently on trips.

For a hackathon demo, call `POST /api/fleet-locations/simulate`. It generates a random nearby coordinate, speed, and heading for every registered vehicle. Pass `vehicleId`, `latitude`, and `longitude` as query parameters to simulate one vehicle around a chosen point. When IoT trackers are available, they should publish the same `FleetLocationIn` JSON used by `POST /api/fleet-locations`.

For streaming instead of polling, connect an EventSource-compatible client to `GET /api/fleet-locations/stream`. Because native browser `EventSource` cannot set an Authorization header, use a fetch-based SSE client or continue with authenticated five-second polling.

The configuration loader supports both the new names (`PB_API_URL`, `PB_ADMIN_TOKEN`) and the sample backend's legacy names (`PB_BASE_URL`, `SKILLSWAP_API_KEY`).
