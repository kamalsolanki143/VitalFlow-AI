import os

import httpx

from .context import PatientContext

BAND_API_BASE = os.getenv("BAND_API_URL", "https://api.band.com/v1")

CHANNELS = {
    "intake_complete": "report.intake.complete",
    "analysis_complete": "report.analysis.complete",
    "history_complete": "report.history.complete",
    "knowledge_complete": "report.knowledge.complete",
    "prediction_complete": "report.prediction.complete",
    "routing_complete": "report.routing.complete",
    "explain_complete": "report.explain.complete",
    "compliance_complete": "report.compliance.complete",
}


async def publish(channel: str, context: PatientContext) -> bool:
    api_key = os.getenv("BAND_API_KEY")
    if not api_key:
        return False
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{BAND_API_BASE}/publish",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"channel": channel, "payload": context.to_dict()},
            )
            return resp.is_success
    except Exception:
        return False


async def subscribe(channel: str, callback) -> None:
    api_key = os.getenv("BAND_API_KEY")
    if not api_key:
        return
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BAND_API_BASE}/subscribe/{channel}",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.is_success:
                data = resp.json()
                ctx = PatientContext.from_dict(data.get("payload", {}))
                await callback(ctx)
    except Exception:
        pass


async def get_context(report_id: str) -> PatientContext:
    api_key = os.getenv("BAND_API_KEY")
    if not api_key:
        return PatientContext()
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BAND_API_BASE}/context/{report_id}",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.is_success:
                return PatientContext.from_dict(resp.json())
    except Exception:
        pass
    return PatientContext()
