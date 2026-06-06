import json
import os
import uuid
from datetime import datetime

import httpx

from band.channel import CHANNELS, publish
from band.context import PatientContext

AIML_API_KEY = os.getenv("AIML_API_KEY")
AIML_BASE_URL = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")


async def process_intake(
    file_bytes: bytes, patient_name: str, patient_age: int, patient_id: str
) -> str:
    report_id = str(uuid.uuid4())

    prompt = (
        "You are a medical report parser. Extract all data from this diagnostic report.\n"
        "Return ONLY a JSON object with these exact fields:\n"
        "{\n"
        '  "patient_name": "string",\n'
        '  "patient_age": int,\n'
        '  "test_type": "string",\n'
        '  "test_values": {"test_name": value},\n'
        '  "reference_ranges": {"test_name": "range string"}\n'
        "}\n"
        "No explanation. No markdown. Pure JSON only."
    )

    extracted = {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{AIML_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {AIML_API_KEY}"},
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {"role": "system", "content": prompt},
                        {
                            "role": "user",
                            "content": file_bytes.decode("utf-8", errors="replace"),
                        },
                    ],
                },
            )
            if resp.is_success:
                content = resp.json()["choices"][0]["message"]["content"]
                extracted = json.loads(content)
    except Exception:
        extracted = {}

    ctx = PatientContext()
    ctx.report_id = report_id
    ctx.patient_name = extracted.get("patient_name", patient_name)
    ctx.patient_age = extracted.get("patient_age", patient_age)
    ctx.patient_id = patient_id
    ctx.test_type = extracted.get("test_type", "")
    ctx.test_values = extracted.get("test_values", {})
    ctx.reference_ranges = extracted.get("reference_ranges", {})
    ctx.sla_start = datetime.utcnow().isoformat()
    ctx.status = "intake"
    ctx.log_handoff(
        "intake_agent",
        "Report ingested",
        "Extracted patient data and test values from report",
    )

    await publish(CHANNELS["intake_complete"], ctx)
    return report_id
