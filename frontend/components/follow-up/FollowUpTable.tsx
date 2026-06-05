'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { getFollowUps, sendReminder, markFollowUpComplete } from '@/lib/api'
import { FollowUp } from '@/lib/types'
import { ReminderStatusBadge, FollowUpStatusBadge } from './ReminderStatusBadge'
import { formatDate } from '@/lib/utils'
import { Bell, CheckCircle, Calendar, User2, Clock } from 'lucide-react'

export default function FollowUpTable() {
  const { data: followUps = [], isLoading, mutate } = useSWR('followups', getFollowUps, { refreshInterval: 30000 })
  const [processing, setProcessing] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const handleRemind = async (id: string) => {
    setProcessing(id)
    await sendReminder(id)
    setMsg('Reminder sent successfully')
    await mutate()
    setProcessing(null)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleComplete = async (id: string) => {
    setProcessing(id)
    await markFollowUpComplete(id)
    setMsg('Follow-up marked as complete')
    await mutate()
    setProcessing(null)
    setTimeout(() => setMsg(''), 3000)
  }

  const scheduled = followUps.filter((f: FollowUp) => f.status === 'Scheduled').length
  const remindersSent = followUps.filter((f: FollowUp) => f.reminder_sent).length
  const missed = followUps.filter((f: FollowUp) => f.status === 'Missed').length

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Scheduled Today', value: scheduled, icon: Calendar, color: '#3b82f6', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.06)' },
          { label: 'Reminders Sent', value: remindersSent, icon: Bell, color: '#22c55e', border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.06)' },
          { label: 'Missed Appointments', value: missed, icon: Clock, color: '#ef4444', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Success message */}
      {msg && (
        <div style={{ padding: '10px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#4ade80' }}>
          ✓ {msg}
        </div>
      )}

      {/* Table */}
      <div className="vf-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vf-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Report Type</th>
                <th>Follow-Up Date</th>
                <th>Reminder Sent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}><div className="skeleton" style={{ width: 80, height: 13 }} /></td>
                  ))}</tr>
                ))
              ) : followUps.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No follow-ups found</td></tr>
              ) : (
                followUps.map((fu: FollowUp) => (
                  <tr key={fu.followup_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User2 size={12} color="var(--text-muted)" />
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{fu.patient_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fu.doctor_name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fu.report_type}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(fu.followup_date)}</td>
                    <td><ReminderStatusBadge sent={fu.reminder_sent} /></td>
                    <td><FollowUpStatusBadge status={fu.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {fu.status !== 'Completed' && (
                          <>
                            {!fu.reminder_sent && (
                              <button
                                id={`send-reminder-${fu.followup_id}`}
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleRemind(fu.followup_id)}
                                disabled={processing === fu.followup_id}
                                style={{ color: '#60a5fa' }}
                              >
                                <Bell size={11} />
                                {processing === fu.followup_id ? '...' : 'Remind'}
                              </button>
                            )}
                            <button
                              id={`mark-complete-${fu.followup_id}`}
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleComplete(fu.followup_id)}
                              disabled={processing === fu.followup_id}
                              style={{ color: '#4ade80' }}
                            >
                              <CheckCircle size={11} />
                              {processing === fu.followup_id ? '...' : 'Complete'}
                            </button>
                          </>
                        )}
                        {fu.status === 'Completed' && (
                          <span style={{ fontSize: 11, color: '#4ade80' }}>✓ Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
