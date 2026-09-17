import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Use the project's compiler so this suite also works on Vite's supported
// Node versions that do not yet support importing TypeScript directly.
const source = readFileSync(new URL('../src/features/lookup-word/lib/normalizeEntityCard.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { normalizeEntityCard } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

for (const tag of ['인물', '장소', '사건', '']) {
  test(`dictionary details are retained for ${tag || '일반 단어'}`, () => {
    const fields = [{ label: '설명', value: '현재까지 등장한 내용입니다.' }]
    const card = normalizeEntityCard({ word: '초봉', title: '초봉', tag, fields, is_spoiler_filtered: true }, '초봉')
    assert.deepEqual(card, { word: '초봉', title: '초봉', tag, fields, isSpoilerFiltered: true })
  })
}

test('dictionary field maps retain their labels and details', () => {
  const card = normalizeEntityCard({ title: '군산', tag: '장소', fields: { '첫 등장 페이지': 1, '주요 사건': '인물이 군산에 도착한다.' } }, '군산')
  assert.deepEqual(card.fields, [
    { label: '첫 등장 페이지', value: '1' },
    { label: '주요 사건', value: '인물이 군산에 도착한다.' },
  ])
})

test('documented legacy explanations are displayed when fields are absent', () => {
  const card = normalizeEntityCard({ word: '군산', explanation: '이야기의 배경이 되는 도시.', is_spoiler_filtered: true }, '군산')
  assert.equal(card.title, '군산')
  assert.deepEqual(card.fields, [{ label: '설명', value: '이야기의 배경이 되는 도시.' }])
})

test('invalid generated fields cannot crash rendering or hide valid details', () => {
  const card = normalizeEntityCard({
    fields: [null, 'invalid', { label: '기본 설정', value: {} }, { label: '주요 장면', value: '  ' }, { label: null, value: '  읽은 장면의 설명  ' }],
  }, '초봉')
  assert.deepEqual(card.fields, [{ label: '설명', value: '읽은 장면의 설명' }])
})

test('empty and malformed fields produce an empty list for the fallback UI', () => {
  for (const fields of [undefined, null, '', [], {}, [{ label: '기본 설정' }], [{ label: '설명', value: [] }]]) {
    const card = normalizeEntityCard({ title: '초봉', tag: '인물', fields }, '초봉')
    assert.deepEqual(card.fields, [])
    assert.equal(card.title, '초봉')
    assert.equal(card.tag, '인물')
  }
})

test('legacy explanation is a fallback only when no usable fields exist', () => {
  const card = normalizeEntityCard({ fields: [{ label: '기본 설정', value: null }], explanation: '확인된 설명' }, '초봉')
  assert.deepEqual(card.fields, [{ label: '설명', value: '확인된 설명' }])
  const canonical = normalizeEntityCard({ fields: [{ label: '뜻', value: '정상 설명' }], explanation: '이전 설명' }, '단어')
  assert.deepEqual(canonical.fields, [{ label: '뜻', value: '정상 설명' }])
})

test('invalid metadata falls back to the requested word and a safe badge value', () => {
  const card = normalizeEntityCard({ title: {}, word: null, tag: [], is_spoiler_filtered: 'false' }, '초봉')
  assert.deepEqual(card, { word: '초봉', title: '초봉', tag: '', fields: [], isSpoilerFiltered: false })
})

test('invalid response bodies surface the request error state', () => {
  for (const response of [null, undefined, 'invalid', []]) {
    assert.throws(() => normalizeEntityCard(response, '초봉'), /Invalid dictionary response/)
  }
})
