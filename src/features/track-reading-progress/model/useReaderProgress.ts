import { useEffect } from 'react'
import { updateProgress } from '@/entities/reading-progress/api/progressApi'
import { throttle } from '@/shared/lib/throttle'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

let pendingSave = Promise.resolve()

interface UseReaderProgressParams {
  novelId: string
  episodeId: string
  totalChars: number
}

export function useReaderProgress({ novelId, episodeId, totalChars }: UseReaderProgressParams) {
  const userId = useAuthStore((s) => s.user?.id)
  useEffect(() => {
    if (totalChars <= 0 || userId === undefined) return
    const scope = `${novelId}:${episodeId}`
    const save = throttle((progress: number, offset: number) => {
      pendingSave = pendingSave.then(async () => {
        if (useAuthStore.getState().user?.id !== userId) return
        await updateProgress({ novelId, currentChapterNumber: Number(episodeId),
          currentCharOffset: Math.min(offset, totalChars), progress })
      }).catch(() => {})
    }, 500)
    let previousProgress = -1
    let previousOffset = -1
    const track = () => {
      const state = useReaderStore.getState()
      if (state.cutoff.scope !== scope || (state.progress === previousProgress && state.cutoff.offset === previousOffset)) return
      previousProgress = state.progress
      previousOffset = state.cutoff.offset
      save(state.progress, state.cutoff.offset)
    }
    track()
    const unsubscribe = useReaderStore.subscribe(track)
    return () => { unsubscribe(); save.flush(); save.cancel() }
  }, [novelId, episodeId, totalChars, userId])
}
