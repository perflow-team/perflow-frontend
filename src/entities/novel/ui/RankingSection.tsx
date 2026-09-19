import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchRanking, RANKING_LABELS, type RankingSort } from '../api/novelApi'
import NovelCard from './NovelCard'
import ScrollCarousel from '@/shared/ui/ScrollCarousel'
import Skeleton from '@/shared/ui/Skeleton'

export default function RankingSection({ sort }: { sort: RankingSort }) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['ranking', sort, 10], queryFn: () => fetchRanking(sort),
  })
  return (
    <section aria-labelledby={`ranking-${sort}`} className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id={`ranking-${sort}`} className="text-headline-small text-neutral-900">{RANKING_LABELS[sort]}</h2>
        <Link to={`/ranking?sort=${sort}`} className="shrink-0 text-label-large text-neutral-500 hover:text-primary-600">전체 보기</Link>
      </div>
      <p className="mb-6 text-body-small text-neutral-500">{sort === 'views' ? '누적 조회수가 높은 작품을 만나보세요.' : sort === 'rating' ? '별점이 높은 순으로, 새로운 취향을 찾아보세요.' : '오늘 한국 시간 기준으로 새로 등록된 이야기예요.'}</p>
      {isPending ? <div className="flex gap-4 overflow-hidden" role="status" aria-label="작품 불러오는 중">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-[300px] w-[230px] shrink-0 rounded-lg" />)}</div>
        : isError ? <div className="rounded-xl bg-neutral-50 p-6 text-body-small text-neutral-500"><p>작품을 불러오지 못했어요.</p><button type="button" onClick={() => void refetch()} className="mt-2 cursor-pointer text-primary-700">다시 시도</button></div>
        : !data?.length ? <p className="rounded-xl bg-neutral-50 px-6 py-8 text-body-small text-neutral-500">{sort === 'new' ? '오늘 새로 등록된 작품이 아직 없어요.' : '아직 등록된 작품이 없어요.'}</p>
        : <ScrollCarousel>{data.map((novel, i) => <NovelCard key={novel.id} id={novel.id} title={novel.title} author={novel.author} coverImageUrl={novel.cover_image_url} tags={novel.tags} views={novel.views} rating={novel.rating} rank={sort === 'new' ? undefined : i + 1} />)}</ScrollCarousel>}
    </section>
  )
}
