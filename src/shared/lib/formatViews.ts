export function formatViews(views: number): string {
  if (views >= 10000) return `${(views / 10000).toFixed(1)}만`
  return views.toLocaleString('ko-KR')
}
