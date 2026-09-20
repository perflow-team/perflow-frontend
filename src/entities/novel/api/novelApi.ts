import { api } from '@/shared/api/base'
import { rankNovels } from '../lib/rankNovels'

export interface NovelSummary {
  id: number
  title: string
  original_title: string | null
  edition_note: string | null
  author: string
  description: string | null
  cover_image_url: string | null
  views: number
  likes: number
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
  is_favorite: boolean
}

export async function fetchNovel(novelId: string): Promise<NovelDetail> {
  const { data } = await api.get<NovelDetail>(`/api/novels/${novelId}`)
  return data
}

export type RankingSort = 'views' | 'popular' | 'rating' | 'new'
export interface NovelLikeResult {
  novel_id: number
  liked: boolean
  is_favorite: boolean
  likes: number
}

export async function setNovelLike(novelId: number, liked: boolean): Promise<NovelLikeResult> {
  const { data } = await api.post<NovelLikeResult>(`/api/novels/${novelId}/like`, { liked })
  return data
}

export async function fetchMyFavorites(): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/users/me/favorites')
  return data
}

export const RANKING_LABELS: Record<RankingSort, string> = {
  views: '조회수 랭킹', popular: '인기 랭킹', rating: '별점 랭킹', new: '신작',
}

export async function fetchRanking(sort: RankingSort, limit = 10, genre?: string): Promise<NovelSummary[]> {
  // The deployed legacy ranking endpoint rejects "popular" and drops undated
  // new releases. Rank the full, genre-filtered catalog using its saved metrics.
  return rankNovels(await fetchGenreNovels(genre), sort, limit)
}

export async function fetchNewNovels(genre?: string, limit = 100): Promise<NovelSummary[]> {
  return fetchRanking('new', limit, genre)
}

export async function fetchGenres(): Promise<string[]> {
  const { data } = await api.get<string[]>('/api/genres')
  return data
}
