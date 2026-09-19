import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { formatViews } from '@/shared/lib/formatViews'
import NovelTags from './NovelTags'

interface NovelCardProps {
  id: number
  title: string
  author: string
  coverImageUrl: string | null
  tags?: string[]
  views?: number
  rating?: number
  rank?: number
}

function NovelCard({ id, title, author, coverImageUrl, tags, views, rating, rank }: NovelCardProps) {
  return (
    <Link to={`/novel/${id}`} className="group flex w-[230px] shrink-0 flex-col gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500">
      <div className="relative h-[300px] w-[230px] overflow-hidden rounded-lg bg-neutral-200 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        )}
        {rank !== undefined && <span className="absolute left-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary-900/90 px-2 text-title-medium font-bold text-white" aria-label={`${rank}위`}>{rank}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-title-small text-neutral-900 transition-colors group-hover:text-primary-600">
          {title}
        </h3>
        <span className="text-label-medium text-neutral-500">{author}</span>
        {(views !== undefined || rating !== undefined) && <div className="flex items-center gap-3 text-label-small text-neutral-500">
          {rating !== undefined && <span className="inline-flex items-center gap-1"><Star size={12} className="text-primary-500" />{rating > 0 ? `${rating.toFixed(1)} / 5` : '평가 전'}</span>}
          {views !== undefined && <span>조회 {formatViews(views)}</span>}
        </div>}
        <NovelTags tags={tags} limit={3} className="mt-1" />
      </div>
    </Link>
  )
}

export default NovelCard
