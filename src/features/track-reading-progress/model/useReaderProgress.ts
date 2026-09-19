import { useEffect, useMemo } from 'react'
import { updateProgress } from '@/entities/reading-progress/api/progressApi'
import { throttle } from '@/shared/lib/throttle'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

interface UseReaderProgressParams {
  novelId: string
  episodeId: string
  totalChars: number
}

export function useReaderProgress({ novelId, episodeId, totalChars }: UseReaderProgressParams) {
  const progress = useReaderStore((s) => s.progress)
  const throttledSave = useMemo(() =>
    throttle((p: number, chars: number) => {
      updateProgress({
        novelId,
        currentChapterNumber: Number(episodeId),
        currentCharOffset: Math.round(p * chars),
        progress: p,
      }).catch(() => {
      })
    }, 500), [novelId, episodeId])

  useEffect(() => () => throttledSave.cancel(), [throttledSave])

  useEffect(() => {
    if (totalChars <= 0) return
    throttledSave(progress, totalChars)
  }, [progress, totalChars, throttledSave])
}
