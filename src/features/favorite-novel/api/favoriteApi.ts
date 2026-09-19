import { api } from '@/shared/api/base'
import type { NovelSummary } from '@/entities/novel/api/novelApi'

export async function fetchMyFavorites(): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/users/me/favorites')
  return data
}
