import useSWR from 'swr'
import { getReports } from '@/lib/api'

export function useDoctorQueue() {
  const { data, error, isLoading, mutate } = useSWR('doctor-queue', getReports, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })
  return {
    queue: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
