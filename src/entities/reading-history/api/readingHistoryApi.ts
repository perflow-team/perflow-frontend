import { api } from '@/shared/api/base'

export interface ReadingProgressItem {
  novel_id: number
  novel_title: string
  cover_image_url: string | null
  current_chapter_number: number
  total_chapters: number
  progress_percentage: number
}

export async function fetchReadingProgress(): Promise<ReadingProgressItem[]> {
  const { data } = await api.get<ReadingProgressItem[]>('/api/users/me/progress')
  return data
}
