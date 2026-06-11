import json
import os

import httpx

from band.channel import CHANNELS, publish
from band.context import PatientContext

FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")
FEATHERLESS_BASE_URL = os.getenv(
    "FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1"
)


async def process_analysis(ctx: PatientContext) -> PatientContext:
    test_values = json.dumps(ctx.test_values)
    reference_ranges = json.dumps(ctx.reference_ranges)

    prompt = (
        "You are a medical analysis AI.\n"
        "Compare these test values against reference ranges and identify abnormal values.\n"
        f"Test Values: {test_values}\n"
        f"Reference Ranges: {reference_ranges}\n"
        "Return ONLY a JSON array. Each item must have exactly:\n"
        "{\n"
        '  "test": "test name",\n'
        '  "value": numeric value,\n'
        '  "reference": "reference range string",\n'
        '  "deviation_percent": numeric percent above or below range,\n'
        '  "flag": "CRITICAL HIGH or HIGH or LOW or CRITICAL LOW"\n'
        "}\n"
        "No explanation. No markdown. Pure JSON array only."
    )

    abnormal_flags = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{FEATHERLESS_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {FEATHERLESS_API_KEY}"},
                json={
                    "model": "mistralai/Mistral-7B-Instruct-v0.2",
                    "messages": [{"role": "system", "content": prompt}],
                },
            )
            if resp.is_success:
                content = resp.json()["choices"][0]["message"]["content"]
                abnormal_flags = json.loads(content)
    except Exception:
        abnormal_flags = []

    ctx.abnormal_flags = abnormal_flags

    if abnormal_flags:
        max_deviation = max(
            abs(f.get("deviation_percent", 0)) for f in abnormal_flags
        )
        if max_deviation > 50:
            ctx.urgency_score = "critical"
        elif max_deviation >= 20:
            ctx.urgency_score = "medium"
        else:
            ctx.urgency_score = "low"
    else:
        ctx.urgency_score = "low"

    ctx.status = "analysis"
    ctx.log_handoff(
        "analysis_agent",
        "Analysis complete",
        f"Found {len(abnormal_flags)} abnormal flags, urgency: {ctx.urgency_score}",
    )

    await publish(CHANNELS["analysis_complete"], ctx)
    return ctx
