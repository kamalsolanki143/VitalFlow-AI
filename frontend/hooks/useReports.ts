import useSWR from 'swr'
import { getReports, getDashboardStats, getAgentStatus } from '@/lib/api'

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR('reports', getReports, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })

  //console.log("REPORTS DATA =", data)
  //console.log("REPORTS ERROR =", error)

  return {
    reports: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR('dashboard-stats', getDashboardStats, {
    refreshInterval: 10000,
  })
  return { stats: data, isLoading, isError: !!error }
}

export function useAgentStatus() {
  const { data, error, isLoading } = useSWR('agent-status', getAgentStatus, {
    refreshInterval: 10000,
  })
  return { agents: data ?? [], isLoading, isError: !!error }
}