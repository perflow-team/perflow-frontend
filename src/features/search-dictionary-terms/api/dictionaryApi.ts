import { api } from '@/shared/api/base'

export interface TermEntry {
  id: number | string
  name: string
  type: string
}

interface FetchDictionaryTermsParams {
  novelId: string
  currentChapterNumber: number
  currentCharOffset: number
  query?: string
}

export async function fetchDictionaryTerms({
  novelId,
  currentChapterNumber,
  currentCharOffset,
  query,
}: FetchDictionaryTermsParams): Promise<TermEntry[]> {
  const { data } = await api.get<TermEntry[]>(`/api/novels/${novelId}/dictionary/terms`, {
    params: { current_chapter_number: currentChapterNumber, current_char_offset: currentCharOffset, query: query || undefined },
  })
  return data
}
