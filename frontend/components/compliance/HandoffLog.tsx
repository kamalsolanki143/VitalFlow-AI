'use client'

import React, { useState, useMemo } from 'react'
import { useCompliance } from '@/hooks/useCompliance'
import { ComplianceLog, AgentStep, SLAStatus } from '@/lib/types'
import { formatDateTime, formatDuration, formatDurationMs } from '@/lib/utils'
import SLAStatusBadge from './SLAStatusBadge'
import { ChevronDown, ChevronRight, Filter, Search } from 'lucide-react'

function AgentTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        Agent Handoff Log
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 12, paddingBottom: idx < steps.length - 1 ? 10 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: step.status === 'completed' ? '#22c55e' : step.status === 'failed' ? '#ef4444' : '#f59e0b',
                flexShrink: 0, marginTop: 2,
              }} />
              {idx < steps.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', margin: '2px 0' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{step.agent_name}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDurationMs(step.duration_ms)}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{step.action}</div>
              <div style={{ fontSize: 10, color: '#334155' }}>{formatDateTime(step.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HandoffLog() {
  const { logs, isLoading } = useCompliance()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [slaFilter, setSlaFilter] = useState<'All' | SLAStatus>('All')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (slaFilter !== 'All' && log.sla_status !== slaFilter) return false
      if (search && !log.patient_name.toLowerCase().includes(search.toLowerCase()) && !log.report_id.toLowerCase().includes(search.toLowerCase())) return false
      if (dateFrom && new Date(log.uploaded_at) < new Date(dateFrom)) return false
      if (dateTo && new Date(log.uploaded_at) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [logs, slaFilter, search, dateFrom, dateTo])

  const metCount = logs.filter(l => l.sla_status === 'Met').length
  const breachedCount = logs.filter(l => l.sla_status === 'Breached').length

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Reports', value: logs.length, color: 'var(--accent)', borderColor: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.06)' },
          { label: 'SLA Met', value: metCount, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.06)' },
          { label: 'SLA Breached', value: breachedCount, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.borderColor}`, borderRadius: 10, padding: '14px 20px' }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 280 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input id="compliance-search" className="vf-input" style={{ paddingLeft: 30 }} placeholder="Search patient or report ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Filter size={12} color="var(--text-muted)" />
        <select id="sla-filter" className="vf-input" style={{ width: 'auto', cursor: 'pointer' }} value={slaFilter} onChange={e => setSlaFilter(e.target.value as 'All' | SLAStatus)}>
          <option>All</option>
          <option>Met</option>
          <option>Breached</option>
        </select>
        <input id="date-from" className="vf-input" type="date" style={{ width: 'auto', colorScheme: 'dark' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
        <input id="date-to" className="vf-input" type="date" style={{ width: 'auto', colorScheme: 'dark' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="vf-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vf-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient</th>
                <th>Uploaded At</th>
                <th>Completed At</th>
                <th>Total Time</th>
                <th>SLA Status</th>
                <th>Log</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}><div className="skeleton" style={{ width: 80, height: 13 }} /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No compliance records found</td></tr>
              ) : (
                filtered.map((log: ComplianceLog) => (
                  <React.Fragment key={log.report_id}>
                    <tr
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedId(expandedId === log.report_id ? null : log.report_id)}
                    >
                      <td className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{log.report_id}</td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{log.patient_name}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(log.uploaded_at)}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(log.pipeline_completed_at)}</td>
                      <td>
                        <span
                          className="mono"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: log.total_time_seconds > 300 ? '#ef4444' : '#22c55e',
                          }}
                        >
                          {formatDuration(log.total_time_seconds)}
                        </span>
                      </td>
                      <td><SLAStatusBadge status={log.sla_status} /></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" id={`expand-log-${log.report_id}`}>
                          {expandedId === log.report_id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          {expandedId === log.report_id ? 'Collapse' : 'View Log'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === log.report_id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <AgentTimeline steps={log.agent_steps} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
