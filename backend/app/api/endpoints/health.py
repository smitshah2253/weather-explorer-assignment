from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Health Check")
async def health_check() -> dict[str, str]:
    """
    Simple health check endpoint for k8s/cloud provider liveness probes.
    """
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
