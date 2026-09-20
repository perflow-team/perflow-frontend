import { useQuery } from '@tanstack/react-query'
import { fetchEntityCard } from '@/features/lookup-word/api/wordLookupApi'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

interface UseEntityCardParams {
  novelId: string
  episodeId: string
  word: string | null
  contextSentence: string | null
  currentCharOffset: number
  selectionCharOffset?: number
}

export function useEntityCard({ novelId, episodeId, word, contextSentence, currentCharOffset, selectionCharOffset }: UseEntityCardParams) {
  const progress = useReaderStore((s) => s.progress)

  return useQuery({
    queryKey: ['entity', 'reader-card-v2', novelId, episodeId, word, currentCharOffset, selectionCharOffset],
    queryFn: () =>
      fetchEntityCard({
        novelId,
        word: word as string,
        contextSentence: contextSentence as string,
        currentChapterNumber: Number(episodeId),
        progress,
        currentCharOffset,
        selectionCharOffset,
      }),
    enabled: word != null && contextSentence != null,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
