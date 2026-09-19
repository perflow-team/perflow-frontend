export default function NovelTags({ tags = [], limit, className = '' }: { tags?: string[]; limit?: number; className?: string }) {
  const visible = [...new Set(tags.filter((tag) => !tag.startsWith('#')))].slice(0, limit)
  if (!visible.length) return null
  return (
    <p aria-label="작품 장르" className={`line-clamp-1 text-label-small text-neutral-400 ${className}`}>
      {visible.join(' · ')}
    </p>
  )
}
