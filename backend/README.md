# Weather Explorer Backend

FastAPI backend service responsible for fetching meteorological archives from Open-Meteo and storing/retrieving JSON datasets in Google Cloud Storage (GCS).

## Tech Stack
- **Framework**: FastAPI (Python 3.12)
- **Data Validation & Settings**: Pydantic v2, Pydantic-Settings
- **Serialization**: ORJSON (Rust-based JSON serializer)
- **HTTP Client**: HTTPX (async with connection pooling)
- **Cloud Storage**: Google Cloud Storage SDK (`google-cloud-storage`)
- **Logging**: Loguru (structured logging + request tracing)
- **Testing**: Pytest, Pytest-Asyncio, Respx, Unittest.mock
- **Linting & Formatting**: Ruff, Black

---

## Setup & Running

### 1. Create and activate virtual environment
```bash
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\activate

# macOS / Linux:
source .venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
*Configure `GCS_BUCKET_NAME` and `GCP_PROJECT_ID` (or `GOOGLE_APPLICATION_CREDENTIALS`) if running against your own GCP project.*

### 4. Start development server
```bash
uvicorn app.main:app --reload --reload-dir app --port 8000
```
- API Base: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

---

## Running Tests

All unit and integration tests run offline (Open-Meteo network is mocked via `respx` and GCS is mocked via `unittest.mock`).

```bash
# Run all tests
pytest -v

# Run tests with coverage summary
pytest --cov=app --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=app --cov-report=html
```

---

## Code Quality & Linting
```bash
ruff check .
black --check .
```
