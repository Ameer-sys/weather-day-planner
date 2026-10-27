import test from 'node:test';
import assert from 'node:assert/strict';
import { guidanceForPlan } from '../guidance.js';

const assessment={status:'caution',maxWind:51,maxRain:18,total:0,thunder:false};
test('guidance separates recommendation, reason, time and waterfall precautions',()=>{
 const result=guidanceForPlan({assessment,best:{start:8,end:11,status:'caution'},activity:'Waterfall hike & picnic'});
 assert.match(result.summary,/Use caution/);
 assert.match(result.reason,/Strong wind.*51 km\/h/);
 assert.equal(result.time,'8 AM–11 AM');
 assert.match(result.precautions.join(' '),/slippery/);
 assert.doesNotMatch(JSON.stringify(result),/OpenAI|API|rule-based|heuristic/i);
});
test('an unsuitable best-ranked window is never presented as good advice',()=>{
 const result=guidanceForPlan({assessment:{...assessment,status:'no-go',thunder:true},best:{start:8,end:11,status:'no-go'}});
 assert.match(result.summary,/Choose another time/);
 assert.equal(result.time,null);
 assert.match(result.timeNote,/No suitable/);
 assert.match(result.reason,/Thunderstorms/);
});
test('stale or missing forecasts give a clear next step without a recommendation',()=>{
 const stale=guidanceForPlan({assessment,best:{start:8,end:11,status:'go'},stale:true});
 assert.match(stale.summary,/Refresh/);assert.equal(stale.time,null);
 const missing=guidanceForPlan({assessment:{status:'unknown'}});
 assert.match(missing.reason,/another date|try again/);assert.equal(missing.time,null);
});
test('cold and heavy rain reasons stay clear and preserve the assessment',()=>{
 const cold=guidanceForPlan({assessment,hours:[{temp:-2,weather:75}]});
 assert.match(cold.reason,/ice|snow/i);
 const rain=guidanceForPlan({assessment:{...assessment,maxWind:10,maxRain:65,total:3.2}});
 assert.match(rain.reason,/Rain or snow/);
 assert.equal(rain.status,'caution');
});
