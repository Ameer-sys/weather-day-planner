const {createRequire}=require('node:module');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const req=process.env.PLAYWRIGHT_MODULES?createRequire(process.env.PLAYWRIGHT_MODULES+'/../package.json'):require;
const {chromium}=req('playwright');
(async()=>{
 const {createServer}=await import('../backend.mjs');
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({channel:'msedge',headless:true,chromiumSandbox:true});
 const errors=[],checks=[];fs.mkdirSync('artifacts',{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},timezoneId:'America/Los_Angeles'});
  page.on('pageerror',e=>errors.push(e.message));
  const live=await (await page.request.get(base+'/api/forecast?lat=43.2557&lon=-79.8711')).json();
  assert.ok(live.forecast?.hourly?.time?.includes('2026-10-29T10:00'));
  assert.equal(live.forecast.timezone,'America/Toronto');
  fs.writeFileSync('artifacts/hamilton-verified.json',JSON.stringify(live,null,2));
  const search=await (await page.request.get(base+'/api/search?q=Hamilton')).json();
  assert.ok(search.results.some(x=>x.admin1==='Ontario'));checks.push('Real Hamilton forecast, October 29 and geocoding');
  await page.goto(base);await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Trip planner',exact:true}).click();
  assert.equal(await page.locator('#plan-date').inputValue(),'2026-10-29');
  assert.match(await page.locator('.micro-note').first().innerText(),/America\/Toronto/);
  await page.locator('#plan-date').fill('2027-01-01');await page.locator('#plan-date').dispatchEvent('change');
  assert.equal(await page.locator('#plan-date').inputValue(),'2027-01-01');
  await page.getByText('We need a forecast for your plan.',{exact:true}).waitFor();checks.push('Unavailable date retained and no recommendation');
  await page.locator('#plan-date').fill('2026-10-29');await page.locator('#plan-date').dispatchEvent('change');
  await page.locator('#plan-activity').selectOption('Cycling');
  await page.locator('#plan-start').selectOption('11');await page.locator('#plan-end').selectOption('17');
  await page.getByRole('button',{name:'Save weather watch',exact:true}).click();
  await page.getByRole('button',{name:'My watchlist',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Open plan',exact:true}).count(),2);
  await page.reload();await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  await page.getByRole('button',{name:'My watchlist',exact:true}).click();
  await page.getByRole('button',{name:'Open plan',exact:true}).first().click();
  await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  assert.equal(await page.locator('#plan-activity').inputValue(),'Cycling');assert.equal(await page.locator('#plan-start').inputValue(),'11');
  await page.getByRole('button',{name:'My watchlist',exact:true}).click();await page.getByRole('button',{name:'Remove',exact:true}).first().click();
  assert.equal(await page.getByRole('button',{name:'Open plan',exact:true}).count(),1);checks.push('Watch save, persistence, reopen, remove, activity and hour range');
  await page.getByRole('button',{name:'Open plan',exact:true}).click();await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.getByRole('button',{name:'Amount (mm)',exact:true}).click();
  assert.match(await page.locator('.main-chart').getAttribute('aria-label'),/millimetres/);
  await page.locator('.chart-hit').nth(10).focus();assert.equal(await page.locator('#chartFloating').isVisible(),true);
  await page.locator('summary').click();assert.ok(await page.locator('.hourly-data tbody tr').count()>=24);await page.locator('summary').click();checks.push('Amount chart, keyboard inspector and hourly data table');
  await page.getByRole('button',{name:/Ask ATMOS Intelligence/}).click();await page.getByText('Your forecast guidance is ready above.',{exact:true}).waitFor();assert.doesNotMatch(await page.locator('.advisor-panel').innerText(),/OpenAI|API key|rule-based|backend/i);assert.equal(await page.locator('.guidance-summary').count(),1);assert.equal(await page.locator('.advisor-panel .guidance-time').count(),1);checks.push('ATMOS guidance remains structured and jargon-free without a key');
  await page.getByRole('button',{name:'Probability',exact:true}).click();
  await page.locator('.notifier').waitFor({state:'hidden'});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [name,width,height] of [['desktop',1440,1100],['tablet',768,1100],['mobile',390,844]]){
   await page.setViewportSize({width,height});await page.getByRole('button',{name:'Overview',exact:true}).click();await page.waitForTimeout(600);
   await page.screenshot({path:`artifacts/${name}.png`,fullPage:true});
   await page.locator('.advisor-panel').screenshot({path:`artifacts/intelligence-${name}.png`});
   await page.screenshot({path:`artifacts/${name}-viewport.png`});
   for(const view of ['Overview','Forecast analysis','Trip planner','My watchlist','Alerts','Settings']){
    await page.getByRole('button',{name:view,exact:true}).click();
    const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    assert.ok(sizes.scroll<=sizes.width,`${name} ${view} overflows: ${JSON.stringify(sizes)}`);
   }
  }
  checks.push('All six pages at 1440, 768 and 390px without document overflow');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('combobox',{name:'Temperature units',exact:true}).selectOption('F');
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  assert.match(await page.locator('.metric-bottom').first().innerText(),/F/);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('combobox',{name:'Temperature units',exact:true}).selectOption('C');
  await page.getByRole('button',{name:'On · turn off',exact:true}).click();
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  assert.equal(await page.locator('.shell').evaluate(el=>getComputedStyle(el.querySelector('.plasma-cloud')).animationName),'none');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Off · turn on',exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  assert.equal(await page.locator('.plasma-cloud').evaluate(el=>getComputedStyle(el).animationName),'none');
  checks.push('Temperature units, motion toggle and OS reduced-motion');
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.route('**/api/forecast?*',r=>r.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'Weather provider temporarily unavailable'})}));
  await page.getByRole('button',{name:'Refresh data',exact:true}).click();
  await page.getByText('DATA STALE',{exact:true}).waitFor();assert.match(await page.locator('.advisor-box').innerText(),/Refresh the forecast/);
  assert.equal(await page.getByRole('button',{name:/Ask ATMOS Intelligence/}).isDisabled(),true);
  await page.screenshot({path:'artifacts/mobile-stale.png',fullPage:true});
  await page.reload();await page.getByText('OFFLINE',{exact:true}).waitFor();assert.match(await page.locator('.metric-val').first().innerText(),/—/);checks.push('Refresh failure retains labelled stale data; initial failure stays empty');
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Show demo view',exact:true}).click();
  await page.getByText('DEMO DATA',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Return to live data',exact:true}).click();await page.getByText('OFFLINE',{exact:true}).waitFor();checks.push('Demo remains explicit and does not persist into live mode');
  await page.unroute('**/api/forecast?*');
  const incomplete=structuredClone(live);incomplete.forecast.hourly.precipitation_probability.fill(null);
  await page.route('**/api/forecast?*',r=>r.fulfill({json:incomplete}));await page.reload();await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  assert.match(await page.locator('.metric-val').nth(1).innerText(),/—/);assert.match(await page.locator('.advisor-box').innerText(),/unavailable/);checks.push('Null provider measurements remain unavailable');
  await page.unroute('**/api/forecast?*');
  // Test-only response fixtures exercise a slow old request and monitoring another location.
  await page.evaluate(()=>localStorage.setItem('atmos.watches',JSON.stringify([{id:'fixture-watch',place:'Ottawa test fixture',date:'2026-10-29',activity:'Picnic',start:10,end:18,lat:45.42,lon:-75.7}])));
  let otherRequests=0;
  await page.route('**/api/forecast?*',async route=>{
   const data=structuredClone(live);
   if(route.request().url().includes('lat=45.42')){otherRequests++;data.forecast.hourly.precipitation_probability.fill(otherRequests===1?10:70);data.forecast.hourly.wind_gusts_10m.fill(15);data.forecast.hourly.wind_speed_10m.fill(10);data.forecast.hourly.temperature_2m.fill(15);data.forecast.hourly.weather_code.fill(0);data.forecast.hourly.precipitation.fill(0);}
   await route.fulfill({json:data});
  });
  await page.reload();await page.getByText('DATA CONNECTED',{exact:true}).waitFor();
  await page.waitForFunction(()=>document.querySelector('.watch-table')?.textContent.includes('GOOD TO GO'));
  await page.getByRole('button',{name:'Refresh data',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.watch-table')?.textContent.includes('USE CAUTION'));
  await page.getByRole('button',{name:'Alerts',exact:true}).click();assert.match(await page.locator('.alert-list').innerText(),/Ottawa test fixture.*10% to 70%/);checks.push('Every saved location is polled and forecast changes create alerts');
  await page.unroute('**/api/forecast?*');
  await page.route('**/api/search?*',r=>r.fulfill({json:{results:[{name:'Tokyo test fixture',latitude:35.68,longitude:139.69,timezone:'Asia/Tokyo'}]}}));
  await page.route('**/api/forecast?*',async route=>{
   const data=structuredClone(live);if(route.request().url().includes('lat=35.68'))data.forecast.timezone='Asia/Tokyo';else await new Promise(r=>setTimeout(r,1200));
   await route.fulfill({json:data}).catch(()=>{});
  });
  await page.getByRole('button',{name:'Overview',exact:true}).click();await page.getByRole('button',{name:'Refresh data',exact:true}).click();
  await page.getByRole('textbox',{name:'Search city',exact:true}).fill('Tokyo');await page.getByRole('button',{name:/Tokyo test fixture/}).click();
  await page.getByText('DATA CONNECTED',{exact:true}).waitFor();await page.waitForTimeout(1500);
  assert.match(await page.locator('.hero-city').innerText(),/Tokyo test fixture/);assert.match(await page.locator('.footer-row').innerText(),/JST|GMT\+9/);checks.push('Changing cities cancels old requests and uses the new location timezone');
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/browser-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
