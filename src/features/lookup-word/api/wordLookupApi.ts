import { api } from '@/shared/api/base'
import { normalizeEntityCard } from '@/features/lookup-word/lib/normalizeEntityCard'
import type { EntityCardData } from '@/features/lookup-word/lib/normalizeEntityCard'

export type { EntityCardData, EntityCardField } from '@/features/lookup-word/lib/normalizeEntityCard'

interface FetchEntityCardParams {
  novelId: string
  word: string
  contextSentence: string
  currentChapterNumber: number
  progress: number
  currentCharOffset: number
  selectionCharOffset?: number
}

export async function fetchEntityCard({
  novelId,
  word,
  contextSentence,
  currentChapterNumber,
  progress,
  currentCharOffset,
  selectionCharOffset,
}: FetchEntityCardParams): Promise<EntityCardData> {
  const { data } = await api.post<unknown>(`/api/ai/novels/${novelId}/dictionary`, {
    word,
    current_char_offset: currentCharOffset,
    selection_char_offset: selectionCharOffset,
    card_version: 'reader-card-v1',
    context_sentence: contextSentence,
    current_chapter_number: currentChapterNumber,
    progress_percentage: progress,
  })
  return normalizeEntityCard(data, word)
}
