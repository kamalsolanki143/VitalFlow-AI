import json
import os

import httpx

from band.channel import CHANNELS, publish
from band.context import PatientContext

AIML_API_KEY = os.getenv("AIML_API_KEY")
AIML_BASE_URL = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")


async def process_explainability(ctx: PatientContext) -> PatientContext:
    prompt = (
        "You are a medical AI explainability engine.\n"
        "Generate a clear human-readable explanation of every decision made for this patient report.\n"
        f"Patient Name: {ctx.patient_name}\n"
        f"Abnormal Flags: {json.dumps(ctx.abnormal_flags)}\n"
        f"Urgency Score: {ctx.urgency_score}\n"
        f"History Summary: {ctx.history_summary}\n"
        f"Knowledge Insights: {json.dumps(ctx.knowledge_insights)}\n"
        f"Emergency Prediction Score: {ctx.emergency_prediction_score}\n"
        f"Assigned Doctor: {ctx.assigned_doctor}\n"
        f"Routing Reason: {ctx.routing_reason}\n"
        "Write a single paragraph explanation covering:\n"
        "- Why urgency was scored this way\n"
        "- What history contributed\n"
        "- What medical knowledge flagged\n"
        "- Why this doctor was assigned\n"
        "- What the prediction score means\n"
        "Return ONLY the explanation paragraph as plain text. No JSON. No markdown."
    )

    explanation = ""
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
                explanation = resp.json()["choices"][0]["message"]["content"]
    except Exception:
        explanation = ""

    ctx.explainability_reason = explanation
    ctx.status = "explain"
    ctx.log_handoff(
        "explainability_agent",
        "Explainability reasoning generated",
        "Explainability reasoning generated",
    )

    await publish(CHANNELS["explain_complete"], ctx)
    return ctx
