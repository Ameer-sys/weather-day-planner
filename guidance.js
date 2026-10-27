// Plain-language presentation of the existing weather assessment; no network or AI required.
const hourLabel=h=>`${h%12||12} ${h%24<12?'AM':'PM'}`;
export function guidanceForPlan({assessment, best, activity='', hours=[], stale=false}={}) {
  if(stale||!assessment||assessment.status==='unknown')return {
    status:'unknown',summary:stale?'Refresh the forecast before you decide.':'We need a forecast for your plan.',
    reason:stale?'The weather shown may be out of date. Try refreshing it.':'Weather details are unavailable for these hours. Choose another date or try again.',
    time:null,timeNote:'We need an up-to-date forecast to suggest a time.',precautions:[]
  };
  const {status,maxWind,maxRain,total,thunder}=assessment;
  const extreme=hours.some(h=>h.temp>=35||h.temp<=-15);
  const cold=hours.some(h=>h.temp<=0||(h.weather>=71&&h.weather<=77)||(h.weather>=85&&h.weather<=86));
  const summary=status==='go'?'The weather looks good for your plan.':status==='caution'?'Your plan may be possible. Use caution.':'Choose another time for your plan.';
  const reason=thunder?'Thunderstorms are forecast during your outing.':extreme?'Very hot or cold weather could make this outing dangerous.':maxWind>=60?`Strong wind gusts of up to ${Math.round(maxWind)} km/h could make this outing dangerous.`:cold?'Ice or snow may make paths slippery.':maxRain>=55?'Rain or snow is likely during part of your outing.':total>=2?`About ${total.toFixed(1)} mm of rain or snow water is expected during your outing.`:maxWind>=35?`Strong wind may affect your outing, with gusts up to ${Math.round(maxWind)} km/h.`:status==='caution'?'Wet paths may make this outing more difficult.':'Little rain and lighter winds are expected during these hours.';
  const precautions=[];
  if(thunder)precautions.push('Avoid open areas and exposed trails during thunderstorms.');
  if(/waterfall/i.test(activity))precautions.push('Waterfall trails may be slippery. Check trail notices before you go.');
  else if(/hik(e|ing)/i.test(activity)&&status!=='go')precautions.push('Watch for slippery paths and check trail notices.');
  if(status==='no-go')precautions.push('Check local weather warnings and consider another day.');
  const suitable=best&&best.status!=='no-go'&&best.status!=='unknown';
  return {status,summary,reason,time:suitable?`${hourLabel(best.start)}–${hourLabel(best.end)}`:null,
    timeNote:suitable?(best.status==='caution'?'This time still needs caution.':'The most promising three-hour window today.'):'No suitable three-hour window is available. Check another day.',precautions};
}
