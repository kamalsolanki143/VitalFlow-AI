from typing import Any

from pymongo import ASCENDING
from pymongo.errors import PyMongoError

from database.connection import followups_collection
from models.followup import Followup, FollowupUpdate


def _clean_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    document.pop("_id", None)
    return document


def create_followup(followup: Followup) -> dict[str, Any]:
    try:
        data = followup.model_dump()
        followups_collection.update_one(
            {"followup_id": followup.followup_id},
            {"$setOnInsert": data},
            upsert=True,
        )
        created = followups_collection.find_one({"followup_id": followup.followup_id})
        if created is None:
            raise RuntimeError("Followup could not be created")
        return _clean_document(created)
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while creating followup: {exc}") from exc


def get_followups() -> list[dict[str, Any]]:
    try:
        followups = followups_collection.find().sort("followup_date", ASCENDING)
        return [_clean_document(followup) for followup in followups if followup is not None]
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while listing followups: {exc}") from exc


def update_followup(followup_id: str, updates: FollowupUpdate) -> dict[str, Any] | None:
    try:
        update_data = updates.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            document = followups_collection.find_one({"followup_id": followup_id})
            return _clean_document(document)
        followups_collection.update_one({"followup_id": followup_id}, {"$set": update_data})
        document = followups_collection.find_one({"followup_id": followup_id})
        return _clean_document(document)
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while updating followup: {exc}") from exc
