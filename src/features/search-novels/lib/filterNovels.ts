import type { NovelSummary } from '@/entities/novel/api/novelApi'

export function filterNovels(novels: NovelSummary[], query: string): NovelSummary[] {
  const normalize = (value: string) => value.normalize('NFC').replace(/\s+/g, '').toLowerCase()
  const q = normalize(query)
  if (!q) return []
  return novels.filter((novel) => [novel.title, novel.original_title, novel.author]
    .some(value => value && normalize(value).includes(q)))
}
