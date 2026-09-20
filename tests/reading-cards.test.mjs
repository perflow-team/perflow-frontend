import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

async function load(source) {
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
}
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const { normalizeEntityCard } = await load(read('../src/features/lookup-word/lib/normalizeEntityCard.ts'))

test('reading-card request preserves occurrence and cutoff without forcing every word to CHARACTER', async () => {
  let sent
  globalThis.readingCardApi = {post:async (url, body) => {
    sent = {url, body}
    return {data:{word:'그곳',title:'푸른정자',tag:'장소',fields:[{label:'주요 사건',value:'쉼터로 쓰였다.'}],is_spoiler_filtered:true}}
  }}
  globalThis.readingCardNormalizer = normalizeEntityCard
  try {
    const source = read('../src/features/lookup-word/api/wordLookupApi.ts')
      .replace("import { api } from '@/shared/api/base'", 'const api = globalThis.readingCardApi')
      .replace("import { normalizeEntityCard } from '@/features/lookup-word/lib/normalizeEntityCard'", 'const normalizeEntityCard = globalThis.readingCardNormalizer')
    const {fetchEntityCard} = await load(source)
    const card = await fetchEntityCard({novelId:'4',word:'그곳',contextSentence:'그곳에 갔다.',
      currentChapterNumber:2,progress:0.4,currentCharOffset:200,selectionCharOffset:170})
    assert.equal(sent.url, '/api/ai/novels/4/dictionary')
    assert.equal(sent.body.card_version, 'reader-card-v2')
    assert.equal(sent.body.current_char_offset, 200)
    assert.equal(sent.body.selection_char_offset, 170)
    assert.equal(sent.body.entity_type, undefined)
    assert.equal(card.title, '푸른정자')
    assert.equal(card.tag, '장소')
  } finally {
    delete globalThis.readingCardApi
    delete globalThis.readingCardNormalizer
  }
})

test('click and keyboard keep the exact selected occurrence distinct from the safe reading cutoff', async () => {
  const {useEntityTrigger} = await load(read('../src/entities/chapter/lib/useEntityTrigger.ts'))
  const calls = []
  const handlers = useEntityTrigger((...args) => calls.push(args)).getHandlers('너', '너는 가고 너는 남아.', 100, 42)
  handlers.onClick()
  handlers.onKeyDown({key:'Enter',repeat:false,preventDefault(){}})
  handlers.onKeyDown({key:'Enter',repeat:true,preventDefault(){}})
  assert.deepEqual(calls, [['너','너는 가고 너는 남아.',100,42],['너','너는 가고 너는 남아.',100,42]])
})

test('all four validated response types retain their exact modal labels and vocabulary has no tag', () => {
  const cards = JSON.parse(read('./fixtures/reading-cards.json')).map((response) => normalizeEntityCard(response, response.word))
  assert.deepEqual(cards.map((card) => card.fields.map((field) => field.label)), [
    ['첫 등장 페이지','기본 설정','주요 장면'], ['첫 등장 페이지','주요 사건','연관 인물'],
    ['첫 등장 페이지','전개 과정','영향 및 결과'], ['뜻','예문'],
  ])
  assert.equal(cards[3].tag, '')
  assert.equal(cards[3].title, cards[3].word)
})


test('classification is shared by icons, tags and fields and inconsistent responses fail closed', () => {
  const place = {type:'PLACE',word:'점순네',title:'점순네',tag:'장소',fields:[{label:'주요 사건',value:'수탉이 싸웠다.'}]}
  assert.equal(normalizeEntityCard(place, '점순네').type, 'PLACE')
  assert.throws(() => normalizeEntityCard({...place, fields:[{label:'뜻',value:'점순이의 집.'}]}, '점순네'), /do not match/)
  assert.throws(() => normalizeEntityCard({...place, tag:''}, '점순네'), /do not match/)
  assert.throws(() => normalizeEntityCard({...place, type:'UNKNOWN'}, '점순네'), /Invalid dictionary type/)
  assert.equal(normalizeEntityCard({word:'너',tag:'',type:null,fields:[{label:'설명',value:'확인 불가'}]}, '너').type, null)
  assert.equal(normalizeEntityCard({word:'지전',tag:'',fields:[{label:'뜻',value:'종이돈.'}]}, '지전').type, 'WORD')
})
