import { hoursForDay, assess as assessWeather, bestWindows as rankWindows, compareForecasts, localTime, numeric, completeWindow } from './weather.js';
import { guidanceForPlan } from './guidance.js';
const $ = (selector) => document.querySelector(selector);
const ico = (name, size=18) => {
  const shapes = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    cloud:'<path d="M20 16.2a4 4 0 0 0-3.7-6.1 6 6 0 0 0-11.7 1.7A3.6 3.6 0 0 0 6 19h11a4 4 0 0 0 3-2.8Z"/>',
    rain:'<path d="M20 15a4 4 0 0 0-3.7-5.9 6 6 0 0 0-11.7 1.7A3.6 3.6 0 0 0 6 18h11"/><path d="m8 21 1-2m4 2 1-2m4 2 1-2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    chart:'<path d="M3 3v18h18M7 15l4-4 4 3 5-7"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    settings:'<path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.3-6.3-1.4 1.4M7.1 16.9l-1.4 1.4m12.6 0-1.4-1.4M7.1 7.1 5.7 5.7"/><circle cx="12" cy="12" r="4"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    refresh:'<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    wind:'<path d="M3 8h12a3 3 0 1 0-3-3M2 12h18a2 2 0 1 1-2 2M4 16h8a3 3 0 1 1-3 3"/>',
    droplet:'<path d="M12 22a8 8 0 0 0 8-8c0-5-8-12-8-12S4 9 4 14a8 8 0 0 0 8 8Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    brain:'<path d="M12 18V6M9 5a4 4 0 0 0-6 4c-2 3 0 6 2 7a4 4 0 0 0 7 2M15 5a4 4 0 0 1 6 4c2 3 0 6-2 7a4 4 0 0 1-7 2M7 10l3 2m7-2-3 2"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.5"/>',
    close:'<path d="M5 5l14 14M19 5 5 19"/>',
    check:'<path d="m5 12 5 5L20 7"/>',
    trash:'<path d="M3 6h18m-2 0-1 15H6L5 6m3 0V4h8v2m-6 4v7m4-7v7"/>',
    radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 4v.5"/>',
    sparkles:'<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3ZM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"/>',
    sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="#071b3c"/><circle cx="16" cy="17" r="2.5" fill="#071b3c"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]||shapes.cloud}</svg>`;
};
const E = (value) => String(value??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const storage = (key,fallback) => {try {const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v);}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
const preset={name:'Hamilton',admin1:'Ontario',country:'Canada',latitude:43.2557,longitude:-79.8711,timezone:'America/Toronto'};
const DEFAULT_TRIP={id:'hamilton-waterfall',place:'Hamilton, Ontario',date:'2026-10-29',activity:'Waterfall hike & picnic',start:10,end:18,lat:43.2557,lon:-79.8711};
const navItems=[['overview','grid','Overview'],['forecast','chart','Forecast analysis'],['planner','compass','Trip planner'],['watches','eye','My watchlist'],['alerts','bell','Alerts'],['settings','settings','Settings']];
const state={view:'overview',location:storage('atmos.location',preset),forecast:null,fetchedAt:null,date:'2026-10-29',start:10,end:18,activity:'Waterfall hike & picnic',chartMode:'probability',unit:storage('atmos.units','C'),loading:true,error:null,demo:new URLSearchParams(location.search).has('demo'),searchMatches:[],aiText:null,aiLabel:null,aiLoading:false,notices:storage('atmos.notices',[]),watches:storage('atmos.watches',[DEFAULT_TRIP]),refreshMinutes:storage('atmos.refreshMinutes',10),notify:false,modal:false,ambient:storage('atmos.ambient',true)};
if(!state.location||typeof state.location.name!=='string'||!Number.isFinite(state.location.latitude)||!Number.isFinite(state.location.longitude))state.location={...preset};
try{new Intl.DateTimeFormat('en',{timeZone:state.location.timezone||'America/Toronto'});}catch{state.location.timezone='America/Toronto';}
state.watches=Array.isArray(state.watches)?state.watches.filter(w=>w&&typeof w.id==='string'&&typeof w.place==='string'&&typeof w.activity==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(w.date)&&Number.isFinite(w.lat)&&Number.isFinite(w.lon)&&Number.isInteger(w.start)&&Number.isInteger(w.end)&&w.start>=0&&w.end<=24&&w.start<w.end).slice(0,30):[DEFAULT_TRIP];
state.notices=Array.isArray(state.notices)?state.notices.filter(n=>n&&typeof n.message==='string'&&!Number.isNaN(Date.parse(n.at))).slice(0,35):[];
if(![5,10,30].includes(state.refreshMinutes))state.refreshMinutes=10;
const todayISO=()=>localTime(Date.now()/1000,state.location.timezone||'America/Toronto').slice(0,10);
const dateLabel=(date,opts={weekday:'short',month:'short',day:'numeric'})=>new Date(`${date}T12:00:00`).toLocaleDateString('en-CA',opts);
const niceTime=(h)=>`${h%12||12} ${h%24<12?'AM':'PM'}`;
const clockTime=(h)=>`${h%12||12}${h%24<12?'AM':'PM'}`;
const fmtHour=(dateTime)=>niceTime(Number(dateTime.slice(11,13)));
const fixed=(v,n=0)=>numeric(v)!==null?v.toFixed(n):'—';
const ctemp=v=> numeric(v)!==null ? `${Math.round(state.unit==='F'?v*9/5+32:v)}°`:'—';
const tempUnit=()=>state.unit==='F'?'°F':'°C';
const weatherName=(code)=>numeric(code)===null?'Conditions unavailable':code===0?'Clear skies':code<=3?'Partly cloudy':code<=48?'Foggy conditions':code<=57?'Light drizzle':code<=67?'Rain expected':code<=77?'Snow conditions':code<=82?'Passing showers':code<=86?'Snow showers':code>=95?'Thunderstorms':'Variable weather';
const statusName=s=>s==='go'?'GOOD TO GO':s==='caution'?'USE CAUTION':s==='no-go'?'POSTPONE':'UNAVAILABLE';
const weatherText=(p)=>!p?'Awaiting forecast data':`${p}% chance of rain at the wettest hour`;
const readRange=()=>({start:Math.min(state.start,state.end-1),end:Math.max(state.end,state.start+1)});
const getDates=()=>state.forecast?.daily?.time||[];
const getHours=(day=state.date)=>hoursForDay(state.forecast,day);
const getDayIndex=(day=state.date)=>getDates().indexOf(day);
const getDay=(day=state.date)=>{const i=getDayIndex(day),daily=state.forecast?.daily;if(i<0||!daily)return null;return {max:daily.temperature_2m_max[i],min:daily.temperature_2m_min[i],maxRain:daily.precipitation_probability_max[i],rainSum:daily.precipitation_sum[i],sunrise:daily.sunrise[i],sunset:daily.sunset[i],wind:daily.wind_speed_10m_max[i],code:daily.weather_code[i]};};
const assess=(hours,activity=state.activity)=>assessWeather(hours,activity);
const chosenHours=()=>{const{start,end}=readRange();return completeWindow(getHours(),start,end)};
const isStale=()=>!state.demo&&(!!state.error||!!state.fetchedAt&&Date.now()-Date.parse(state.fetchedAt)>30*60*1000);
const currentAssessment=()=>assess(isStale()||state.loading?[]:chosenHours());
const bestWindows=(hours=getHours(),n=3)=>isStale()||state.loading?[]:rankWindows(hours,state.activity,n);
function rainWindows(hours=getHours()){
  const out=[];let active=null;
  for(const h of hours){if(numeric(h.rain)===null||numeric(h.amount)===null){if(active)out.push(active);active=null;continue;}if(active&&h.hour!==active.end){out.push(active);active=null;}const wet=h.rain>=40||h.amount>=.2;
    if(wet){if(!active)active={start:h.hour,end:h.hour+1,maxRain:h.rain,amount:h.amount};else{active.end=h.hour+1;active.maxRain=Math.max(active.maxRain,h.rain);active.amount+=h.amount;}}
    else if(active){out.push(active);active=null;}}
  if(active)out.push(active);return out;
}
const locationKey=loc=>String(loc.latitude??loc.lat)+','+String(loc.longitude??loc.lon);
const snapshots=new Map(),watchErrors=new Map();
function maybeCompare(oldData,newData,loc=state.location){
 if(state.demo)return;
 const watches=state.watches.filter(w=>locationKey(w)===locationKey(loc));
 if(locationKey(loc)===locationKey(state.location))watches.push({date:state.date,start:state.start,end:state.end,place:state.location.name});
 const unique=new Map(watches.map(w=>[w.date+'-'+w.start+'-'+w.end,w]));
 for(const w of unique.values()){
  const change=compareForecasts(oldData,newData,w);
  if(change)addNotice('Forecast update: '+w.place+' precipitation risk '+(change.newPeak>change.oldPeak?'rose':'fell')+' from '+change.oldPeak+'% to '+change.newPeak+'% for '+w.date+'.',change.newPeak>change.oldPeak?'caution':'go');
 }
}
async function fetchForecast(loc,signal){
 const response=await fetch('/api/forecast?lat='+encodeURIComponent(loc.latitude??loc.lat)+'&lon='+encodeURIComponent(loc.longitude??loc.lon),{cache:'no-store',signal});
 const data=await response.json();
 if(!response.ok||!data.forecast?.hourly?.time?.length)throw Error(data.error||'Unable to read weather data.');
 return data;
}
let monitoring=false;
async function monitorWatches(){
 if(monitoring||state.demo)return;monitoring=true;
 try{
  const locations=new Map(state.watches.map(w=>[locationKey(w),w]));
  for(const [key,w] of locations){
   if(key===locationKey(state.location)||state.demo)continue;
   try{const data=await fetchForecast(w,AbortSignal.timeout(18000));if(state.demo)break;maybeCompare(snapshots.get(key)?.forecast,data.forecast,w);snapshots.set(key,data);watchErrors.delete(key);}
   catch{watchErrors.set(key,'Refresh failed');}
  }
 }finally{monitoring=false;render();}
}
function addNotice(message,type='info'){
  const item={id:Date.now()+'-'+Math.random(),message,type,at:new Date().toISOString()};state.notices.unshift(item);state.notices=state.notices.slice(0,35);save('atmos.notices',state.notices);
  if(state.notify && 'Notification' in window && Notification.permission==='granted')new Notification('ATMOS Weather Alert',{body:message});
}
let toastTimeout;
function toast(message){let node=$('.notifier');if(node)node.remove();node=document.createElement('div');node.className='notifier';node.setAttribute('role','status');node.textContent=message;document.body.appendChild(node);clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.remove(),4300);}
function makeDemo(){
  const start=new Date(todayISO()+'T12:00:00');const days=[];const hourly={time:[],temperature_2m:[],precipitation_probability:[],precipitation:[],weather_code:[],wind_speed_10m:[],wind_gusts_10m:[],relative_humidity_2m:[],cloud_cover:[],visibility:[]};
  const daily={time:[],temperature_2m_max:[],temperature_2m_min:[],precipitation_probability_max:[],precipitation_sum:[],sunrise:[],sunset:[],weather_code:[],wind_speed_10m_max:[]};
  for(let d=0;d<16;d++){
    const date=new Date(start);date.setDate(date.getDate()+d);const day=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');days.push(day);
    let probs=[],temps=[],amounts=[];
    for(let h=0;h<24;h++){
      const basis=day==='2026-10-29'?30+(h>=10&&h<=19?30:0):14+(d*17)%41;
      const rain=Math.min(95,Math.max(2,Math.round(basis+14*Math.sin(h*.57+d)-9*Math.cos(h*.33))));
      const temp=11+6*Math.sin((h-6)/24*Math.PI)+Math.sin(d*.9)*2;
      const amount=rain>=45?Math.round((rain-34)*.022*10)/10:0;
      const code=rain>=60?61:rain>=43?3:2;
      hourly.time.push(`${day}T${String(h).padStart(2,'0')}:00`);hourly.temperature_2m.push(Math.round(temp*10)/10);hourly.precipitation_probability.push(rain);hourly.precipitation.push(amount);hourly.weather_code.push(code);hourly.wind_speed_10m.push(12+(h+d)%12);hourly.wind_gusts_10m.push(20+(h*2+d)%13);hourly.relative_humidity_2m.push(70);hourly.cloud_cover.push(rain+8);hourly.visibility.push(12000);probs.push(rain);temps.push(temp);amounts.push(amount);
    }
    daily.time.push(day);daily.temperature_2m_max.push(Math.round(Math.max(...temps)));daily.temperature_2m_min.push(Math.round(Math.min(...temps)));daily.precipitation_probability_max.push(Math.max(...probs));daily.precipitation_sum.push(Math.round(amounts.reduce((s,n)=>s+n,0)*10)/10);daily.sunrise.push(`${day}T07:47`);daily.sunset.push(`${day}T18:13`);daily.weather_code.push(Math.max(...probs)>60?61:2);daily.wind_speed_10m_max.push(27);
  }
  return{latitude:state.location.latitude,longitude:state.location.longitude,timezone:state.location.timezone||'America/Toronto',current:{temperature_2m:16.8,apparent_temperature:15.7,weather_code:3,relative_humidity_2m:68,wind_speed_10m:18,precipitation:0,cloud_cover:63,is_day:1},hourly,daily};
}
let forecastRequest=0,forecastController;
async function loadForecast({quiet=false}={}){
 const request=++forecastRequest;forecastController?.abort();forecastController=new AbortController();
 state.aiText=null;state.aiLabel=null;
 if(state.demo){state.forecast=makeDemo();state.fetchedAt=new Date().toISOString();state.loading=false;state.error=null;render();return;}
 if(!quiet){state.loading=true;state.error=null;render();}
 const loc={...state.location},key=locationKey(loc);
 try{
  const data=await fetchForecast(loc,AbortSignal.any([forecastController.signal,AbortSignal.timeout(18000)]));
  if(request!==forecastRequest)return;
  maybeCompare(snapshots.get(key)?.forecast,data.forecast,loc);
  snapshots.set(key,data);watchErrors.delete(key);
  state.forecast=data.forecast;state.fetchedAt=data.fetchedAt;state.location.timezone=data.forecast.timezone;state.error=null;
  }catch(error){if(request!==forecastRequest)return;watchErrors.set(key,'Refresh failed');state.error=error.name==='TimeoutError'?'Weather request timed out. Please retry.':error.message||'Weather service unavailable';}
 finally{if(request===forecastRequest){state.loading=false;render();void monitorWatches();}}
}
function navLink(id,name,label){return `<button class="nav-link ${state.view===id?'active':''}" data-action="nav" data-value="${id}" title="${label}" aria-label="${label}" aria-current="${state.view===id?'page':'false'}">${ico(name)}<span class="nav-full">${E(label)}</span><span class="nav-short" aria-hidden="true">${({overview:"Overview",forecast:"Forecast",planner:"Planner",watches:"Watches",alerts:"Alerts",settings:"Settings"})[id]}</span></button>`;}
function renderSidebar(){return `<aside class="sidebar"><div class="brand"><div class="brand-mark">${ico('cloud',23)}</div><div><div class="brand-name">ATMOS</div><div class="brand-sub">WEATHER INTELLIGENCE</div></div></div><nav aria-label="Dashboard navigation"><div class="side-section">WORKSPACE</div>${navItems.slice(0,4).map(n=>navLink(...n)).join('')}<div class="side-section">SYSTEM</div>${navItems.slice(4).map(n=>navLink(...n)).join('')}</nav><div class="side-spacer"></div><div class="side-bottom"><div class="small-logo">${ico('bolt',17)}</div><strong>Built for better plans.</strong><p>Watch the forecast, find the window, make the call.</p><button data-action="nav" data-value="planner">PLAN A TRIP →</button></div><div class="sidebar-footer"><i class="online-dot"></i><span>ATMOS / v2.0 · ${state.demo?'SHOWCASE':'MONITOR'}</span></div></aside>`;}
function renderTopbar(){return `<header class="topbar"><div class="breadcrumb">OPERATIONS <span class="slash">/</span> <strong>${E(navItems.find(n=>n[0]===state.view)?.[2]||'Overview')}</strong></div><div class="top-spacer"></div><div class="searchbox">${ico('search')}<input id="searchInput" autocomplete="off" placeholder="Search any city or region..." aria-label="Search city"/><div id="searchResults" class="search-pop hide"></div></div><span class="top-time" id="liveClock">--:--</span><button class="round-btn ambient-control ${state.ambient?'on':''}" data-action="ambient-toggle" aria-label="Toggle ambient animations" aria-pressed="${state.ambient}" title="Toggle ambient visual effects">${ico('sparkles')}</button><button class="round-btn" data-action="refresh" title="Refresh weather" aria-label="Refresh weather">${ico('refresh')}</button><button class="round-btn" data-action="nav" data-value="alerts" title="Weather alerts" aria-label="Weather alerts">${ico('bell')}${state.notices.length?'<i class="notif-pip"></i>':''}</button><span class="avatar" title="ATMOS operator">AT</span></header>`;}
function head(title,desc,opts=''){return `<div class="page-head"><div><div class="eyebrow">ATMOS / COMMAND CENTRE</div><h1 tabindex="-1">${E(title)}</h1><p>${E(desc)}</p></div><div class="head-actions">${opts}<span class="status-chip ${state.demo||isStale()?'demo':''}"><i class="online-dot" style="background:${state.demo||isStale()?'#ffb56e':'#1ce1ac'}"></i>${state.demo?'DEMO DATA':state.loading?'CONNECTING':isStale()?state.forecast?'DATA STALE':'OFFLINE':state.forecast?'DATA CONNECTED':'OFFLINE'}</span></div></div>`;}
function metric(title,value,sub,icon,color='blue'){return `<div class="metric"><div class="metric-top"><span>${E(title)}</span><div class="metric-icon">${ico(icon)}</div></div><div class="metric-val">${E(value)}</div><div class="metric-bottom"><span class="${color}">${E(sub)}</span></div></div>`;}
function weatherArt(weatherCode){
  const stormy=weatherCode>=95;
  const snowy=weatherCode>=71 && weatherCode<=77 || weatherCode>=85 && weatherCode<=86;
  const raining=!snowy && (weatherCode>=51&&weatherCode<=67 || weatherCode>=80&&weatherCode<=82 || weatherCode>=95);
  const sunny=weatherCode<=1;
  const kind=stormy?'storm':snowy?'snow':raining?'rain':sunny?'clear':'cloud';
  const stars=Array.from({length:16},(_,i)=>{
    const x=(11+i*47)%94,y=(7+i*29)%86;
    return `<i class="atmos-star" style="--x:${x}%;--y:${y}%;--delay:${(i*0.31).toFixed(2)}s"></i>`;
  }).join('');
  const filaments=Array.from({length:11},(_,i)=>{
    const x=210+i*9,dx=(i-5)*5;
    return `<path class="plasma-filament" d="M${x} 134 C${x+dx} 154 ${x+dx/2+14} 178 ${x+dx+3} 203 S${x+dx-12} 240 ${x+dx+17} 261" style="--delay:${(i*.18).toFixed(2)}s"/>`;
  }).join('');
  const droplets=raining?Array.from({length:19},(_,i)=>`<i class="ambient-rain" style="--x:${(i*31)%100}%;--delay:-${((i*0.19)%2.8).toFixed(2)}s;--duration:${(1.1+(i%5)*.25).toFixed(2)}s"></i>`).join(''):snowy?Array.from({length:24},(_,i)=>`<i class="ambient-snow" style="--x:${(i*39)%100}%;--delay:-${((i*.3)%4).toFixed(2)}s;--duration:${(3+(i%6)*.42).toFixed(2)}s"></i>`).join(''):'';
  return `<div class="weather-art atmosphere-${kind}" aria-hidden="true">
    <div class="atmos-glow"></div><div class="atmos-scan-orbit orbit-one"></div><div class="atmos-scan-orbit orbit-two"></div>
    <div class="atmos-scanner"></div><div class="atmos-haze"></div>
    <svg class="plasma-cloud" viewBox="0 0 440 310" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cloudCore" cx="0" cy="0" r="1" gradientTransform="translate(205 87) rotate(88) scale(129 173)" gradientUnits="userSpaceOnUse"><stop stop-color="#A4E7FF" stop-opacity=".9"/><stop offset=".22" stop-color="#719BFF" stop-opacity=".77"/><stop offset=".58" stop-color="#4437C6" stop-opacity=".61"/><stop offset="1" stop-color="#1B1254" stop-opacity="0"/></radialGradient>
        <linearGradient id="cloudShell" x1="125" x2="321" y1="42" y2="157" gradientUnits="userSpaceOnUse"><stop stop-color="#8FF5FF" stop-opacity=".4"/><stop offset=".48" stop-color="#6D73FF" stop-opacity=".54"/><stop offset="1" stop-color="#5B27C3" stop-opacity=".25"/></linearGradient>
        <linearGradient id="filament" x1="205" y1="123" x2="250" y2="265" gradientUnits="userSpaceOnUse"><stop stop-color="#BCEBFF" stop-opacity=".74"/><stop offset=".5" stop-color="#6F78FF" stop-opacity=".68"/><stop offset="1" stop-color="#A64FFF" stop-opacity="0"/></linearGradient>
        <filter id="cloudBlur"><feGaussianBlur stdDeviation="12"/></filter>
        <filter id="coreGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3.3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="231" cy="111" rx="139" ry="108" fill="#3468FF" opacity=".4" filter="url(#cloudBlur)"/>
      <path class="plasma-dome" d="M98 147 C111 73 160 38 229 36 C305 32 351 80 356 152 C322 174 157 176 98 147Z" fill="url(#cloudCore)" stroke="url(#cloudShell)" stroke-width="2"/>
      <path class="plasma-membrane" d="M98 147 C152 114 295 101 356 152 C297 174 151 179 98 147Z" fill="#7F66FF" fill-opacity=".23" stroke="#79D8FF" stroke-opacity=".55"/>
      <path class="plasma-crown" d="M109 139 C174 108 279 112 348 147" stroke="#9BE5FF" stroke-width="2.4" stroke-linecap="round" filter="url(#coreGlow)"/>
      <path class="plasma-crown crown-secondary" d="M139 91 C206 50 282 78 306 104" stroke="#AE9FFF" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>
      <g stroke="url(#filament)" stroke-width="2" stroke-linecap="round">${filaments}</g>
      <path d="M162 123 C190 145 233 148 286 125" stroke="#D9F7FF" stroke-opacity=".35" stroke-width="1"/>
      <circle class="plasma-seed" cx="196" cy="87" r="24" fill="#BAE5FF" fill-opacity=".25" filter="url(#cloudBlur)"/>
    </svg>
    ${stars}${droplets}
    <div class="atmos-art-caption"><span class="hud-cross">+</span> ATMOSPHERIC VISUALIZATION <span class="hud-coordinate">${Math.abs(Number(state.location.latitude||0)).toFixed(2)}°${state.location.latitude<0?'S':'N'} / ${Math.abs(Number(state.location.longitude||0)).toFixed(2)}°${state.location.longitude<0?'W':'E'}</span></div>
  </div>`;
}
function riskGauge(assessment){const score=assessment.score??0;const angle=Math.PI*(1-score/100);const x=74+60*Math.cos(angle),y=78-60*Math.sin(angle);const color=assessment.status==='go'?'#15d9b7':assessment.status==='caution'?'#ffba6b':'#f7809c';return `<div class="gauge"><svg viewBox="0 0 148 94"><path d="M14 79 A60 60 0 0 1 134 79" fill="none" stroke="#123e6b" stroke-width="13" stroke-linecap="round"/><path d="M14 79 A60 60 0 0 1 134 79" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" stroke-dasharray="${score/100*188.5} 190"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#fff"/></svg><div class="gauge-middle"><strong>${assessment.score===null?'—':score}</strong><span>of 100</span></div></div>`;}
function renderMainChart(hours){
  if(!hours.length)return `<div class="small-empty">Awaiting hourly forecast data.</div>`;
  const w=680,h=205,left=37,right=13,top=13,bottom=28,chartW=w-left-right,chartH=h-top-bottom;
  const maximum=state.chartMode==='rainfall'?Math.max(1,...hours.map(x=>x.amount??0)):100;
  const getV=x=>(state.chartMode==='rainfall'?x.amount:x.rain)/maximum*100;
  if(hours.some(x=>numeric(state.chartMode==='rainfall'?x.amount:x.rain)===null))return '<div class="small-empty">This chart has missing measurements. No dry-weather values have been substituted.</div>';
  const pts=hours.map((p,i)=>({x:left+chartW*i/Math.max(hours.length-1,1),y:top+chartH*(1-getV(p)/100),p}));
  const path=pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area=`${path} L${left+chartW},${top+chartH} L${left},${top+chartH} Z`;
  return `<svg class="main-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Hourly ${state.chartMode==='rainfall'?'precipitation in millimetres':'rain probability as percent'} for ${E(state.date)}">
  <defs><linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#168EFF" stop-opacity=".58"/><stop offset="65%" stop-color="#107CE8" stop-opacity=".19"/><stop offset="100%" stop-color="#1265ef" stop-opacity=".02"/></linearGradient><linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0"><stop stop-color="#8BD8FF"/><stop offset=".48" stop-color="#1B87FF"/><stop offset="1" stop-color="#5AE8FF"/></linearGradient><filter id="lineGlow"><feGaussianBlur stdDeviation="3.6"/></filter></defs>
  ${[0,25,50,75,100].map(v=>{const y=top+chartH*(1-v/100);return `<line class="chart-grid" x1="${left}" x2="${w-right}" y1="${y}" y2="${y}"/><text class="chart-axis" x="${left-7}" y="${y+4}" text-anchor="end">${state.chartMode==='rainfall'?(v/100*maximum).toFixed(1):v+'%'}</text>`;}).join('')}
  <path class="chart-area" d="${area}"/><path class="chart-glow" d="${path}"/><path class="chart-line" d="${path}" pathLength="1"/>
  ${pts.map((p,i)=>`<g class="chart-hit" tabindex="0" role="img" aria-label="${fmtHour(p.p.time)} ${E(p.p.offset)}: ${p.p.rain}% rain probability, ${fixed(p.p.amount,1)} millimetres" data-chart-hour="${E(fmtHour(p.p.time)+' '+p.p.offset)}" data-chart-rain="${p.p.rain}" data-chart-mm="${fixed(p.p.amount,1)}" data-chart-x="${(p.x/w*100).toFixed(2)}" data-chart-y="${(p.y/h*100).toFixed(2)}"><circle class="chart-target" cx="${p.x}" cy="${p.y}" r="11"/><circle class="chart-point" cx="${p.x}" cy="${p.y}" r="${i%3===0?3.2:2}"/></g>`).join('')}
  ${pts.filter(p=>p.p.hour%4===0).map(p=>`<text class="chart-axis" x="${p.x}" y="${h-5}" text-anchor="middle">${fmtHour(p.p.time)}</text>`).join('')}
  </svg><div class="chart-floating" id="chartFloating" hidden></div>`;
}
function renderHourlyBars(hours){if(hours.some(h=>numeric(h.rain)===null))return '<div class="small-empty">Hourly probability data is incomplete.</div>';const filtered=hours.filter(p=>p.hour>=8&&p.hour<=20);return `<div class="bar-chart">${filtered.map((p,i)=>`<div class="bar-col"><div class="bar-hover">${p.rain}% rain</div><div class="bar ${p.rain>=55?'hot':''}" style="height:${Math.max(3,p.rain)}%" title="${niceTime(p.hour)}: ${p.rain}% / ${p.amount} mm"></div><label>${i%2===0?clockTime(p.hour):''}</label></div>`).join('')}</div>`;}
function planGuidance(){return guidanceForPlan({assessment:currentAssessment(),best:bestWindows()[0],activity:state.activity,hours:chosenHours(),stale:isStale()});}
function deterministicText(){const g=planGuidance();return [g.summary,g.reason,g.time?'Best time: '+g.time+'.':'',...g.precautions].filter(Boolean).join(' ');}
function guidanceDetails(g){return '<p class="guidance-reason">'+E(g.reason)+'</p><div class="guidance-time">'+ico('clock',17)+'<div><span>Best time</span><strong>'+E(g.time||'Try another day')+'</strong><small>'+E(g.timeNote)+'</small></div></div>'+(g.precautions.length?'<ul class="guidance-precautions">'+g.precautions.map(p=>'<li>'+ico('info',15)+'<span>'+E(p)+'</span></li>').join('')+'</ul>':'');}
function intelligencePanel(){const g=planGuidance();return '<section class="panel advisor-panel" aria-labelledby="intelligence-title"><div class="panel-head"><div><h2 class="panel-label" id="intelligence-title">ATMOS Intelligence</h2><div class="panel-sub">Simple weather guidance for your plan</div></div>'+ico('brain',18)+'</div><div class="advisor-box"><h3 class="guidance-summary '+g.status+'">'+E(g.summary)+'</h3>'+guidanceDetails(g)+'</div>'+(state.aiText&&!isStale()?'<div class="guidance-extra"><h3>More about your plan</h3><p>'+E(state.aiText)+'</p></div>':'')+'<button class="primary-btn advisor-btn" data-action="ai" '+(g.status==='unknown'||state.aiLoading?'disabled':'')+' aria-busy="'+state.aiLoading+'">'+ico('brain',16)+' '+(state.aiLoading?'Reviewing your plan…':'Ask ATMOS Intelligence')+' '+ico('arrow',14)+'</button><p class="guidance-feedback" role="status">'+E(state.aiLabel||'')+'</p><p class="advisor-disclaimer">Weather conditions can change, so check again before you go.</p></section>';}
function forecastSignal(hours){
  const upcoming=hours.filter(x=>x.hour>=state.start&&x.hour<state.end);
  const risk=upcoming.length&&upcoming.every(x=>numeric(x.rain)!==null)?Math.round(upcoming.reduce((sum,x)=>sum+x.rain,0)/upcoming.length):null;
  const wet=upcoming.filter(x=>x.rain>=55).length;
  return `<div class="signal-band" aria-label="Selected outing weather signals">
    <span class="signal-lead"><span class="signal-line"></span> FORECAST SIGNAL</span>
    <span>${ico('calendar',13)} ${E(dateLabel(state.date,{weekday:'long',month:'short',day:'numeric'}))}</span>
    <span>${ico('clock',13)} ${niceTime(state.start)}–${niceTime(state.end)}</span>
    <span>${ico('droplet',13)} ${risk===null?'—':risk+'%'} avg. precip. chance</span>
    <span class="signal-warning">${ico('alert',13)} ${risk===null?'—':wet} elevated-risk ${wet===1?'hour':'hours'}</span>
    <button class="signal-link" data-action="nav" data-value="planner">OPEN TRIP PLANNER ${ico('arrow',13)}</button>
  </div>`;
}
function mainBody(){const a=currentAssessment(),best=bestWindows()[0],current=state.forecast?.current,day=getDay(),hours=getHours(),{start,end}=readRange(),chance=a.maxRain;
  return `${head('Weather overview','A clearer picture of what the atmosphere has planned.',`<button class="outline-btn" data-action="nav" data-value="planner">${ico('calendar',15)} ${E(dateLabel(state.date))}</button><button class="primary-btn" data-action="refresh">${ico('refresh',15)} Refresh data</button>`)}${errorBanner()}
  <div class="cards">${metric('CURRENT TEMPERATURE',current?ctemp(current.temperature_2m):'—',current?`Feels like ${ctemp(current.apparent_temperature)} ${tempUnit().replace('°','')}`:'Live reading pending','sun')}${metric('PEAK PRECIP. PROBABILITY',chance!==null?`${chance}%`:'—',`${niceTime(start)}–${niceTime(end)} · selected window`,'droplet',chance>=55?'amber':'blue')}${metric('WIND SPEED',current?`${fixed(current.wind_speed_10m)} km/h`:'—','Current model estimate','wind')}${metric('DAYTIME HIGH',day?ctemp(day.max):'—',`${E(dateLabel(state.date))} forecast`,'cloud')}</div>
  ${forecastSignal(hours)}
  <div class="grid-top"><section class="panel weather-hero"><div class="hero-copy"><p class="hero-kicker"><span class="hero-frequency"></span> ${state.demo?'DEMO WEATHER':isStale()?'LAST KNOWN WEATHER':'CURRENT WEATHER'} <span class="hero-kicker-line"></span></p><div class="hero-city">${E(state.location.name)}<span class="hero-location-pin">${ico('pin',15)}</span></div><div class="hero-condition">${current?weatherName(current.weather_code):'Connecting to weather network'} · ${E(state.location.admin1||state.location.country||'')}</div><div class="hero-temp">${current?ctemp(current.temperature_2m):'--°'}</div><div class="hero-feels">Feels like ${current?ctemp(current.apparent_temperature):'—'} <span class="hero-separator">/</span> ${current?fixed(current.relative_humidity_2m)+'% humidity':'—'}</div><span class="hero-tag"><i></i>${state.demo?'SHOWCASE SCENARIO':isStale()?'STALE · REFRESH REQUIRED':state.forecast?'WEATHER DATA CONNECTED':'AWAITING DATA'}</span><div class="hero-micro">WX · ATMOSPHERIC INTELLIGENCE</div></div>${weatherArt(current?.weather_code??3)}</section>
  <section class="panel risk-panel"><div class="panel-head"><div><div class="panel-label">How your plan looks</div><div class="panel-sub">Weather for your chosen hours</div></div>${ico('shield',16)}</div>${riskGauge(a)}<div class="score-pill ${a.status}">${ico('radar',14)} ${a.status==='unknown'?'AWAITING FORECAST':statusName(a.status)}</div><div class="risk-scale"><span>LOW SUITABILITY</span><span>HIGH SUITABILITY</span></div></section>
  <section class="panel window-panel"><div class="panel-head"><div><div class="panel-label">Best weather window</div><div class="panel-sub">Top 3-hour period · ${E(dateLabel(state.date))}</div></div>${ico('clock',16)}</div><div class="window-card"><div class="window-time">${best?`${niceTime(best.start)} – ${niceTime(best.end)}`:'Unavailable'}</div><div class="window-caption">${best?`${fixed(best.avgRain)}% average rain probability`:'Waiting for hourly forecast'}</div><div class="window-badge ${best?.status||''}">${ico('check',13)} ${best?statusName(best.status):'NO DATA'}</div></div><div class="quick-facts"><div class="quick-fact"><small>MAX RAIN RISK</small><strong>${best?best.maxRain+'%':'—'}</strong></div><div class="quick-fact"><small>PRECIPITATION</small><strong>${best?fixed(best.total,1)+' mm':'—'}</strong></div></div><button class="text-button" data-action="nav" data-value="planner">Explore the day →</button></section></div>
  <div class="grid-middle"><section class="panel chart-panel"><div class="panel-head"><div><div class="panel-label">Rain and snow forecast</div><div class="panel-sub">Hourly forecast · ${E(dateLabel(state.date))} · ${state.demo?'illustration':'Open-Meteo forecast'}</div></div><div class="tabs"><button class="tab ${state.chartMode==='probability'?'active':''}" data-action="chart" data-value="probability">Probability</button><button class="tab ${state.chartMode==='rainfall'?'active':''}" data-action="chart" data-value="rainfall">Amount (mm)</button></div></div><div class="chart-wrap">${renderMainChart(hours)}</div>${hourlyTable(hours)}<div class="legend"><span><i></i>${state.chartMode==='probability'?'Precipitation probability (%)':'Precipitation (mm)'}</span><span>${ico('info',12)} Intervals start at shown hour</span></div></section>
  <section class="panel timeline-panel"><div class="panel-head"><div><div class="panel-label">Rain and snow through the day</div><div class="panel-sub">Hourly rain probability · 8 AM–8 PM</div></div>${ico('chart',16)}</div>${hours.length?renderHourlyBars(hours):'<div class="empty-state">No chart data</div>'}<div class="timeline-footer"><div class="tiny-stat"><span>High risk hours</span><strong>${hours.filter(h=>h.hour>=8&&h.hour<=20&&h.rain>=55).length}<em>hours</em></strong></div><div class="tiny-stat"><span>Forecast total</span><strong>${fixed(day?.rainSum,1)}<em>mm</em></strong></div><div class="tiny-stat"><span>Peak rain</span><strong>${day?.maxRain??'—'}<em>%</em></strong></div></div></section></div>
  <div class="grid-bottom"><section class="panel watch-panel"><div class="panel-head"><div><div class="panel-label">Monitored activities</div><div class="panel-sub">Your upcoming outdoor plans</div></div><button class="text-button" data-action="nav" data-value="watches">Manage watches →</button></div>${watchTable()}</section>${intelligencePanel()}</div>
  <div class="footer-row"><span>ATMOS • Weather data by <a href="https://open-meteo.com/" class="tiny-link" target="_blank" rel="noopener">Open-Meteo</a> • Non-commercial demonstration</span><span>${state.demo?'DEMO / NOT LIVE DATA':state.fetchedAt?'Provider fetched '+new Date(state.fetchedAt).toLocaleTimeString('en-CA',{timeZone:state.forecast?.timezone||'America/Toronto',timeZoneName:'short'}):'Awaiting live weather data'} · All times local to forecast location</span></div>`;
}
function watchTable(){if(!state.watches.length)return '<div class="small-empty">No saved activities yet. Create one in Trip Planner.</div>';return `<div style="overflow-x:auto"><table class="watch-table"><thead><tr><th>LOCATION / ACTIVITY</th><th>DATE</th><th>TIME</th><th>STATUS</th></tr></thead><tbody>${state.watches.slice(0,4).map(w=>{const snapshot=snapshots.get(locationKey(w));const forecast=state.demo?null:snapshot?.forecast;const available=forecast&&!watchErrors.has(locationKey(w))&&Date.now()-Date.parse(snapshot.fetchedAt)<1800000;const selected=available?completeWindow(hoursForDay(forecast,w.date),w.start,w.end):[];const r=selected.length?assess(selected,w.activity):{status:'neutral'};return `<tr><td><span class="loc-name"><span class="loc-icon">${ico('pin',13)}</span><span>${E(w.place)}<br><small class="muted">${E(w.activity)}</small></span></span></td><td>${E(dateLabel(w.date,{month:'short',day:'numeric'}))}</td><td>${niceTime(w.start)}–${niceTime(w.end)}</td><td><span class="tag ${r.status==='go'?'':r.status==='caution'?'caution':r.status==='no-go'?'no-go':'neutral'}">${r.status==='neutral'?'NOT LOADED':statusName(r.status)}</span></td></tr>`;}).join('')}</tbody></table></div>`;}
function errorBanner(){return state.error||isStale()?`<div class="error-banner"><span>${ico('alert',16)} ${state.forecast?'We could not update the weather. The forecast shown may be out of date. Refresh it before deciding.':'We could not load the weather. Check your connection and try again.'}</span><div class="head-actions"><button data-action="refresh">Retry</button><button data-action="demo">View labelled demo</button></div></div>`:state.forecast&&!getDates().includes(state.date)?`<div class="error-banner" role="status">We do not have a forecast for ${E(dateLabel(state.date))}. Forecasts are available from ${E(dateLabel(getDates()[0]))} to ${E(dateLabel(getDates().at(-1)))}. Choose another date in Trip Planner.</div>`:'';}
function hourlyTable(hours){return `<details class="hourly-data"><summary>View hourly measurements</summary><div><table><caption>${E(state.forecast?.timezone||state.location.timezone)} · Precipitation covers the hour beginning at the listed time. Includes rain, showers and snow water equivalent.</caption><thead><tr><th scope="col">Hour</th><th scope="col">Probability</th><th scope="col">Amount</th><th scope="col">Temperature</th><th scope="col">Gusts</th></tr></thead><tbody>${hours.map(h=>`<tr><td>${fmtHour(h.time)} ${E(h.offset)}</td><td>${fixed(h.rain)}%</td><td>${fixed(h.amount,1)} mm</td><td>${ctemp(h.temp)} ${tempUnit()}</td><td>${fixed(h.gust)} km/h</td></tr>`).join('')}</tbody></table></div></details>`;}
function dateStrip(){return `<div class="date-strip">${getDates().map(d=>{const idx=getDayIndex(d),day=state.forecast?.daily;return `<button class="date-pill ${d===state.date?'active':''}" data-action="date" data-value="${d}"><small>${E(dateLabel(d,{weekday:'short',month:'short',day:'numeric'}))}</small><strong>${day?ctemp(day.temperature_2m_max[idx]):'—'}</strong><small>${day?fixed(day.precipitation_probability_max[idx])+'% precip.':'—'}</small></button>`;}).join('')}</div>`;}
function renderForecast(){const hours=getHours(),wet=rainWindows(),day=getDay();return `${head('Forecast analysis','Zoom into any day, track precipitation windows and compare hourly conditions.',`<button class="primary-btn" data-action="refresh">${ico('refresh',14)} Update forecast</button>`)}${errorBanner()}<section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">16-day forecast monitor</div><div class="panel-sub">Select a day to inspect conditions</div></div>${ico('calendar')}</div>${dateStrip()}</section><div class="grid-middle" style="margin-top:13px"><section class="panel chart-panel"><div class="panel-head"><div><div class="panel-label">Detailed precipitation timeline</div><div class="panel-sub">${E(dateLabel(state.date))} · source: ${state.demo?'demonstration':'Open-Meteo'}</div></div><div class="tabs"><button class="tab ${state.chartMode==='probability'?'active':''}" data-action="chart" data-value="probability">Probability</button><button class="tab ${state.chartMode==='rainfall'?'active':''}" data-action="chart" data-value="rainfall">Amount (mm)</button></div></div><div class="chart-wrap">${renderMainChart(hours)}</div>${hourlyTable(hours)}</section><section class="panel timeline-panel"><div class="panel-head"><div><div class="panel-label">Weather summary</div><div class="panel-sub">Daily metrics</div></div>${ico('sun')}</div><div class="quick-facts" style="grid-template-columns:1fr 1fr;margin-top:24px">${[['High / low',day?`${ctemp(day.max)} / ${ctemp(day.min)}`:'—'],['Peak rain risk',day?`${fixed(day.maxRain)}%`:'—'],['Expected rain',day?`${fixed(day.rainSum,1)} mm`:'—'],['Wind speed max',day?`${fixed(day.wind)} km/h`:'—'],['Sunrise',day?.sunrise?.slice(11)||'—'],['Sunset',day?.sunset?.slice(11)||'—']].map(([k,v])=>`<div class="quick-fact"><small>${E(k)}</small><strong>${E(v)}</strong></div>`).join('')}</div></section></div><section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">Rain windows detected</div><div class="panel-sub">Consecutive hours ≥40% rain probability or ≥0.2 mm forecast precipitation</div></div>${ico('droplet')}</div>${!hours.length?'<p class="small-empty">Connect to live forecast data to inspect windows.</p>':wet.length?`<div class="ranked-slots">${wet.map(w=>`<div class="slot"><span class="tag caution">RAIN WINDOW</span><strong>${niceTime(w.start)} – ${niceTime(w.end)}</strong><small>Peak ${w.maxRain}% chance · ${fixed(w.amount,1)} mm total</small></div>`).join('')}</div>`:'<p class="small-empty">No hours currently pass the rain-window threshold for this date.</p>'}</section>`;}
function planner(){const a=currentAssessment(),best=bestWindows(),hours=getHours(),g=planGuidance(),{start,end}=readRange();return `${head('Trip planner','Choose a good time for your next outing.',`<button class="primary-btn" data-action="save-watch">${ico('plus',14)} Save weather watch</button>`)}${errorBanner()}<section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">Your plan</div><div class="panel-sub">Choose your date, activity and times</div></div>${ico('sliders')}</div><div class="form-row"><div class="field"><label for="plan-date">Date</label><input id="plan-date" type="date" data-change="date" value="${E(state.date)}" /></div><div class="field"><label for="plan-activity">Activity</label><select id="plan-activity" data-change="activity">${['Waterfall hike & picnic','Hiking','Picnic','Cycling','Photography','Running','Outdoor event'].map(x=>`<option ${x===state.activity?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label for="plan-start">Start time</label><select id="plan-start" data-change="start">${Array.from({length:14},(_,i)=>i+6).map(x=>`<option value="${x}" ${x===start?'selected':''}>${niceTime(x)}</option>`).join('')}</select></div><div class="field"><label for="plan-end">End time</label><select id="plan-end" data-change="end">${Array.from({length:15},(_,i)=>i+7).map(x=>`<option value="${x}" ${x===end?'selected':''}>${niceTime(x)}</option>`).join('')}</select></div></div><p class="micro-note">Monitoring ${E(state.location.name)} · ${E(state.forecast?.timezone||state.location.timezone||'local time')} · Times are local to this place. A 10 AM–6 PM plan ends at 6 PM. Search above to change location.</p></section><div style="height:13px"></div><div class="recommendation-large"><div><span class="tag ${a.status==='caution'?'caution':a.status==='no-go'?'no-go':''}">${a.status==='unknown'?'NOT READY':statusName(a.status)}</span><h2>${E(g.summary)}</h2>${guidanceDetails(g)}</div><div class="gauge" style="flex-shrink:0">${riskGauge(a)}</div></div><div style="height:13px"></div><section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">Best three-hour options</div><div class="panel-sub">Compare these times, and check local warnings before you go.</div></div>${ico('compass')}</div>${hours.length?`<div class="ranked-slots">${best.slice(0,3).map((b,i)=>`<div class="slot"><span class="tag ${b.status==='caution'?'caution':b.status==='no-go'?'no-go':''}">#${i+1} ${statusName(b.status)}</span><strong>${niceTime(b.start)} – ${niceTime(b.end)}</strong><small>Score ${b.score}/100 · peak rain ${b.maxRain}% · ${fixed(b.total,1)} mm</small></div>`).join('')}</div>`:'<p class="small-empty">No hourly forecast loaded.</p>'}</section>`;}
function watches(){return `${head('Weather watchlist','Saved plans and days you want to keep an eye on.',`<button class="primary-btn" data-action="nav" data-value="planner">${ico('plus',14)} Plan another activity</button>`)}<div class="section-banner"><div><h3>Updates to your saved plans</h3><p>ATMOS checks every saved location while this tab is open. Your watches are stored in this browser. Always recheck trail advisories before leaving.</p></div><span class="status-chip ${state.demo?'demo':''}">${state.demo?'DEMO DATA':'LOCAL WATCHES'}</span></div><section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">${state.watches.length} saved activities</div><div class="panel-sub">All watch entries</div></div>${ico('eye')}</div>${state.watches.length?state.watches.map(w=>`<div class="setting-row"><div><strong>${E(w.place)} · ${E(w.activity)}</strong><p>${E(dateLabel(w.date,{weekday:'long',month:'long',day:'numeric',year:'numeric'}))} · ${niceTime(w.start)}–${niceTime(w.end)}</p></div><button class="outline-btn" data-action="delete-watch" data-value="${E(w.id)}">${ico('trash',14)} Remove</button><button class="outline-btn" data-action="open-watch" data-value="${E(w.id)}">Open plan</button></div>`).join(''):'<div class="small-empty">No saved watches. Open Trip Planner to create one.</div>'}</section>`;}
function alerts(){return `${head('Weather updates','See what has changed for your saved plans.',`<button class="outline-btn" data-action="clear-alerts">${ico('trash',14)} Clear history</button>`)}<div class="section-banner"><div><h3>${state.notices.length} recorded alerts</h3><p>Updates appear while this tab is open. ATMOS does not send emails or official weather warnings. Check your local weather service for urgent alerts.</p></div>${ico('bell',25)}</div><section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">Alert activity</div><div class="panel-sub">This browser · newest first</div></div>${ico('radar')}</div><div class="alert-list">${state.notices.length?state.notices.map(x=>`<div class="alert-card"><div class="alert-icon">${ico(x.type==='caution'?'alert':'info',16)}</div><div><strong>${E(x.message)}</strong><p>Your forecast has changed</p><small>${new Date(x.at).toLocaleString()}</small></div></div>`).join(''):'<div class="small-empty">No changes to report yet. We will show an update here when the forecast changes enough to affect your plan.</div>'}</div></section>`;}
function settings(){return `${head('Settings','Make ATMOS work the way you like.')}<section class="panel wide-panel"><div class="panel-head"><div><div class="panel-label">Your preferences</div><div class="panel-sub">Saved in this browser</div></div>${ico('settings')}</div><div class="setting-row"><div><strong>Temperature units</strong><p>Change the displayed temperature scale.</p></div><select id="setting-unit" aria-label="Temperature units" data-change="unit"><option value="C" ${state.unit==='C'?'selected':''}>Celsius (°C)</option><option value="F" ${state.unit==='F'?'selected':''}>Fahrenheit (°F)</option></select></div><div class="setting-row"><div><strong>Automatic refresh</strong><p>Check for new forecasts while this tab is open. The weather forecast may not change each time.</p></div><select id="setting-refresh" aria-label="Automatic refresh" data-change="refresh-minutes"><option value="5" ${state.refreshMinutes===5?'selected':''}>Every 5 minutes</option><option value="10" ${state.refreshMinutes===10?'selected':''}>Every 10 minutes</option><option value="30" ${state.refreshMinutes===30?'selected':''}>Every 30 minutes</option></select></div><div class="setting-row"><div><strong>Browser notifications</strong><p>Get a notification when the forecast changes for your plan. Keep this tab open and allow notifications.</p></div><button class="outline-btn" data-action="notifications">${ico('bell',14)} ${state.notify?'Enabled':'Request permission'}</button></div><div class="setting-row"><div><strong>Atmospheric animations</strong><p>Turn moving weather effects on or off. Your device’s reduced-motion setting is always respected.</p></div><button class="outline-btn" data-action="ambient-toggle">${ico('sparkles',14)} ${state.ambient?'On · turn off':'Off · turn on'}</button></div><div class="setting-row"><div><strong>Demo data</strong><p>Explore the dashboard with sample weather. Demo values are made up and should not be used to plan an outing.</p></div><button class="outline-btn" data-action="${state.demo?'live':'demo'}">${state.demo?'Return to live data':'Show demo view'}</button></div><div class="setting-row"><div><strong>ATMOS Intelligence</strong><p>Clear guidance is included with your forecast. No extra setup is needed.</p></div><span class="page-chip">Included</span></div></section><div style="height:13px"></div><section class="panel wide-panel"><div class="panel-label">About the weather</div><p class="micro-note">Forecast and geocoding data © <a class="tiny-link" href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>. The animated artwork is decorative. Forecasts and plan scores help you compare options, but cannot promise a safe outing. Check official weather warnings and trail closures before leaving.</p></section>`;}
function render(){const root=$('#app');if(!root)return;const focused=document.activeElement;const focusId=focused?.id;const action=focused?.dataset.action;const value=focused?.dataset.value;
  const body=state.view==='overview'?mainBody():state.view==='forecast'?renderForecast():state.view==='planner'?planner():state.view==='watches'?watches():state.view==='alerts'?alerts():settings();
  root.innerHTML=`<div class="shell ${state.ambient?'ambient-on':'ambient-off'}">${renderSidebar()}<main class="main">${renderTopbar()}<div class="content" id="main-content" tabindex="-1">${body}</div></main></div>`;
  updateClock();
  if(focusId)document.getElementById(focusId)?.focus();else if(action){[...document.querySelectorAll('[data-action]')].find(el=>el.dataset.action===action&&el.dataset.value===value)?.focus();}
}
function updateClock(){const clock=$('#liveClock');if(clock)clock.textContent=new Intl.DateTimeFormat('en-CA',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:state.forecast?.timezone||state.location.timezone||'America/Toronto',timeZoneName:'short'}).format(new Date());}
let debounceTimer;
async function citySearch(query){const node=$('#searchResults');if(!node)return;if(query.trim().length<2){node.classList.add('hide');return;}
  node.classList.remove('hide');node.innerHTML='<div class="search-hint">Looking up cities...</div>';
  try{const response=await fetch('/api/search?q='+encodeURIComponent(query));const data=await response.json();if(!response.ok)throw Error(data.error||'Search unavailable');if($('#searchInput')?.value!==query)return;state.searchMatches=data.results||[];node.innerHTML=state.searchMatches.length?state.searchMatches.map((x,i)=>`<button class="search-result" data-action="select-location" data-value="${i}"><span>${E(x.name)}<br><small>${E([x.admin1,x.country].filter(Boolean).join(', '))}</small></span>${ico('arrow',13)}</button>`).join(''):'<div class="search-hint">No matching locations found.</div>';
  }catch(err){if($('#searchInput')?.value!==query)return;node.innerHTML=`<div class="search-hint">${E(err.message)}</div>`;}}
async function askAI(){if(currentAssessment().status==='unknown'||state.aiLoading)return;state.aiLoading=true;state.aiLabel=null;render();const context=JSON.stringify([state.location,state.date,state.start,state.end,state.activity,state.demo,state.fetchedAt]);const a=currentAssessment();try{
  const response=await fetch('/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({place:state.location.name,date:state.date,activity:state.activity,timeWindow:`${niceTime(state.start)}–${niceTime(state.end)}`,verdict:statusName(a.status),metrics:{rainProbabilityPeak:a.maxRain,averageRainProbability:Math.round(a.avgRain),expectedRainMm:Number(a.total.toFixed(2)),maximumWindGustKmh:Math.round(a.maxWind),thunderstormForecast:a.thunder,bestWindow:bestWindows()[0]||null}})});
  const data=await response.json();if(!response.ok)throw Error(data.error||'AI unavailable');if(context!==JSON.stringify([state.location,state.date,state.start,state.end,state.activity,state.demo,state.fetchedAt]))return;state.aiText=data.advice;state.aiLabel='Your extra guidance is ready.';
 }catch(e){if(context!==JSON.stringify([state.location,state.date,state.start,state.end,state.activity,state.demo,state.fetchedAt]))return;state.aiText=null;state.aiLabel='Your forecast guidance is ready above.';}finally{state.aiLoading=false;render();}}
function saveWatch(){if(state.demo){toast('Switch to live mode before saving a weather watch.');return;}if(state.watches.length>=30){toast('Remove an old watch before adding another (30 maximum).');return;}const id='watch-'+Date.now();const w={id,place:[state.location.name,state.location.admin1].filter(Boolean).join(', '),lat:state.location.latitude,lon:state.location.longitude,timezone:state.location.timezone,date:state.date,activity:state.activity,start:state.start,end:state.end};if(state.watches.some(x=>x.lat===w.lat&&x.lon===w.lon&&x.date===w.date&&x.start===w.start&&x.end===w.end&&x.activity===w.activity)){toast('This exact watch is already saved.');return;}state.watches.unshift(w);save('atmos.watches',state.watches);toast('Weather watch saved to this browser.');render();}
async function handleAction(el){const act=el.dataset.action,val=el.dataset.value;
 if(act==='nav'){state.view=val;render();document.querySelector('h1')?.focus();return;}
 if(act==='open-watch'){const w=state.watches.find(w=>w.id===val);if(!w)return;state.location={name:w.place.split(",")[0],admin1:w.place.split(",").slice(1).join(",").trim(),latitude:w.lat,longitude:w.lon,timezone:w.timezone||'America/Toronto'};state.date=w.date;state.start=w.start;state.end=w.end;state.activity=w.activity;state.demo=false;history.replaceState(null,'',location.pathname);state.forecast=null;state.fetchedAt=null;state.view='planner';save('atmos.location',state.location);await loadForecast();return;}
 if(act==='ambient-toggle'){state.ambient=!state.ambient;save('atmos.ambient',state.ambient);render();toast(state.ambient?'Ambient effects enabled.':'Ambient effects disabled.');return;}
 if(act==='refresh'){if(state.demo)toast('Demo mode is on. Switch to live data in Settings.');else await loadForecast();return;}
 if(act==='demo'){state.demo=true;state.aiText=null;await loadForecast();toast('Demo mode: all values are fictional and clearly labelled.');return;}
 if(act==='live'){state.demo=false;state.forecast=null;state.fetchedAt=null;history.replaceState(null,'',location.pathname);await loadForecast();toast('Live weather mode requested.');return;}
 if(act==='date'){state.date=val;state.aiText=null;render();return;}
 if(act==='chart'){state.chartMode=val;render();return;}
 if(act==='ai'){await askAI();return;}
 if(act==='save-watch'){saveWatch();return;}
 if(act==='delete-watch'){state.watches=state.watches.filter(w=>w.id!==val);save('atmos.watches',state.watches);render();return;}
 if(act==='clear-alerts'){state.notices=[];save('atmos.notices',[]);render();return;}
 if(act==='select-location'){const match=state.searchMatches[Number(val)];if(!match)return;state.location=match;state.aiText=null;state.demo=false;history.replaceState(null,'',location.pathname);save('atmos.location',match);state.forecast=null;state.fetchedAt=null;await loadForecast();toast('Now monitoring '+match.name);return;}
 if(act==='notifications'){if(!('Notification' in window)){toast('Browser notifications are not supported here.');return;}const permission=await Notification.requestPermission();state.notify=permission==='granted';toast(state.notify?'Notifications enabled for this open tab.':'Notification permission not granted.');render();return;}
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el){e.preventDefault();handleAction(el);}else if(!e.target.closest('.searchbox'))$('#searchResults')?.classList.add('hide');});
document.addEventListener('input',e=>{if(e.target.id==='searchInput'){clearTimeout(debounceTimer);const q=e.target.value;debounceTimer=setTimeout(()=>citySearch(q),350);}});
document.addEventListener('change',e=>{const element=e.target,which=element.dataset.change,value=element.value;if(!which)return;
 if(which==='date'){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return;state.date=value;state.aiText=null;state.aiLabel=null;}
 if(which==='activity'){state.activity=value;state.aiText=null;state.aiLabel=null;}
 if(which==='start'){state.start=Math.min(Number(value),state.end-1);state.aiText=null;state.aiLabel=null;}
 if(which==='end'){state.end=Math.max(Number(value),state.start+1);state.aiText=null;state.aiLabel=null;}
 if(which==='unit'){state.unit=value;save('atmos.units',value);}
 if(which==='refresh-minutes'){state.refreshMinutes=Number(value);save('atmos.refreshMinutes',state.refreshMinutes);}
 render();});
function showChartInspector(target){
  const element=target?.closest?.('[data-chart-hour]');
  const tooltip=$('#chartFloating');
  if(!tooltip||!element)return;
  tooltip.hidden=false;
  tooltip.innerHTML=`<span class="chart-inspector-time">${E(element.dataset.chartHour)}</span><strong>${E(element.dataset.chartRain)}% <small>rain chance</small></strong><span>${E(element.dataset.chartMm)} mm forecast precipitation</span>`;
  tooltip.style.left=`${Math.max(12,Math.min(80,Number(element.dataset.chartX)))}%`;
  tooltip.style.top=`${Math.max(5,Number(element.dataset.chartY)-17)}%`;
  document.querySelectorAll('.chart-hit.active').forEach(x=>x.classList.remove('active'));
  element.classList.add('active');
}
document.addEventListener('pointerover',event=>showChartInspector(event.target));
document.addEventListener('focusin',event=>showChartInspector(event.target));
document.addEventListener('pointerout',event=>{
  if(event.target?.closest?.('.chart-hit')){
    const tip=$('#chartFloating');if(tip)tip.hidden=true;
    document.querySelectorAll('.chart-hit.active').forEach(x=>x.classList.remove('active'));
  }
});
document.addEventListener('focusout',event=>{
 if(event.target?.closest?.('.chart-hit')){const tip=$('#chartFloating');if(tip)tip.hidden=true;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#searchResults')?.classList.add('hide');if(e.key==='ArrowDown'&&e.target.id==='searchInput'){$('.search-result')?.focus();e.preventDefault();}});
function start(){render();loadForecast();setInterval(updateClock,30000);setInterval(()=>{if(!state.demo&&document.visibilityState==='visible'&&Date.now()-(new Date(state.fetchedAt||0)).getTime()>=state.refreshMinutes*60*1000)loadForecast({quiet:true});},60000);}
start();
