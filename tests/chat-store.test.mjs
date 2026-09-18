import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
const storage = new Map()
globalThis.localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}
const requests=[]
globalThis.__chatSend = args => new Promise((resolve,reject)=>requests.push({args,resolve,reject}))
let source=readFileSync(new URL('../src/features/ask-chatbot/model/useChatStore.ts',import.meta.url),'utf8')
source=source.replace("import { sendChatMessage } from '../api/chatApi'",'const sendChatMessage = globalThis.__chatSend')
source=source.replace("import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'",'const useReaderStore = {getState:()=>({progress:0.4})}')
source=source.replace("from 'zustand'",`from '${import.meta.resolve('zustand')}'`).replace("from 'zustand/middleware'",`from '${import.meta.resolve('zustand/middleware')}'`)
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}})
const {useChatStore:store,conversationKey:key}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('late replies, errors and loading stay with the originating book and account',async()=>{
 const a=store.getState().sendMessage({novelId:'A',episodeId:'1',userId:1,question:'A 질문'})
 const b=store.getState().sendMessage({novelId:'B',episodeId:'2',userId:1,question:'B 질문'})
 assert.equal(requests.length,2)
 await store.getState().sendMessage({novelId:'A',episodeId:'1',userId:1,question:'중복'})
 assert.equal(requests.length,2)
 assert.equal(store.getState().conversations[key('B',1)].messages[0].content,'B 질문')
 requests[1].resolve({reply:'B 답변',context_used:'B 본문'});await b
 assert.equal(store.getState().conversations[key('A',1)].isSending,true)
 requests[0].resolve({reply:'A 답변',context_used:'A 본문'});await a
 assert.deepEqual(store.getState().conversations[key('A',1)].messages.map(m=>m.content),['A 질문','A 답변'])
 assert.deepEqual(store.getState().conversations[key('B',1)].messages.map(m=>m.content),['B 질문','B 답변'])
 assert.equal(store.getState().conversations[key('A',2)],undefined)
 const error=store.getState().sendMessage({novelId:'C',episodeId:'1',userId:2,question:'오류 질문'})
 requests[2].reject(new Error('offline'));await error
 assert.equal(store.getState().conversations[key('C',2)].messages.at(-1).error,true)
 assert.equal(store.getState().conversations[key('B',1)].messages.length,2)
})
test('persisted conversations survive reload without restoring a stuck loading state',async()=>{
 const pending=store.getState().sendMessage({novelId:'D',episodeId:'1',userId:null,question:'대기중'})
 const saved=JSON.parse(storage.get('perflow-book-conversations'))
 assert.equal(saved.state.conversations[key('D',null)].isSending,false)
 assert.equal(saved.state.conversations[key('D',null)].messages[0].content,'대기중')
 assert.equal(saved.state.conversations[key('A',1)].messages.at(-1).content,'A 답변')
 requests[3].resolve({reply:'완료',context_used:''});await pending
})
test('unavailable browser storage does not stop sending or retaining the current conversation',async()=>{
 const original=localStorage.setItem
 localStorage.setItem=()=>{throw new Error('quota exceeded')}
 try{
  const sending=store.getState().sendMessage({novelId:'E',episodeId:'1',userId:null,question:'저장 공간 없음'})
  requests[4].resolve({reply:'메모리에 유지',context_used:''});await sending
  assert.equal(store.getState().conversations[key('E',null)].messages.at(-1).content,'메모리에 유지')
 }finally{localStorage.setItem=original}
})
