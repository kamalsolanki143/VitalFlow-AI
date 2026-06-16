from typing import Any

from pymongo.errors import PyMongoError

from database.connection import patients_collection
from models.patient import Patient, PatientUpdate


def _clean_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    document.pop("_id", None)
    return document


def create_patient(patient: Patient) -> dict[str, Any]:
    try:
        data = patient.model_dump()
        patients_collection.update_one(
            {"patient_id": patient.patient_id},
            {"$setOnInsert": data},
            upsert=True,
        )
        created = get_patient(patient.patient_id)
        if created is None:
            raise RuntimeError("Patient could not be created")
        return created
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while creating patient: {exc}") from exc


def get_patient(patient_id: str) -> dict[str, Any] | None:
    try:
        return _clean_document(patients_collection.find_one({"patient_id": patient_id}))
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while fetching patient: {exc}") from exc


def update_patient(patient_id: str, updates: PatientUpdate) -> dict[str, Any] | None:
    try:
        update_data = updates.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            return get_patient(patient_id)
        patients_collection.update_one({"patient_id": patient_id}, {"$set": update_data})
        return get_patient(patient_id)
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while updating patient: {exc}") from exc


def delete_patient(patient_id: str) -> bool:
    try:
        result = patients_collection.delete_one({"patient_id": patient_id})
        return result.deleted_count > 0
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while deleting patient: {exc}") from exc
