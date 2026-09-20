import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, ChevronRight, Eye, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import { fetchChapters } from '@/entities/chapter/api/chapterApi'
import { fetchNovel } from '@/entities/novel/api/novelApi'
import NovelLikeButton from '@/features/favorite-novel/ui/NovelLikeButton'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { formatViews } from '@/shared/lib/formatViews'
import NovelCoverPlaceholder from '@/entities/novel/ui/NovelCoverPlaceholder'
import PreparingOverlay from '@/entities/novel/ui/PreparingOverlay'
import { isPlaceholderNovel } from '@/entities/novel/lib/isPlaceholderNovel'
import Badge from '@/shared/ui/Badge'
import Button from '@/shared/ui/Button'
import Skeleton from '@/shared/ui/Skeleton'
import SectionNotice from '@/shared/ui/SectionNotice'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

function NovelDetailPage() {
  const { novelId = '1' } = useParams()
  const userId = useAuthStore((s) => s.user?.id ?? null)

  const { data: novel, isLoading: novelLoading } = useQuery({
    queryKey: ['novel', novelId, userId],
    queryFn: () => fetchNovel(novelId),
  })
  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: () => fetchChapters(novelId),
  })

  const firstChapter = chapters?.[0]


  const genreTags = [...new Set((novel?.tags ?? []).filter((tag) => !tag.startsWith('#')))]
  const subGenreTags = [...new Set((novel?.tags ?? []).filter((tag) => tag.startsWith('#')))]

  useDocumentTitle(novel?.title ?? '작품 정보')

  return (
    <div className="min-h-svh bg-white pt-14 md:pt-16">
      <Header />

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-[1168px] flex-col gap-6 px-4 py-8 sm:flex-row sm:gap-10 md:px-10 md:py-12">
          <div className="relative mx-auto aspect-[23/30] w-[160px] shrink-0 overflow-hidden rounded-lg bg-neutral-200 shadow-lg ring-1 ring-neutral-900/5 sm:mx-0 sm:w-[230px]">
            {novel?.cover_image_url ? (
              <img src={novel.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              novel && <NovelCoverPlaceholder id={novel.id} title={novel.title} author={novel.author} />
            )}
            {novel && isPlaceholderNovel(novel.id) && <PreparingOverlay />}
          </div>

          <div className="flex flex-col gap-3 text-center sm:text-left">
            {novelLoading && (
              <div className="flex flex-col items-center gap-3 sm:items-start">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-5/6 max-w-2xl" />
              </div>
            )}
            {!novelLoading && !novel && (
              <p className="text-body-medium text-neutral-400">작품 정보를 가져오지 못했어요.</p>
            )}
            {novel && (
              <>
                <h1 className="text-headline-small font-bold text-neutral-900 sm:text-headline-large">{novel.title}</h1>
                <p className="text-title-small text-neutral-500">
                  {novel.author} 지음 · 총 {novel.total_chapters}화 연재
                </p>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-label-large text-neutral-500 sm:justify-start">
                  <span className="inline-flex items-center gap-1">
                    <Star size={16} className="text-primary-500" />
                    {novel.rating > 0 ? `${novel.rating.toFixed(1)} / 10` : '평가 전'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={16} className="text-neutral-400" />
                    조회 {formatViews(novel.views)}
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-body-medium text-neutral-700">
                  {novel.description ?? '아직 작품 소개가 등록되지 않았어요.'}
                </p>

                {novel.original_title && <p className="text-body-small text-neutral-600"><span className="mr-2 font-medium">원제</span>{novel.original_title}</p>}
                {novel.edition_note && <p className="text-label-small text-neutral-500">{novel.edition_note}</p>}
                {genreTags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 sm:justify-start">
                    <span className="text-label-large text-neutral-400">장르</span>
                    {genreTags.map((tag) => (
                      <span key={tag} className="text-label-large font-medium text-primary-700">#{tag}</span>
                    ))}
                  </div>
                )}
                {subGenreTags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 sm:justify-start">
                    <span className="text-label-large text-neutral-400">세부 장르</span>
                    {subGenreTags.map((tag) => (
                      <span key={tag} className="text-label-large font-medium text-neutral-600">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {firstChapter && (
                    <Link to={`/novel/${novelId}/read/${firstChapter.chapter_number}`}>
                      <Button>
                        {firstChapter.chapter_number}화 보기
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  )}
                  <NovelLikeButton key={`${novel.id}:${userId}`} novel={novel} userId={userId} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <h2 className="mb-4 text-title-large font-bold text-neutral-900 sm:text-headline-small">회차 목록</h2>

        {chaptersLoading && (
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        )}
        {!chaptersLoading && chapters?.length === 0 && (
          <SectionNotice icon={BookOpen}>등록된 회차가 없어요.</SectionNotice>
        )}

        {chapters && chapters.length > 0 && (
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/novel/${novelId}/read/${chapter.chapter_number}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="line-clamp-1 text-body-medium text-neutral-900">
                  {chapter.title ?? `${chapter.chapter_number}화`}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {!chapter.is_free && <Badge tone="primary">유료</Badge>}
                  <ChevronRight
                    size={14}
                    className="text-neutral-300 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default NovelDetailPage
