from datetime import datetime


class PatientContext:
    def __init__(self):
        self.report_id = ""
        self.patient_name = ""
        self.patient_age = 0
        self.patient_id = ""
        self.test_type = ""
        self.test_values = {}
        self.reference_ranges = {}
        self.abnormal_flags = []
        self.history_summary = ""
        self.history_urgency_upgrade = False
        self.knowledge_insights = []
        self.urgency_score = ""
        self.emergency_prediction_score = 0
        self.priority_score = 0
        self.prediction_reasoning = ""
        self.assigned_doctor = ""
        self.routing_reason = ""
        self.explainability_reason = ""
        self.handoff_log = []
        self.sla_start = ""
        self.sla_breached = False
        self.notification_sent = False
        self.status = ""

    def to_dict(self) -> dict:
        return {
            "report_id": self.report_id,
            "patient_name": self.patient_name,
            "patient_age": self.patient_age,
            "patient_id": self.patient_id,
            "test_type": self.test_type,
            "test_values": self.test_values,
            "reference_ranges": self.reference_ranges,
            "abnormal_flags": self.abnormal_flags,
            "history_summary": self.history_summary,
            "history_urgency_upgrade": self.history_urgency_upgrade,
            "knowledge_insights": self.knowledge_insights,
            "urgency_score": self.urgency_score,
            "emergency_prediction_score": self.emergency_prediction_score,
            "priority_score": self.priority_score,
            "prediction_reasoning": self.prediction_reasoning,
            "assigned_doctor": self.assigned_doctor,
            "routing_reason": self.routing_reason,
            "explainability_reason": self.explainability_reason,
            "handoff_log": self.handoff_log,
            "sla_start": self.sla_start,
            "sla_breached": self.sla_breached,
            "notification_sent": self.notification_sent,
            "status": self.status,
        }

    @classmethod
    def from_dict(cls, data: dict):
        ctx = cls()
        ctx.report_id = data.get("report_id", "")
        ctx.patient_name = data.get("patient_name", "")
        ctx.patient_age = data.get("patient_age", 0)
        ctx.patient_id = data.get("patient_id", "")
        ctx.test_type = data.get("test_type", "")
        ctx.test_values = data.get("test_values", {})
        ctx.reference_ranges = data.get("reference_ranges", {})
        ctx.abnormal_flags = data.get("abnormal_flags", [])
        ctx.history_summary = data.get("history_summary", "")
        ctx.history_urgency_upgrade = data.get("history_urgency_upgrade", False)
        ctx.knowledge_insights = data.get("knowledge_insights", [])
        ctx.urgency_score = data.get("urgency_score", "")
        ctx.emergency_prediction_score = data.get("emergency_prediction_score", 0)
        ctx.priority_score = data.get("priority_score", 0)
        ctx.prediction_reasoning = data.get("prediction_reasoning", "")
        ctx.assigned_doctor = data.get("assigned_doctor", "")
        ctx.routing_reason = data.get("routing_reason", "")
        ctx.explainability_reason = data.get("explainability_reason", "")
        ctx.handoff_log = data.get("handoff_log", [])
        ctx.sla_start = data.get("sla_start", "")
        ctx.sla_breached = data.get("sla_breached", False)
        ctx.notification_sent = data.get("notification_sent", False)
        ctx.status = data.get("status", "")
        return ctx

    def log_handoff(self, agent_name: str, action: str, reasoning: str):
        self.handoff_log.append({
            "agent": agent_name,
            "action": action,
            "reasoning": reasoning,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def update_status(self, status: str):
        self.status = status
