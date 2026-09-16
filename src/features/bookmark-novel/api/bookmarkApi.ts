import { api } from '@/shared/api/base'
import type { NovelSummary } from '@/entities/novel/api/novelApi'

// Not live on the backend yet (confirmed 404) — wired ahead of time against
// the agreed contract so it starts working the moment the routes ship.
export async function addBookmark(novelId: string): Promise<void> {
  await api.post(`/api/novels/${novelId}/bookmark`)
}

export async function removeBookmark(novelId: string): Promise<void> {
  await api.delete(`/api/novels/${novelId}/bookmark`)
}

export async function fetchMyBookmarks(): Promise<NovelSummary[]> {
  const { data } = await api.get<NovelSummary[]>('/api/users/me/bookmarks')
  return data
}
