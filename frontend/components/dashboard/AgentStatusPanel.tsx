'use client'

import { AgentStatusInfo, AgentStatus } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Bot } from 'lucide-react'

interface AgentStatusPanelProps {
  agents: AgentStatusInfo[]
  isLoading: boolean
}

function StatusDot({ status }: { status: AgentStatus }) {
  const colors: Record<AgentStatus, string> = {
    completed: '#22c55e',
    running: '#f59e0b',
    failed: '#ef4444',
    pending: '#64748b',
  }
  const glow: Record<AgentStatus, string> = {
    completed: '0 0 6px #22c55e',
    running: '0 0 8px #f59e0b',
    failed: '0 0 6px #ef4444',
    pending: 'none',
  }
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: colors[status],
        boxShadow: glow[status],
        flexShrink: 0,
      }}
      className={status === 'running' ? 'pulse-amber' : ''}
    />
  )
}

export default function AgentStatusPanel({ agents, isLoading }: AgentStatusPanelProps) {
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
        <Bot size={14} color="var(--accent)" />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          AI Agent Pipeline
        </h2>
      </div>
      <div style={{ padding: '8px 0' }}>
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ padding: '8px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
              <div className="skeleton" style={{ flex: 1, height: 12 }} />
              <div className="skeleton" style={{ width: 40, height: 12 }} />
            </div>
          ))
        ) : (
          agents.map((agent, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 18px',
                borderBottom: idx < agents.length - 1 ? '1px solid rgba(31,45,69,0.4)' : 'none',
              }}
            >
              <StatusDot status={agent.status} />
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)' }}>
                {agent.agent_name}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {formatRelativeTime(agent.last_run)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
