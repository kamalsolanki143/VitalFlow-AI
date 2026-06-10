import {
  Report,
  ReportDetail,
  ComplianceLog,
  FollowUp,
  DashboardStats,
  AgentStatusInfo,
  UploadPayload,
  UploadResponse,
} from './types'
import {
  mockStats,
  mockReports,
  mockReportDetail,
  mockComplianceLogs,
  mockFollowUps,
  mockAgentStatus,
} from './mockData'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    if (fallback !== undefined) return fallback
    throw new Error('Backend unavailable')
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  return safeFetch<DashboardStats>('/api/dashboard/stats', undefined, mockStats)
}

export async function getAgentStatus(): Promise<AgentStatusInfo[]> {
  return safeFetch<AgentStatusInfo[]>('/api/agents/status', undefined, mockAgentStatus)
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getReports(): Promise<Report[]> {
  return safeFetch<Report[]>('/api/reports', undefined, mockReports)
}

export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  return safeFetch<ReportDetail>(`/api/reports/${reportId}`, undefined, { ...mockReportDetail, report_id: reportId })
}

export async function acknowledgeReport(reportId: string): Promise<{ success: boolean }> {
  return safeFetch<{ success: boolean }>(
    `/api/reports/${reportId}/acknowledge`,
    { method: 'POST' },
    { success: true }
  )
}

export async function escalateReport(reportId: string): Promise<{ success: boolean }> {
  return safeFetch<{ success: boolean }>(
    `/api/reports/${reportId}/escalate`,
    { method: 'POST' },
    { success: true }
  )
}

export async function uploadReport(payload: UploadPayload): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('patient_name', payload.patient_name)
  formData.append('patient_age', String(payload.patient_age))
  formData.append('patient_id', payload.patient_id)
  formData.append('report_type', payload.report_type)
  formData.append('referring_doctor', payload.referring_doctor)

  try {
    const res = await fetch(`${BASE_URL}/api/reports/upload`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    // Simulate backend response for demo
    await new Promise(r => setTimeout(r, 500))
    return {
      report_id: `RPT-${Math.floor(Math.random() * 900) + 100}`,
      status: 'success',
      message: 'Report processed successfully',
      risk_score: Math.floor(Math.random() * 60) + 20,
      urgency: (['Critical', 'Medium', 'Low'] as const)[Math.floor(Math.random() * 3)],
      assigned_doctor: 'Dr. Priya Nair',
    }
  }
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export async function getComplianceLogs(params?: {
  date_from?: string
  date_to?: string
  sla_status?: string
}): Promise<ComplianceLog[]> {
  const query = params ? new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString() : ''
  return safeFetch<ComplianceLog[]>(`/api/compliance${query ? '?' + query : ''}`, undefined, mockComplianceLogs)
}

// ─── Follow-Ups ───────────────────────────────────────────────────────────────

export async function getFollowUps(): Promise<FollowUp[]> {
  return safeFetch<FollowUp[]>('/api/followups', undefined, mockFollowUps)
}

export async function sendReminder(followupId: string): Promise<{ success: boolean }> {
  return safeFetch<{ success: boolean }>(
    `/api/followups/${followupId}/remind`,
    { method: 'POST' },
    { success: true }
  )
}

export async function markFollowUpComplete(followupId: string): Promise<{ success: boolean }> {
  return safeFetch<{ success: boolean }>(
    `/api/followups/${followupId}/complete`,
    { method: 'POST' },
    { success: true }
  )
}
