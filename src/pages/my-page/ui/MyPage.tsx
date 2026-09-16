import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { fetchMyBookmarks } from '@/features/bookmark-novel/api/bookmarkApi'
import { fetchReadingHistory, fetchReadingStats } from '@/entities/reading-history/api/readingHistoryApi'
import Button from '@/shared/ui/Button'
import Skeleton from '@/shared/ui/Skeleton'

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
        <section className="mx-auto flex max-w-[1168px] flex-col items-center gap-4 px-4 py-24 text-center md:px-10">
          <h1 className="text-headline-small text-neutral-900">마이페이지</h1>
          <p className="text-body-medium text-neutral-500">로그인하면 독서 통계와 이어보기를 볼 수 있어요.</p>
          <Link to="/login">
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
        <h1 className="text-headline-small text-neutral-900">{user.nickname}님의 독서 현황</h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statsQuery.isLoading ? (
            <>
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
            </>
          ) : statsQuery.isError || !statsQuery.data ? (
            <p className="col-span-full text-body-small text-neutral-400">독서 통계는 아직 준비 중이에요.</p>
          ) : (
            <>
              <StatTile label="누적 독서 시간" value={`${statsQuery.data.total_reading_minutes}분`} />
              <StatTile label="완독 작품 수" value={`${statsQuery.data.completed_novels}편`} />
              <StatTile label="선호 장르" value={statsQuery.data.favorite_genre ?? '-'} />
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
          <p className="text-body-small text-neutral-400">이어보기 목록은 아직 준비 중이에요.</p>
        ) : historyQuery.data.length === 0 ? (
          <p className="text-body-small text-neutral-400">아직 읽은 작품이 없어요.</p>
        ) : (
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {historyQuery.data.map((item) => (
              <Link
                key={item.novel_id}
                to={`/novel/${item.novel_id}/read/${item.current_chapter_number}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50"
              >
                <span className="text-body-medium text-neutral-900">{item.novel_title}</span>
                <span className="text-label-medium text-neutral-400">
                  {item.current_chapter_number}화 · {Math.round(item.progress_percentage * 100)}%
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
          <p className="text-body-small text-neutral-400">관심작 목록은 아직 준비 중이에요.</p>
        ) : bookmarksQuery.data.length === 0 ? (
          <p className="text-body-small text-neutral-400">등록한 관심작이 없어요.</p>
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-label-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-title-large font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

function StatTileSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-6 w-14" />
    </div>
  )
}

export default MyPage
