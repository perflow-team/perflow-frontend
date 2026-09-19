import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import NovelCard from '@/entities/novel/ui/NovelCard'
import { fetchGenres, fetchGenreNovels } from '@/entities/novel/api/novelApi'

export default function GenrePage() {
  const [params, setParams] = useSearchParams()
  const genre = params.get('g') || undefined
  const { data: genres = [] } = useQuery({ queryKey: ['genres'], queryFn: fetchGenres })
  const { data = [], isPending, isError, refetch } = useQuery({ queryKey: ['genre-novels', genre], queryFn: () => fetchGenreNovels(genre) })
  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />
      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-headline-small text-neutral-900">장르</h1>
        <p className="mt-2 text-body-small text-neutral-500">지금 끌리는 이야기의 분위기를 골라보세요.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {['전체', ...genres].map(name => <button key={name} type="button" aria-pressed={(genre ?? '전체') === name} onClick={() => setParams(name === '전체' ? {} : { g: name })}
            className={`cursor-pointer rounded-full px-4 py-2 text-label-large transition-colors ${(genre ?? '전체') === name ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-700'}`}>{name}</button>)}
        </div>
        {isError ? <div className="mt-8 text-body-small text-neutral-500"><p>작품을 불러오지 못했어요.</p><button type="button" onClick={() => void refetch()} className="mt-2 cursor-pointer text-primary-700">다시 시도</button></div>
          : isPending ? <p role="status" className="mt-8 text-neutral-500">작품을 불러오는 중이에요.</p>
          : data.length === 0 ? <p className="mt-8 text-neutral-500">이 장르에는 아직 작품이 없어요.</p>
          : <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-10 sm:justify-start">{data.map(novel => <NovelCard key={novel.id} id={novel.id} title={novel.title} author={novel.author} coverImageUrl={novel.cover_image_url} tags={novel.tags} views={novel.views} rating={novel.rating} />)}</div>}
      </section>
    </div>
  )
}
