from fastapi import APIRouter, HTTPException, status

from backend.database.escalation_db import create_escalation, get_escalations
from backend.models.escalation import Escalation

router = APIRouter(prefix="/api/escalations", tags=["escalations"])


def _database_error(exc: RuntimeError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(exc),
    )


@router.get("")
def list_all_escalations() -> list[dict]:
    try:
        return get_escalations()
    except RuntimeError as exc:
        raise _database_error(exc) from exc


@router.post("", status_code=status.HTTP_201_CREATED)
def add_escalation(escalation: Escalation) -> dict:
    try:
        return create_escalation(escalation)
    except RuntimeError as exc:
        raise _database_error(exc) from exc