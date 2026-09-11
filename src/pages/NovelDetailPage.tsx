import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Button from '../shared/ui/Button'

const episodes = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `${i + 1}화. 시작의 순간`,
  date: '2026.09.10',
  free: i < 3,
}))

function NovelDetailPage() {
  const { novelId = '1' } = useParams()

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-[1168px] gap-10 px-10 py-12">
          <div className="h-[300px] w-[230px] shrink-0 rounded-lg bg-neutral-200" />

          <div className="flex flex-col gap-3">
            <span className="text-label-large text-neutral-500">로맨스판타지 · 연재중</span>
            <h1 className="text-headline-large text-neutral-900">달빛 아래 검객 #{novelId}</h1>
            <p className="text-title-small text-neutral-500">이서준 지음</p>

            <div className="flex items-center gap-4 text-label-medium text-neutral-500">
              <span className="flex items-center gap-1 text-warning-700">★ 4.8</span>
              <span>조회 1.2M</span>
              <span>연재 128화</span>
            </div>

            <p className="mt-2 max-w-2xl text-body-medium text-neutral-700">
              몰락한 검문의 마지막 제자, 그가 다시 검을 든 이유는 단 하나. 잃어버린 이름을 되찾기 위해서다.
              화려한 밤하늘 아래 펼쳐지는 검객들의 이야기.
            </p>

            <div className="mt-4 flex gap-3">
              <Link to={`/novel/${novelId}/read/1`}>
                <Button>1화 무료로 보기</Button>
              </Link>
              <Button variant="outline">관심작 등록</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-10 py-10">
        <h2 className="mb-4 text-headline-small text-neutral-900">회차 목록</h2>
        <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              to={`/novel/${novelId}/read/${episode.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-body-medium text-neutral-900">{episode.title}</span>
                {!episode.free && (
                  <span className="rounded bg-primary-100 px-2 py-0.5 text-label-small text-primary-700">유료</span>
                )}
              </div>
              <span className="text-label-medium text-neutral-400">{episode.date}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default NovelDetailPage
