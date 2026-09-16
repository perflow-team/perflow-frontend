import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import { addBookmark, removeBookmark } from '@/features/bookmark-novel/api/bookmarkApi'
import { fetchChapters } from '@/entities/chapter/api/chapterApi'
import { fetchNovel } from '@/entities/novel/api/novelApi'
import Button from '@/shared/ui/Button'
import Skeleton from '@/shared/ui/Skeleton'

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
          <div className="mx-auto h-[300px] w-[230px] shrink-0 overflow-hidden rounded-lg bg-neutral-200 sm:mx-0">
            {novel?.cover_image_url && (
              <img src={novel.cover_image_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-3 text-center sm:text-left">
            {novelLoading && (
              <div className="flex flex-col items-center gap-3 sm:items-start">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
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
                <p className="text-title-small text-neutral-500">{novel.author} 지음</p>
                <p className="text-label-medium text-neutral-500">총 {novel.total_chapters}화 연재</p>

                <p className="mt-2 max-w-2xl text-body-medium text-neutral-700">
                  {novel.description ?? '아직 작품 소개가 등록되지 않았어요.'}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {firstChapter && (
                    <Link to={`/novel/${novelId}/read/${firstChapter.chapter_number}`}>
                      <Button>{firstChapter.chapter_number}화 보기</Button>
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
          <p className="text-body-small text-neutral-400">등록된 회차가 없어요.</p>
        )}

        {chapters && chapters.length > 0 && (
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/novel/${novelId}/read/${chapter.chapter_number}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50"
              >
                <span className="text-body-medium text-neutral-900">
                  {chapter.title ?? `${chapter.chapter_number}화`}
                </span>
                {!chapter.is_free && (
                  <span className="rounded bg-primary-100 px-2 py-0.5 text-label-small text-primary-700">유료</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default NovelDetailPage
