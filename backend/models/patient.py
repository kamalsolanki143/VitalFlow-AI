from pydantic import BaseModel, Field


class Patient(BaseModel):
    patient_id: str = Field(..., min_length=1)
    patient_name: str = Field(..., min_length=1)
    patient_age: int = Field(..., ge=0, le=130)


class PatientUpdate(BaseModel):
    patient_name: str | None = Field(default=None, min_length=1)
    patient_age: int | None = Field(default=None, ge=0, le=130)
