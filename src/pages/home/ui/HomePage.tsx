import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { type ReactNode, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import NovelCoverCollage from '@/entities/novel/ui/NovelCoverCollage'
import RankingSection from '@/entities/novel/ui/RankingSection'
import { fetchGenres, fetchNovels } from '@/entities/novel/api/novelApi'
import Skeleton from '@/shared/ui/Skeleton'
import WaveBackdrop from '@/shared/ui/WaveBackdrop'
import { useInView } from '@/shared/lib/useInView'

function NovelCardSkeleton() {
  return (
    <div className="flex w-[230px] flex-col gap-2">
      <Skeleton className="h-[300px] w-[230px] rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

// Scroll-reveal wrapper for catalog cards. IntersectionObserver-driven, no
// animation library — reduced-motion users get an instant, un-animated
// render via the .reveal-item CSS override in app/index.css.
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
  const catalogRef = useRef<HTMLDivElement>(null)

  const { data: novels, isLoading, isError } = useQuery({
    queryKey: ['novels'],
    queryFn: fetchNovels,
  })
  const { data: genres = [] } = useQuery({ queryKey: ['genres'], queryFn: fetchGenres })

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleStartReading = () => {
    if (novels && novels.length > 0) {
      navigate(`/novel/${novels[0].id}`)
    } else {
      scrollToCatalog()
    }
  }

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="relative overflow-hidden border-b border-neutral-200 bg-primary-900">
        <WaveBackdrop />
        <div className="relative z-10 mx-auto grid max-w-[1168px] items-center gap-12 px-4 py-20 md:px-10 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-lg text-headline-large text-white md:text-display-small">
              언제 어디서나,
              <br />
              당신만의 이야기를 만나보세요
            </h1>
            <p className="max-w-md text-body-large text-primary-200/90">
              익숙한 고전도 처음 만나는 이야기처럼. 취향에 맞는 작품에 편안하게 몰입해 보세요.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStartReading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-label-large font-medium text-primary-900 transition hover:bg-primary-50 active:translate-y-[1px]"
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

          {novels && (
            <NovelCoverCollage
              novels={novels}
              className="mx-auto hidden w-full max-w-[420px] sm:block lg:mx-0 lg:ml-auto"
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-4 pt-8 md:px-10">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {genres.map((genre) => (
            <Link
              key={genre}
              to={`/genre?g=${encodeURIComponent(genre)}`}
              className="shrink-0 rounded-full bg-neutral-100 px-4 py-2 text-label-large font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <RankingSection sort="views" />
      <RankingSection sort="rating" />
      <RankingSection sort="new" />

      <section ref={catalogRef} id="catalog" className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-headline-small text-neutral-900">작품 목록</h2>
        </div>

        {isError && <p className="text-body-small text-neutral-400">작품 목록을 가져오지 못했어요.</p>}
        {!isLoading && novels && novels.length === 0 && (
          <p className="text-body-small text-neutral-400">아직 등록된 작품이 없어요.</p>
        )}

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 sm:justify-start">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <NovelCardSkeleton key={i} />)
            : novels?.map((novel, i) => (
                <RevealCard key={novel.id} index={i}>
                  <NovelCard
                    id={novel.id}
                    title={novel.title}
                    author={novel.author}
                    coverImageUrl={novel.cover_image_url}
                    tags={novel.tags}
                    views={novel.views}
                    rating={novel.rating}
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
