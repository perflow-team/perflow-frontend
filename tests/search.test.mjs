import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
const source=readFileSync(new URL('../src/features/search-novels/lib/filterNovels.ts',import.meta.url),'utf8')
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}})
const {filterNovels}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
test('search matches original or adapted title and author despite whitespace',()=>{
 const novels=[{title:'초-럭키한 하루, 럭키가 아니었다?',original_title:'운수 좋은 날',author:'현진건'},{title:'다른 이야기',original_title:null,author:'다른 작가'}]
 for(const q of ['운수 좋은 날','운수좋은날',' 운수  좋은\t날 ','초-럭키한','현진건'])assert.deepEqual(filterNovels(novels,q),[novels[0]])
 assert.deepEqual(filterNovels(novels,'   '),[])
 assert.deepEqual(filterNovels(novels,'%'),[])
})
