import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/base'
import type { EntityMark } from '@/entities/chapter/model/types'
import { useEffect } from 'react'

interface LookupTargets {
  status: 'preparing' | 'completed' | 'failed' | 'not_prepared'
  targets: EntityMark[]
}

export function useLookupTargets(novelId: string, episodeId: string, enabled: boolean) {
  const client = useQueryClient()
  const queryKey = ['lookup-targets', novelId, episodeId]
  const fetch = async () => {
    const { data } = await api.get<LookupTargets>(`/api/novels/${novelId}/chapters/${episodeId}/lookup-targets`)
    return data
  }
  const query = useQuery({
    queryKey, queryFn: () => fetch(), enabled, retry: false, staleTime: 60_000,
    refetchInterval: (query) => query.state.data?.status === 'preparing' ? 2000 : false,
  })
  useEffect(() => {
    if (query.data?.status === 'completed') void client.invalidateQueries({ queryKey: ['dictionary-terms', novelId, episodeId] })
  }, [client, query.data?.status, novelId, episodeId])
  return query
}
