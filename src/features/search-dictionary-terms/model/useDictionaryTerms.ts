import { useQuery } from '@tanstack/react-query'
import { fetchDictionaryTerms } from '@/features/search-dictionary-terms/api/dictionaryApi'

interface UseDictionaryTermsParams {
  novelId: string
  episodeId: string
  query: string
}

export function useDictionaryTerms({ novelId, episodeId, query }: UseDictionaryTermsParams) {
  return useQuery({
    queryKey: ['dictionary-terms', novelId, episodeId, query.trim()],
    queryFn: () => fetchDictionaryTerms({ novelId, currentChapterNumber: Number(episodeId), query: query.trim() }),
    placeholderData: (prev) => prev,
    retry: false,
  })
}
