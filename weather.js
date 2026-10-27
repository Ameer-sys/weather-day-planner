// Shared, side-effect-free forecast interpretation. No browser or network dependencies.
export const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
const formatters = new Map();
export function localTime(seconds, timezone='UTC') {
  if (!Number.isFinite(seconds)) return null;
  if (!formatters.has(timezone)) formatters.set(timezone,new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}));
  const p=Object.fromEntries(formatters.get(timezone).formatToParts(new Date(seconds*1000)).map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function normalizeForecast(raw) {
  if (!raw?.hourly?.time?.length || !raw.timezone || !raw.daily?.time?.length) throw new Error('Weather provider returned an incomplete forecast.');
  const length=raw.hourly.time.length;
  if(['precipitation_probability','precipitation','temperature_2m','wind_speed_10m','wind_gusts_10m','weather_code'].some(k=>!Array.isArray(raw.hourly[k])||raw.hourly[k].length!==length))throw new Error('Weather provider returned incomplete hourly measurements.');
  new Intl.DateTimeFormat('en',{timeZone:raw.timezone});
  if (typeof raw.hourly.time[0] !== 'number') return raw; // Explicit legacy demo uses interval-start local labels.
  const f=structuredClone(raw), h=f.hourly, epochs=[...h.time];
  h.epoch=epochs;
  h.time=epochs.map(t=>localTime(t,f.timezone));
  h.offset=epochs.map(t=>new Intl.DateTimeFormat('en',{timeZone:f.timezone,timeZoneName:'shortOffset',hour:'numeric'}).formatToParts(t*1000).find(p=>p.type==='timeZoneName').value);
  // Open-Meteo precipitation and gusts describe the preceding hour. Label by interval START.
  for (const key of ['precipitation_probability','precipitation','wind_gusts_10m']) h[key]=epochs.map((_,i)=>numeric(raw.hourly[key]?.[i+1]));
  if(f.current) f.current.time=localTime(f.current.time,f.timezone);
  // Provider daily buckets use a fixed offset. Recompute aggregates by actual local date.
  const dates=[...new Set(h.time.map(t=>t.slice(0,10)))];
  const daily={time:dates};
  for(const key of ['temperature_2m_max','temperature_2m_min','precipitation_probability_max','precipitation_sum','weather_code','wind_speed_10m_max']) daily[key]=[];
  daily.sunrise=dates.map(d=>raw.daily.sunrise?.map(t=>localTime(t,f.timezone)).find(t=>t?.startsWith(d))??null);
  daily.sunset=dates.map(d=>raw.daily.sunset?.map(t=>localTime(t,f.timezone)).find(t=>t?.startsWith(d))??null);
  for(const d of dates){
    const rows=hoursForDay(f,d);
    const aggregate=(key,fn)=>rows.length&&rows.every(r=>numeric(r[key])!==null)?fn(rows.map(r=>r[key])):null;
    daily.temperature_2m_max.push(aggregate('temp',v=>Math.max(...v)));
    daily.temperature_2m_min.push(aggregate('temp',v=>Math.min(...v)));
    daily.precipitation_probability_max.push(aggregate('rain',v=>Math.max(...v)));
    daily.precipitation_sum.push(aggregate('amount',v=>v.reduce((a,b)=>a+b,0)));
    daily.weather_code.push(aggregate('weather',v=>Math.max(...v)));
    daily.wind_speed_10m_max.push(aggregate('wind',v=>Math.max(...v)));
  }
  f.daily=daily;
  f.intervalConvention='Hourly precipitation and gusts cover the hour starting at the displayed time; temperature and weather code are instantaneous.';
  return f;
}
export function hoursForDay(forecast,day){
  const h=forecast?.hourly;
  return (h?.time||[]).flatMap((t,i)=>t.startsWith(day)?[{time:t,epoch:h.epoch?.[i],offset:h.offset?.[i]||'',hour:Number(t.slice(11,13)),rain:numeric(h.precipitation_probability?.[i]),amount:numeric(h.precipitation?.[i]),temp:numeric(h.temperature_2m?.[i]),wind:numeric(h.wind_speed_10m?.[i]),gust:numeric(h.wind_gusts_10m?.[i]),weather:numeric(h.weather_code?.[i])}]:[]);
}
export const selectHours=(hours,start,end)=>hours.filter(h=>h.hour>=start&&h.hour<end);
export function completeWindow(hours,start,end){
  const selected=selectHours(hours,start,end);
  if(!selected.length)return [];
  // UTC continuity also permits repeated local hours at fall-back and skipped spring hours.
  if(selected.every(h=>Number.isFinite(h.epoch))){
    if(selected[0].hour!==start||selected.at(-1).hour!==end-1||selected.some((h,i)=>i&&h.epoch-selected[i-1].epoch!==3600))return [];
  }else if(selected.length!==end-start||selected.some((h,i)=>h.hour!==start+i))return [];
  return selected;
}
export function assess(hours,activity='Picnic'){
  const unknown={status:'unknown',score:null,maxRain:null,avgRain:null,total:null,maxWind:null,thunder:false,reason:'Complete forecast data is unavailable for this window.'};
  if(!hours.length||hours.some(x=>['rain','amount','temp','wind','gust','weather'].some(k=>numeric(x[k])===null)))return unknown;
  const maxRain=Math.max(...hours.map(x=>x.rain)),avgRain=hours.reduce((s,x)=>s+x.rain,0)/hours.length,total=hours.reduce((s,x)=>s+x.amount,0),maxWind=Math.max(...hours.map(x=>Math.max(x.gust,x.wind))),thunder=hours.some(x=>x.weather>=95),isHike=/hik(e|ing)|waterfall/i.test(activity),freezing=hours.some(x=>x.temp<=0),snow=hours.some(x=>(x.weather>=71&&x.weather<=77)||(x.weather>=85&&x.weather<=86)),extreme=hours.some(x=>x.temp>=35||x.temp<=-15);
  const score=Math.round(Math.max(4,Math.min(100,100-avgRain*.5-maxRain*.17-total*6-Math.max(0,maxWind-20)*.8-(isHike?8:0)-(thunder?45:0)-(freezing||snow?20:0)-(extreme?30:0))));
  let status='go';if(thunder||maxWind>=60||total>=7||maxRain>=90||(isHike&&total>=4)||extreme)status='no-go';else if(maxRain>=55||total>=2||maxWind>=35||(isHike&&maxRain>=42)||freezing||snow)status='caution';
  const reason=thunder?'Thunderstorms are forecast. Avoid exposed trails.':extreme?'Extreme temperatures make this plan unsuitable.':maxWind>=60?`Wind gusts may reach ${Math.round(maxWind)} km/h.`:freezing||snow?'Freezing or snowy conditions may make surfaces slippery.':maxRain>=55?`Precipitation probability reaches ${maxRain}% during the selected window.`:total>=2?`${total.toFixed(1)} mm of precipitation forecast during your selected hours.`:maxWind>=35?`Wind gusts may reach ${Math.round(maxWind)} km/h.`:isHike&&maxRain>=42?'A wet trail could be slippery near waterfalls.':'Relatively favourable conditions in the selected window.';
  return {status,score,maxRain,avgRain,total,maxWind,thunder,reason};
}
export function bestWindows(hours,activity,n=3){
  const out=[];
  for(let start=8;start<=20-n;start++){
    const slice=selectHours(hours,start,start+n);
    if(slice.length!==n||slice.some((h,i)=>h.hour!==start+i||(i&&h.epoch&&h.epoch-slice[i-1].epoch!==3600)))continue;
    const a=assess(slice,activity);if(a.status!=='unknown')out.push({...a,start,end:start+n});
  }
  return out.sort((a,b)=>b.score-a.score||a.start-b.start);
}
export function compareForecasts(oldData,newData,watch){
  const a=completeWindow(hoursForDay(oldData,watch.date),watch.start,watch.end),b=completeWindow(hoursForDay(newData,watch.date),watch.start,watch.end);
  if(!a.length||a.length!==b.length||a.some((x,i)=>x.time!==b[i].time||x.epoch!==b[i].epoch||numeric(x.rain)===null||numeric(b[i].rain)===null))return null;
  const oldPeak=Math.max(...a.map(x=>x.rain)),newPeak=Math.max(...b.map(x=>x.rain));
  return Math.abs(newPeak-oldPeak)>=15?{oldPeak,newPeak}:null;
}
