import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../backend.mjs';
async function withServer(options,run){
 const server=createServer(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{await run(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(r=>server.close(r));}
}
test('public assets and HEAD work; private files are never published',()=>withServer({},async base=>{
 for(const file of ['/','/app.js','/weather.js','/guidance.js','/styles.css','/favicon.svg'])assert.equal((await fetch(base+file)).status,200,file);
 for(const file of ['/server.mjs','/.env','/.env.local','/.git/config','/.git%5cconfig','/package.json','/test/server.test.mjs','/CODEX_HANDOFF.md'])assert.ok([403,404].includes((await fetch(base+file)).status),file);
 const response=await fetch(base,{method:'HEAD'});assert.equal(await response.text(),'');assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
}));
test('coordinates, exact routes and methods are validated before fetching',()=>withServer({fetchImpl:()=>{throw Error('must not fetch')}},async base=>{
 for(const q of ['lat=900&lon=2','lat=&lon=2','lat=NaN&lon=2','lat=1','lat=1&lon=181'])assert.equal((await fetch(base+'/api/forecast?'+q)).status,400);
 assert.equal((await fetch(base+'/api/forecast-extra')).status,404);
 assert.equal((await fetch(base+'/api/forecast',{method:'POST'})).status,405);
}));
test('upstream failures return useful errors without leaked internals',async()=>{
 for(const fetchImpl of [async()=>new Response('',{status:429}),async()=>{throw Error('private credential detail')}])await withServer({fetchImpl},async base=>{
  const r=await fetch(base+'/api/forecast?lat=43&lon=-79');assert.equal(r.status,502);assert.doesNotMatch(await r.text(),/private credential/);
 });
});
test('cache preserves original fetch timestamp and expires',async()=>{
 let time=1000000,calls=0;
 const forecast={timezone:'America/Toronto',hourly:{time:['2026-10-29T10:00'],precipitation_probability:[0],precipitation:[0],temperature_2m:[10],wind_speed_10m:[10],wind_gusts_10m:[15],weather_code:[0]},daily:{time:['2026-10-29']}};
 await withServer({now:()=>time,fetchImpl:async()=>{calls++;return Response.json(forecast)}},async base=>{
  const url=base+'/api/forecast?lat=43&lon=-79',a=await (await fetch(url)).json();time+=60000;
  const b=await (await fetch(url)).json();assert.equal(b.fetchedAt,a.fetchedAt);assert.equal(b.cached,true);assert.equal(calls,1);
  time+=300000;const c=await (await fetch(url)).json();assert.notEqual(c.fetchedAt,a.fetchedAt);assert.equal(calls,2);
 });
});
test('AI is optional and disabled for anonymous hosted deployments',async()=>{
 for(const env of [{},{VERCEL:'1',OPENAI_API_KEY:'test-only'}])await withServer({env},async base=>assert.equal((await fetch(base+'/api/advice',{method:'POST'})).status,503));
});
test('AI rejects cross-origin requests and invalid numeric context',()=>withServer({env:{OPENAI_API_KEY:'test-only'}},async base=>{
 assert.equal((await fetch(base+'/api/advice',{method:'POST',headers:{origin:'https://other.example'}})).status,403);
 const response=await fetch(base+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({place:'Hamilton',date:'2026-10-29',activity:'Hiking',metrics:{}})});assert.equal(response.status,400);
}));

const context={place:'Hamilton',date:'2026-10-29',activity:'Hiking',timeWindow:'10 AM–6 PM',verdict:'USE CAUTION',metrics:{rainProbabilityPeak:18,averageRainProbability:9,expectedRainMm:0,maximumWindGustKmh:51,thunderstormForecast:false}};
test('optional AI sends only approved context server-side and enforces its quota',async()=>{
 let calls=0;
 await withServer({env:{OPENAI_API_KEY:'test-only-secret'},fetchImpl:async(url,options)=>{
  calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.authorization,'Bearer test-only-secret');
  const body=JSON.parse(options.body);assert.equal(body.store,false);assert.doesNotMatch(body.input,/unexpected/);
  return Response.json({output:[{content:[{type:'output_text',text:'Consider wind exposure.'}]}]});
 }},async base=>{
  for(let i=0;i<12;i++){const r=await fetch(base+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...context,metrics:{...context.metrics,unexpected:'injected field'}})});assert.equal(r.status,200);assert.deepEqual(await r.json(),{advice:'Consider wind exposure.'});}
  assert.equal((await fetch(base+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(context)})).status,429);assert.equal(calls,12);
 });
});
test('AI rejects oversized and malformed bodies without a paid request',()=>withServer({env:{OPENAI_API_KEY:'test-only'},fetchImpl:()=>{throw Error('must not fetch')}},async base=>{
 for(const [body,status] of [['{',400],['x'.repeat(12001),413]])assert.equal((await fetch(base+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body})).status,status);
}));
test('AI provider errors do not disclose credentials or provider internals',()=>withServer({env:{OPENAI_API_KEY:'test-only'},fetchImpl:async()=>Response.json({error:{message:'private upstream detail'}},{status:401})},async base=>{
 const r=await fetch(base+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(context)});assert.equal(r.status,502);assert.doesNotMatch(await r.text(),/private upstream|test-only/);
}));
