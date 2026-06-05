'use client'

import { useState, useMemo } from 'react'
import { useDoctorQueue } from '@/hooks/useDoctorQueue'
import { Report, UrgencyLevel, ReportStatus } from '@/lib/types'
import { getUrgencyBadgeClass, getStatusBadgeClass, getRowClass, getRiskColor, formatRelativeTime } from '@/lib/utils'
import ReportDetailModal from '@/components/doctor-queue/ReportDetailModal'
import { Search, Filter, Eye, ChevronDown } from 'lucide-react'

const URGENCY_OPTIONS: ('All' | UrgencyLevel)[] = ['All', 'Critical', 'Medium', 'Low']
const STATUS_OPTIONS: ('All' | ReportStatus)[] = ['All', 'Pending Review', 'Acknowledged', 'Escalated', 'Complete']

export default function QueueTable() {
  const { queue, isLoading, mutate } = useDoctorQueue()
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | UrgencyLevel>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | ReportStatus>('All')
  const [search, setSearch] = useState('')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return queue
      .filter(r => urgencyFilter === 'All' || r.urgency === urgencyFilter)
      .filter(r => statusFilter === 'All' || r.status === statusFilter)
      .filter(r => !search || r.patient_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.risk_score - a.risk_score)
  }, [queue, urgencyFilter, statusFilter, search])

  return (
    <>
      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="queue-search"
            className="vf-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search patient name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Filter size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />

        {/* Urgency filter */}
        <div style={{ position: 'relative' }}>
          <select
            id="urgency-filter"
            className="vf-input"
            style={{ appearance: 'none', paddingRight: 28, cursor: 'pointer' }}
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value as 'All' | UrgencyLevel)}
          >
            {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative' }}>
          <select
            id="status-filter"
            className="vf-input"
            style={{ appearance: 'none', paddingRight: 28, cursor: 'pointer' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'All' | ReportStatus)}
          >
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} report{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="vf-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vf-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Age</th>
                <th>Report Type</th>
                <th style={{ minWidth: 150 }}>Risk Score</th>
                <th>Urgency</th>
                <th>Assigned Doctor</th>
                <th>Assigned At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j}><div className="skeleton" style={{ width: j === 4 ? 130 : 70, height: 13 }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No reports match the current filters
                  </td>
                </tr>
              ) : (
                filtered.map((report: Report, idx: number) => {
                  const riskColor = getRiskColor(report.risk_score)
                  return (
                    <tr key={report.report_id} className={getRowClass(report.urgency)}>
                      <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{report.patient_name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{report.patient_id}</div>
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>{report.patient_age}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.report_type}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: riskColor, minWidth: 24 }}>
                            {report.risk_score}
                          </span>
                          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div className="gauge-grow" style={{ width: `${report.risk_score}%`, height: '100%', background: riskColor, borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={getUrgencyBadgeClass(report.urgency)}>{report.urgency}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.assigned_doctor}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(report.uploaded_at)}</td>
                      <td><span className={getStatusBadgeClass(report.status)}>{report.status}</span></td>
                      <td>
                        <button
                          id={`queue-view-${report.report_id}`}
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedReportId(report.report_id)}
                        >
                          <Eye size={11} />
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

      {selectedReportId && (
        <ReportDetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
          onAcknowledged={() => { mutate(); setSelectedReportId(null) }}
        />
      )}
    </>
  )
}
