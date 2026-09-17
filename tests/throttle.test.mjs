import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import ts from 'typescript'

const source = readFileSync(new URL('../src/shared/lib/throttle.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { throttle } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('leaving a chapter cancels its pending progress save', async () => {
  const saved = []
  const save = throttle((chapter, progress) => saved.push({ chapter, progress }), 30)
  save(1, 0.1)
  save(1, 0.2)
  save.cancel()
  await delay(50)
  assert.deepEqual(saved, [{ chapter: 1, progress: 0.1 }])
})

test('throttle retains the latest complete argument set', async () => {
  const saved = []
  const save = throttle((chapter, offset) => saved.push({ chapter, offset }), 30)
  save(1, 10)
  save(1, 20)
  save(2, 30)
  await delay(50)
  assert.deepEqual(saved, [{ chapter: 1, offset: 10 }, { chapter: 2, offset: 30 }])
})
