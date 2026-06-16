from typing import Any

from pymongo import DESCENDING
from pymongo.errors import PyMongoError

from database.connection import reports_collection
from models.report import Report, ReportUpdate

def _clean_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    document.pop("_id", None)
    return document


def create_report(report: Report) -> dict[str, Any]:
    try:
        data = report.model_dump()
        reports_collection.update_one(
            {"report_id": report.report_id},
            {"$setOnInsert": data},
            upsert=True,
        )
        created = get_report(report.report_id)
        if created is None:
            raise RuntimeError("Report could not be created")
        return created
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while creating report: {exc}") from exc


def get_report(report_id: str) -> dict[str, Any] | None:
    try:
        return _clean_document(reports_collection.find_one({"report_id": report_id}))
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while fetching report: {exc}") from exc


def list_reports() -> list[dict[str, Any]]:
    try:
        reports = reports_collection.find().sort("uploaded_at", DESCENDING)
        return [_clean_document(report) for report in reports if report is not None]
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while listing reports: {exc}") from exc


def update_report(report_id: str, updates: ReportUpdate) -> dict[str, Any] | None:
    try:
        update_data = updates.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            return get_report(report_id)
        reports_collection.update_one({"report_id": report_id}, {"$set": update_data})
        return get_report(report_id)
    except PyMongoError as exc:
        raise RuntimeError(f"Database error while updating report: {exc}") from exc
