import { useQuery } from '@tanstack/react-query'
import { fetchEntityCard } from '../../../shared/api/entities'
import { useReaderStore } from '../../reader/store/useReaderStore'

interface UseEntityCardParams {
  novelId: string
  entityId: string | null
}

export function useEntityCard({ novelId, entityId }: UseEntityCardParams) {
  const progress = useReaderStore((s) => s.progress)

  return useQuery({
    queryKey: ['entity', novelId, entityId, Math.floor(progress * 100)],
    queryFn: () => fetchEntityCard({ novelId, entityId: entityId as string, progress }),
    enabled: entityId != null,
  })
}
