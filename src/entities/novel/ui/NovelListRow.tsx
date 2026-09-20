import type { KeyboardEvent, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { formatViews } from '@/shared/lib/formatViews'
import { isPlaceholderNovel } from '../lib/isPlaceholderNovel'
import { useToggleLike } from '../lib/useToggleLike'
import NovelCoverPlaceholder from './NovelCoverPlaceholder'
import PreparingOverlay from './PreparingOverlay'

interface NovelListRowProps {
  id: number
  title: string
  author: string
  coverImageUrl: string | null
  tags?: string[]
  views?: number
  rating?: number
  likes?: number
  isNew?: boolean
  rank?: number
}

function NovelListRow({ id, title, author, coverImageUrl, tags, views, rating, likes, isNew, rank }: NovelListRowProps) {
  const { liked, count: likeCount, toggle, isPending, isError } = useToggleLike(id, likes)

  const handleLikeToggle = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggle()
  }

  const genreLine = [...new Set((tags ?? []).filter((tag) => !tag.startsWith('#')))].slice(0, 2).join(' · ')

  return (
    <Link
      to={`/novel/${id}`}
      className="group flex items-center gap-3 border-b border-neutral-100 py-3 last:border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      <div className="relative h-[84px] w-[62px] shrink-0 overflow-hidden rounded-md shadow-sm">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <NovelCoverPlaceholder id={id} title={title} author={author} compact />
        )}
        {isPlaceholderNovel(id) && <PreparingOverlay short />}
        {rank !== undefined && (
          <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded bg-primary-900/90 px-1 text-label-small font-bold text-white">
            {rank}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="line-clamp-1 text-title-small font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
            {title}
          </h3>
          {isNew && (
            <span className="shrink-0 rounded bg-primary-600 px-1 py-0.5 text-label-small font-bold leading-none text-white">
              NEW
            </span>
          )}
        </div>
        <p className="line-clamp-1 text-label-medium text-neutral-500">
          {author}
          {genreLine && ` · ${genreLine}`}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-label-small text-neutral-500">
          {rating !== undefined && (
            <span className="inline-flex items-center gap-0.5">
              <Star size={11} className="text-primary-500" />
              {rating > 0 ? `${rating.toFixed(1)} / 10` : '평가 전'}
            </span>
          )}
          {views !== undefined && <span>조회 {formatViews(views)}</span>}
          <span
            role="button"
            tabIndex={isPending ? -1 : 0}
            aria-disabled={isPending}
            aria-pressed={liked}
            aria-label={`${liked ? '좋아요 취소' : '좋아요'} ${likeCount.toLocaleString('ko-KR')}개`}
            onClick={handleLikeToggle}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') handleLikeToggle(event)
            }}
            className="inline-flex cursor-pointer items-center gap-0.5 rounded outline-none hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <Heart size={11} className={liked ? 'fill-primary-500 text-primary-500' : 'text-primary-500'} />
            좋아요 {likeCount.toLocaleString('ko-KR')}
          </span>
          {isError && <span role="alert">좋아요를 처리하지 못했어요. 다시 눌러주세요.</span>}
        </div>
      </div>
    </Link>
  )
}

export default NovelListRow
