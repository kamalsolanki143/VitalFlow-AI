'use client'

import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import PageWrapper from './PageWrapper'
import Sidebar from './Sidebar'
import { ReactNode } from 'react'

const BYPASS_ROUTES = ['/login', '/']

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isBypassPage = BYPASS_ROUTES.includes(pathname)

  // Auth/Landing pages — full screen, no sidebar, no topbar
  if (isBypassPage) {
    return (
      <div style={{ width: '100%' }}>
        {children}
      </div>
    )
  }

  // App pages — sidebar + topbar layout
  return (
    <div
      style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      <TopBar pathname={pathname} />
      <PageWrapper>{children}</PageWrapper>
    </div>
  )
}
