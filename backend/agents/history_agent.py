import json
import os

import httpx
from motor.motor_asyncio import AsyncIOMotorClient

from band.channel import CHANNELS, publish
from band.context import PatientContext

AIML_API_KEY = os.getenv("AIML_API_KEY")
AIML_BASE_URL = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")
MONGODB_URI = os.getenv("MONGODB_URI")


async def process_history(ctx: PatientContext) -> PatientContext:
    past_reports = []
    if MONGODB_URI:
        try:
            client = AsyncIOMotorClient(MONGODB_URI)
            db = client.get_database()
            cursor = db.reports.find(
                {
                    "patient_id": ctx.patient_id,
                    "report_id": {"$ne": ctx.report_id},
                }
            ).limit(10)
            past_reports = await cursor.to_list(length=10)
        except Exception:
            past_reports = []

    prompt = (
        "You are a patient history analyst.\n"
        "Analyse this patient's previous diagnostic reports and current abnormal findings.\n"
        f"Previous Reports: {json.dumps(past_reports)}\n"
        f"Current Abnormal Flags: {json.dumps(ctx.abnormal_flags)}\n"
        "Return ONLY a JSON object with exactly:\n"
        "{\n"
        '  "history_summary": "max 2 sentence plain english summary",\n'
        '  "upgrade_urgency": true or false,\n'
        '  "reason": "one sentence explanation"\n'
        "}\n"
        "No explanation. No markdown. Pure JSON only."
    )

    result = {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{AIML_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {AIML_API_KEY}"},
                json={
                    "model": "gpt-4o",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            if resp.is_success:
                content = resp.json()["choices"][0]["message"]["content"]
                result = json.loads(content)
    except Exception:
        result = {}

    ctx.history_summary = result.get("history_summary", "")
    ctx.history_urgency_upgrade = result.get("upgrade_urgency", False)
    if ctx.history_urgency_upgrade:
        ctx.urgency_score = "critical"

    ctx.status = "history"
    ctx.log_handoff(
        "patient_history_agent", "History analysed", ctx.history_summary
    )

    await publish(CHANNELS["history_complete"], ctx)
    return ctx
