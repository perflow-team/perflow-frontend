import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import NovelListRow from '@/entities/novel/ui/NovelListRow'
import NovelListRowSkeleton from '@/entities/novel/ui/NovelListRowSkeleton'
import NovelCoverCollage from '@/entities/novel/ui/NovelCoverCollage'
import RankingSection from '@/entities/novel/ui/RankingSection'
import { fetchGenreNovels, fetchNovels, type RankingSort } from '@/entities/novel/api/novelApi'
import { CARD_COVER_CLASS, CARD_WIDTH_CLASS } from '@/entities/novel/ui/cardSize'
import Skeleton from '@/shared/ui/Skeleton'
import WaveBackdrop from '@/shared/ui/WaveBackdrop'
import { useInView } from '@/shared/lib/useInView'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

const GENRE_TABS = ['전체', '로맨스', '드라마', '코미디']
const HERO_COVER_IDS = [1, 2, 3]

const RANKING_SECTIONS: { sort: RankingSort; title: string; description: string; anchorId?: string }[] = [
  { sort: 'views', title: '조회수 랭킹', description: '누적 조회수가 높은 작품을 만나보세요.' },
  { sort: 'popular', title: '인기 랭킹', description: '좋아요가 많은 작품을 만나보세요.' },
  { sort: 'new', title: '신작', description: '신작으로 등록된 이야기를 만나보세요.', anchorId: 'update' },
]

function NovelCardSkeleton() {
  return (
    <div className={`flex ${CARD_WIDTH_CLASS} flex-col gap-2`}>
      <Skeleton className={`${CARD_COVER_CLASS} rounded-lg`} />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

function RevealCard({ index, children }: { index: number; children: ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal-item transition-all duration-500 ease-out ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {children}
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const catalogRef = useRef<HTMLDivElement>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined)

  useDocumentTitle('언제 어디서나 즐기는 웹소설')

  const { data: novels } = useQuery({
    queryKey: ['novels'],
    queryFn: fetchNovels,
  })

  const heroNovels = HERO_COVER_IDS.map((id) => novels?.find((novel) => novel.id === id)).filter(
    (novel): novel is NonNullable<typeof novel> => novel != null,
  )

  const {
    data: catalogNovels,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useQuery({
    queryKey: ['genre-novels', selectedGenre],
    queryFn: () => fetchGenreNovels(selectedGenre),
  })

  useEffect(() => {
    if (!location.hash) return
    document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleStartReading = () => {
    if (novels && novels.length > 0) {
      navigate(`/novel/${novels[0].id}`)
    } else {
      scrollToCatalog()
    }
  }

  return (
    <div className="min-h-svh bg-white pt-14 md:pt-16">
      <Header />

      <section className="relative overflow-hidden border-b border-neutral-200 bg-primary-900">
        <WaveBackdrop />
        <div className="relative z-10 mx-auto grid max-w-[1168px] items-center gap-12 px-4 py-20 md:px-10 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-lg text-headline-medium font-bold text-white sm:text-headline-large md:text-display-small">
              언제 다시 읽더라도
              <br />
              다시 생생하게 읽어보세요
            </h1>
            <p className="max-w-md text-body-large text-primary-200/90">
              매일매일 새로 업데이트 되는 이야기들의 파도에 올라타 보세요.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStartReading}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-white px-6 py-3 text-label-large font-medium text-primary-900 transition hover:bg-primary-50 active:translate-y-[1px]"
              >
                읽기 시작하기
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={scrollToCatalog}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3 text-label-large font-medium text-white transition hover:bg-white/10 active:translate-y-[1px]"
              >
                전체 작품 보기
              </button>
            </div>
          </div>

          {heroNovels.length > 0 && (
            <NovelCoverCollage
              novels={heroNovels}
              className="mx-auto hidden w-full max-w-[420px] sm:block lg:mx-0 lg:ml-auto"
            />
          )}
        </div>
      </section>

      <section id="genre" className="mx-auto max-w-[1168px] scroll-mt-14 px-4 pt-8 md:scroll-mt-16 md:px-10">
        <div role="tablist" aria-label="장르 필터" className="flex gap-1 border-b border-neutral-200">
          {GENRE_TABS.map((genre) => {
            const active = (selectedGenre ?? '전체') === genre
            return (
              <button
                key={genre}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedGenre(genre === '전체' ? undefined : genre)}
                className={`cursor-pointer px-3 py-3 text-label-large font-medium transition-colors sm:px-4 ${
                  active ? 'border-b-2 border-primary-600 font-semibold text-primary-700' : 'text-neutral-500 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                {genre}
              </button>
            )
          })}
        </div>
      </section>

      <div id="ranking" className="scroll-mt-14 md:scroll-mt-16">
        {RANKING_SECTIONS.map(({ sort, title, description, anchorId }) => (
          <RankingSection key={sort} sort={sort} title={title} description={description} genre={selectedGenre} anchorId={anchorId} />
        ))}
      </div>

      <section ref={catalogRef} id="catalog" className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-title-large font-bold text-neutral-900 sm:text-headline-small">전체</h2>
        </div>

        {catalogError && <p className="text-body-small text-neutral-400">작품 목록을 가져오지 못했어요.</p>}
        {!catalogLoading && catalogNovels && catalogNovels.length === 0 && (
          <p className="text-body-small text-neutral-400">아직 등록된 작품이 없어요.</p>
        )}

        <div className="sm:hidden">
          {catalogLoading
            ? Array.from({ length: 4 }).map((_, i) => <NovelListRowSkeleton key={i} />)
            : catalogNovels?.map((novel) => (
                <NovelListRow
                  key={novel.id}
                  id={novel.id}
                  title={novel.title}
                  author={novel.author}
                  coverImageUrl={novel.cover_image_url}
                  tags={novel.tags}
                  views={novel.views}
                  rating={novel.rating}
                  likes={novel.likes}
                  isNew={novel.is_new}
                />
              ))}
        </div>

        <div className="hidden flex-wrap justify-center gap-x-6 gap-y-10 sm:flex sm:justify-start">
          {catalogLoading
            ? Array.from({ length: 4 }).map((_, i) => <NovelCardSkeleton key={i} />)
            : catalogNovels?.map((novel, i) => (
                <RevealCard key={novel.id} index={i}>
                  <NovelCard
                    id={novel.id}
                    title={novel.title}
                    author={novel.author}
                    coverImageUrl={novel.cover_image_url}
                    tags={novel.tags}
                    views={novel.views}
                    rating={novel.rating}
                    likes={novel.likes}
                  />
                </RevealCard>
              ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-5">
        <div className="mx-auto max-w-[1168px] px-4 text-body-small text-neutral-500 md:px-10">
          © 2026 Perflow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default HomePage
