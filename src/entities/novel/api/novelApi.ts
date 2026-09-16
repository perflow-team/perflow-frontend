import { api } from '@/shared/api/base'

export interface NovelSummary {
  id: number
  title: string
  author: string
  description: string | null
  cover_image_url: string | null
}

export async function fetchNovels(): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/novels')
  return data
}

export interface NovelDetail {
  id: number
  title: string
  author: string
  description: string | null
  cover_image_url: string | null
  total_chapters: number
}

export async function fetchNovel(novelId: string): Promise<NovelDetail> {
  const { data } = await api.get<NovelDetail>(`/api/novels/${novelId}`)
  return data
}
