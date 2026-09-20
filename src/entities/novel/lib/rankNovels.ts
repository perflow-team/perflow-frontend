import type { NovelSummary, RankingSort } from '../api/novelApi'

function publishedTime(value: string | null): number | null {
  if (!value) return null
  const timestamp = Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`)
  return Number.isFinite(timestamp) ? timestamp : null
}

const metric = (value: number) => Number.isFinite(value) ? value : 0

export function rankNovels(novels: NovelSummary[], sort: RankingSort, limit = 10, now = Date.now()): NovelSummary[] {
  const candidates = sort === 'new'
    ? novels.filter((novel) => novel.is_new && (publishedTime(novel.published_at) ?? -Infinity) <= now)
    : [...novels]

  candidates.sort((a, b) => {
    if (sort === 'new') {
      const aTime = publishedTime(a.published_at)
      const bTime = publishedTime(b.published_at)
      if (aTime !== bTime) {
        if (aTime === null) return 1
        if (bTime === null) return -1
        return bTime - aTime
      }
      return b.id - a.id
    }
    if (sort === 'popular' || sort === 'rating') {
      const difference = metric(b.rating) - metric(a.rating)
      if (difference) return difference
    }
    return metric(b.views) - metric(a.views) || a.id - b.id
  })
  return candidates.slice(0, Math.max(0, Math.floor(limit)))
}
