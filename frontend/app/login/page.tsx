'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  Users,
  CheckCircle,
} from 'lucide-react'

const FEATURES = [
  { icon: Zap,     label: '10-Agent AI Pipeline',     desc: 'Every report processed by specialized medical AI' },
  { icon: Shield,  label: 'Emergency Risk Prediction', desc: 'Real-time critical risk scoring with explainability' },
  { icon: Users,   label: 'Smart Doctor Routing',      desc: 'Auto-assigns reports to the right specialist' },
]

const STATS = [
  { value: '< 3 min', label: 'Avg. Pipeline Time' },
  { value: '99.4%',   label: 'Accuracy Rate' },
  { value: '0',       label: 'Critical Reports Missed' },
]

// Floating stat card component
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: '14px 18px',
        backdropFilter: 'blur(8px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#60a5fa',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    // Simulate auth — any credentials work for demo
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── LEFT PANEL: Brand + Features ─────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 52%',
          background: 'linear-gradient(145deg, #0a0f1e 0%, #0f1729 40%, #0d1b3e 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
            }}
          >
            <Activity size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
              VitalFlow
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AI Healthcare Coordination
            </div>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11,
              color: '#93c5fd',
              fontWeight: 500,
              marginBottom: 24,
              letterSpacing: '0.03em',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            10-Agent AI Pipeline Active
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#f1f5f9',
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              margin: '0 0 20px',
            }}
          >
            No Critical Report
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Goes Unnoticed.
            </span>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7,
              margin: '0 0 40px',
              maxWidth: 420,
            }}
          >
            VitalFlow automatically processes diagnostic reports, predicts emergency risk,
            routes to the right doctor, and escalates if there's no response.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, position: 'relative' }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ───────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          background: 'var(--bg-secondary)',
          position: 'relative',
        }}
      >
        {/* Subtle top gradient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
            backgroundSize: '200% 100%',
          }}
        />

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#f1f5f9',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Sign in to access the VitalFlow coordination platform
            </p>
          </div>

          {/* Quick access hint */}
          <div
            style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 11,
              color: '#93c5fd',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CheckCircle size={12} />
            Demo mode — use any email and password to sign in
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="vf-input"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ fontSize: 14 }}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11,
                    color: '#60a5fa',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="vf-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ fontSize: 14, paddingRight: 40 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 7,
                  padding: '9px 13px',
                  fontSize: 12,
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '13px',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? 'rgba(59,130,246,0.4)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to VitalFlow
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '28px 0 20px',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ROLE ACCESS</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Role quick-login buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { role: 'Coordinator', email: 'coordinator@hospital.com' },
              { role: 'Doctor',      email: 'doctor@hospital.com'      },
              { role: 'Admin',       email: 'admin@hospital.com'       },
            ].map(({ role, email: roleEmail }) => (
              <button
                key={role}
                id={`quicklogin-${role.toLowerCase()}`}
                type="button"
                onClick={() => {
                  setEmail(roleEmail)
                  setPassword('demo1234')
                }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  padding: '8px 6px',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                }}
                onMouseEnter={e => {
                  ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)'
                  ;(e.target as HTMLButtonElement).style.color = '#60a5fa'
                }}
                onMouseLeave={e => {
                  ;(e.target as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.target as HTMLButtonElement).style.color = 'var(--text-muted)'
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Footer note */}
          <p
            style={{
              marginTop: 32,
              fontSize: 11,
              color: '#334155',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            VitalFlow is for authorized hospital staff only.
            <br />
            Hackathon demo — no real credentials required.
          </p>
        </div>
      </div>
    </div>
  )
}
