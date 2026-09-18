import { useQuery } from '@tanstack/react-query'
import { fetchDictionaryTerms } from '@/features/search-dictionary-terms/api/dictionaryApi'

interface UseDictionaryTermsParams {
  novelId: string
  episodeId: string
  query: string
  currentCharOffset: number
}

export function useDictionaryTerms({ novelId, episodeId, query, currentCharOffset }: UseDictionaryTermsParams) {
  return useQuery({
    queryKey: ['dictionary-terms', novelId, episodeId, currentCharOffset, query.trim()],
    queryFn: () => fetchDictionaryTerms({ novelId, currentChapterNumber: Number(episodeId), query: query.trim(), currentCharOffset }),
    retry: false,
  })
}
