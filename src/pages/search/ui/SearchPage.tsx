import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import { fetchNovels } from '@/entities/novel/api/novelApi'
import { filterNovels } from '@/features/search-novels/lib/filterNovels'
import Skeleton from '@/shared/ui/Skeleton'
import SectionNotice from '@/shared/ui/SectionNotice'

function NovelCardSkeleton() {
  return (
    <div className="flex w-[230px] flex-col gap-2">
      <Skeleton className="h-[300px] w-[230px] rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const { data: novels, isLoading, isError, refetch } = useQuery({ queryKey: ['novels'], queryFn: fetchNovels })
  const results = filterNovels(novels ?? [], query)

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-headline-small text-neutral-900">
          &quot;{query}&quot; 검색 결과 {!isLoading && !isError && <span className="text-neutral-400">{results.length}건</span>}
        </h1>

        <div className="mt-6 flex flex-wrap justify-center gap-6 sm:justify-start">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <NovelCardSkeleton key={i} />)
            : results.map((novel) => (
                <NovelCard
                  key={novel.id}
                  id={novel.id}
                  title={novel.title}
                  author={novel.author}
                  coverImageUrl={novel.cover_image_url}
                />
              ))}
        </div>

        {isError && (
          <div role="alert" className="mt-6 text-body-small text-neutral-500">
            <p>작품 목록을 가져오지 못했어요.</p>
            <button type="button" onClick={() => void refetch()} className="mt-2 text-primary-600">다시 시도</button>
          </div>
        )}

        {!isLoading && !isError && results.length === 0 && (
          <SectionNotice icon={Search}>다른 제목이나 작가로 검색해보세요.</SectionNotice>
        )}
      </section>
    </div>
  )
}

export default SearchPage
