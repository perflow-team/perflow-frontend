// Open on a separate local Vite port. All API requests stay in this fixture.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { createRoot } from 'react-dom/client'
import { Link, MemoryRouter } from 'react-router-dom'
import App from '@/app/App'
import '@/app/index.css'
import { api } from '@/shared/api/base'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

const storageKey = 'perflow-like-fixture'
const votes: Record<string, number[]> = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
let failNext = false
const book = { id: 1, title: '누적 좋아요 검증 작품', original_title: '검증 원제', author: '테스트',
  edition_note: null, description: '운영 DB와 통신하지 않는 테스트 화면입니다.', cover_image_url: null,
  views: 100, rating: 9.4, likes: 18420, genres: ['드라마'], tags: [], total_chapters: 1 }
const count = () => book.likes + Object.values(votes).filter((ids) => ids.includes(book.id)).length

api.defaults.adapter = async (config) => {
  const account = String(config.headers.Authorization ?? '').replace('Bearer fixture-', '')
  const liked = () => (votes[account] ?? []).includes(book.id)
  const summary = () => ({ ...book, likes: count(), is_favorite: liked() })
  let data: unknown
  if (config.url === '/api/novels/1/like') {
    await new Promise((resolve) => setTimeout(resolve, 200))
    if (failNext) { failNext = false; throw new AxiosError('Fixture network failure') }
    const desired = JSON.parse(config.data).liked
    votes[account] = desired ? [book.id] : []
    localStorage.setItem(storageKey, JSON.stringify(votes))
    data = { novel_id: book.id, likes: count(), liked: desired, is_favorite: desired }
  } else if (config.url === '/api/novels/1') data = summary()
  else if (config.url === '/api/novels/1/chapters') data = [{ id: 1, chapter_number: 1, title: '1. 검증 시작', is_free: true }]
  else if (config.url === '/api/users/me/favorites') data = liked() ? [summary()] : []
  else if (config.url === '/api/novels' || config.url === '/api/novels/ranking') data = [summary()]
  else if (config.url === '/api/users/me/progress') data = []
  else if (config.url === '/api/genres') data = ['드라마']
  else throw new AxiosError(`Unhandled fixture request: ${config.url}`)
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

export function TestControls() {
  const user = useAuthStore((s) => s.user)
  return <nav className="fixed inset-x-0 bottom-0 z-[100] flex items-center gap-4 bg-neutral-900 p-4 text-white" aria-label="테스트 도구">
    <span>{user?.nickname ?? '비로그인'}</span>
    {[101, 102].map((id) => <button key={id} onClick={() => useAuthStore.getState().setAuth(`fixture-${id}`, { id, nickname: `테스트 ${id}`, email: '' })}>계정 {id}</button>)}
    <button onClick={() => useAuthStore.getState().logout()}>테스트 로그아웃</button>
    <button onClick={() => { failNext = true }}>다음 요청 실패</button>
    <Link to="/novel/1">테스트 상세</Link><Link to="/mypage">테스트 관심작</Link><Link to="/ranking">테스트 랭킹</Link>
  </nav>
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={['/novel/1']}><App /><TestControls /></MemoryRouter>
  </QueryClientProvider>,
)
