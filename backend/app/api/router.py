from fastapi import APIRouter
from app.api.endpoints import health

# Master router that aggregates all domain routers
api_router = APIRouter()

# Register endpoints
api_router.include_router(health.router, tags=["Health"])
