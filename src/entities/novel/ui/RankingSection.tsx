import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNewNovels, fetchRanking, type RankingSort } from '../api/novelApi'
import NovelCard from './NovelCard'
import { CARD_ASPECT_CLASS, CARD_WIDTH_CLASS } from './cardSize'
import ScrollCarousel from '@/shared/ui/ScrollCarousel'
import Skeleton from '@/shared/ui/Skeleton'

const PREVIEW_LIMIT = 10
const EXPANDED_LIMIT = 100

interface RankingSectionProps {
  sort: RankingSort
  title: string
  description: string
  genre?: string
  anchorId?: string
}

export default function RankingSection({ sort, title, description, genre, anchorId }: RankingSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const limit = expanded ? EXPANDED_LIMIT : PREVIEW_LIMIT
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['ranking', sort, limit, genre],
    queryFn: () => (sort === 'new' ? fetchNewNovels(genre, limit) : fetchRanking(sort, limit, genre)),
  })

  return (
    <section
      id={anchorId}
      aria-labelledby={`ranking-${sort}`}
      className={`mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10 ${anchorId ? 'scroll-mt-14 md:scroll-mt-16' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id={`ranking-${sort}`} className="text-title-large font-bold text-neutral-900 sm:text-headline-small">{title}</h2>
        {!!data?.length && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="shrink-0 cursor-pointer text-label-large text-neutral-500 hover:text-primary-600"
          >
            {expanded ? '접기' : '전체 보기'}
          </button>
        )}
      </div>
      <p className="mb-6 text-body-small text-neutral-500">{description}</p>
      {isPending ? (
        <div className="flex gap-3 overflow-hidden sm:gap-4" role="status" aria-label="작품 불러오는 중">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className={`${CARD_ASPECT_CLASS} ${CARD_WIDTH_CLASS} shrink-0 rounded-lg`} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-neutral-50 p-6 text-body-small text-neutral-500">
          <p>작품을 불러오지 못했어요.</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 cursor-pointer text-primary-700">다시 시도</button>
        </div>
      ) : !data?.length ? (
        <p className="rounded-xl bg-neutral-50 px-6 py-8 text-body-small text-neutral-500">
          {sort === 'new' ? '신작으로 등록된 작품이 아직 없어요.' : '아직 등록된 작품이 없어요.'}
        </p>
      ) : expanded ? (
        <>
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:hidden">
            {data.map((novel, i) => (
              <NovelCard
                key={novel.id}
                id={novel.id}
                title={novel.title}
                author={novel.author}
                coverImageUrl={novel.cover_image_url}
                tags={novel.tags}
                views={novel.views}
                rating={novel.rating}
                likes={novel.likes}
                rank={sort === 'new' ? undefined : i + 1}
                fluid
              />
            ))}
          </div>
          <div className="hidden flex-wrap gap-x-4 gap-y-10 sm:flex">
            {data.map((novel, i) => (
              <NovelCard
                key={novel.id}
                id={novel.id}
                title={novel.title}
                author={novel.author}
                coverImageUrl={novel.cover_image_url}
                tags={novel.tags}
                views={novel.views}
                rating={novel.rating}
                likes={novel.likes}
                rank={sort === 'new' ? undefined : i + 1}
              />
            ))}
          </div>
        </>
      ) : (
        <ScrollCarousel>
          {data.map((novel, i) => (
            <NovelCard
              key={novel.id}
              id={novel.id}
              title={novel.title}
              author={novel.author}
              coverImageUrl={novel.cover_image_url}
              tags={novel.tags}
              views={novel.views}
              rating={novel.rating}
              likes={novel.likes}
              rank={sort === 'new' ? undefined : i + 1}
            />
          ))}
        </ScrollCarousel>
      )}
    </section>
  )
}
