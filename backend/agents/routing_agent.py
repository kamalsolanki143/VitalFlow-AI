import json
import os

import httpx
from motor.motor_asyncio import AsyncIOMotorClient

from band.channel import CHANNELS, publish
from band.context import PatientContext

AIML_API_KEY = os.getenv("AIML_API_KEY")
AIML_BASE_URL = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")
MONGODB_URI = os.getenv("MONGODB_URI")


async def process_routing(ctx: PatientContext) -> PatientContext:
    doctors_list = []
    if MONGODB_URI:
        try:
            client = AsyncIOMotorClient(MONGODB_URI)
            db = client.get_database()
            cursor = db.doctors.find({"available": True})
            doctors_list = await cursor.to_list(length=50)
        except Exception:
            doctors_list = []

    prompt = (
        "You are a hospital routing AI.\n"
        "Assign the most appropriate doctor for this patient based on urgency and specialisation needed.\n"
        f"Urgency Score: {ctx.urgency_score}\n"
        f"Emergency Prediction Score: {ctx.emergency_prediction_score}\n"
        f"Knowledge Insights: {json.dumps(ctx.knowledge_insights)}\n"
        f"Available Doctors: {json.dumps(doctors_list)}\n"
        "Routing Rules:\n"
        "- Critical + prediction > 80 → senior on-call specialist, immediate\n"
        "- Critical + prediction 50-80 → primary specialist, urgent\n"
        "- Medium → primary doctor, same-day\n"
        "- Low → any available doctor, next visit\n"
        "Return ONLY a JSON object with exactly:\n"
        "{\n"
        '  "assigned_doctor": "doctor name",\n'
        '  "routing_reason": "one sentence explanation"\n'
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

    ctx.assigned_doctor = result.get("assigned_doctor", "")
    ctx.routing_reason = result.get("routing_reason", "")
    ctx.status = "routing"
    ctx.log_handoff(
        "routing_agent",
        "Doctor assigned",
        f"Assigned to {ctx.assigned_doctor}: {ctx.routing_reason}",
    )

    await publish(CHANNELS["routing_complete"], ctx)
    return ctx
