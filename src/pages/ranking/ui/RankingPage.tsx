import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import NovelListRow from '@/entities/novel/ui/NovelListRow'
import { fetchGenres, fetchNewNovels, fetchRanking, RANKING_LABELS, type RankingSort } from '@/entities/novel/api/novelApi'
import { CARD_ASPECT_CLASS, CARD_WIDTH_CLASS } from '@/entities/novel/ui/cardSize'
import Skeleton from '@/shared/ui/Skeleton'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

const SORTS: RankingSort[] = ['views', 'popular', 'rating', 'new']

export default function RankingPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('sort') as RankingSort
  const sort = SORTS.includes(requested) ? requested : 'views'
  const genre = params.get('genre') || undefined
  const { data: genres = [] } = useQuery({ queryKey: ['genres'], queryFn: fetchGenres })
  const { data = [], isPending, isError, refetch } = useQuery({
    queryKey: ['ranking', sort, 100, genre], queryFn: () => sort === 'new' ? fetchNewNovels(genre) : fetchRanking(sort, 100, genre),
  })
  const change = (next: RankingSort, nextGenre = genre) => setParams({ sort: next, ...(nextGenre ? { genre: nextGenre } : {}) })

  useDocumentTitle(RANKING_LABELS[sort])

  return (
    <div className="min-h-svh bg-white pt-14 md:pt-16">
      <Header />
      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-title-large font-bold text-neutral-900 sm:text-headline-small">랭킹</h1>
        <p className="mt-2 text-body-small text-neutral-500">{sort === 'new' ? '신작으로 등록된 작품을 최신 등록순으로 보여드려요.' : sort === 'popular' ? '좋아요가 많은 순으로 보여드려요.' : sort === 'rating' ? '10점 만점의 별점순이에요. 같은 별점은 조회수순으로 보여드려요.' : '누적 조회수가 높은 순으로 보여드려요.'}</p>
        <div className="mt-5 flex gap-1 border-b border-neutral-200" aria-label="랭킹 기준">
          {SORTS.map(value => <button key={value} type="button" aria-pressed={sort === value} onClick={() => change(value)}
            className={`cursor-pointer px-3 py-3 text-label-large transition-colors sm:px-4 ${sort === value ? 'border-b-2 border-primary-600 font-semibold text-primary-700' : 'text-neutral-500 hover:bg-primary-50 hover:text-primary-700'}`}>
            {RANKING_LABELS[value]}
          </button>)}
        </div>
        <label className="mt-5 flex items-center gap-3 text-label-large text-neutral-600">장르
          <select aria-label="장르 선택" value={genre ?? ''} onChange={event => change(sort, event.target.value)} className="max-w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-2 focus:outline-primary-500">
            <option value="">전체 장르</option>{genres.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        {isError ? <div className="mt-8 text-body-medium text-neutral-500"><p>랭킹을 불러오지 못했어요.</p><button type="button" onClick={() => void refetch()} className="mt-2 cursor-pointer text-primary-700">다시 시도</button></div>
          : isPending ? <Skeleton className={`mt-8 ${CARD_ASPECT_CLASS} ${CARD_WIDTH_CLASS} rounded-lg`} />
          : data.length === 0 ? <p className="mt-8 rounded-xl bg-neutral-50 p-8 text-body-medium text-neutral-500">{sort === 'new' ? '신작으로 등록된 작품이 아직 없어요.' : '이 장르에는 아직 작품이 없어요.'}</p>
          : <>
              <div className="mt-2 sm:hidden">{data.map((novel, i) => <NovelListRow key={novel.id} id={novel.id} title={novel.title} author={novel.author} coverImageUrl={novel.cover_image_url} tags={novel.tags} views={novel.views} rating={novel.rating} likes={novel.likes} isNew={novel.is_new} rank={i + 1} />)}</div>
              <div className="mt-8 hidden flex-wrap justify-center gap-x-6 gap-y-10 sm:flex sm:justify-start">{data.map((novel, i) => <NovelCard key={novel.id} id={novel.id} title={novel.title} author={novel.author} coverImageUrl={novel.cover_image_url} tags={novel.tags} views={novel.views} rating={novel.rating} likes={novel.likes} rank={i + 1} />)}</div>
            </>}
      </section>
    </div>
  )
}
