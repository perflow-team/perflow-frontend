import { useQuery } from '@tanstack/react-query'
import { fetchEntityCard } from '@/features/lookup-word/api/wordLookupApi'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

interface UseEntityCardParams {
  novelId: string
  episodeId: string
  word: string | null
  contextSentence: string | null
  currentCharOffset: number
}

export function useEntityCard({ novelId, episodeId, word, contextSentence, currentCharOffset }: UseEntityCardParams) {
  const progress = useReaderStore((s) => s.progress)

  return useQuery({
    queryKey: ['entity', novelId, episodeId, word, currentCharOffset],
    queryFn: () =>
      fetchEntityCard({
        novelId,
        word: word as string,
        contextSentence: contextSentence as string,
        currentChapterNumber: Number(episodeId),
        progress,
        currentCharOffset,
      }),
    enabled: word != null && contextSentence != null,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
