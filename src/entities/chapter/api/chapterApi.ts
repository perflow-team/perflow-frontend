import { api } from '@/shared/api/base'
import type { EntityMark } from '@/entities/chapter/model/types'

export interface ChapterSummary {
  id: number
  chapter_number: number
  title: string | null
  is_free: boolean
}

export async function fetchChapters(novelId: string): Promise<ChapterSummary[]> {
  const { data } = await api.get<ChapterSummary[]>(`/api/novels/${novelId}/chapters`)
  return data
}

export interface ChapterContent {
  id: number
  chapter_number: number
  title: string | null
  content: string
  entities: EntityMark[]
}

export async function fetchChapterContent(novelId: string, chapterNumber: number): Promise<ChapterContent> {
  const { data } = await api.get<ChapterContent>(`/api/novels/${novelId}/chapters/${chapterNumber}`)
  return data
}
