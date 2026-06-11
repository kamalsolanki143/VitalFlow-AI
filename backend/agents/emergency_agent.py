import json
import os

import httpx

from band.channel import CHANNELS, publish
from band.context import PatientContext

AIML_API_KEY = os.getenv("AIML_API_KEY")
AIML_BASE_URL = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")


async def process_prediction(ctx: PatientContext) -> PatientContext:
    prompt = (
        "You are an emergency risk prediction AI for a hospital triage system.\n"
        "Calculate an emergency probability score and priority score for this patient.\n"
        f"Patient Age: {ctx.patient_age}\n"
        f"Urgency Score: {ctx.urgency_score}\n"
        f"Abnormal Flags: {json.dumps(ctx.abnormal_flags)}\n"
        f"History Upgrade: {json.dumps(ctx.history_urgency_upgrade)}\n"
        f"Knowledge Insights: {json.dumps(ctx.knowledge_insights)}\n"
        "Return ONLY a JSON object with exactly:\n"
        "{\n"
        '  "emergency_prediction_score": integer 0 to 100,\n'
        '  "priority_score": integer 0 to 100,\n'
        '  "prediction_reasoning": "one sentence explanation"\n'
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

    ctx.emergency_prediction_score = result.get("emergency_prediction_score", 0)
    ctx.priority_score = result.get("priority_score", 0)
    ctx.prediction_reasoning = result.get("prediction_reasoning", "")
    ctx.status = "prediction"
    ctx.log_handoff(
        "emergency_prediction_agent",
        "Prediction complete",
        f"Scores - emergency: {ctx.emergency_prediction_score}, priority: {ctx.priority_score}",
    )

    await publish(CHANNELS["prediction_complete"], ctx)
    return ctx
