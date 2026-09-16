import { useEffect, useRef } from 'react'
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
  const totalCharsRef = useRef(totalChars)
  totalCharsRef.current = totalChars

  const throttledSave = useRef(
    throttle((p: number) => {
      updateProgress({
        novelId,
        currentChapterNumber: Number(episodeId),
        currentCharOffset: Math.round(p * totalCharsRef.current),
        progress: p,
      }).catch(() => {
        // best-effort: progress will resync on the next successful save
      })
    }, 500),
  ).current

  useEffect(() => {
    if (totalChars <= 0) return
    throttledSave(progress)
  }, [progress, totalChars, throttledSave])
}
