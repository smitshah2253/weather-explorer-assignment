from pydantic import BaseModel, Field

class ErrorResponse(BaseModel):
    """Generic error response model."""
    status: str = Field(default="error", description="Indicates the request failed")
    message: str = Field(..., description="Detailed description of what went wrong")
