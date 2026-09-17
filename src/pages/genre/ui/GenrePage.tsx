import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import MockNovelCard from '@/entities/novel/ui/MockNovelCard'
import { GENRES, MOCK_NOVELS } from '@/shared/mocks/mockCatalog'
import SectionNotice from '@/shared/ui/SectionNotice'

function isGenre(value: string | null): value is (typeof GENRES)[number] {
  return GENRES.includes(value as (typeof GENRES)[number])
}

function GenrePage() {
  const [searchParams] = useSearchParams()
  const initialGenre = searchParams.get('g')
  const [activeGenre, setActiveGenre] = useState<(typeof GENRES)[number]>(
    isGenre(initialGenre) ? initialGenre : GENRES[0],
  )
  const novels = MOCK_NOVELS.filter((n) => n.genre === activeGenre)

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-headline-small text-neutral-900">장르</h1>
        <p className="mt-2 text-body-small text-neutral-500">장르별 작품을 준비 중이에요. 아래 작품은 미리보기용 예시이며, 아직 읽을 수 없어요.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setActiveGenre(genre)}
              className={`rounded-full px-4 py-2 text-label-large font-medium transition-colors ${
                genre === activeGenre
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {novels.length === 0 ? (
            <SectionNotice icon={Sparkles}>이 장르는 아직 작품이 없어요.</SectionNotice>
          ) : (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 sm:justify-start">
              {novels.map((novel) => (
                <MockNovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default GenrePage
