import type { KeyboardEvent, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { formatViews } from '@/shared/lib/formatViews'
import { isPlaceholderNovel } from '../lib/isPlaceholderNovel'
import { useToggleLike } from '../lib/useToggleLike'
import { CARD_COVER_CLASS, CARD_WIDTH_CLASS } from './cardSize'
import NovelTags from './NovelTags'
import NovelCoverPlaceholder from './NovelCoverPlaceholder'
import PreparingOverlay from './PreparingOverlay'

interface NovelCardProps {
  id: number
  title: string
  author: string
  coverImageUrl: string | null
  tags?: string[]
  views?: number
  rating?: number
  likes?: number
  rank?: number
  fluid?: boolean
}

function NovelCard({ id, title, author, coverImageUrl, tags, views, rating, likes, rank, fluid = false }: NovelCardProps) {
  const { liked, count: likeCount, toggle, isPending, isError } = useToggleLike(id, likes)

  const handleLikeToggle = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggle()
  }

  return (
    <Link to={`/novel/${id}`} className={`group flex ${fluid ? 'w-full' : `${CARD_WIDTH_CLASS} shrink-0`} flex-col gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500`}>
      <div className={`relative ${CARD_COVER_CLASS} overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 group-hover:shadow-lg`}>
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <NovelCoverPlaceholder id={id} title={title} author={author} />
        )}
        {isPlaceholderNovel(id) && <PreparingOverlay />}
        {rank !== undefined && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_16%,rgba(0,0,0,0.2)_28%,transparent_42%)]" />
            <span
              className="absolute left-4 top-4 text-2xl font-black leading-none text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] sm:left-6 sm:top-6 sm:text-3xl md:left-6 md:top-6 md:text-4xl"
              aria-label={`${rank}위`}
            >
              {rank}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-title-small font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
          {title}
        </h3>
        <span className="text-label-medium text-neutral-500">{author}</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-label-small text-neutral-500">
          {rating !== undefined && <span className="inline-flex items-center gap-1"><Star size={12} className="text-primary-500" />{rating > 0 ? `${rating.toFixed(1)} / 10` : '평가 전'}</span>}
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
            className="inline-flex cursor-pointer items-center gap-1 rounded outline-none hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <Heart size={12} className={liked ? 'fill-primary-500 text-primary-500' : 'text-primary-500'} />
            좋아요 {likeCount.toLocaleString('ko-KR')}
          </span>
          {isError && <span role="alert">좋아요를 처리하지 못했어요. 다시 눌러주세요.</span>}
        </div>
        <NovelTags tags={tags} limit={3} className="mt-1" />
      </div>
    </Link>
  )
}

export default NovelCard
