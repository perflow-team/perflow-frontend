import { Link } from 'react-router-dom'

interface NovelCardProps {
  id: number
  title: string
  author: string
  coverImageUrl: string | null
}

function NovelCard({ id, title, author, coverImageUrl }: NovelCardProps) {
  return (
    <Link to={`/novel/${id}`} className="group flex w-[230px] flex-col gap-2">
      <div className="h-[300px] w-[230px] overflow-hidden rounded-lg bg-neutral-200">
        {coverImageUrl && <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-title-small text-neutral-900 group-hover:text-primary-600">{title}</h3>
        <span className="text-label-medium text-neutral-500">{author}</span>
      </div>
    </Link>
  )
}

export default NovelCard
