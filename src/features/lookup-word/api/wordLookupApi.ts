import { api } from '@/shared/api/base'
import { normalizeEntityCard } from '@/features/lookup-word/lib/normalizeEntityCard'
import type { EntityCardData } from '@/features/lookup-word/lib/normalizeEntityCard'

export type { EntityCardData, EntityCardField } from '@/features/lookup-word/lib/normalizeEntityCard'

interface FetchEntityCardParams {
  novelId: string
  word: string
  contextSentence: string
  currentChapterNumber: number
  progress: number // internal 0~1 scale
}

// POST /api/ai/novels/{novelId}/dictionary — a single on-demand lookup for
// the exact word long-pressed/hovered, using the sentence it appeared in as
// context. There's no "list all entities" endpoint; each call is scoped to
// one word. entity_type is still sent for backward-compat but the backend
// now classifies the word itself and ignores this field.
export async function fetchEntityCard({
  novelId,
  word,
  contextSentence,
  currentChapterNumber,
  progress,
}: FetchEntityCardParams): Promise<EntityCardData> {
  const { data } = await api.post<unknown>(`/api/ai/novels/${novelId}/dictionary`, {
    word,
    entity_type: 'CHARACTER',
    context_sentence: contextSentence,
    current_chapter_number: currentChapterNumber,
    progress_percentage: progress, // 0~1, unified across all endpoints per updated spec
  })
  return normalizeEntityCard(data, word)
}
