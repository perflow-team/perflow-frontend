import type { NovelSummary } from '@/entities/novel/api/novelApi'

export function filterNovels(novels: NovelSummary[], query: string): NovelSummary[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return novels.filter((novel) => novel.title.toLowerCase().includes(q) || novel.author.toLowerCase().includes(q))
}
