// Local-only fixture: every API request is intercepted, including progress saves.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom'
import App from '@/app/App'
import '@/app/index.css'
import { api } from '@/shared/api/base'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
let failNext = false
let notify = () => {}
const saved: { current_chapter_number: number; progress_percentage: number }[] = []
const titles = ['1. 꽃이 피었다', '2. 다시 걷는 길', '3. 마지막 풍경']
const chapters = titles.map((title, i) => ({ id: i + 1, chapter_number: i + 1, title, is_free: true }))
const paragraph = '바람이 불자 나뭇잎이 살랑거렸다. 나는 천천히 걸음을 옮기며 그날의 이야기를 떠올렸다. 길 끝에는 다음 이야기가 기다리고 있었다. '
const contents = [Array.from({ length: 18 }, (_, i) => `${i + 1}번째 장면. ${paragraph.repeat(2)}`).join('\n\n'),
  Array.from({ length: 10 }, (_, i) => `${i + 1}번째 장면. ${paragraph.repeat(2)}`).join('\n\n'), '마지막 꽃잎이 바람을 따라 날아갔다. 이야기는 여기에서 끝났다.']
api.defaults.adapter = async (config) => {
  let data: unknown
  if (config.url?.endsWith('/progress')) {
    if (config.method === 'put') {
      const position = JSON.parse(config.data)
      await new Promise((resolve) => setTimeout(resolve, position.current_chapter_number === 1 ? 300 : 20))
      saved.push(position)
      notify()
      data = {}
    } else data = { current_chapter_number: 1, current_char_offset: 0, progress_percentage: 0, updated_at: null }
  } else if (config.url?.endsWith('/lookup-targets')) data = { status: 'completed', targets: [] }
  else if (config.url === '/api/novels/1/chapters') data = chapters
  else if (/\/chapters\/\d+$/.test(config.url ?? '')) {
    const id = Number(config.url!.split('/').at(-1))
    await new Promise((resolve) => setTimeout(resolve, 250))
    if (failNext && id === 2) throw new AxiosError('Fixture load failure')
    data = { ...chapters[id - 1], content: contents[id - 1], entities: [] }
  } else throw new AxiosError(`Unhandled fixture request: ${config.url}`)
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}
useAuthStore.getState().setAuth('local-continuation-fixture', { id: 901, nickname: '검증 계정', email: '' })
export function Controls() {
  const [, render] = useState(0)
  useEffect(() => {
    notify = () => render((value) => value + 1)
    return () => { notify = () => {} }
  }, [])
  const navigate = useNavigate()
  const location = useLocation()
  const progress = useReaderStore((state) => state.progress)
  return <aside className="fixed left-1 top-24 z-[60] max-w-40 rounded bg-white/95 p-2 text-xs shadow" aria-label="검증 도구">
    <p>테스트 전용 · API 차단</p><p>{location.pathname}</p><p>진도 {Math.round(progress * 100)}%</p>
    <button className="block p-2" onClick={() => navigate('/novel/1/read/1')}>테스트 1화로</button>
    <button className="block p-2" onClick={() => { failNext = true; client.removeQueries({ queryKey: ['chapter-content', '1', '2'] }) }}>2화 불러오기 실패</button>
    <button className="block p-2" onClick={() => { failNext = false }}>네트워크 복구</button>
    <output aria-label="저장 결과">{saved.slice(-6).map((s, i) => <p key={i}>{s.current_chapter_number}화 {Math.round(s.progress_percentage * 100)}%</p>)}</output>
  </aside>
}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}>
  <MemoryRouter initialEntries={['/novel/1/read/1']}><App /><Controls /></MemoryRouter>
</QueryClientProvider>)
