import { useEffect, useMemo } from 'react'
import { updateProgress } from '@/entities/reading-progress/api/progressApi'
import { throttle } from '@/shared/lib/throttle'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

interface UseReaderProgressParams {
  novelId: string
  episodeId: string
  totalChars: number
}

// Watches the reader store's progress value (which updates on every scroll
// frame / page turn for a smooth UI) and persists it to the server at most
// once every 500ms, decoupling UI responsiveness from network calls.
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
        // best-effort: progress will resync on the next successful save
      })
    }, 500), [novelId, episodeId])

  useEffect(() => () => throttledSave.cancel(), [throttledSave])

  useEffect(() => {
    if (totalChars <= 0) return
    throttledSave(progress, totalChars)
  }, [progress, totalChars, throttledSave])
}
