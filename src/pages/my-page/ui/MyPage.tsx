import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck, ChevronRight, Compass, Heart, History, LogIn } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import NovelListRow from '@/entities/novel/ui/NovelListRow'
import NovelListRowSkeleton from '@/entities/novel/ui/NovelListRowSkeleton'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import UserAvatar from '@/entities/user/ui/UserAvatar'
import { fetchMyFavorites } from '@/features/favorite-novel/api/favoriteApi'
import { fetchReadingProgress } from '@/entities/reading-history/api/readingHistoryApi'
import { CARD_COVER_CLASS, CARD_WIDTH_CLASS } from '@/entities/novel/ui/cardSize'
import Button from '@/shared/ui/Button'
import Skeleton from '@/shared/ui/Skeleton'
import SectionNotice from '@/shared/ui/SectionNotice'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

function MyPage() {
  const user = useAuthStore((s) => s.user)

  const progressQuery = useQuery({
    queryKey: ['reading-progress'],
    queryFn: fetchReadingProgress,
    enabled: !!user,
    retry: false,
  })
  const favoritesQuery = useQuery({
    queryKey: ['my-favorites'],
    queryFn: fetchMyFavorites,
    enabled: !!user,
    retry: false,
  })

  useDocumentTitle(user ? `${user.nickname}님의 마이페이지` : '마이페이지')

  if (!user) {
    return (
      <div className="min-h-svh bg-white pt-14 md:pt-16">
        <Header />
        <section className="mx-auto flex max-w-[1168px] flex-col items-center gap-3 px-4 py-24 text-center md:px-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <LogIn size={20} />
          </div>
          <h1 className="mt-1 text-title-large font-bold text-neutral-900 sm:text-headline-small">마이페이지</h1>
          <p className="text-body-medium text-neutral-500">로그인하면 독서 통계와 이어보기를 볼 수 있어요.</p>
          <Link to="/login" className="mt-2">
            <Button>로그인하러 가기</Button>
          </Link>
        </section>
      </div>
    )
  }

  const progress = progressQuery.data
  const inProgressCount = progress?.length ?? 0
  const completedCount = progress?.filter((item) => item.progress_percentage >= 1).length ?? 0
  const avgProgressPercent =
    progress && progress.length > 0
      ? Math.round((progress.reduce((sum, item) => sum + item.progress_percentage, 0) / progress.length) * 100)
      : 0

  return (
    <div className="min-h-svh bg-white pt-14 md:pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <div className="flex items-center gap-3">
          <UserAvatar nickname={user.nickname} />
          <h1 className="text-title-large font-bold text-neutral-900 sm:text-headline-small">{user.nickname}님의 독서 현황</h1>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {progressQuery.isLoading ? (
            <>
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
            </>
          ) : progressQuery.isError || !progress ? (
            <div className="col-span-full">
              <SectionNotice icon={Compass}>독서 통계는 아직 준비 중이에요.</SectionNotice>
            </div>
          ) : (
            <>
              <StatTile icon={BookOpenCheck} label="읽고 있는 작품" value={`${inProgressCount}편`} />
              <StatTile icon={History} label="완독 작품 수" value={`${completedCount}편`} />
              <StatTile icon={Compass} label="평균 진행률" value={`${avgProgressPercent}%`} />
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <h2 className="mb-4 text-title-large font-bold text-neutral-900 sm:text-headline-small">이어보기</h2>
        {progressQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : progressQuery.isError || !progress ? (
          <SectionNotice icon={History}>이어보기 목록은 아직 준비 중이에요.</SectionNotice>
        ) : progress.length === 0 ? (
          <SectionNotice icon={History}>아직 읽은 작품이 없어요.</SectionNotice>
        ) : (
          <div className="flex flex-col gap-3">
            {progress.map((item) => {
              const percent = Math.min(100, Math.round(item.progress_percentage * 100))
              return (
                <Link
                  key={item.novel_id}
                  to={`/novel/${item.novel_id}/read/${item.current_chapter_number}`}
                  className="group rounded-lg border border-neutral-200 px-5 py-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="line-clamp-1 text-body-medium text-neutral-900">{item.novel_title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-label-medium text-neutral-400">
                      {item.current_chapter_number}화 · {percent}%
                      <ChevronRight size={14} className="text-neutral-300 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <h2 className="mb-4 text-title-large font-bold text-neutral-900 sm:text-headline-small">관심작</h2>
        {favoritesQuery.isLoading ? (
          <>
            <div className="sm:hidden">
              {Array.from({ length: 3 }).map((_, i) => <NovelListRowSkeleton key={i} />)}
            </div>
            <div className="hidden flex-wrap justify-center gap-6 sm:flex sm:justify-start">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex ${CARD_WIDTH_CLASS} flex-col gap-2`}>
                  <Skeleton className={`${CARD_COVER_CLASS} rounded-lg`} />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </>
        ) : favoritesQuery.isError || !favoritesQuery.data ? (
          <SectionNotice icon={Heart}>관심작 목록은 아직 준비 중이에요.</SectionNotice>
        ) : favoritesQuery.data.length === 0 ? (
          <SectionNotice icon={Heart}>등록한 관심작이 없어요.</SectionNotice>
        ) : (
          <>
            <div className="sm:hidden">
              {favoritesQuery.data.map((novel) => (
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
            <div className="hidden flex-wrap justify-center gap-6 sm:flex sm:justify-start">
              {favoritesQuery.data.map((novel) => (
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
                />
              ))}
            </div>
          </>
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
