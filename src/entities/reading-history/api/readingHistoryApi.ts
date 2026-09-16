import { api } from '@/shared/api/base'

// None of these three are live on the backend yet (confirmed 404). Shapes
// below are our proposed contract (see docs/integration-report.md #2) —
// adjust field names here once the backend confirms the real response.
export interface ReadingStats {
  total_reading_minutes: number
  completed_novels: number
  favorite_genre: string | null
}

export async function fetchReadingStats(): Promise<ReadingStats> {
  const { data } = await api.get<ReadingStats>('/api/users/me/reading-stats')
  return data
}

export interface ReadingHistoryItem {
  novel_id: number
  novel_title: string
  current_chapter_number: number
  progress_percentage: number
}

export async function fetchReadingHistory(): Promise<ReadingHistoryItem[]> {
  const { data } = await api.get<ReadingHistoryItem[]>('/api/users/me/reading-history')
  return data
}
