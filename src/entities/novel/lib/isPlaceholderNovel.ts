const REAL_NOVEL_IDS = new Set([1, 2, 3, 4, 5])

export function isPlaceholderNovel(id: number): boolean {
  return !REAL_NOVEL_IDS.has(id)
}
