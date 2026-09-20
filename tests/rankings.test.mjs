import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/entities/novel/lib/rankNovels.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { rankNovels } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const ids = (novels) => novels.map((novel) => novel.id)
const book = (id, fields = {}) => ({ id, views: 0, likes: 0, rating: 0, is_new: false, published_at: null, ...fields })

test('views, popularity and new releases use different stored catalog fields', () => {
  const books = [book(1, { views: 900, likes: 100, rating: 8 }), book(2, { views: 100, likes: 0, rating: 9.5 }),
    book(3, { views: 500, likes: 20, rating: 9, is_new: true }), book(4, { is_new: true })]
  assert.deepEqual(ids(rankNovels(books, 'views')), [1, 3, 2, 4])
  assert.deepEqual(ids(rankNovels(books, 'popular')), [2, 3, 1, 4])
  assert.deepEqual(ids(rankNovels(books, 'new')), [4, 3])
  assert.deepEqual(ids(books), [1, 2, 3, 4], 'sorting must not mutate shared catalog data')
})

test('new releases retain undated flagged books and exclude future or unflagged books', () => {
  const books = [book(1, { is_new: true, published_at: '2026-09-19T00:00:00' }),
    book(2, { is_new: true, published_at: '2026-09-20T09:00:00+09:00' }),
    book(3, { is_new: true, published_at: '2026-09-21T00:00:00Z' }),
    book(4, { is_new: true }), book(5, { is_new: true }), book(6, { published_at: '2026-09-20T00:00:00Z' })]
  assert.deepEqual(ids(rankNovels(books, 'new', 10, Date.parse('2026-09-20T00:00:00Z'))), [2, 1, 5, 4])
})

test('ties use views then ID, popularity matches ratings, and limits apply after sorting', () => {
  const books = [book(3, { views: 100, likes: 10, rating: 9 }),
    book(2, { views: 200, likes: 10, rating: 8 }), book(1, { views: 200, likes: 10, rating: 8 })]
  assert.deepEqual(ids(rankNovels(books, 'popular', 2)), [3, 1])
  assert.deepEqual(ids(rankNovels(books, 'rating')), [3, 1, 2])
  assert.deepEqual(rankNovels(books, 'views', 0), [])
  assert.deepEqual(rankNovels([], 'new'), [])
})

test('ranking API works against the deployed legacy catalog without the unsupported ranking endpoint', async () => {
  const apiSource = readFileSync(new URL('../src/entities/novel/api/novelApi.ts', import.meta.url), 'utf8')
    .replace("import { api } from '@/shared/api/base'", 'const api = globalThis.rankingApiFixture')
    .replace("import { rankNovels } from '../lib/rankNovels'", 'const rankNovels = globalThis.rankingSortFixture')
  const calls = []
  const books = [book(1, { views: 500, likes: 50, rating: 8 }), book(2, { views: 50, likes: 10, rating: 9, is_new: true })]
  globalThis.rankingApiFixture = { get: async (url, options) => {
    calls.push({ url, options })
    assert.equal(url, '/api/novels')
    return { data: books }
  } }
  globalThis.rankingSortFixture = rankNovels
  try {
    const compiled = ts.transpileModule(apiSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
    const { fetchRanking, fetchNewNovels } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
    assert.deepEqual(ids(await fetchRanking('popular', 1, '로맨스')), [2])
    assert.deepEqual(ids(await fetchRanking('views', 1, '로맨스')), [1])
    assert.deepEqual(ids(await fetchNewNovels('로맨스')), [2])
    assert(calls.every((call) => call.options.params.genre === '로맨스'))
  } finally {
    delete globalThis.rankingApiFixture
    delete globalThis.rankingSortFixture
  }
})
