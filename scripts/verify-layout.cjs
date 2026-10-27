const {createRequire}=require('node:module');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const req=process.env.PLAYWRIGHT_MODULES?createRequire(process.env.PLAYWRIGHT_MODULES+'/../package.json'):require;
const {chromium}=req('playwright');
(async()=>{
 const {createServer}=await import('../backend.mjs');
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true,chromiumSandbox:true});
 const results=[],errors=[];fs.mkdirSync('artifacts/layout',{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:3440,height:1440}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [3440,2560,1920,1440,768,390]){
   await page.setViewportSize({width,height:width>1920?1440:width>640?1080:844});
   for(const view of ['Overview','Forecast analysis','Trip planner','My watchlist','Alerts','Settings']){
    await page.getByRole('button',{name:view,exact:true}).click();
    const metrics=await page.evaluate(()=>{
     const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};};
     const chart=document.querySelector('.main-chart'),m=chart?.getScreenCTM();
     return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,shell:box('.shell'),sidebar:box('.sidebar'),main:box('.main'),padding:parseFloat(getComputedStyle(document.querySelector('.content')).paddingRight),chart:chart?box('.main-chart'):null,chartPanel:chart?box('.chart-panel'):null,chartScale:m?{x:m.a,y:m.d}:null};
    });
    if(view==='Overview')await page.screenshot({path:`artifacts/layout/overview-${width}.png`,fullPage:true});
    assert.ok(Math.abs(metrics.shell.width-width)<1,`${width} ${view}: shell uses ${metrics.shell.width}px`);
    assert.equal(metrics.sidebar.left,0,`${width} ${view}: sidebar left edge`);
    assert.equal(metrics.main.right,width,`${width} ${view}: main right edge`);
    assert.ok(metrics.scroll<=width,`${width} ${view}: horizontal overflow`);
    if(width>=1440)assert.ok(metrics.padding>=24&&metrics.padding<=32,`${width}: content padding ${metrics.padding}`);
    if(metrics.chartScale){
     assert.ok(Math.abs(metrics.chartScale.x-metrics.chartScale.y)<.001,'Chart is distorted');
     assert.ok(metrics.chart.left>=metrics.chartPanel.left&&metrics.chart.right<=metrics.chartPanel.right,`${width} ${view}: chart escapes its card`);
    }
    results.push({width,view,...metrics});
   }
  }
  await page.setViewportSize({width:3440,height:1440});
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.route('**/api/forecast?*',r=>r.fulfill({status:502,json:{error:'Test outage'}}));
  await page.getByRole('button',{name:'Refresh data',exact:true}).click();
  await page.getByText('DATA STALE',{exact:true}).waitFor();
  const cards=await page.locator('.content-overview .panel').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
  for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
   const a=cards[i],b=cards[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,'Cards overlap when the error banner appears');
  }
  await page.screenshot({path:'artifacts/layout/ultrawide-stale.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.notEqual(await page.locator('.plasma-cloud').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/layout/results.json',JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({viewports:6,pagesPerViewport:6,checks:results.length,errors}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
