from band.channel import CHANNELS, publish
from band.context import PatientContext

MEDICAL_KNOWLEDGE = {
    "Troponin": {
        "risk_level": "Critical",
        "possible_concern": "Acute Myocardial Infarction or cardiac injury",
        "suggested_action": "Immediate cardiology consultation required",
    },
    "PSA": {
        "risk_level": "High",
        "possible_concern": "Prostate cancer risk",
        "suggested_action": "Urology referral and biopsy consideration",
    },
    "HbA1c": {
        "risk_level": "Medium",
        "possible_concern": "Uncontrolled diabetes",
        "suggested_action": "Endocrinology review and medication adjustment",
    },
    "Creatinine": {
        "risk_level": "High",
        "possible_concern": "Acute kidney injury or chronic kidney disease",
        "suggested_action": "Nephrology referral and immediate hydration assessment",
    },
    "CBC_WBC": {
        "risk_level": "Medium",
        "possible_concern": "Infection, inflammation or haematological disorder",
        "suggested_action": "Haematology review and blood culture",
    },
    "Glucose": {
        "risk_level": "Medium",
        "possible_concern": "Diabetic emergency or hypoglycaemia",
        "suggested_action": "Immediate glucose management protocol",
    },
}


async def process_knowledge(ctx: PatientContext) -> PatientContext:
    insights = []
    for flag in ctx.abnormal_flags:
        test_name = flag.get("test", "")
        if test_name in MEDICAL_KNOWLEDGE:
            knowledge = MEDICAL_KNOWLEDGE[test_name]
            insights.append(
                {
                    "test": test_name,
                    "risk_level": knowledge["risk_level"],
                    "possible_concern": knowledge["possible_concern"],
                    "suggested_action": knowledge["suggested_action"],
                }
            )

    ctx.knowledge_insights = insights
    ctx.status = "knowledge"
    ctx.log_handoff(
        "medical_knowledge_agent",
        "Knowledge check complete",
        f"Found {len(insights)} knowledge insights",
    )

    await publish(CHANNELS["knowledge_complete"], ctx)
    return ctx
