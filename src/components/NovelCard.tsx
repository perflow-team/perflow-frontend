import { Link } from 'react-router-dom'

interface NovelCardProps {
  id: string
  title: string
  author: string
  genre: string
  rating: number
}

function NovelCard({ id, title, author, genre, rating }: NovelCardProps) {
  return (
    <Link to={`/novel/${id}`} className="group flex w-[230px] flex-col gap-2">
      <div className="h-[300px] w-[230px] overflow-hidden rounded-lg bg-neutral-200" />
      <div className="flex flex-col gap-1">
        <span className="text-label-medium text-neutral-500">{genre}</span>
        <h3 className="line-clamp-1 text-title-small text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        <div className="flex items-center justify-between text-label-medium text-neutral-500">
          <span>{author}</span>
          <span className="flex items-center gap-1 text-warning-700">
            ★ {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default NovelCard
