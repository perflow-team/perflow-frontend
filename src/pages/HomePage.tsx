import Header from '../components/Header'
import NovelCard from '../components/NovelCard'

const featuredNovels = [
  { id: '1', title: '달빛 아래 검객', author: '이서준', genre: '판타지', rating: 4.8 },
  { id: '2', title: '재벌집 막내딸', author: '한소율', genre: '현대판타지', rating: 4.9 },
  { id: '3', title: '회귀한 황녀님', author: '김다연', genre: '로맨스판타지', rating: 4.7 },
  { id: '4', title: '검은 태양의 기사', author: '박지훈', genre: '무협', rating: 4.6 },
  { id: '5', title: '이세계 약사', author: '최유나', genre: '판타지', rating: 4.5 },
  { id: '6', title: '악역의 남편이 되었다', author: '정민서', genre: '로맨스', rating: 4.8 },
  { id: '7', title: '플레이어의 게임', author: '오태양', genre: '게임판타지', rating: 4.9 },
  { id: '8', title: '천재 공작가의 비밀', author: '윤서아', genre: '로맨스판타지', rating: 4.7 },
]

const genres = ['판타지', '로맨스', '로맨스판타지', '현대판타지', '무협', 'BL', '미스터리', '라이트노벨']

function HomePage() {
  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="border-b border-neutral-200 bg-neutral-900">
        <div className="mx-auto flex max-w-[1168px] flex-col gap-4 px-10 py-24">
          <p className="text-label-large text-neutral-400">PERFLOW</p>
          <h1 className="text-display-small text-white">
            언제 어디서나,
            <br />
            당신만의 이야기를 만나보세요
          </h1>
          <p className="max-w-xl text-body-large text-neutral-300">
            매일 업데이트되는 웹소설을 가장 편안한 방식으로 읽어보세요.
          </p>
          <div className="mt-4 flex gap-3">
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

      <section className="mx-auto max-w-[1168px] px-10 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-headline-small text-neutral-900">지금 인기 있는 작품</h2>
          <a href="#" className="text-label-large text-primary-600 hover:underline">
            전체보기
          </a>
        </div>
        <div className="flex flex-wrap gap-6">
          {featuredNovels.map((novel) => (
            <NovelCard key={novel.id} {...novel} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1168px] px-10 pb-16">
        <h2 className="mb-6 text-headline-small text-neutral-900">장르별로 찾아보기</h2>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className="rounded-full border border-neutral-300 px-5 py-2 text-label-large text-neutral-700 hover:border-primary-400 hover:text-primary-700"
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-10">
        <div className="mx-auto max-w-[1168px] px-10 text-body-small text-neutral-500">
          © 2026 Perflow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default HomePage
