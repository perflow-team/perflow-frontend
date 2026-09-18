import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const base=process.env.BASE_URL??'http://127.0.0.1:4173'
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true})
const errors=[]
const content='초봉은 군산에서 갑신정변에 관한 생경한 이야기를 읽었다. 오늘은 맑다.\n'+('조용한 오후에 책장을 넘겼다.\n'.repeat(80))
const terms=[['초봉','CHARACTER','인물'],['군산','PLACE','장소'],['갑신정변','EVENT','사건'],['생경','WORD','']]
const targets=terms.map(([word,type])=>({word,type,start_offset:content.indexOf(word),end_offset:content.indexOf(word)+word.length,lookup_offset:content.indexOf(".")+1}))
const graph={nodes:[{id:1,name:'초봉'},{id:2,name:'정주사'},{id:3,name:'형보'},{id:4,name:'승재'},{id:5,name:'계봉'},{id:6,name:'미확인 인물'}],links:[
 {source:2,target:1,relation_type:'부녀',description:'정주사는 초봉의 아버지다.'},
 {source:1,target:5,relation_type:'자매',description:'초봉과 계봉은 자매다.'},
 {source:1,target:3,relation_type:'직장 동료',description:'초봉과 형보는 같은 직장에서 일한다.'},
 {source:3,target:4,relation_type:'상사와 부하',description:'형보는 승재의 상사다.'},
]}
async function setup(options={}){
 const context=await browser.newContext({viewport:{width:1280,height:900},...options})
 const page=await context.newPage();const lookups=[];let indexCalls=0;let releaseA;let holdA=false
 page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(url.origin===new URL(base).origin)return route.continue()
  const json=body=>route.fulfill({json:body,headers:{'Access-Control-Allow-Origin':'*'}})
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}})
  if(url.pathname.endsWith('/lookup-targets'))return json(++indexCalls===1?{status:'preparing',targets:[]}:{status:'completed',targets})
  if(url.pathname.endsWith('/chapters'))return json([1,2].map(n=>({id:n,chapter_number:n,title:`${n}화`,is_free:true})))
  const chapter=url.pathname.match(/\/novels\/(\d+)\/chapters\/(\d+)$/)
  if(chapter)return json({id:Number(chapter[2]),chapter_number:Number(chapter[2]),title:`작품 ${chapter[1]} · ${chapter[2]}화`,content,entities:[]})
  if(url.pathname.endsWith('/progress'))return json({current_chapter_number:1,progress_percentage:0,updated_at:null})
  if(url.pathname.endsWith('/dictionary')){
   const body=req.postDataJSON();lookups.push(body)
   return json({word:body.word,title:body.word,tag:terms.find(t=>t[0]===body.word)?.[2]??'인물',fields:[{label:'설명',value:`${body.word}의 자세한 설명입니다.`}]})
  }
  if(url.pathname.endsWith('/characters/relations'))return json(graph)
  if(url.pathname.endsWith('/dictionary/terms'))return json(terms.map(([name,type],id)=>({id,name,type})))
  if(url.pathname.endsWith('/message')){
   const book=url.pathname.match(/\/chat\/(\d+)/)[1]
   if(book==='1'&&holdA)await new Promise(resolve=>{releaseA=resolve})
   return json({reply:`작품 ${book}의 답변`,context_used:`작품 ${book} 본문`})
  }
  throw new Error('Unexpected request '+url.pathname)
 })
 const navigate=async(book,episode=1)=>{
  await page.evaluate(path=>{history.pushState({},'',path);window.dispatchEvent(new PopStateEvent('popstate'))},`/novel/${book}/read/${episode}`)
  await page.getByRole('heading',{name:`작품 ${book} · ${episode}화`,exact:true}).waitFor()
 }
 return {context,page,lookups,navigate,hold:()=>{holdA=true},release:()=>releaseA?.()}
}
async function closeCard(page){await page.getByRole('dialog').getByRole('button',{name:'닫기',exact:true}).click()}
async function ready(page){await page.goto(`${base}/novel/1/read/1`);await page.locator('[data-lookup-word="군산"]').first().waitFor()}
async function openPanel(page,name='챗봇'){
 await page.getByRole('button',{name:'챗봇 토글',exact:true}).click()
 if(name!=='챗봇')await page.getByRole('button',{name,exact:true}).click()
}
try{
 const desktop=await setup();const {page,lookups,context,navigate}=desktop
 await ready(page)
 const word=page.locator('[data-lookup-word="군산"]').first()
 assert.equal(await page.locator('[data-lookup-word="오늘"]').count(),0,'Unindexed ordinary words must not claim to have explanations')
 for(const [term] of terms){
  const target=page.locator(`[data-lookup-word="${term}"]`).first()
  await page.mouse.move(0,0);await page.waitForTimeout(250)
  const background=await target.evaluate(el=>getComputedStyle(el).backgroundColor)
  const calls=lookups.length
  await target.hover();await page.waitForTimeout(1200)
  assert.notEqual(await target.evaluate(el=>getComputedStyle(el).backgroundColor),background,`${term}: hover must highlight`)
  assert.equal(lookups.length,calls,`${term}: hover must not request a definition`)
  assert.equal(await page.getByRole('dialog').count(),0,`${term}: hover must not open a card`)
  await target.click()
  await page.getByRole('dialog').getByText(`${term}의 자세한 설명입니다.`,{exact:true}).waitFor()
  assert.equal(lookups.length,calls+1,'A click must make exactly one lookup')
  assert.equal(lookups.at(-1).word,term)
  assert.equal(lookups.at(-1).current_char_offset, content.indexOf('.')+1, 'The clicked sentence cutoff must reach the API')
  assert(lookups.at(-1).context_sentence.includes('초봉은 군산'))
  await closeCard(page)
  await target.hover();await page.waitForTimeout(1200)
  assert.equal(await page.getByRole('dialog').count(),0,'Returning to a word must not reopen its card')
  assert.equal(lookups.length,calls+1)
 }
 for(const key of ['Enter','Space']){
  await word.focus();await page.keyboard.press(key)
  await page.getByRole('dialog').waitFor();await closeCard(page)
 }
 console.log('PASS: all four types, sustained/repeated hover only highlights, click opens one card, Enter/Space activation')
 await openPanel(page)
 const tab=page.getByRole('button',{name:'관계도',exact:true})
 const tabBefore=await tab.evaluate(el=>getComputedStyle(el).backgroundColor)
 await tab.hover();await page.waitForTimeout(250)
 assert.equal(await tab.evaluate(el=>getComputedStyle(el).cursor),'pointer')
 assert.notEqual(await tab.evaluate(el=>getComputedStyle(el).backgroundColor),tabBefore)
 desktop.hold()
 await page.getByPlaceholder('궁금한 걸 물어보세요').fill('첫 작품 질문')
 await page.getByRole('button',{name:'전송',exact:true}).click()
 await page.getByText('첫 작품 질문',{exact:true}).waitFor()
 await navigate(2)
 assert.equal(await page.getByText('첫 작품 질문',{exact:true}).count(),0)
 await page.getByPlaceholder('궁금한 걸 물어보세요').fill('두 번째 작품 질문')
 await page.getByRole('button',{name:'전송',exact:true}).click()
 await page.getByText('작품 2의 답변',{exact:true}).waitFor()
 desktop.release();await page.waitForTimeout(200)
 assert.equal(await page.getByText('작품 1의 답변',{exact:true}).count(),0)
 await navigate(1);await page.getByText('작품 1의 답변',{exact:true}).waitFor()
 assert.equal(await page.getByText('두 번째 작품 질문',{exact:true}).count(),0)
 await page.reload();await openPanel(page);await page.getByText('작품 1의 답변',{exact:true}).waitFor()
 console.log('PASS: per-book conversation, late reply isolation, another book remains usable, reload persistence')
 await page.getByRole('button',{name:'관계도',exact:true}).click()
 await page.getByRole('heading',{name:'관계별 인물 그룹',exact:true}).waitFor()
 assert.equal(await page.locator('[data-relation-group="family"]').count(),1)
 await page.locator('[data-relation-group="family"]').getByText('기준:',{exact:false}).waitFor()
 await page.locator('[data-relation-group="family"] summary').filter({hasText:'부녀'}).click()
 await page.getByText('정주사는 초봉의 아버지다.',{exact:true}).waitFor()
 await page.getByRole('button',{name:'상하·사제',exact:true}).click()
 assert.equal(await page.locator('[data-relation-group="family"]').count(),0)
 assert.equal(await page.locator('[data-relation-group="hierarchy"]').count(),1)
 await page.getByRole('button',{name:'전체',exact:true}).click()
 await page.screenshot({path:'/private/tmp/perflow-assist-desktop.png'})
 await context.close()
 console.log('PASS: criteria, family/work/hierarchy groups, relationship evidence and filtering')
 for(const viewport of [{width:390,height:844},{width:820,height:1180}]){
  const mobile=await setup({viewport,isMobile:true,hasTouch:true});const p=mobile.page
  await ready(p)
  // Holding a touch must never open a card automatically.
  const client=await mobile.context.newCDPSession(p)
  const box=await p.locator('[data-lookup-word="군산"]').first().boundingBox()
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]})
  await p.waitForTimeout(1200)
  assert.equal(await p.getByRole('dialog').count(),0,'Long press must not activate a definition')
  assert.equal(mobile.lookups.length,0)
  await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]})
  await openPanel(p,'관계도')
  await p.getByRole('heading',{name:'관계별 인물 그룹',exact:true}).waitFor()
  const bounds=await p.locator('aside').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=viewport.width)
  await p.screenshot({path:`/private/tmp/perflow-assist-${viewport.width}.png`})
  await mobile.context.close()
  console.log(`PASS: ${viewport.width}px no automatic long-press card, relation layout`)
 }
 assert.deepEqual(errors,[])
 console.log('PASS: no browser errors; API responses mocked, native Chrome touch events used')
}finally{await browser.close()}
