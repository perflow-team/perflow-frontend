import type { MockNovel } from '@/shared/mocks/mockCatalog'

// Genre only exists on the mock catalog right now (the real /api/novels
// response has no genre field), so genre search only ever matches these —
// see mockCatalog.ts for why this data exists at all.
export function filterMockNovels(novels: MockNovel[], query: string): MockNovel[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return novels.filter(
    (novel) =>
      novel.title.toLowerCase().includes(q) ||
      novel.author.toLowerCase().includes(q) ||
      novel.genre.toLowerCase().includes(q),
  )
}
