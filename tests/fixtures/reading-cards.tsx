// Development-only fixture. All requests are intercepted; no production writes.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import App from '@/app/App'
import '@/app/index.css'
import { api } from '@/shared/api/base'
import cards from './reading-cards.json'
import storedPlace from './stored-place.json'
const fixtureCards = [...cards, storedPlace.card]

const content = [
  '목수 김철수는 마을에 혼자 살았다. 사람들은 그를 철수 아저씨라고 불렀다.',
  '영희가 김철수를 바라보며 말했다. “너는 다리를 고칠 수 있니?”',
  '푸른정자는 마을 사람들이 쉬는 곳이었다. 김철수, 영희, 민수, 지수, 수진, 영수, 미나, 진우, 선희가 그곳을 방문했다.',
  '어젯밤 홍수로 마을 다리가 무너졌다. 사람들은 이를 다리 붕괴 사건이라고 불렀다.',
  '그 일이 있고 나서 주민들은 강을 건너지 못했다. 김철수는 다리를 고치기 시작했다.',
  '영희는 지전 한 장으로 쌀을 샀다.',
  storedPlace.content,
].join('\n')
const marks = fixtureCards.map((card) => ({ word:card.word, type:({인물:'CHARACTER',장소:'PLACE',사건:'EVENT'} as Record<string,string>)[card.tag] ?? 'WORD',
  start_offset:content.indexOf(card.word), end_offset:content.indexOf(card.word)+card.word.length,
  lookup_offset:content.length }))
api.defaults.adapter = async (config) => {
  let data: unknown
  if (config.url?.endsWith('/dictionary')) {
    const input = JSON.parse(config.data)
    if (input.card_version !== 'reader-card-v2') throw new AxiosError('Missing card version')
    const mark = marks.find((entry) => entry.word === input.word)
    if (input.selection_char_offset !== undefined && input.selection_char_offset !== mark?.start_offset) throw new AxiosError('Wrong occurrence')
    await new Promise((resolve) => setTimeout(resolve, 200))
    data = fixtureCards.find((card) => card.word === input.word)
  } else if (config.url?.endsWith('/lookup-targets')) data = {status:'completed',targets:marks}
  else if (config.url?.endsWith('/dictionary/terms')) data = fixtureCards.map((card, i) => ({id:String(i),name:card.word,type:marks[i].type}))
  else if (config.url?.endsWith('/progress')) data = {current_chapter_number:1,current_char_offset:0,progress_percentage:0,updated_at:null}
  else if (config.url?.endsWith('/chapters')) data = [{id:1,chapter_number:1,title:'1. 설명 카드 검증',is_free:true}]
  else if (config.url?.endsWith('/chapters/1')) data = {id:1,chapter_number:1,title:'1. 설명 카드 검증',content,entities:marks}
  else throw new AxiosError(`Unhandled fixture request: ${config.url}`)
  return {data,status:200,statusText:'OK',headers:{},config}
}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}>
  <MemoryRouter initialEntries={['/novel/1/read/1']}><App /></MemoryRouter>
</QueryClientProvider>)
