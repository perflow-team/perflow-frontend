// Read-only dictionary verification against the real local API + configured DB.
// Start the frontend/backend and run prepare_dictionary.py first.
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const api = process.env.API_URL ?? 'http://127.0.0.1:8000'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
const errors = [], requests = [], timings = []
const failedRequests = []
page.on('pageerror', error => errors.push(error.message))
page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure()?.errorText }))
page.on('request', req => { if (new URL(req.url()).pathname.endsWith('/dictionary')) requests.push(req.postDataJSON()) })
// Preserve actual users' reading progress. No novel/dictionary API is mocked.
await page.route(url => url.origin === new URL(api).origin && /\/api\/novels\/\d+\/progress$/.test(url.pathname), route => route.fulfill({ json: { current_chapter_number: 1, progress_percentage: 0, current_char_offset: 0, updated_at: null }, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } }))
try {
  const targets = await (await context.request.get(`${api}/api/novels/2/chapters/1/lookup-targets`)).json()
  assert.equal(targets.status, 'completed')
  await page.goto(`${base}/novel/2/read/1`)
  for (const word of ['군산', '정주사', '미두']) {
    const mark = targets.targets.find(t => t.word === word)
    assert(mark, `Prepared ${word} must exist`)
    const element = page.locator(`[data-lookup-word="${word}"]`).first()
    await element.scrollIntoViewIfNeeded()
    const before = requests.length
    await element.hover()
    await page.waitForTimeout(250)
    assert.equal(requests.length, before)
    const responsePromise = page.waitForResponse(r => new URL(r.url()).pathname.endsWith('/dictionary') && r.request().method() === 'POST')
    const start = performance.now()
    await element.click()
    const response = await responsePromise
    const data = await response.json()
    assert.equal(data.source, 'precomputed')
    assert.equal(requests.at(-1).current_char_offset, mark.lookup_offset)
    await page.getByRole('dialog').getByText(data.fields[0].value, { exact: true }).waitFor()
    timings.push({ word, click_to_display_ms: Math.round(performance.now() - start), fields: data.fields.length })
    await page.getByRole('dialog').getByRole('button', { name: '닫기', exact: true }).click()
    // The card cannot be exposed before its first sentence's cutoff.
    const blocked = await (await context.request.post(`${api}/api/ai/novels/2/dictionary`, { data: { word, current_chapter_number: 1, current_char_offset: data.available_after_offset - 1 } })).json()
    assert.equal(blocked.source, 'unavailable')
  }
  // A known late revelation in the test novel must not leak into chapter one.
  const first = await (await context.request.post(`${api}/api/ai/novels/1/dictionary`, { data: { word: '김철수', current_chapter_number: 1, current_char_offset: 1000 } })).json()
  assert.equal(first.source, 'precomputed')
  assert(!JSON.stringify(first).includes('마왕'))
  const later = await (await context.request.post(`${api}/api/ai/novels/1/dictionary`, { data: { word: '김철수', current_chapter_number: 50, current_char_offset: 1000 } })).json()
  assert.equal(later.source, 'precomputed')
  assert(JSON.stringify(later).includes('마왕'))
  await page.getByRole('button', { name: '챗봇 토글', exact: true }).click()
  await page.getByRole('button', { name: '용어사전', exact: true }).click()
  await page.getByPlaceholder('용어 검색').waitFor()
  const savedTerm = page.locator('aside').getByRole('button', { name: /^군산/ })
  await savedTerm.waitFor()
  await savedTerm.click()
  await page.getByRole('dialog').locator('p').first().waitFor()
  await page.screenshot({ path: '/private/tmp/perflow-precomputed-reader.png' })
  assert.deepEqual(errors, [])
  const report = { status: 'passed', dictionary_api: 'real local code + configured PostgreSQL', progress_api: 'mocked to preserve user data', timings, spoiler_checks: ['current sentence cutoff', 'chapter 1 hides chapter 50 reveal'], errors }
  await writeFile('/private/tmp/perflow-precomputed-browser.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  await page.screenshot({ path: '/private/tmp/perflow-precomputed-failure.png' })
  console.log(JSON.stringify({ errors, failedRequests, page_text: (await page.locator('body').innerText()).slice(0, 500) }))
  throw error
} finally { await browser.close() }
