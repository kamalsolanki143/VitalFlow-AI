'use client'

import { useState, useEffect } from 'react'
import { getReportDetail, acknowledgeReport, escalateReport } from '@/lib/api'
import { ReportDetail, AgentStep, AbnormalFlag } from '@/lib/types'
import {
  getUrgencyBadgeClass,
  getStatusBadgeClass,
  getRiskColor,
  formatDateTime,
  formatDurationMs,
} from '@/lib/utils'
import { X, CheckCircle, AlertTriangle, User, Clock, Bot, FlaskConical, FileText } from 'lucide-react'

interface ReportDetailModalProps {
  reportId: string
  onClose: () => void
  onAcknowledged?: () => void
}

function AgentTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div style={{ padding: '8px 0' }}>
      {steps.map((step, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            gap: 12,
            padding: '10px 0',
            borderBottom: idx < steps.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: step.status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                border: `1px solid ${step.status === 'completed' ? 'rgba(34,197,94,0.4)' : 'rgba(59,130,246,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 10,
                fontWeight: 700,
                color: step.status === 'completed' ? '#4ade80' : '#60a5fa',
              }}
            >
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                {step.agent_name}
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {formatDurationMs(step.duration_ms)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {step.action}
            </p>
            <span style={{ fontSize: 10, color: '#334155' }}>{formatDateTime(step.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AbnormalFlagsTable({ flags }: { flags: AbnormalFlag[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="vf-table" style={{ fontSize: 12 }}>
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Reference</th>
            <th>Deviation</th>
            <th>Risk</th>
            <th>Concern</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag, idx) => {
            const deviationColor =
              flag.deviation_percent > 500 ? '#ef4444' :
              flag.deviation_percent > 100 ? '#f59e0b' : '#22c55e'
            return (
              <tr key={idx}>
                <td style={{ fontWeight: 600, fontSize: 12 }}>{flag.test_name}</td>
                <td>
                  <span className="mono" style={{ color: deviationColor, fontWeight: 700 }}>
                    {flag.value} {flag.unit}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{flag.reference_range}</td>
                <td>
                  <span className="mono" style={{ color: deviationColor, fontWeight: 600 }}>
                    +{flag.deviation_percent}%
                  </span>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: flag.risk_level === 'Critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: flag.risk_level === 'Critical' ? '#f87171' : '#fbbf24',
                      border: `1px solid ${flag.risk_level === 'Critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    }}
                  >
                    {flag.risk_level}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 160 }}>{flag.possible_concern}</td>
                <td style={{ fontSize: 11, color: '#60a5fa' }}>{flag.suggested_action}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: React.ComponentType<{ size: number; color: string }>, label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 }}>
      <Icon size={13} color="var(--accent)" />
      <h3 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </h3>
    </div>
  )
}

export default function ReportDetailModal({ reportId, onClose, onAcknowledged }: ReportDetailModalProps) {
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [acknowledging, setAcknowledging] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    getReportDetail(reportId).then(r => {
      setReport(r)
      setLoading(false)
    })
  }, [reportId])

  const handleAcknowledge = async () => {
    setAcknowledging(true)
    await acknowledgeReport(reportId)
    setActionMsg('✓ Report acknowledged successfully')
    setAcknowledging(false)
    onAcknowledged?.()
  }

  const handleEscalate = async () => {
    setEscalating(true)
    await escalateReport(reportId)
    setActionMsg('⚡ Escalation triggered — senior team notified')
    setEscalating(false)
  }

  const riskColor = report ? getRiskColor(report.risk_score) : '#64748b'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 920,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {loading ? 'Loading Report...' : `Report: ${report?.patient_name}`}
            </div>
            {report && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {report.report_id} · {report.report_type} · Age {report.patient_age}
              </div>
            )}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            id="modal-close-btn"
            style={{ padding: 6 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: '100%', height: i === 0 ? 80 : 40 }} />
              ))}
            </div>
          ) : report ? (
            <>
              {/* Patient + Risk Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <SectionTitle icon={User} label="Patient Info" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    {[
                      ['Name', report.patient_name],
                      ['Patient ID', report.patient_id],
                      ['Age', String(report.patient_age)],
                      ['Report Type', report.report_type],
                      ['Assigned Doctor', report.assigned_doctor],
                      ['Referring Doctor', report.referring_doctor],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginTop: 1 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <span className={getUrgencyBadgeClass(report.urgency)}>{report.urgency}</span>
                    <span className={getStatusBadgeClass(report.status)}>{report.status}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${riskColor}44`,
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <SectionTitle icon={AlertTriangle} label="Risk Assessment" />
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Risk Score</div>
                      <span className="mono" style={{ fontSize: 44, fontWeight: 800, color: riskColor, lineHeight: 1 }}>
                        {report.risk_score}
                      </span>
                      <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                        <div
                          className="gauge-grow"
                          style={{ width: `${report.risk_score}%`, height: '100%', background: riskColor, borderRadius: 4 }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Emergency Prediction: <span className="mono" style={{ color: riskColor }}>{report.emergency_prediction_score}/100</span></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Routing reason:</strong> {report.routing_reason}
                  </div>
                </div>
              </div>

              {/* Abnormal Flags */}
              <SectionTitle icon={FlaskConical} label="Abnormal Test Values" />
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <AbnormalFlagsTable flags={report.abnormal_flags} />
              </div>

              {/* Explainability */}
              <SectionTitle icon={FileText} label="AI Explainability" />
              <div
                style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.7,
                }}
              >
                {report.explainability_text}
              </div>

              {/* Patient History */}
              <SectionTitle icon={User} label="Patient History Summary" />
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                }}
              >
                {report.patient_history_summary}
              </div>

              {/* Agent Timeline */}
              <SectionTitle icon={Bot} label="Agent Pipeline Timeline" />
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '0 16px',
                }}
              >
                <AgentTimeline steps={report.agent_pipeline} />
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ fontSize: 12, color: '#22c55e' }}>{actionMsg}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            <button
              id="escalate-btn"
              className="btn btn-danger"
              onClick={handleEscalate}
              disabled={escalating}
            >
              <AlertTriangle size={13} />
              {escalating ? 'Escalating...' : 'Escalate Now'}
            </button>
            <button
              id="acknowledge-btn"
              className="btn btn-success"
              onClick={handleAcknowledge}
              disabled={acknowledging}
            >
              <CheckCircle size={13} />
              {acknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
