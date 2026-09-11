import { useQuery } from '@tanstack/react-query'
import { fetchDictionaryTerms } from '../../../shared/api/dictionary'
import { useReaderStore } from '../../reader/store/useReaderStore'

interface UseDictionaryTermsParams {
  novelId: string
  query: string
}

export function useDictionaryTerms({ novelId, query }: UseDictionaryTermsParams) {
  const progress = useReaderStore((s) => s.progress)

  return useQuery({
    queryKey: ['dictionary', novelId, Math.floor(progress * 100), query.trim()],
    queryFn: () => fetchDictionaryTerms({ novelId, progress, query }),
    placeholderData: (prev) => prev,
  })
}
