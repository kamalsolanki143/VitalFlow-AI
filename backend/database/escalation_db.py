from typing import Any

from pymongo import DESCENDING
from pymongo.errors import PyMongoError

from database.connection import escalations_collection
from models.escalation import Escalation


def _clean_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    document.pop("_id", None)
    return document


def create_escalation(escalation: Escalation) -> dict[str, Any]:
    try:
        data = escalation.model_dump()
        escalations_collection.insert_one(data)
        created = escalations_collection.find_one({"escalation_id": escalation.escalation_id})
        if created is None:
            raise RuntimeError("Escalation could not be created")
        return _clean_document(created)
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while creating escalation: {exc}") from exc


def get_escalations() -> list[dict[str, Any]]:
    try:
        escalations = escalations_collection.find().sort("created_at", DESCENDING)
        return [_clean_document(escalation) for escalation in escalations if escalation is not None]
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while listing escalations: {exc}") from exc
