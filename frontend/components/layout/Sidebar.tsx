'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  Stethoscope,
  ClipboardList,
  CalendarCheck,
  Activity,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Report', icon: Upload },
  { href: '/doctor-queue', label: 'Doctor Queue', icon: Stethoscope },
  { href: '/compliance', label: 'Compliance Logs', icon: ClipboardList },
  { href: '/follow-up', label: 'Follow-Up Tracker', icon: CalendarCheck },
]

export default function Sidebar() {
  const pathname = usePathname()

  // Don't render on auth or landing pages
  if (pathname === '/login' || pathname === '/') return null

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Activity size={18} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              VitalFlow
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI Healthcare
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#60a5fa' : 'var(--text-muted)',
                background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Log Out Button */}
        <div style={{ marginTop: 'auto', padding: '0 4px' }}>
          <button
            onClick={() => {
              // Standard route logout
              window.location.href = '/'
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(239, 68, 68, 0.85)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.color = '#f87171'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(239, 68, 68, 0.85)'
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }}
          />
          <span>AI Pipeline Active</span>
        </div>
        <div style={{ marginTop: 4, color: '#334155', fontSize: 10 }}>
          v1.0 — Hackathon Build
        </div>
      </div>
    </aside>
  )
}
