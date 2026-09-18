import { api } from '@/shared/api/base'

export interface TermEntry {
  id: number | string
  name: string
  type: string
}

interface FetchDictionaryTermsParams {
  novelId: string
  currentChapterNumber: number
  query?: string
}

// GET /api/novels/{novelId}/dictionary/terms — server-side filtered to
// entries that have appeared by current_chapter_number, for both browsing
// and search, so nothing spoiler-adjacent is ever sent to the client.
export async function fetchDictionaryTerms({
  novelId,
  currentChapterNumber,
  query,
}: FetchDictionaryTermsParams): Promise<TermEntry[]> {
  const { data } = await api.get<TermEntry[]>(`/api/novels/${novelId}/dictionary/terms`, {
    params: { current_chapter_number: currentChapterNumber, query: query || undefined },
  })
  return data
}
