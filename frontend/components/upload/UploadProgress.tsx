'use client'

import { useState, useEffect } from 'react'
import { UploadResponse, UrgencyLevel } from '@/lib/types'
import { Check, Loader2, AlertTriangle, UserCheck, Bell, Shield } from 'lucide-react'
import { getUrgencyBadgeClass, getRiskColor } from '@/lib/utils'

interface UploadProgressProps {
  isStarted: boolean        // true the moment user clicks Analyze — starts animation immediately
  response: UploadResponse | null  // arrives later from API; triggers result card
}

interface Step {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ size: number; color: string }>
  durationMs: number
}

const STEPS: Step[] = [
  { id: 'intake',       label: 'Report Intake',      description: 'Parsing and extracting medical data...',        icon: Shield,      durationMs: 900  },
  { id: 'analysis',    label: 'Medical Analysis',    description: 'Identifying abnormal values and biomarkers...', icon: AlertTriangle, durationMs: 1800 },
  { id: 'history',     label: 'History Check',       description: 'Retrieving patient medical history...',         icon: UserCheck,  durationMs: 700  },
  { id: 'risk',        label: 'Risk Prediction',     description: 'Computing emergency risk score...',             icon: Shield,      durationMs: 2000 },
  { id: 'routing',     label: 'Doctor Routing',      description: 'Assigning to the right specialist...',          icon: UserCheck,  durationMs: 600  },
  { id: 'notification',label: 'Notification',        description: 'Sending Telegram + email alert...',            icon: Bell,        durationMs: 800  },
]

const TOTAL_ANIMATION_MS = STEPS.reduce((sum, s) => sum + s.durationMs, 0) // ~6.8 s

type StepState = 'pending' | 'running' | 'done'

export default function UploadProgress({ isStarted, response }: UploadProgressProps) {
  const [stepStates, setStepStates] = useState<StepState[]>(STEPS.map(() => 'pending'))
  const [animDone, setAnimDone] = useState(false)

  // Start animation chain the moment isStarted becomes true
  useEffect(() => {
    if (!isStarted) {
      setStepStates(STEPS.map(() => 'pending'))
      setAnimDone(false)
      return
    }

    let idx = 0
    let cancelled = false

    const runNext = () => {
      if (cancelled || idx >= STEPS.length) {
        if (!cancelled) setAnimDone(true)
        return
      }
      const i = idx++

      setStepStates(prev => {
        const next = [...prev]
        next[i] = 'running'
        return next
      })

      setTimeout(() => {
        if (cancelled) return
        setStepStates(prev => {
          const next = [...prev]
          next[i] = 'done'
          return next
        })
        runNext()
      }, STEPS[i].durationMs)
    }

    runNext()
    return () => { cancelled = true }
  }, [isStarted])

  // Show result card when BOTH animation is done AND API response arrived
  const showResult = animDone && response !== null

  const urgencyColor = response?.urgency ? getRiskColor(response.risk_score ?? 0) : '#64748b'

  return (
    <div className="vf-card fade-in" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          AI Agent Pipeline Running
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          Your report is being processed by 10 specialized AI agents
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {STEPS.map((step, idx) => {
          const state = stepStates[idx]
          const Icon = step.icon

          return (
            <div
              key={step.id}
              style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
            >
              {/* Circle + connector line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
                <div
                  className={state === 'done' ? 'step-complete' : ''}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      state === 'done'    ? 'rgba(34,197,94,0.2)' :
                      state === 'running' ? 'rgba(245,158,11,0.2)' :
                      'var(--bg-secondary)',
                    border: `2px solid ${
                      state === 'done'    ? '#22c55e' :
                      state === 'running' ? '#f59e0b' :
                      'var(--border)'
                    }`,
                    transition: 'all 0.3s',
                    flexShrink: 0,
                  }}
                >
                  {state === 'done' ? (
                    <Check size={13} color="#22c55e" />
                  ) : state === 'running' ? (
                    <Loader2
                      size={13}
                      color="#f59e0b"
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                  ) : (
                    <Icon size={11} color="var(--text-muted)" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 20,
                      background: state === 'done' ? '#22c55e' : 'var(--border)',
                      transition: 'background 0.3s',
                      margin: '2px 0',
                    }}
                  />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, paddingBottom: idx < STEPS.length - 1 ? 16 : 0, paddingTop: 2 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: state === 'running' ? 600 : 500,
                    color:
                      state === 'pending' ? 'var(--text-muted)' :
                      state === 'running' ? '#fbbf24' :
                      'var(--text-primary)',
                    transition: 'color 0.2s',
                    marginBottom: 2,
                  }}
                >
                  {step.label}
                </div>
                {state !== 'pending' && (
                  <div style={{ fontSize: 11, color: state === 'done' ? '#4ade80' : '#f59e0b' }}>
                    {state === 'done' ? '✓ Completed' : step.description}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Waiting for API (animation done but no response yet) */}
      {animDone && !response && (
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          Waiting for server response...
        </div>
      )}

      {/* Result Card — shown only when animation done AND response received */}
      {showResult && response && (
        <div
          className="fade-in"
          style={{
            marginTop: 24,
            background: 'var(--bg-secondary)',
            border: `1px solid ${urgencyColor}44`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 14,
            }}
          >
            ✓ Pipeline Complete — Results
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Report ID</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{response.report_id}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Score</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: urgencyColor, lineHeight: 1 }}>
                {response.risk_score ?? '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Urgency</div>
              {response.urgency && (
                <span className={getUrgencyBadgeClass(response.urgency as UrgencyLevel)}>
                  {response.urgency}
                </span>
              )}
            </div>
          </div>
          {response.assigned_doctor && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--border)',
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Assigned to: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{response.assigned_doctor}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>— Telegram + email notification sent</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
