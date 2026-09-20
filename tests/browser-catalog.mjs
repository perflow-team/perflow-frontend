// Local UI regression with deterministic API fixtures. No production writes.
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
const books = [
  { id: 2, title: '탁류', author: '채만식', views: 900, rating: 8.5, likes: 10, tags: ['인생하드모드'], genres: ['드라마'] },
  { id: 4, title: '동백꽃', author: '김유정', views: 700, rating: 9.4, likes: 50, tags: ['츤데레', '눈치제로남주'], genres: ['로맨스'] },
  { id: 5, title: '날개', author: '이상', views: 100, rating: 8.9, likes: 30, tags: ['의식의흐름'], genres: ['심리'] },
].map(book => ({ ...book, description: '검증용 소개글', cover_image_url: null, total_chapters: 1 }))
const errors = []
try {
  for (const width of [320, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    await context.addInitScript(() => localStorage.setItem('perflow-auth', JSON.stringify({ state: {
      accessToken: 'local-fixture-token', user: { id: 500, nickname: '독서테스터', email: 'reader@example.invalid' },
    }, version: 0 })))
    const page = await context.newPage()
    page.on('pageerror', e => errors.push(e.message))
    const requests = []
    let failRanking = false
    await page.route('**/api/**', route => {
      const url = new URL(route.request().url())
      if (url.origin === new URL(base).origin) return route.continue()
      const json = data => route.fulfill({ json: data, headers: { 'Access-Control-Allow-Origin': '*' } })
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
        'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': '*',
      } })
      if (url.pathname === '/api/genres') return json(['드라마', '로맨스', '심리'])
      const genre = url.searchParams.get('genre')
      const candidates = genre ? books.filter(b => b.genres.includes(genre)) : books
      if (url.pathname === '/api/novels') {
        requests.push(url.search)
        if (failRanking) return route.fulfill({ status: 503, json: {}, headers: { 'Access-Control-Allow-Origin': '*' } })
        return json(candidates)
      }
      if (url.pathname === '/api/novels/ranking') {
        requests.push(url.search)
        if (failRanking) return route.fulfill({ status: 503, json: {}, headers: { 'Access-Control-Allow-Origin': '*' } })
        return json(url.searchParams.get('sort') === 'new' ? [] : [...candidates].sort((a, b) => b[url.searchParams.get('sort') === 'popular' ? 'rating' : url.searchParams.get('sort')] - a[url.searchParams.get('sort') === 'popular' ? 'rating' : url.searchParams.get('sort')]))
      }
      if (url.pathname.endsWith('/chapters')) return json([{ id: 1, chapter_number: 1, title: '1화', is_free: true }])
      if (url.pathname.endsWith('/progress')) return json({ current_chapter_number: 1, current_char_offset: 0, progress_percentage: 0 })
      if (/\/api\/novels\/\d+$/.test(url.pathname)) return json(books.find(b => b.id === Number(url.pathname.split('/').at(-1))))
      return json([])
    })
    await page.goto(base)
    const views = page.getByRole('region', { name: '조회수 랭킹', exact: true })
    const ratings = page.getByRole('region', { name: '인기 랭킹', exact: true })
    await views.getByRole('heading', { name: '탁류', exact: true }).waitFor().catch(async error => {
      console.log({ requests, errors, body: await page.locator('body').innerText() })
      throw error
    })
    assert.equal(await views.getByRole('heading', { level: 3 }).first().innerText(), '탁류')
    assert.equal(await ratings.getByRole('heading', { level: 3 }).first().innerText(), '동백꽃')
    await page.getByRole('region', { name: '신작', exact: true }).getByText('신작으로 등록된 작품이 아직 없어요.').waitFor()
    assert(await page.getByText('#츤데레').count() > 0)
    await page.screenshot({ path: `/private/tmp/perflow-catalog-home-${width}.png`, fullPage: true })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page-level horizontal overflow')

    await page.getByRole('button', { name: '독서테스터님', exact: true }).click()
    const menu = page.getByRole('dialog', { name: '유저 프로필' })
    await menu.waitFor()
    assert.equal(new URL(page.url()).pathname, '/')
    const box = await menu.boundingBox()
    assert(box.x >= 0 && box.x + box.width <= width)
    await page.keyboard.press('Escape')
    await menu.waitFor({ state: 'hidden' })
    assert.equal(await page.getByRole('button', { name: '독서테스터님', exact: true }).evaluate(el => el === document.activeElement), true)
    await page.keyboard.press('Enter')
    await menu.waitFor()
    await menu.getByRole('link', { name: '마이페이지', exact: true }).click()
    await page.waitForURL('**/mypage')

    await page.goto(`${base}/ranking?sort=rating`)
    await page.getByRole('heading', { name: '동백꽃', exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { level: 3 }).first().innerText(), '동백꽃')
    await page.getByLabel('장르 선택', { exact: true }).selectOption('로맨스')
    await page.getByRole('heading', { name: '탁류', exact: true }).waitFor({ state: 'hidden' })
    await page.getByRole('heading', { name: '동백꽃', exact: true }).waitFor()
    assert(requests.some(query => new URLSearchParams(query).get('genre') === '로맨스'))
    await page.getByRole('button', { name: '신작', exact: true }).click()
    await page.getByText('신작으로 등록된 작품이 아직 없어요.').waitFor()

    await page.goto(`${base}/genre?g=${encodeURIComponent('로맨스')}`)
    await page.getByRole('heading', { name: '동백꽃', exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { name: '탁류', exact: true }).count(), 0)
    await page.getByRole('link').filter({ has: page.getByRole('heading', { name: '동백꽃', exact: true }) }).click()
    await page.getByText('#츤데레', { exact: true }).waitFor()

    failRanking = true
    await page.goto(`${base}/ranking?sort=views`)
    await page.getByText('랭킹을 불러오지 못했어요.').waitFor({ timeout: 20000 })
    failRanking = false
    await page.getByRole('button', { name: '다시 시도', exact: true }).click()
    await page.getByRole('heading', { name: '탁류', exact: true }).waitFor()
    console.log(`PASS ${width}px: real API contract, sort/filter/new empty state, profile keyboard/navigation, tags, retry, no overflow`)
    await context.close()
  }
  assert.deepEqual(errors, [])
} finally { await browser.close() }
