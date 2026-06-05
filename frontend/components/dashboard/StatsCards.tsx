'use client'

import { DashboardStats } from '@/lib/types'
import { FileText, AlertTriangle, Clock, Zap } from 'lucide-react'

interface StatsCardsProps {
  stats: DashboardStats | undefined
  isLoading: boolean
}

const cards = [
  {
    key: 'total_today' as keyof DashboardStats,
    label: 'Total Reports Today',
    icon: FileText,
    color: 'var(--accent)',
    borderColor: 'rgba(59,130,246,0.4)',
    bg: 'rgba(59,130,246,0.06)',
  },
  {
    key: 'critical_count' as keyof DashboardStats,
    label: 'Critical Reports',
    icon: AlertTriangle,
    color: 'var(--critical)',
    borderColor: 'rgba(239,68,68,0.4)',
    bg: 'var(--critical-bg)',
  },
  {
    key: 'pending_review' as keyof DashboardStats,
    label: 'Pending Doctor Review',
    icon: Clock,
    color: 'var(--medium)',
    borderColor: 'rgba(245,158,11,0.4)',
    bg: 'var(--medium-bg)',
  },
  {
    key: 'escalations_active' as keyof DashboardStats,
    label: 'Escalations Active',
    icon: Zap,
    color: '#a855f7',
    borderColor: 'rgba(168,85,247,0.4)',
    bg: 'rgba(168,85,247,0.06)',
  },
]

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map(({ key, label, icon: Icon, color, borderColor, bg }) => (
        <div
          key={key}
          className="fade-in"
          style={{
            background: bg,
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: '20px 22px',
          }}
        >
          {isLoading ? (
            <div>
              <div className="skeleton" style={{ width: 60, height: 36, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 120, height: 14 }} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div
                  className="mono"
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {stats?.[key] ?? 0}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `${color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} color={color} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                {label}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
