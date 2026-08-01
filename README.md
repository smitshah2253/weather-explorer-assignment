# Weather Explorer

A production-ready Full Stack monorepo for the Full Stack Engineer take-home assignment.

## Overview
This repository contains a modern web application scaffolding. It is separated into a React 19 frontend and a Python 3.12 FastAPI backend. 

## Architecture
The project follows a standard decoupled frontend-backend architecture suitable for a scalable SaaS product.

- **Frontend**: A Single Page Application (SPA) built with React 19, TypeScript, and Vite. It utilizes Tailwind CSS v4 and shadcn/ui for styling, TanStack Query for data fetching, and Zod + React Hook Form for robust form validation.
- **Backend**: A RESTful API built with Python 3.12 and FastAPI. It leverages Pydantic for serialization and validation, Uvicorn as the ASGI server, and Pytest for testing.

## Folder Structure
```
weather-explorer/
├── backend/            # FastAPI python backend
│   ├── app/            # Application code (routes, schemas, core)
│   ├── tests/          # Pytest suite
│   ├── requirements.txt
│   ├── pyproject.toml  # Ruff, Black, Pytest config
│   ├── Dockerfile
│   └── .env.example
├── frontend/           # React 19 / Vite frontend
│   ├── src/            # React components, pages, hooks, services
│   ├── public/         # Static assets
│   ├── package.json
│   ├── vite.config.ts  
│   └── Dockerfile
├── docs/               # Project documentation
├── scripts/            # Helper scripts
├── docker-compose.yml  # Docker orchestration for local dev
└── package.json        # Root package.json for dev scripts
```

## Tech Stack
### Frontend
- React 19, Vite, TypeScript
- Tailwind CSS v4, shadcn/ui, Lucide React
- TanStack Query, TanStack Table, Recharts
- React Hook Form, Zod, Axios, React Router, React Hot Toast

### Backend
- Python 3.12, FastAPI, Uvicorn
- Pydantic v2, ORJSON, Loguru, python-dotenv
- httpx, Google Cloud Storage
- Pytest, Ruff, Black

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Python (3.12+)
- Docker & Docker Compose (optional for local dev, required for containers)

### Local Development (Without Docker)
1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate # Or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

### Local Development (With Docker)
```bash
docker-compose up --build
```

### Dev Scripts
If you prefer running both environments concurrently via Node:
```bash
npm install
npm run dev
```

## Development Workflow
- **Linting (Frontend)**: `npm run lint` (ESLint) and `npm run format` (Prettier)
- **Linting (Backend)**: `ruff check .` and `black .`
- **Testing (Backend)**: `pytest`
