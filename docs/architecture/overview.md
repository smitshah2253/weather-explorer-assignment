# Architecture Overview

## Monorepo Strategy
This project utilizes a simple directory-based monorepo layout. 
This structure ensures that the API and client code reside in the same repository, simplifying setup, PR reviews, and versioning for the take-home assignment, while keeping the concerns strictly separate.

## Technology Choices

### Frontend
- **React 19 & Vite**: Provides a lightning-fast development experience with the latest React features.
- **Tailwind CSS v4**: A utility-first CSS framework for rapid UI development. Version 4 provides a CSS-first configuration and faster build times.
- **shadcn/ui**: Offers unstyled, accessible components that we can fully customize.
- **TanStack Query (React Query)**: Handles asynchronous state management, caching, and synchronization with the backend API.
- **Zod & React Hook Form**: Ensures robust, type-safe form validation.

### Backend
- **Python 3.12 & FastAPI**: A highly performant framework for building APIs, chosen for its speed, simplicity, and built-in OpenAPI/Swagger documentation.
- **Pydantic v2**: Handles data validation and settings management natively within FastAPI.
- **Uvicorn**: An ASGI web server implementation for Python.

## Scalability and Future-proofing
Although this is a take-home assignment scaffolding, the directory structure mimics a production service:
- Docker support is included out-of-the-box for seamless deployments.
- Code quality is enforced by tools like `ruff`, `black`, `pytest`, and `eslint`.
- Path aliases (`@/`) in the frontend prevent relative import hell.
