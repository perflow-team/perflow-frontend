import { useEffect, useRef } from 'react'
import { saveReadingProgress } from '../../../shared/api/progress'
import { throttle } from '../../../shared/lib/throttle'
import { useReaderStore } from '../store/useReaderStore'

interface UseReaderProgressParams {
  novelId: string
  episodeId: string
}

// Watches the reader store's progress value (which updates on every scroll
// frame / page turn for a smooth UI) and persists it to the server at most
// once every 500ms, decoupling UI responsiveness from network calls.
export function useReaderProgress({ novelId, episodeId }: UseReaderProgressParams) {
  const progress = useReaderStore((s) => s.progress)

  const throttledSave = useRef(
    throttle((p: number) => {
      saveReadingProgress({ novelId, episodeId, progress: p })
    }, 500),
  ).current

  useEffect(() => {
    throttledSave(progress)
  }, [progress, throttledSave])
}
