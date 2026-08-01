# Weather Explorer Backend

This is a Python 3.12 RESTful API built with FastAPI. It forms the backend for the Weather Explorer monorepo.

## Tech Stack
- **Framework**: FastAPI (Python 3.12)
- **Validation**: Pydantic v2
- **Server**: Uvicorn
- **Testing**: Pytest
- **Linting/Formatting**: Ruff, Black

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - On Windows: `.venv\Scripts\activate`
   - On macOS/Linux: `source .venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Copy `.env.example` to `.env` and configure accordingly.

5. Run development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Folder Structure
- `app/` - Main application code.
  - `main.py` - FastAPI entry point.
  - `core/config.py` - Pydantic BaseSettings.
- `tests/` - Pytest test suite.
- `pyproject.toml` - Configuration for Ruff, Black, and Pytest.
- `requirements.txt` - Python dependencies.
