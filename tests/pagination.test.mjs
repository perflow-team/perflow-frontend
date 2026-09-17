import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/features/switch-reader-mode/lib/paginateContent.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { paginateContent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const measure = (_index, text) => Math.ceil([...text].length / 10) * 20

test('an oversized paragraph is readable in full across pages, with exact source offsets', () => {
  const text = '초봉은 군산을 떠올렸다. '.repeat(100)
  const pages = paginateContent([{ type: 'paragraph', text, start: 17 }], 80, measure)
  assert(pages.length > 1)
  assert.equal(pages.flat().map(block => block.text).join(''), text)
  let offset = 17
  for (const page of pages) {
    assert(page.reduce((height, block, i) => height + measure(0, block.text) + (i ? 12 : 0), 0) <= 80)
    for (const block of page) {
      assert.equal(block.start, offset)
      assert.equal(block.contextSentence, text)
      offset += block.text.length
    }
  }
})

test('short paragraphs move intact and their page gaps count toward available height', () => {
  const content = [0, 20, 40].map(start => ({ type: 'paragraph', text: '가'.repeat(15), start }))
  const pages = paginateContent(content, 90, measure)
  assert.deepEqual(pages.map(page => page.length), [1, 1, 1])
  assert.deepEqual(pages.flat().map(block => block.start), [0, 20, 40])
})

test('splitting preserves combined emoji and decomposed Korean graphemes', () => {
  const graphemes = ['👩🏽‍💻', '가', 'é', '🏳️‍🌈']
  const text = graphemes.join('')
  const pages = paginateContent([{ type: 'paragraph', text, start: 0 }], 1, (_i, value) => Array.from(new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(value)).length)
  assert.deepEqual(pages.flat().map(block => block.text), graphemes)
  assert.equal(pages.flat().map(block => block.text).join(''), text)
})

test('empty content and a viewport shorter than a line terminate without losing text', () => {
  assert.deepEqual(paginateContent([], 80, measure), [[]])
  const pages = paginateContent([{ type: 'paragraph', text: '가나다', start: 0 }], 1, measure)
  assert.equal(pages.flat().map(block => block.text).join(''), '가나다')
})
