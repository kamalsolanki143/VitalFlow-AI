import os
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorClient

from band.channel import CHANNELS, publish
from band.context import PatientContext

MONGODB_URI = os.getenv("MONGODB_URI")

ALL_AGENTS = [
    "intake_agent",
    "analysis_agent",
    "patient_history_agent",
    "medical_knowledge_agent",
    "emergency_prediction_agent",
    "routing_agent",
    "explainability_agent",
    "compliance_agent",
]


async def process_compliance(ctx: PatientContext) -> PatientContext:
    sla_rules = {
        "critical": 300,
        "medium": 900,
        "low": 3600,
    }

    pipeline_time = 0
    if ctx.sla_start:
        try:
            start = datetime.fromisoformat(ctx.sla_start)
            now = datetime.utcnow()
            pipeline_time = (now - start).total_seconds()
        except Exception:
            pipeline_time = 0

    sla_limit = sla_rules.get(ctx.urgency_score, 3600)
    if pipeline_time > sla_limit:
        ctx.sla_breached = True

    logged_agents = {entry.get("agent") for entry in ctx.handoff_log}
    missing = [a for a in ALL_AGENTS if a not in logged_agents]
    if missing:
        print(f"WARNING: Missing handoff entries from: {missing}")

    if MONGODB_URI:
        try:
            client = AsyncIOMotorClient(MONGODB_URI)
            db = client.get_database()
            await db.reports.replace_one(
                {"report_id": ctx.report_id},
                ctx.to_dict(),
                upsert=True,
            )
        except Exception:
            pass

    ctx.status = "compliance"
    ctx.log_handoff(
        "compliance_agent",
        "Audit complete",
        f"Pipeline time: {pipeline_time}s, SLA breached: {ctx.sla_breached}",
    )

    await publish(CHANNELS["compliance_complete"], ctx)
    return ctx
