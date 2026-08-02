# Climate & Weather Explorer

Full-stack application for fetching, storing, and visualizing historical meteorological data from the Open-Meteo API. Built with a **FastAPI** backend and a **React 19 + Vite** frontend, storing ingested datasets as immutable JSON files in **Google Cloud Storage (GCS)**.

---

## Live Demo & Endpoints

- **Frontend App**: [ https://weather-explorer-assignment-ecu5.vercel.app/](https://weather-explorer-assignment-ecu5.vercel.app/) *(or your Vercel URL)*
- **Backend API**: `https://weather-explorer-api-483908344338.asia-south1.run.app`
- **Swagger Docs**: [https://weather-explorer-api-483908344338.asia-south1.run.app/docs](https://weather-explorer-api-483908344338.asia-south1.run.app/docs)
- **Health Check**: `https://weather-explorer-api-483908344338.asia-south1.run.app/health`

The backend and GCS bucket are hosted in Google Cloud's `asia-south1` (Mumbai) region.

---

## Tech Stack

- **Backend**: Python 3.12, FastAPI, Pydantic v2, HTTPX, Google Cloud Storage SDK, Loguru, Pytest
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, TanStack Table v8, Recharts, Framer Motion, React Hook Form + Zod
- **Infrastructure**: Google Cloud Run, Google Cloud Storage, Vercel, Docker & Docker Compose

---

## Architecture & Key Decisions

### 1. Clean Architecture Backend
The backend is structured into decoupled layers (`api` -> `services` -> `storage` / `validators`):
- **Transport (`api/`)**: Thin route handlers that validate requests and return responses.
- **Service (`services/`)**: Orchestrates Open-Meteo fetching, file naming, and GCS uploads.
- **Domain Boundaries**: Low-level `httpx` and `google-cloud` errors are caught and converted to custom domain exceptions (`WeatherServiceError`, `WeatherServiceNotFoundError`), ensuring clean HTTP error mapping without leaking internal stack traces.

### 2. Non-blocking GCS Operations
The official `google-cloud-storage` Python SDK is synchronous. Calling it directly inside async routes would block FastAPI's event loop. I wrapped GCS operations in `asyncio.to_thread()` to offload blocking network I/O to worker threads.

### 3. Resilient Open-Meteo Client
Implemented an exponential backoff retry decorator (`@with_retry`). It retries transient `5xx` server errors, connection resets, and timeouts, but immediately fails on `4xx` client errors to avoid pointless retries.

### 4. Client-side Caching & Smart Ingestion
- Uses **TanStack Query** for automatic caching, background refetching, and request deduplication.
- Before triggering a new Open-Meteo fetch + GCS upload, the frontend checks if matching coordinates and dates already exist in the stored files list to prevent duplicate uploads.

### 5. IAM & Cloud Security
The Cloud Run deployment uses **Application Default Credentials (ADC)** linked to a dedicated Service Account with `roles/storage.objectAdmin` on the bucket. No service account private keys are stored in the repo.

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routes & dependency injection
│   │   ├── core/            # Config (pydantic-settings) & logging
│   │   ├── exceptions/      # Custom domain exceptions & handlers
│   │   ├── middleware/      # RequestID & structured logging
│   │   ├── models/          # Data models & filename generator
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # WeatherService & Open-Meteo client
│   │   ├── storage/         # GCS client wrapper
│   │   └── validators/      # Date & coordinate validation rules
│   ├── tests/
│   │   ├── unit/            # Unit tests (mocked with respx & unittest.mock)
│   │   └── integration/     # API route tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components & theme toggle
│   │   ├── features/weather/# Charts, data table, location picker, drawer
│   │   ├── hooks/           # React Query custom hooks
│   │   └── utils/           # Formatters & geocoding helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Quick Start / Local Setup

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker (optional)

---

### Method 1: Local Development

#### Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run server
uvicorn app.main:app --reload --reload-dir app --port 8000
```
Backend runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
```
Frontend runs at `http://localhost:5173`.

> **Note for testing local frontend with live cloud data:**  
> You can set `VITE_API_BASE_URL=https://weather-explorer-api-483908344338.asia-south1.run.app` in `frontend/.env` to run the frontend locally against the live Cloud Run + GCS backend without needing any GCP credentials.

---

### Method 2: Docker Compose

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

## Testing

The backend includes a complete Pytest suite. All external network calls (Open-Meteo API) are mocked with `respx`, and GCS operations are mocked with `unittest.mock`, so tests run completely offline.

```bash
cd backend

# Run tests
pytest -v

# Run tests with coverage
pytest --cov=app --cov-report=term-missing
```

### Linting & Formatting
```bash
# Backend
ruff check .
black --check .

# Frontend
cd frontend
npm run lint
```

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/weather/store` | Fetch historical weather from Open-Meteo and store JSON in GCS |
| `GET` | `/api/v1/weather/files` | List all stored weather files in GCS (newest first) |
| `GET` | `/api/v1/weather/files/{filename}` | Download and return raw JSON content of a specific file |
| `GET` | `/health` | Service health check |

#### Example `POST /api/v1/weather/store` Payload:
```json
{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "start_date": "2024-01-01",
  "end_date": "2024-01-15"
}
```

#### Example Stored Filename Format:
`weather_23_02_72_57_2024-01-01_2024-01-15_20260802T120000Z.json`

