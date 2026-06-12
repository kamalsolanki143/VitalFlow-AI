from datetime import datetime, timezone

from pydantic import BaseModel, Field


class Report(BaseModel):
    report_id: str = Field(..., min_length=1)
    patient_id: str = Field(..., min_length=1)
    report_type: str = Field(..., min_length=1)
    risk_score: float = Field(..., ge=0, le=100)
    urgency: str = Field(..., min_length=1)
    assigned_doctor: str = Field(..., min_length=1)
    status: str = Field(default="uploaded", min_length=1)
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReportUpdate(BaseModel):
    report_type: str | None = Field(default=None, min_length=1)
    risk_score: float | None = Field(default=None, ge=0, le=100)
    urgency: str | None = Field(default=None, min_length=1)
    assigned_doctor: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1)
