from datetime import datetime

from pydantic import BaseModel, Field


class Followup(BaseModel):
    followup_id: str = Field(..., min_length=1)
    patient_id: str = Field(..., min_length=1)
    followup_date: datetime
    status: str = Field(default="pending", min_length=1)
    reminder_sent: bool = False


class FollowupUpdate(BaseModel):
    followup_date: datetime | None = None
    status: str | None = Field(default=None, min_length=1)
    reminder_sent: bool | None = None
