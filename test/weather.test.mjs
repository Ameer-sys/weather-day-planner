import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeForecast, hoursForDay, assess, bestWindows, compareForecasts, localTime, selectHours, completeWindow } from '../weather.js';

const hour = (changes={}) => ({hour:10,time:'2026-10-29T10:00',rain:0,amount:0,temp:15,wind:10,gust:15,weather:0,...changes});
test('missing measurements never mean dry weather or a GO recommendation',()=>{
  assert.equal(assess([hour({rain:null})],'Picnic').status,'unknown');
  assert.equal(assess([],'Picnic').score,null);
});
test('malformed hourly arrays are rejected; gaps do not produce an assessment',()=>{
  const f=raw('2026-10-29T04:00:00Z',25);f.hourly.precipitation=[];
  assert.throws(()=>normalizeForecast(f),/incomplete hourly/);
  assert.equal(completeWindow([hour({hour:10}),hour({hour:12})],10,13).length,0);
});
test('freezing, snow and extreme temperatures affect activity guidance',()=>{
 assert.equal(assess([hour({temp:0})],'Running').status,'caution');
 assert.equal(assess([hour({weather:75})],'Cycling').status,'caution');
 assert.equal(assess([hour({temp:36})],'Picnic').status,'no-go');
});
test('hiking, rain, wind and thunder thresholds remain conservative',()=>{
  assert.equal(assess([hour({rain:41})],'Hiking').status,'go');
  assert.equal(assess([hour({rain:42})],'Hiking').status,'caution');
  assert.equal(assess([hour({amount:4})],'Waterfall hike & picnic').status,'no-go');
  assert.equal(assess([hour({gust:60})],'Picnic').status,'no-go');
  assert.equal(assess([hour({weather:95})],'Picnic').status,'no-go');
});
test('time conversion uses location timezone across midnight and both DST transitions',()=>{
  const stamp=s=>Date.parse(s)/1000;
  assert.equal(localTime(stamp('2026-10-30T01:00:00Z'),'America/Toronto'),'2026-10-29T21:00');
  assert.equal(localTime(stamp('2026-11-01T05:00:00Z'),'America/Toronto'),'2026-11-01T01:00');
  assert.equal(localTime(stamp('2026-11-01T06:00:00Z'),'America/Toronto'),'2026-11-01T01:00');
  assert.equal(localTime(stamp('2026-03-08T07:00:00Z'),'America/Toronto'),'2026-03-08T03:00');
});
function raw(start,count){
  const time=Array.from({length:count},(_,i)=>Date.parse(start)/1000+i*3600);
  return {timezone:'America/Toronto',utc_offset_seconds:-14400,current:{time:time[0]},daily:{time:[time[0]]},hourly:{time,precipitation_probability:time.map(()=>10),precipitation:time.map((_,i)=>i),temperature_2m:time.map(()=>15),wind_speed_10m:time.map(()=>10),wind_gusts_10m:time.map(()=>15),weather_code:time.map(()=>0)}};
}
test('preceding-hour precipitation is attached to the interval starting at the displayed hour',()=>{
  const f=normalizeForecast(raw('2026-10-29T04:00:00Z',25));
  const hours=hoursForDay(f,'2026-10-29');
  assert.equal(hours.length,24);
  assert.equal(hours[10].amount,11);
  assert.equal(selectHours(hours,10,18).reduce((n,h)=>n+h.amount,0),116);
  assert.equal(hoursForDay(f,'2027-01-01').length,0);
});
test('DST days contain 25 or 23 distinct hourly intervals',()=>{
  assert.equal(hoursForDay(normalizeForecast(raw('2026-11-01T04:00:00Z',27)),'2026-11-01').length,25);
  assert.equal(hoursForDay(normalizeForecast(raw('2026-03-08T05:00:00Z',25)),'2026-03-08').length,23);
});
test('best windows exclude missing hours and unavailable measurements',()=>{
  assert.equal(bestWindows([hour({hour:8}),hour({hour:10}),hour({hour:11})],'Picnic').length,0);
  assert.equal(bestWindows([8,9,10].map(h=>hour({hour:h,rain:null})),'Picnic').length,0);
});
test('change detection only compares complete matching windows',()=>{
  const old=normalizeForecast(raw('2026-10-29T04:00:00Z',25));
  const next=structuredClone(old); next.hourly.precipitation_probability.fill(30);
  const watch={date:'2026-10-29',start:10,end:18};
  assert.deepEqual(compareForecasts(old,next,watch),{oldPeak:10,newPeak:30});
  next.hourly.precipitation_probability[12]=null;
  assert.equal(compareForecasts(old,next,watch),null);
});
