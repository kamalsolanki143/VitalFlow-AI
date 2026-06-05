'use client'

import { useState } from 'react'
import { useReports, useDashboardStats, useAgentStatus } from '@/hooks/useReports'
import StatsCards from '@/components/dashboard/StatsCards'
import RiskPriorityTable from '@/components/dashboard/RiskPriorityTable'
import AgentStatusPanel from '@/components/dashboard/AgentStatusPanel'
import RecentReports from '@/components/dashboard/RecentReports'
import ReportDetailModal from '@/components/doctor-queue/ReportDetailModal'
import { Report } from '@/lib/types'

export default function DashboardPage() {
  const { reports, isLoading: reportsLoading } = useReports()
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { agents, isLoading: agentsLoading } = useAgentStatus()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  return (
    <>
      <StatsCards stats={stats} isLoading={statsLoading} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <RiskPriorityTable
          reports={reports}
          isLoading={reportsLoading}
          onViewReport={setSelectedReport}
        />
        <AgentStatusPanel agents={agents} isLoading={agentsLoading} />
      </div>

      <div style={{ maxWidth: 420 }}>
        <RecentReports reports={reports} isLoading={reportsLoading} />
      </div>

      {selectedReport && (
        <ReportDetailModal
          reportId={selectedReport.report_id}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  )
}
