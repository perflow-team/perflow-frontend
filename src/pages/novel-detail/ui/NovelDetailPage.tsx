import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, ChevronRight, Heart, MessageCircle, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import { addBookmark, removeBookmark } from '@/features/bookmark-novel/api/bookmarkApi'
import { fetchChapters } from '@/entities/chapter/api/chapterApi'
import { fetchNovel } from '@/entities/novel/api/novelApi'
import NovelTags from '@/entities/novel/ui/NovelTags'
import Badge from '@/shared/ui/Badge'
import Button from '@/shared/ui/Button'
import Skeleton from '@/shared/ui/Skeleton'
import SectionNotice from '@/shared/ui/SectionNotice'

function NovelDetailPage() {
  const { novelId = '1' } = useParams()

  const { data: novel, isLoading: novelLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: () => fetchNovel(novelId),
  })
  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: () => fetchChapters(novelId),
  })

  const firstChapter = chapters?.[0]

  // No GET flag tells us the current bookmark state yet, so this starts
  // false every visit. The API isn't live on the backend (404) — clicking
  // shows a friendly notice instead of failing silently.
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState(false)
  const [bookmarkNotice, setBookmarkNotice] = useState<string | null>(null)

  const handleBookmarkClick = async () => {
    setBookmarkPending(true)
    setBookmarkNotice(null)
    try {
      if (bookmarked) {
        await removeBookmark(novelId)
        setBookmarked(false)
      } else {
        await addBookmark(novelId)
        setBookmarked(true)
      }
    } catch {
      setBookmarkNotice('관심작 등록은 아직 준비 중이에요.')
    } finally {
      setBookmarkPending(false)
    }
  }

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-[1168px] flex-col gap-6 px-4 py-8 sm:flex-row sm:gap-10 md:px-10 md:py-12">
          <div className="mx-auto h-[300px] w-[230px] shrink-0 overflow-hidden rounded-lg bg-neutral-200 shadow-lg ring-1 ring-neutral-900/5 sm:mx-0">
            {novel?.cover_image_url && (
              <img src={novel.cover_image_url} alt="" className="h-full w-full object-cover" />
            )}
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
                <h1 className="text-headline-large text-neutral-900">{novel.title}</h1>
                <p className="text-title-small text-neutral-500">
                  {novel.author} 지음 · 총 {novel.total_chapters}화 연재
                </p>

                <p className="mt-1 max-w-2xl text-body-medium text-neutral-700">
                  {novel.description ?? '아직 작품 소개가 등록되지 않았어요.'}
                </p>
                <NovelTags tags={novel.tags} className="justify-center sm:justify-start" />

                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <FeatureChip icon={MessageCircle}>스포일러 없는 AI 챗봇</FeatureChip>
                  <FeatureChip icon={Users}>인물 관계도</FeatureChip>
                  <FeatureChip icon={BookOpen}>모르는 단어 설명</FeatureChip>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {firstChapter && (
                    <Link to={`/novel/${novelId}/read/${firstChapter.chapter_number}`}>
                      <Button>
                        {firstChapter.chapter_number}화 보기
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={handleBookmarkClick} disabled={bookmarkPending}>
                    <Heart size={16} className={bookmarked ? 'fill-primary-600 text-primary-600' : ''} />
                    {bookmarked ? '관심작 등록됨' : '관심작 등록'}
                  </Button>
                </div>
                {bookmarkNotice && <p className="text-label-small text-neutral-400">{bookmarkNotice}</p>}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-8 md:px-10 md:py-10">
        <h2 className="mb-4 text-headline-small text-neutral-900">회차 목록</h2>

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

function FeatureChip({ icon: Icon, children }: { icon: ComponentType<{ size?: number }>; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-label-medium font-medium text-primary-700">
      <Icon size={14} />
      {children}
    </span>
  )
}

export default NovelDetailPage
