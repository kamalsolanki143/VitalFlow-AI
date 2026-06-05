'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Report',
  '/doctor-queue': 'Doctor Queue',
  '/compliance': 'Compliance Logs',
  '/follow-up': 'Follow-Up Tracker',
}

interface TopBarProps {
  pathname: string
}

export default function TopBar({ pathname }: TopBarProps) {
  const [time, setTime] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [lastRefresh, setLastRefresh] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setLastRefresh(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const title = PAGE_TITLES[pathname] ?? 'VitalFlow'

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Page title */}
      <div>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Last refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
          <RefreshCw size={11} />
          <span>Refreshed {lastRefresh}</span>
        </div>

        {/* System status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: isOnline ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isOnline ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            fontSize: 11,
            fontWeight: 600,
            color: isOnline ? '#4ade80' : '#f87171',
          }}
        >
          {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          {isOnline ? 'System Online' : 'Backend Offline'}
        </div>

        {/* Clock */}
        <div
          className="mono"
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          {time}
        </div>
      </div>
    </header>
  )
}
