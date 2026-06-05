'use client'

import { FollowUpStatus } from '@/lib/types'

interface ReminderStatusBadgeProps {
  sent: boolean
}

interface FollowUpStatusBadgeProps {
  status: FollowUpStatus
}

export function ReminderStatusBadge({ sent }: ReminderStatusBadgeProps) {
  return (
    <span
      className="badge"
      style={
        sent
          ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
          : { background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }
      }
    >
      {sent ? '✓ Sent' : '— Pending'}
    </span>
  )
}

export function FollowUpStatusBadge({ status }: FollowUpStatusBadgeProps) {
  const map: Record<FollowUpStatus, { bg: string; color: string; border: string }> = {
    Scheduled: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    Completed: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    Missed: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    Pending: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  }
  const s = map[status]
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}
