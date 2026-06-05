'use client'

import { Report } from '@/lib/types'
import { getUrgencyBadgeClass, formatRelativeTime } from '@/lib/utils'
import { FileText, Clock } from 'lucide-react'

interface RecentReportsProps {
  reports: Report[]
  isLoading: boolean
}

export default function RecentReports({ reports, isLoading }: RecentReportsProps) {
  const recent = [...reports]
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .slice(0, 5)

  return (
    <div className="vf-card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Clock size={14} color="var(--accent)" />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Recent Uploads
        </h2>
      </div>
      <div style={{ padding: '8px 0' }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '10px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: 120, height: 13, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 80, height: 11 }} />
              </div>
              <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 20 }} />
            </div>
          ))
        ) : (
          recent.map((report, idx) => (
            <div
              key={report.report_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 18px',
                borderBottom: idx < recent.length - 1 ? '1px solid rgba(31,45,69,0.4)' : 'none',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={13} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {report.patient_name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {report.report_type} · {formatRelativeTime(report.uploaded_at)}
                </div>
              </div>
              <span className={getUrgencyBadgeClass(report.urgency)}>{report.urgency}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
