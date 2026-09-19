export default function NovelTags({ tags = [], limit, className = '' }: { tags?: string[]; limit?: number; className?: string }) {
  const visible = [...new Set(tags)].slice(0, limit)
  if (!visible.length) return null
  return (
    <ul aria-label="작품 키워드" className={`flex flex-wrap gap-1.5 ${className}`}>
      {visible.map((tag) => <li key={tag} className="rounded-full bg-primary-50 px-2.5 py-1 text-label-small text-primary-700">#{tag.replace(/^#+/, '')}</li>)}
    </ul>
  )
}
