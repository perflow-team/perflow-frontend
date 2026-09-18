import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
const source = readFileSync(new URL('../src/features/view-character-relations/lib/groupRelations.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { groupRelations } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const nodes = [1,2,3,4,5,6,7].map(id => ({id, name:`인물${id}`}))
const link = (source,target,relation_type,description='') => ({source,target,relation_type,description})

test('unrelated families remain separate, with multi-category members allowed', () => {
  const result = groupRelations({nodes, links:[link(1,2,'부녀'),link(2,3,'자매'),link(4,5,'부부'),link(2,6,'직장 동료')]})
  assert.deepEqual(result.groups.filter(g=>g.category==='family').map(g=>g.nodes.map(n=>n.id)), [[1,2,3],[4,5]])
  assert.deepEqual(result.groups.find(g=>g.category==='work').nodes.map(n=>n.id),[2,6])
  assert.deepEqual(result.ungrouped.map(n=>n.id),[7])
})
test('hierarchy is explicit, and unknown relationship types are not guessed from descriptions', () => {
  const result = groupRelations({nodes, links:[link(1,2,'상사'),link(3,4,'스승과 제자'),link(5,6,'미확인','가족인지는 아직 모른다.'),link(6,999,'가족')]})
  assert.equal(result.groups.filter(g=>g.category==='hierarchy').length,2)
  assert.equal(result.groups.filter(g=>g.category==='family').length,0)
  assert.equal(result.groups.find(g=>g.category==='other').links[0].description,'가족인지는 아직 모른다.')
  assert.deepEqual(result.ungrouped.map(n=>n.id),[7])
})
