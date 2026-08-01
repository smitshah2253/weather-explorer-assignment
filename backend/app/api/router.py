from fastapi import APIRouter
from app.api.endpoints import health, weather_routes
# Master router that aggregates all domain routers
api_router = APIRouter()

# Register endpoints
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(weather_routes.router)
