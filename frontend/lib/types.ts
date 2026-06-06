// TypeScript types for VitalFlow

export type UrgencyLevel = 'Critical' | 'Medium' | 'Low'
export type ReportStatus = 'Pending Review' | 'Acknowledged' | 'Escalated' | 'Complete'
export type FollowUpStatus = 'Scheduled' | 'Completed' | 'Missed' | 'Pending'
export type AgentStatus = 'completed' | 'running' | 'failed' | 'pending'
export type SLAStatus = 'Met' | 'Breached'

export interface Report {
  report_id: string
  patient_name: string
  patient_age: number
  patient_id: string
  report_type: string
  uploaded_at: string
  urgency: UrgencyLevel
  risk_score: number
  emergency_prediction_score: number
  assigned_doctor: string
  status: ReportStatus
  referring_doctor: string
}

export interface AbnormalFlag {
  test_name: string
  value: number
  unit: string
  reference_range: string
  deviation_percent: number
  risk_level: string
  possible_concern: string
  suggested_action: string
}

export interface AgentStep {
  agent_name: string
  action: string
  timestamp: string
  duration_ms: number
  status: AgentStatus
}

export interface ReportDetail extends Report {
  abnormal_flags: AbnormalFlag[]
  explainability_text: string
  patient_history_summary: string
  routing_reason: string
  agent_pipeline: AgentStep[]
  pipeline_completed_at: string
}

export interface ComplianceLog {
  report_id: string
  patient_name: string
  uploaded_at: string
  pipeline_completed_at: string
  total_time_seconds: number
  sla_status: SLAStatus
  agent_steps: AgentStep[]
}

export interface FollowUp {
  followup_id: string
  patient_name: string
  doctor_name: string
  report_type: string
  followup_date: string
  reminder_sent: boolean
  status: FollowUpStatus
}

export interface DashboardStats {
  total_today: number
  critical_count: number
  pending_review: number
  escalations_active: number
}

export interface AgentStatusInfo {
  agent_name: string
  status: AgentStatus
  last_run: string
}

export interface UploadPayload {
  file: File
  patient_name: string
  patient_age: number
  patient_id: string
  report_type: string
  referring_doctor: string
}

export interface UploadResponse {
  report_id: string
  status: string
  message: string
  risk_score?: number
  urgency?: UrgencyLevel
  assigned_doctor?: string
}
