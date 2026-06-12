from datetime import datetime, timezone

from pydantic import BaseModel, Field


class Escalation(BaseModel):
    escalation_id: str = Field(..., min_length=1)
    report_id: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="open", min_length=1)
