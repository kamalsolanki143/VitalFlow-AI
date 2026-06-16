from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from database.escalation_db import create_escalation

from database.report_db import (
    create_report,
    get_report,
    list_reports,
    update_report,
)
from models.escalation import Escalation
from models.report import Report, ReportUpdate

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _database_error(exc: RuntimeError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(exc),
    )


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_report(report: Report) -> dict:
    try:
        return create_report(report)
    except RuntimeError as exc:
        raise _database_error(exc) from exc


@router.get("")
def get_reports() -> list[dict]:
    try:
        return list_reports()
    except RuntimeError as exc:
        raise _database_error(exc) from exc


@router.get("/{report_id}")
def get_report_by_id(report_id: str) -> dict:
    try:
        report = get_report(report_id)
    except RuntimeError as exc:
        raise _database_error(exc) from exc

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    return report


@router.post("/{report_id}/acknowledge")
def acknowledge_report(report_id: str) -> dict:
    try:
        report = update_report(
            report_id,
            ReportUpdate(status="acknowledged"),
        )
    except RuntimeError as exc:
        raise _database_error(exc) from exc

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    return report


@router.post("/{report_id}/escalate", status_code=status.HTTP_201_CREATED)
def escalate_report(report_id: str) -> dict:
    try:
        report = get_report(report_id)

        if report is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        update_report(
            report_id,
            ReportUpdate(status="escalated"),
        )

        escalation = Escalation(
            escalation_id=str(uuid4()),
            report_id=report_id,
            level=report.get("urgency", "high"),
            status="open",
        )

        return create_escalation(escalation)

    except RuntimeError as exc:
        raise _database_error(exc) from exc