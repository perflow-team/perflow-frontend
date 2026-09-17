import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import MockNovelCard from '@/entities/novel/ui/MockNovelCard'
import { fetchNovels } from '@/entities/novel/api/novelApi'
import { filterMockNovels } from '@/features/search-novels/lib/filterMockNovels'
import { filterNovels } from '@/features/search-novels/lib/filterNovels'
import { MOCK_NOVELS } from '@/shared/mocks/mockCatalog'
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

  const { data: novels, isLoading } = useQuery({ queryKey: ['novels'], queryFn: fetchNovels })
  const results = filterNovels(novels ?? [], query)
  const mockResults = filterMockNovels(MOCK_NOVELS, query)
  const totalCount = results.length + mockResults.length

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-headline-small text-neutral-900">
          &quot;{query}&quot; 검색 결과 {!isLoading && <span className="text-neutral-400">{totalCount}건</span>}
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

        {!isLoading && mockResults.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-title-small text-neutral-500">장르 · 작가 일치</h2>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 sm:justify-start">
              {mockResults.map((novel) => (
                <MockNovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && totalCount === 0 && (
          <SectionNotice icon={Search}>다른 제목, 작가, 장르로 검색해보세요.</SectionNotice>
        )}
      </section>
    </div>
  )
}

export default SearchPage
