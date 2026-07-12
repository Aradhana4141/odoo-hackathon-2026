# TransitOps

## Team Lead: Aradhana

TransitOps is a unified transport operations and fleet logistics management platform. It coordinates vehicles, driver operations, trip dispatching, maintenance scheduling, and business intelligence reporting.

The application uses an asynchronous **FastAPI** backend integrated with a **PocketBase** relational datastore, combined with a **Next.js (App Router)** responsive frontend styled with Tailwind CSS.

---

## Technical Architecture

```
├── backend/                   # FastAPI Server
│   ├── app/
│   │   ├── api/               # Router endpoints (Auth, Dispatch, Telemetry, LLM, etc.)
│   │   ├── services/          # PocketBase client SDK & business workflows
│   │   ├── config.py          # Environment configuration
│   │   ├── models.py          # Pydantic data schemas
│   │   └── normalizers.py     # State and enum converters
│   └── tests/                 # Integration and contract test suite
│
└── frontend/                  # Next.js App
    ├── src/
    │   ├── app/               # Routes (Dashboard, Fleet, Driver Registry, Reports)
    │   ├── components/        # Layout and reusable UI
    │   └── utils/             # TypeScript client & openapi-fetch helpers
```

### Core Technologies

- **Frontend**: Next.js, React 19, TypeScript, Tailwind CSS, Recharts, Framer Motion, openapi-fetch.
- **Backend**: FastAPI (Python 3.11+), Pydantic v2, Uvicorn, HTTPX.
- **Database**: PocketBase (REST API interaction layer).
- **External Integrations**: Google GenAI (Gemini 2.5) for document extraction and natural language processing.

---

## Feature Directory

### 1. Security, Session Guard, and RBAC

- **Secure Authentication**: Standard cookie-based session token storage (`token`, `role`) managed through Next.js Server Actions.
- **Brute-Force Lockout Guard**: Client-side auth attempts are rate-limited via encrypted lockout cookies that isolate session access for 15 minutes upon successive failed attempts.
- **Protected Route Middleware**: An Edge-compatible Next.js Middleware acts as a global router guard, enforcing login requirements on administrative views and redirecting authenticated sessions away from public sign-in screens.
- **Role-Based Access Control (RBAC)**: Users are bound to specific functional roles (`ADMIN`, `FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`). Route permissions are enforced both via backend dependencies and matching layouts in the frontend sidebar navigation.

### 2. Fleet Registry & Asset Management

- **Asset Management**: Add, update, select, and decommission vehicles. Enforces strict capacity and configuration checks (e.g., cargo weight thresholds vs. vehicle maximum carrying capacity).
- **Document Management**: Upload and storage of vehicle compliance records (Registrations, Insurance Policies, Transit Permits).
- **Asset States**: Manages structural resource states (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`) to protect vehicles from invalid simultaneous allocations.

### 3. Driver Compliance & Safety Profiles

- **Operator Database**: Track driver data, license classifications (Class A Heavy, Class B Medium, Class C Light), expiration timelines, and contact information.
- **Dynamic Expiry Tracking**: Flags operator state shifts and locks dispatch workflows if the driver's commercial driver license (CDL) has expired.
- **Driver Operations State**: Track operator status (`AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`).

### 4. Dispatch Board & Trip Orchestration

- **Dispatch Board**: Split-view operational columns divided into `Drafts`, `Active Board`, and `Completed` trip records.
- **Orchestration Lifecycle**:
  1.  **Draft**: Plan path vectors (source and destination locations), payload weight, and plan matching operator-vehicle assets.
  2.  **Dispatch**: Enforces safety and structural checks before committing state. Lock resources, update driver and vehicle records to `ON_TRIP`, and set route dispatch timestamps.
  3.  **Completion**: Log ending odometers, capture absolute trip distances, record fuel volumes, and close logs.
- **PocketBase Batch Transactions**: When enabled (`PB_BATCH_ENABLED=true`), state adjustments (such as transitioning multiple resources simultaneously upon dispatch or completion) are executed in single atomic batches.

### 5. Maintenance Ticketing System

- **Service Logging**: Create maintenance tickets for scheduled or emergency vehicle service (e.g., engine repair, oil changes, tire replacement).
- **State Enforcements**: Scheduling maintenance transitions a vehicle's state to `IN_SHOP` and blocks it from trip assignments.
- **Service Closure**: Log actual technician repair notes and final financial costs. Resolving a ticket re-flags the vehicle to `AVAILABLE` and converts the maintenance cost into a registered system expense.

### 6. Expense Logging & Financial Management

- **Expense Ledgers**: Log expenses associated with operations, categorized by type (`FUEL`, `TOLL`, `MAINTENANCE`, `OTHER`).
- **Fuel Volume Logs**: Track exact fuel volumes consumed during execution against vehicle odometers to map fleet efficiency patterns.

### 7. Intelligence Reports & Asset ROI

- **Fleet-Wide Analytics**: Business intelligence visualizations showing fuel efficiency trends (distance per volume), utilization rates, operational costs, and total generated revenue.
- **Vehicle ROI Tracking**: Compares exact operational margins (generated revenue based on completed kilometers vs. operating expenses) against original vehicle acquisition costs to calculate percentage ROI.
- **CSV Auditor Export**: Exposes parameterized reporting streams allowing financial analysts to download tabular data exports including trip profit breakdowns, toll costs, and unassigned operating expenses.

### 8. Real-Time Telemetry & GPS Tracking Console

- **Active GPS Telemetry**: Real-time positional mapping grid that charts active vehicle coordinates.
- **Speed & Compass Navigation**: Renders vehicle velocities, accuracy margins, and compass directions based on reported headings.
- **Telemetry Simulator**: Includes a simulation endpoint that injects moving GPS telemetry coordinates into the system's store to mimic active on-route updates.

### 9. AI Workflows (Gemini 2.5 Integration)

- **Fleet Assistant Chat**: Uses Gemini model structures to answer conversational prompts regarding vehicle statuses, compliance schedules, and expiry alerts based on real-time datastore evaluations.
- **Document OCR Extraction**: Uploaded vehicle documents are parsed by Gemini vision models to extract metadata (registration number, manufacturer, vehicle classification, insurance and permit expiration dates), automatically updating matching vehicle records in the database.

---

## Datastore Collections Schema (PocketBase)

Below is an overview of the structural collections managed within the underlying PocketBase database:

- **`users`**: Platform accounts holding role designations (`ADMIN`, `FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`), emails, hashed passwords, names, and user avatars.
- **`Vehicles`**: Fleet database recording registration numbers, make/model, carrying capacities, cumulative odometers, acquisition costs, and current operational states.
- **`Drivers`**: Operator records linking back to `users` accounts, storing license IDs, classifications, expiration thresholds, safety scores, and operator availability states.
- **`Trips`**: Dispatch registry logging trip IDs, source/destination coordinates, weight details, associated vehicles, designated drivers, dispatch times, completion times, and trip status.
- **`Maintenance`**: Operational servicing log indicating targets, service classifications, expected and final pricing variables, progress timestamps, and technician notes.
- **`Expenses`**: Cost ledger tracing individual financial impacts, mapping cost categories, absolute amounts, dates, and cross-referenced trip or vehicle IDs.
- **`Documents`**: Document register storing binary uploads of compliance papers, associated expirations, and matching vehicle associations.
- **`Fuel_Logs`**: Dynamic fuel consumption registers tracing odometer checkpoints, filled volumes, specific fuel pricing, and associated trip metadata.

---

## Installation & Setup

### Environment Settings

Create a `.env` file in the appropriate folders:

#### Backend Config (`backend/.env`)

```env
PB_API_URL=https://db-clarity.arinji.com/api
PB_ADMIN_TOKEN=your_pocketbase_admin_token
CORS_ORIGINS=http://localhost:3000
PB_BATCH_ENABLED=false
GEMINI_API_KEY=your_gemini_api_key
REVENUE_RATE_PER_KM=50
```

#### Frontend Config (`frontend/.env`)

```env
NEXT_PUBLIC_PB_URL=https://db-clarity.arinji.com
API_URL=http://localhost:8000/api
```

---

### Execution

#### 1. Running the FastAPI Backend

Ensure Python 3.11+ and virtual environment tools are installed.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Running the Next.js Frontend

Ensure `pnpm` is configured.

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000` to access the platform.

---

### Backend Test Suite

The backend contains a test suite powered by `pytest` verifying Pydantic models, API routing contracts, RBAC guards, and mapper operations.

```bash
cd backend
pytest
```
