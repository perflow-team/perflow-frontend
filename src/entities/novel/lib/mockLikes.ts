export function mockLikesFor(id: number): number {
  const seed = (id * 9301 + 49297) % 233280
  const ratio = seed / 233280
  return Math.floor(120 + ratio * 14000)
}
