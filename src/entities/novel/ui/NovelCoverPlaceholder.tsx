import { coverToneFor } from '../lib/coverTone'

interface NovelCoverPlaceholderProps {
  id: number
  title: string
  author: string
  /** For thumbnails much smaller than the grid card (e.g. the mobile list row). */
  compact?: boolean
}

function NovelCoverPlaceholder({ id, title, author, compact = false }: NovelCoverPlaceholderProps) {
  const tone = coverToneFor(id)

  if (compact) {
    return <div className={`h-full w-full ${tone.bg}`} />
  }

  return (
    <div className={`flex h-full w-full flex-col justify-between p-2.5 sm:p-3 md:p-4 ${tone.bg}`}>
      <span className={`hidden text-label-small font-medium tracking-wide sm:block ${tone.accent}`}>{author}</span>
      <p className={`line-clamp-4 text-label-large font-semibold leading-snug sm:text-title-medium md:line-clamp-5 md:text-title-large ${tone.text}`}>{title}</p>
    </div>
  )
}

export default NovelCoverPlaceholder
