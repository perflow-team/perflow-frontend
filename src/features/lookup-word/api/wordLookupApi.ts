import { api } from '@/shared/api/base'

export interface EntityCardField {
  label: string
  value: string
}

export interface EntityCardData {
  word: string
  title: string
  tag: string // '인물' | '장소' | '사건' | '' (빈 문자열 = 일반 단어)
  fields: EntityCardField[]
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
  title: string
  tag: string
  fields: EntityCardField[]
  is_spoiler_filtered: boolean
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
  const { data } = await api.post<DictionaryResponse>(`/api/ai/novels/${novelId}/dictionary`, {
    word,
    entity_type: 'CHARACTER',
    context_sentence: contextSentence,
    current_chapter_number: currentChapterNumber,
    progress_percentage: progress, // 0~1, unified across all endpoints per updated spec
  })
  return {
    word: data.word,
    title: data.title,
    tag: data.tag,
    fields: data.fields,
    isSpoilerFiltered: data.is_spoiler_filtered,
  }
}
