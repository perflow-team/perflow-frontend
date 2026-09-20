import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

async function load(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { createContinuationGesture } = await load('../src/features/switch-reader-mode/lib/continuationGesture.ts')
const { throttle } = await load('../src/shared/lib/throttle.ts')

test('reaching the end and the remaining wheel momentum do not advance', () => {
  const g = createContinuationGesture(0)
  g.updateEnd(false, 0)
  assert.equal(g.wheel(200, 500), false)
  g.updateEnd(true, 510)
  for (let time = 520; time < 1800; time += 30) assert.equal(g.wheel(90, time), false)
  assert.equal(g.wheel(90, 2100), true)
  assert.equal(g.wheel(90, 2500), false, 'one transition per mounted chapter')
})

test('short chapters never skip on mount or from continuous incoming momentum', () => {
  const g = createContinuationGesture(0)
  g.updateEnd(true, 0)
  for (let time = 10; time < 1000; time += 20) assert.equal(g.wheel(100, time), false)
  assert.equal(g.wheel(20, 1300), false)
  assert.equal(g.wheel(20, 1320), false)
  assert.equal(g.wheel(40, 1340), true)
})

test('upward movement, leaving the bottom and resize reset the gesture', () => {
  const g = createContinuationGesture(0)
  g.updateEnd(true, 0)
  assert.equal(g.wheel(50, 600), false)
  assert.equal(g.wheel(-10, 610), false)
  assert.equal(g.wheel(100, 620), false)
  g.updateEnd(false, 700)
  assert.equal(g.wheel(100, 1000), false)
  g.updateEnd(true, 1200)
  assert.equal(g.wheel(100, 1250), false)
  assert.equal(g.wheel(100, 1700), true)
})

test('touch must begin at the settled end; horizontal, downward and cancelled swipes do not advance', () => {
  const g = createContinuationGesture(0)
  g.touchStart(500)
  g.updateEnd(true, 600)
  assert.equal(g.touchEnd(100, 0), false)
  g.touchStart(1100)
  assert.equal(g.touchEnd(-100, 0), false)
  g.touchStart(1200)
  assert.equal(g.touchEnd(100, 150), false)
  g.touchStart(1300)
  g.cancelTouch()
  assert.equal(g.touchEnd(100, 0), false)
  g.touchStart(1400)
  assert.equal(g.touchEnd(80, 5), true)
  assert.equal(g.touchEnd(80, 0), false)
})

test('keyboard repeats cannot skip and failed loads can be retried deliberately', () => {
  const g = createContinuationGesture(0)
  g.updateEnd(true, 0)
  assert.equal(g.key(600, true), false)
  assert.equal(g.key(600, false), true)
  g.retry(800)
  g.updateEnd(true, 800)
  assert.equal(g.wheel(100, 900), false)
  assert.equal(g.wheel(100, 1300), true)
})

test('leaving a chapter flushes its latest pending progress exactly once', () => {
  const calls = []
  const save = throttle((chapter, progress) => calls.push({ chapter, progress }), 10000)
  save(1, 0.9)
  save(1, 0.99)
  save(1, 1)
  save.flush()
  save.flush()
  save.cancel()
  assert.deepEqual(calls, [{ chapter: 1, progress: 0.9 }, { chapter: 1, progress: 1 }])
})
