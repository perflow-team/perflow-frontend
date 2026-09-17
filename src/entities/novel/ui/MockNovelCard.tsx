import { ArrowDown, ArrowUp, Minus, Star } from 'lucide-react'
import type { MockNovel } from '@/shared/mocks/mockCatalog'
import { formatViews } from '@/shared/lib/formatViews'

interface MockNovelCardProps {
  novel: MockNovel
  rank?: number
  /** Rank change since last week: positive = up, negative = down, null = new entry. */
  rankDelta?: number | null
}

function RankDeltaTag({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="font-semibold text-primary-600">NEW</span>
  if (delta === 0) return <Minus size={11} className="text-neutral-300" />
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-medium text-success-700">
        <ArrowUp size={11} />
        {delta}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-medium text-error-700">
      <ArrowDown size={11} />
      {Math.abs(delta)}
    </span>
  )
}

// Cover box is styled identically to NovelCard's (same neutral-200 base,
// same shadow lift) — real covers will fill this exact box once the
// backend has cover art, and mock covers shouldn't look like a different
// component family in the meantime.
function MockNovelCard({ novel, rank, rankDelta }: MockNovelCardProps) {
  return (
    <div className="group flex w-[230px] shrink-0 flex-col gap-2">
      <div className="relative h-[300px] w-[230px] overflow-hidden rounded-lg bg-neutral-200 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {rank !== undefined && (
          <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/40 to-transparent px-3 pb-2 pt-8">
            <span className="text-headline-small font-bold text-white">{rank}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-title-small text-neutral-900 transition-colors group-hover:text-primary-600">
          {novel.title}
        </h3>
        <div className="flex items-center gap-1.5 text-label-medium text-neutral-500">
          <span className="line-clamp-1">{novel.author}</span>
          <span className="text-neutral-300">·</span>
          <span className="shrink-0">{novel.genre}</span>
        </div>
        <div className="flex items-center gap-3 text-label-small text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <Star size={11} className="fill-warning-500 text-warning-500" />
            {novel.rating.toFixed(1)}
          </span>
          <span>조회 {formatViews(novel.views)}</span>
          {rankDelta !== undefined && <RankDeltaTag delta={rankDelta} />}
        </div>
      </div>
    </div>
  )
}

export default MockNovelCard
