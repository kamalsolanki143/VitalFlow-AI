from datetime import datetime, timezone

from pydantic import BaseModel, Field


class Report(BaseModel):
    report_id: str = Field(..., min_length=1)

    patient_name: str = Field(..., min_length=1)
    patient_age: int = Field(..., ge=0)
    patient_id: str = Field(..., min_length=1)

    report_type: str = Field(..., min_length=1)

    uploaded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    urgency: str = Field(..., min_length=1)

    risk_score: float = Field(..., ge=0, le=100)

    emergency_prediction_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    assigned_doctor: str = Field(..., min_length=1)

    status: str = Field(
        default="Pending Review",
        min_length=1,
    )

    referring_doctor: str = Field(..., min_length=1)


class ReportUpdate(BaseModel):
    patient_name: str | None = None
    patient_age: int | None = None
    patient_id: str | None = None

    report_type: str | None = None

    urgency: str | None = None

    risk_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    emergency_prediction_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    assigned_doctor: str | None = None

    status: str | None = None

    referring_doctor: str | None = None