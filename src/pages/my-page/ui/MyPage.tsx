import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck, ChevronRight, Clock, Heart, History, LogIn, Sparkles } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { fetchMyBookmarks } from '@/features/bookmark-novel/api/bookmarkApi'
import { fetchReadingHistory, fetchReadingStats } from '@/entities/reading-history/api/readingHistoryApi'
import Button from '@/shared/ui/Button'
import Skeleton from '@/shared/ui/Skeleton'
import SectionNotice from '@/shared/ui/SectionNotice'

// None of the three endpoints below are live on the backend yet (all 404 as
// of writing — see docs/integration-report.md #2). Wired ahead of the API
// so each section just starts showing real data once the routes ship,
// instead of staying a static placeholder until then.
function MyPage() {
  const user = useAuthStore((s) => s.user)

  const statsQuery = useQuery({
    queryKey: ['reading-stats'],
    queryFn: fetchReadingStats,
    enabled: !!user,
    retry: false,
  })
  const historyQuery = useQuery({
    queryKey: ['reading-history'],
    queryFn: fetchReadingHistory,
    enabled: !!user,
    retry: false,
  })
  const bookmarksQuery = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: fetchMyBookmarks,
    enabled: !!user,
    retry: false,
  })

  if (!user) {
    return (
      <div className="min-h-svh bg-white pt-16">
        <Header />
        <section className="mx-auto flex max-w-[1168px] flex-col items-center gap-3 px-4 py-24 text-center md:px-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <LogIn size={20} />
          </div>
          <h1 className="mt-1 text-headline-small text-neutral-900">마이페이지</h1>
          <p className="text-body-medium text-neutral-500">로그인하면 독서 통계와 이어보기를 볼 수 있어요.</p>
          <Link to="/login" className="mt-2">
            <Button>로그인하러 가기</Button>
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-title-medium font-semibold text-white">
            {user.nickname.slice(0, 1)}
          </div>
          <h1 className="text-headline-small text-neutral-900">{user.nickname}님의 독서 현황</h1>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statsQuery.isLoading ? (
            <>
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
            </>
          ) : statsQuery.isError || !statsQuery.data ? (
            <div className="col-span-full">
              <SectionNotice icon={Sparkles}>독서 통계는 아직 준비 중이에요.</SectionNotice>
            </div>
          ) : (
            <>
              <StatTile icon={Clock} label="누적 독서 시간" value={`${statsQuery.data.total_reading_minutes}분`} />
              <StatTile icon={BookOpenCheck} label="완독 작품 수" value={`${statsQuery.data.completed_novels}편`} />
              <StatTile icon={Heart} label="선호 장르" value={statsQuery.data.favorite_genre ?? '-'} />
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <h2 className="mb-4 text-headline-small text-neutral-900">이어보기</h2>
        {historyQuery.isLoading ? (
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : historyQuery.isError || !historyQuery.data ? (
          <SectionNotice icon={History}>이어보기 목록은 아직 준비 중이에요.</SectionNotice>
        ) : historyQuery.data.length === 0 ? (
          <SectionNotice icon={History}>아직 읽은 작품이 없어요.</SectionNotice>
        ) : (
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {historyQuery.data.map((item) => (
              <Link
                key={item.novel_id}
                to={`/novel/${item.novel_id}/read/${item.current_chapter_number}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="line-clamp-1 text-body-medium text-neutral-900">{item.novel_title}</span>
                <span className="flex shrink-0 items-center gap-2 text-label-medium text-neutral-400">
                  {item.current_chapter_number}화 · {Math.round(item.progress_percentage * 100)}%
                  <ChevronRight size={14} className="text-neutral-300 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <h2 className="mb-4 text-headline-small text-neutral-900">관심작</h2>
        {bookmarksQuery.isLoading ? (
          <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex w-[230px] flex-col gap-2">
                <Skeleton className="h-[300px] w-[230px] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : bookmarksQuery.isError || !bookmarksQuery.data ? (
          <SectionNotice icon={Heart}>관심작 목록은 아직 준비 중이에요.</SectionNotice>
        ) : bookmarksQuery.data.length === 0 ? (
          <SectionNotice icon={Heart}>등록한 관심작이 없어요.</SectionNotice>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
            {bookmarksQuery.data.map((novel) => (
              <NovelCard
                key={novel.id}
                id={novel.id}
                title={novel.title}
                author={novel.author}
                coverImageUrl={novel.cover_image_url}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatTile({ icon: Icon, label, value }: { icon: ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-neutral-50 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-label-medium text-neutral-500">{label}</p>
        <p className="mt-0.5 text-title-large font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  )
}

function StatTileSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-neutral-50 p-5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  )
}

export default MyPage
