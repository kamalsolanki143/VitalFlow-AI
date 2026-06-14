from fastapi import APIRouter, HTTPException, status

from backend.database.followup_db import get_followups, update_followup
from backend.models.followup import FollowupUpdate

router = APIRouter(prefix="/api/followups", tags=["followups"])


def _database_error(exc: RuntimeError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(exc),
    )


@router.get("")
def list_all_followups() -> list[dict]:
    try:
        return get_followups()
    except RuntimeError as exc:
        raise _database_error(exc) from exc


@router.post("/{followup_id}/remind")
def remind_followup(followup_id: str) -> dict:
    try:
        followup = update_followup(
            followup_id,
            FollowupUpdate(reminder_sent=True),
        )
    except RuntimeError as exc:
        raise _database_error(exc) from exc

    if followup is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Followup not found",
        )

    return followup


@router.post("/{followup_id}/complete")
def complete_followup(followup_id: str) -> dict:
    try:
        followup = update_followup(
            followup_id,
            FollowupUpdate(status="completed"),
        )
    except RuntimeError as exc:
        raise _database_error(exc) from exc

    if followup is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Followup not found",
        )

    return followup