'use client'

import { Report } from '@/lib/types'
import {
  getUrgencyBadgeClass,
  getStatusBadgeClass,
  getRowClass,
  getRiskColor,
  formatRelativeTime,
} from '@/lib/utils'
import { Eye } from 'lucide-react'

interface RiskPriorityTableProps {
  reports: Report[]
  isLoading: boolean
  onViewReport: (report: Report) => void
}

export default function RiskPriorityTable({ reports, isLoading, onViewReport }: RiskPriorityTableProps) {
  const sorted = [...reports].sort((a, b) => b.risk_score - a.risk_score).slice(0, 10)

  return (
    <div className="vf-card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Risk Priority Queue
        </h2>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Sorted by risk score — highest first
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="vf-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Report Type</th>
              <th style={{ minWidth: 160 }}>Risk Score</th>
              <th>Urgency</th>
              <th>Assigned Doctor</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ width: j === 2 ? 140 : 80, height: 14 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              sorted.map(report => {
                const riskColor = getRiskColor(report.risk_score)
                return (
                  <tr key={report.report_id} className={getRowClass(report.urgency)}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {report.patient_id}
                      </div>
                     <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {report.report_type}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{report.report_type}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          className="mono"
                          style={{ fontSize: 14, fontWeight: 700, color: riskColor, minWidth: 28 }}
                        >
                          {report.risk_score}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 5,
                            background: 'var(--border)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            className="gauge-grow"
                            style={{
                              width: `${report.risk_score}%`,
                              height: '100%',
                              background: riskColor,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td><span className={getUrgencyBadgeClass(report.urgency)}>{report.urgency}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.assigned_doctor}</td>
                    <td><span className={getStatusBadgeClass(report.status)}>{report.status}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(report.uploaded_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onViewReport(report)}
                        id={`view-report-${report.report_id}`}
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
