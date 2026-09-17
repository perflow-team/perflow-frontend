// Start Vite first. Requires Playwright and a Chrome executable; optional
// PLAYWRIGHT_MODULE, CHROME_PATH and BASE_URL support a shared local runtime.
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
const errors = []
const paragraph = '초봉은 군산을 떠올렸다. '.repeat(220) + '마지막 문장입니다.'
const second = '두 번째 회차의 시작입니다. ' + paragraph
const novels = [{ id: 1, title: '탁류', author: '채만식', cover_image_url: null }]

async function setup(viewport, failCatalog = false) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const lookups = []
  const saves = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === new URL(base).origin) return route.continue()
    const json = body => route.fulfill({ json: body, headers: { 'Access-Control-Allow-Origin': '*' } })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } })
    if (url.pathname === '/api/novels') return failCatalog
      ? route.fulfill({ status: 503, json: { detail: 'Test failure' }, headers: { 'Access-Control-Allow-Origin': '*' } })
      : json(novels)
    if (url.pathname.endsWith('/chapters')) return json([1, 2].map(number => ({ id: number, chapter_number: number, title: `${number}화 검증`, is_free: true })))
    const match = url.pathname.match(/\/chapters\/(\d+)$/)
    if (match) {
      const number = Number(match[1])
      const content = number === 1 ? paragraph : second
      const entities = [...content.matchAll(/초봉/g)].map(m => ({ word: '초봉', type: 'CHARACTER', start_offset: m.index, end_offset: m.index + 2 }))
      return json({ id: number, chapter_number: number, title: `${number}화 검증`, content, entities })
    }
    if (url.pathname.endsWith('/progress')) {
      if (request.method() === 'PUT') saves.push(request.postDataJSON())
      return json({ current_chapter_number: 1, progress_percentage: 0, current_char_offset: 0, updated_at: null })
    }
    if (url.pathname.endsWith('/dictionary')) {
      lookups.push(request.postDataJSON())
      return json({ word: '초봉', title: '초봉', tag: '인물', fields: [{ label: '설명', value: '현재 회차에서 읽은 인물 설명' }] })
    }
    throw new Error(`Unexpected API request: ${request.method()} ${url.pathname}`)
  })
  return { context, page, lookups, saves }
}
async function setting(page, name) {
  await page.getByRole('button', { name: '읽기 설정', exact: true }).click()
  await page.getByRole('button', { name, exact: true }).click()
}
async function currentPage(page) {
  return page.locator('[data-reader-pages]').evaluate(outer => {
    const content = outer.lastElementChild
    const style = getComputedStyle(outer)
    const available = outer.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
    return { text: content.textContent, height: content.getBoundingClientRect().height, available }
  })
}
async function readAll(page, expected) {
  let collected = ''
  for (let i = 0; i < 100; i++) {
    const current = await currentPage(page)
    assert(current.height <= current.available + 1, `Page clipped: ${JSON.stringify(current)}`)
    collected += current.text
    if (collected === expected) break
    assert(expected.startsWith(collected), 'No text may repeat or disappear at page boundaries')
    await page.getByRole('button', { name: '다음 페이지', exact: true }).click()
  }
  assert.equal(collected, expected, 'Every character must remain accessible')
  await page.getByText('100%', { exact: true }).waitFor()
}
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }, { width: 844, height: 390 }]) {
    const { context, page, lookups, saves } = await setup(viewport)
    await page.goto(`${base}/novel/1/read/1`)
    await setting(page, '넘기기 방식 전환 (스크롤)')
    await page.locator('[data-reader-pages]').waitFor()
    assert((await currentPage(page)).text.length < paragraph.length)
    await page.locator('[data-reader-pages] > :last-child span.cursor-pointer').first().hover()
    await page.getByRole('dialog').getByText('현재 회차에서 읽은 인물 설명', { exact: true }).waitFor()
    assert.equal(lookups[0].word, '초봉')
    assert.equal(lookups[0].context_sentence, paragraph)
    await page.getByRole('dialog').getByRole('button', { name: '닫기', exact: true }).click()
    await page.mouse.move(0, 0)
    await readAll(page, paragraph)
    await page.getByRole('button', { name: '다음 회차', exact: true }).click()
    await page.getByRole('heading', { name: '2화 검증', exact: true }).waitFor()
    assert((await currentPage(page)).text.startsWith('두 번째 회차의 시작입니다.'))
    assert.equal(await page.getByText('다시 오신 걸 환영해요', { exact: true }).count(), 0)
    await setting(page, '확대')
    await setting(page, '확대')
    await setting(page, '줄간격')
    await setting(page, '폰트 (고딕)')
    await page.evaluate(() => document.fonts.ready)
    await readAll(page, second)
    // Reflow keeps the last passage in view and remains inside the viewport.
    await page.setViewportSize({ width: viewport.width === 390 ? 320 : viewport.width - 100, height: viewport.height })
    const resized = await currentPage(page)
    assert(resized.height <= resized.available + 1)
    assert(saves.some(save => save.current_chapter_number === 2))
    console.log(`PASS reader: ${viewport.width}x${viewport.height}, all text, tooltip, chapter transition, fonts, resize`)
    await context.close()
  }
  for (const width of [320, 390, 768, 1280]) {
    const { context, page } = await setup({ width, height: 844 })
    await page.goto(base)
    await page.getByRole('button', { name: '검색', exact: true }).click()
    const input = page.getByPlaceholder('제목, 작가로 검색')
    const bounds = await input.evaluate(el => {
      const r = el.parentElement.parentElement.getBoundingClientRect()
      return { left: r.left, right: r.right, viewport: innerWidth }
    })
    assert(bounds.left >= 0 && bounds.right <= bounds.viewport, JSON.stringify(bounds))
    await input.fill('채만식')
    await input.press('Enter')
    await page.getByRole('heading', { name: /채만식.*검색 결과.*1건/ }).waitFor()
    await page.getByRole('link', { name: '탁류 채만식', exact: true }).waitFor()
    await page.goto(`${base}/search?q=${encodeURIComponent('재의 계승자')}`)
    await page.getByRole('heading', { name: /검색 결과.*0건/ }).waitFor()
    assert.equal(await page.locator('h3', { hasText: '재의 계승자' }).count(), 0)
    await page.goto(`${base}/genre?g=${encodeURIComponent('미스터리')}`)
    await page.getByText(/미리보기용 예시/).waitFor()
    await page.goto(`${base}/ranking`)
    await page.getByRole('button', { name: '신작', exact: true }).click()
    await page.getByText(/미리보기용 예시/).waitFor()
    console.log(`PASS catalog: width ${width}, search geometry, real results, no sample results, genre/ranking navigation`)
    await context.close()
  }
  const { context, page } = await setup({ width: 390, height: 844 }, true)
  await page.goto(`${base}/search?q=test`)
  await page.getByRole('alert').getByText('작품 목록을 가져오지 못했어요.', { exact: true }).waitFor()
  assert.equal(await page.getByText('다른 제목이나 작가로 검색해보세요.', { exact: true }).count(), 0)
  await context.close()
  assert.deepEqual(errors, [], 'No browser runtime errors')
  console.log('PASS: API error distinguished from an empty search; no browser runtime errors. APIs were mocked.')
} finally { await browser.close() }
