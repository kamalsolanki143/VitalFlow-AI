from datetime import datetime
from typing import Dict, Any


class EscalationAgent:
    """
    Escalation Agent

    Responsibilities:
    - Monitor critical reports
    - Handle escalation workflow
    - Track escalation levels
    - Generate escalation logs
    """

    def __init__(self):
        self.agent_name = "Escalation Agent"

    def escalate_case(
        self,
        patient_context: Dict[str, Any]
    ) -> Dict[str, Any]:

        patient_name = patient_context.get(
            "patient_name",
            "Unknown Patient"
        )

        assigned_doctor = patient_context.get(
            "assigned_doctor",
            "Unknown Doctor"
        )

        escalation_level = patient_context.get(
            "escalation_level",
            1
        )

        escalation_targets = {
            1: "Senior Doctor",
            2: "Hospital Admin",
            3: "Emergency Queue"
        }

        target = escalation_targets.get(
            escalation_level,
            "Emergency Queue"
        )

        message = f"""
🚨 ESCALATION ALERT

Patient: {patient_name}

Original Doctor:
{assigned_doctor}

Escalation Level:
Level {escalation_level}

Escalated To:
{target}

Reason:
No acknowledgement received within SLA.

Action Required:
Immediate review required.
        """.strip()

        escalation_record = {
            "status": "escalated",
            "agent": self.agent_name,
            "timestamp": datetime.utcnow().isoformat(),
            "patient": patient_name,
            "level": escalation_level,
            "target": target,
            "message": message
        }

        print("\n========================")
        print("ESCALATION TRIGGERED")
        print("========================")
        print(message)
        print("========================\n")

        return escalation_record


if __name__ == "__main__":

    sample_patient_context = {
        "patient_name": "Rahul Sharma",
        "assigned_doctor": "Dr. Mehta",
        "escalation_level": 1
    }

    agent = EscalationAgent()

    result = agent.escalate_case(
        sample_patient_context
    )

    print(result)