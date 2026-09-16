import { useQuery } from '@tanstack/react-query'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import { fetchNovels } from '@/entities/novel/api/novelApi'
import Skeleton from '@/shared/ui/Skeleton'

function NovelCardSkeleton() {
  return (
    <div className="flex w-[230px] flex-col gap-2">
      <Skeleton className="h-[300px] w-[230px] rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

function HomePage() {
  const { data: novels, isLoading, isError } = useQuery({
    queryKey: ['novels'],
    queryFn: fetchNovels,
  })

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="border-b border-neutral-200 bg-neutral-900">
        <div className="mx-auto flex max-w-[1168px] flex-col gap-4 px-4 py-14 md:px-10 md:py-24">
          <p className="text-label-large text-neutral-400">PERFLOW</p>
          <h1 className="text-headline-large text-white md:text-display-small">
            언제 어디서나,
            <br />
            당신만의 이야기를 만나보세요
          </h1>
          <p className="max-w-xl text-body-large text-neutral-300">
            매일 업데이트되는 웹소설을 가장 편안한 방식으로 읽어보세요.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-white px-6 py-3 text-label-large font-medium text-neutral-900 hover:bg-neutral-100"
            >
              무료로 시작하기
            </button>
            <button
              type="button"
              className="rounded-md border border-neutral-600 px-6 py-3 text-label-large font-medium text-white hover:bg-neutral-800"
            >
              둘러보기
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-headline-small text-neutral-900">작품 목록</h2>
        </div>

        {isError && <p className="text-body-small text-neutral-400">작품 목록을 가져오지 못했어요.</p>}
        {!isLoading && novels && novels.length === 0 && (
          <p className="text-body-small text-neutral-400">아직 등록된 작품이 없어요.</p>
        )}

        <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <NovelCardSkeleton key={i} />)
            : novels?.map((novel) => (
                <NovelCard
                  key={novel.id}
                  id={novel.id}
                  title={novel.title}
                  author={novel.author}
                  coverImageUrl={novel.cover_image_url}
                />
              ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-10">
        <div className="mx-auto max-w-[1168px] px-4 text-body-small text-neutral-500 md:px-10">
          © 2026 Perflow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default HomePage
