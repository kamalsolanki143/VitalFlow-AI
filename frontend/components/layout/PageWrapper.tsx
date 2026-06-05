import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <main
      style={{
        padding: '24px',
        maxWidth: '1600px',
        margin: '0 auto',
      }}
    >
      {children}
    </main>
  )
}
