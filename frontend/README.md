# Weather Explorer Frontend

React 19 single-page application (SPA) providing an interactive meteorological dashboard with time-series charts, tabular data grids, coordinate pickers, and cloud file management.

## Tech Stack
- **Core**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **State & Caching**: TanStack Query v5 (React Query)
- **Data Table**: TanStack Table v8 (sorting, pagination, search, CSV export)
- **Data Visualization**: Recharts (multi-metric time-series with zoom/brush)
- **Forms & Validation**: React Hook Form, Zod

---

## Setup & Running

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Default `VITE_API_BASE_URL` is `http://localhost:8000`.

> **Tip**: You can point `VITE_API_BASE_URL` directly to the live Cloud Run backend (`https://weather-explorer-api-483908344338.asia-south1.run.app`) to test the local UI against live GCS data without running the backend locally.

### 3. Start development server
```bash
npm run dev
```
Runs at `http://localhost:5173`.

---

## Build & Quality Checks

```bash
# Type check and build production bundle
npm run build

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```
