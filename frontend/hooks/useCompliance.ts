import useSWR from 'swr'
import { getComplianceLogs } from '@/lib/api'

export function useCompliance() {
  const { data, error, isLoading, mutate } = useSWR('compliance', getComplianceLogs, {
    refreshInterval: 30000,
  })
  return {
    logs: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
