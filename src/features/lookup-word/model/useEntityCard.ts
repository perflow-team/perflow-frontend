import { useQuery } from '@tanstack/react-query'
import { fetchEntityCard } from '@/features/lookup-word/api/wordLookupApi'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

interface UseEntityCardParams {
  novelId: string
  episodeId: string
  word: string | null
  contextSentence: string | null
}

export function useEntityCard({ novelId, episodeId, word, contextSentence }: UseEntityCardParams) {
  const progress = useReaderStore((s) => s.progress)

  return useQuery({
    queryKey: ['entity', novelId, word, contextSentence, Math.floor(progress * 100)],
    queryFn: () =>
      fetchEntityCard({
        novelId,
        word: word as string,
        contextSentence: contextSentence as string,
        currentChapterNumber: Number(episodeId),
        progress,
      }),
    enabled: word != null && contextSentence != null,
    retry: false,
  })
}
