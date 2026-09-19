import { api } from '@/shared/api/base'

export interface NovelSummary {
  id: number
  title: string
  author: string
  description: string | null
  cover_image_url: string | null
  views: number
  rating: number
  is_new: boolean
  published_at: string | null
  genres: string[]
  tags: string[]
}

export async function fetchNovels(): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/novels')
  return data
}

export async function fetchGenreNovels(genre?: string): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/novels', { params: { genre } })
  return data
}

export interface NovelDetail extends NovelSummary {
  total_chapters: number
}

export async function fetchNovel(novelId: string): Promise<NovelDetail> {
  const { data } = await api.get<NovelDetail>(`/api/novels/${novelId}`)
  return data
}

export type RankingSort = 'views' | 'rating' | 'new'
export const RANKING_LABELS: Record<RankingSort, string> = {
  views: '조회수 랭킹', rating: '별점 랭킹', new: '오늘의 신작',
}

export async function fetchRanking(sort: RankingSort, limit = 10, genre?: string): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/novels/ranking', { params: { sort, limit, genre } })
  return data
}

export async function fetchGenres(): Promise<string[]> {
  const { data } = await api.get<string[]>('/api/genres')
  return data
}
