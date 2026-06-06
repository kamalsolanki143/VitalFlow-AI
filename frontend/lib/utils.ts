import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { UrgencyLevel, ReportStatus, FollowUpStatus, SLAStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getUrgencyBadgeClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'Critical': return 'badge badge-critical'
    case 'Medium': return 'badge badge-medium'
    case 'Low': return 'badge badge-low'
  }
}

export function getStatusBadgeClass(status: ReportStatus): string {
  switch (status) {
    case 'Pending Review': return 'badge badge-pending'
    case 'Acknowledged': return 'badge badge-acknowledged'
    case 'Escalated': return 'badge badge-escalated'
    case 'Complete': return 'badge badge-complete'
  }
}

export function getFollowUpBadgeClass(status: FollowUpStatus): string {
  switch (status) {
    case 'Scheduled': return 'badge badge-scheduled'
    case 'Completed': return 'badge badge-complete'
    case 'Missed': return 'badge badge-missed'
    case 'Pending': return 'badge badge-pending'
  }
}

export function getSLABadgeClass(status: SLAStatus): string {
  switch (status) {
    case 'Met': return 'badge badge-met'
    case 'Breached': return 'badge badge-breached'
  }
}

export function getRiskColor(score: number): string {
  if (score >= 75) return '#ef4444'
  if (score >= 45) return '#f59e0b'
  return '#22c55e'
}

export function getRowClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'Critical': return 'row-critical'
    case 'Medium': return 'row-medium'
    case 'Low': return 'row-low'
  }
}
