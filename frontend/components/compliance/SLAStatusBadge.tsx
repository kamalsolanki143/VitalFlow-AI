'use client'

import { SLAStatus } from '@/lib/types'

interface SLAStatusBadgeProps {
  status: SLAStatus
}

export default function SLAStatusBadge({ status }: SLAStatusBadgeProps) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {status === 'Met' ? '✓' : '✗'} SLA {status}
    </span>
  )
}
