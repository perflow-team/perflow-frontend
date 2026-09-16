import { api } from '@/shared/api/base'

export interface EntityCardData {
  word: string
  explanation: string
  isSpoilerFiltered: boolean
}

interface FetchEntityCardParams {
  novelId: string
  word: string
  contextSentence: string
  currentChapterNumber: number
  progress: number // internal 0~1 scale
}

interface DictionaryResponse {
  word: string
  explanation: string
  is_spoiler_filtered: boolean
}

// POST /api/ai/novels/{novelId}/dictionary — a single on-demand lookup for
// the exact word long-pressed/hovered, using the sentence it appeared in as
// context. There's no "list all entities" endpoint; each call is scoped to
// one word.
export async function fetchEntityCard({
  novelId,
  word,
  contextSentence,
  currentChapterNumber,
  progress,
}: FetchEntityCardParams): Promise<EntityCardData> {
  const { data } = await api.post<DictionaryResponse>(`/api/ai/novels/${novelId}/dictionary`, {
    word,
    entity_type: 'CHARACTER',
    context_sentence: contextSentence,
    current_chapter_number: currentChapterNumber,
    progress_percentage: progress, // 0~1, unified across all endpoints per updated spec
  })
  return { word: data.word, explanation: data.explanation, isSpoilerFiltered: data.is_spoiler_filtered }
}
