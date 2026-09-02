const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const styleNames={casual:'CASUAL',minimal:'MINIMAL',mode:'MODE',feminine:'FEMININE'};
const lookPairs={casual:{warm:6,cool:1},minimal:{warm:4,cool:2},mode:{warm:7,cool:8},feminine:{warm:5,cool:3}};
const signNames={aries:'おひつじ座',taurus:'おうし座',gemini:'ふたご座',cancer:'かに座',leo:'しし座',virgo:'おとめ座',libra:'てんびん座',scorpio:'さそり座',sagittarius:'いて座',capricorn:'やぎ座',aquarius:'みずがめ座',pisces:'うお座'};
let state={lat:35.6762,lon:139.6503,name:'Tokyo, Japan',weather:null,style:'casual'};

function weatherLabel(code){
  if(code===0)return['晴れ','☀️'];
  if([1,2].includes(code))return['晴れ時々くもり','🌤️'];
  if(code===3)return['くもり','☁️'];
  if([45,48].includes(code))return['霧','🌫️'];
  if([51,53,55,56,57,61,63,65,80,81,82].includes(code))return['雨','🌧️'];
  if([71,73,75,77,85,86].includes(code))return['雪','🌨️'];
  if([95,96,99].includes(code))return['雷雨','⛈️'];
  return['くもり','☁️'];
}
function effectiveFeels(feels){let v=feels;if($('#cold').value==='cold')v-=2;if($('#cold').value==='hot')v+=2;return v}
function chooseLook(feels=22){const pair=lookPairs[state.style];return pair[effectiveFeels(feels)>=24?'warm':'cool']}
function setLook(feels=22){
  const img=$('#outfitIllust');
  const look=chooseLook(feels);
  $('#outfitStyleTag').textContent=styleNames[state.style];
  img.classList.add('changing');
  setTimeout(()=>{img.src=`looks/look-${look}.webp`;img.classList.remove('changing')},90);
  $$('.style-chip').forEach(b=>b.classList.toggle('active',b.dataset.style===state.style));
}
function outfit(feels,rain,wind){
  const a=effectiveFeels(feels);let title,reason;
  if(a>=30){title='涼しいトップスで軽く';reason='かなり暑め。通気性と日差し対策を優先。'}
  else if(a>=25){title='半袖＋軽い羽織';reason='日中は半袖で快適。冷房対策に薄手の羽織を。'}
  else if(a>=20){title='長袖シャツがちょうどいい';reason='脱ぎ着しやすい一枚が今日の正解。'}
  else if(a>=15){title='薄手ニット＋ジャケット';reason='風があるとひんやり。軽い上着が安心。'}
  else{title='アウターをしっかり';reason='冷え込み対策を優先。'}
  if(wind>=8)reason+=' 風も強め。';
  if(rain>=50)reason+=' 雨に強い靴が◎。';
  return[title,reason];
}
function umbrella(rain){
  if(rain>=60)return['傘を持って ☂','今日はしっかり雨対策。'];
  if(rain>=30)return['折りたたみ傘','にわか雨に備えると安心。'];
  return['傘なしでOK','身軽にいけそう。'];
}
function render(d){
  state.weather=d;const c=d.current,x=d.daily;const r=x.precipitation_probability_max[0]??0;
  const [cond,ico]=weatherLabel(c.weather_code);const [ot,or]=outfit(c.apparent_temperature,r,c.wind_speed_10m/3.6);const [umb,umbSub]=umbrella(r);
  $('#temp').textContent=Math.round(c.temperature_2m);$('#condition').textContent=cond;$('#weatherIcon').textContent=ico;
  $('#rain').textContent=r+'%';$('#wind').textContent=(c.wind_speed_10m/3.6).toFixed(1)+' m/s';$('#feels').textContent=Math.round(c.apparent_temperature)+'°';
  $('#uv').textContent=x.uv_index_max?.[0]?.toFixed(1)??'--';$('#place').textContent='📍 '+state.name;
  $('#outfitTitle').textContent=ot;$('#outfitReason').textContent=or;$('#umbrella').textContent=umb;$('#umbrellaSub').textContent=umbSub;
  $('#weatherNote').textContent=`最高 ${Math.round(x.temperature_2m_max[0])}° / 最低 ${Math.round(x.temperature_2m_min[0])}°。${r>=50?'雨を見ながら、移動は少し余裕を。':'大きな雨の心配は少なめ。'}`;
  $('#daySummary').textContent=`最高 ${Math.round(x.temperature_2m_max[0])}° / 最低 ${Math.round(x.temperature_2m_min[0])}°。${r>=50?'傘と足元を忘れずに。':'身軽に動けそうな一日。'}`;
  $('#walkSub').textContent=r>=50?'今日は屋内寄り道がよさそう':'今日は散歩向き';
  setLook(c.apparent_temperature);renderHourly(d);
}
function renderHourly(d){
  const h=d.hourly,n=new Date();let s=h.time.findIndex(v=>new Date(v)>=new Date(n.getFullYear(),n.getMonth(),n.getDate(),n.getHours()));if(s<0)s=0;
  $('#hourly').innerHTML=h.time.slice(s,s+6).map((v,j)=>{const i=s+j,t=new Date(v);return `<div class="hour ${j===0?'now':''}"><small>${j===0?'NOW':t.getHours()+'時'}</small><i>${weatherLabel(h.weather_code[i])[1]}</i><b>${Math.round(h.temperature_2m[i])}°</b></div>`}).join('');
}
async function fetchWeather(){
  try{const u=`https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto&forecast_days=2`;const r=await fetch(u);render(await r.json())}
  catch{$('#condition').textContent='天気を取得できませんでした'}
}
async function reverse(lat,lon){try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=ja`);const d=await r.json();return d.address?.city||d.address?.ward||d.address?.town||d.address?.state||'現在地'}catch{return'現在地'}}
function locate(){navigator.geolocation?.getCurrentPosition(async p=>{state.lat=p.coords.latitude;state.lon=p.coords.longitude;state.name=await reverse(state.lat,state.lon);fetchWeather()},()=>showToast('位置情報を取得できませんでした'))}
function stars(n){return'★'.repeat(n)+'☆'.repeat(5-n)}
function fortune(){
  const s=$('#sign').value,d=new Date(),seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate()+s.length*17;
  const i=seed%5,score=68+(seed%27),work=3+(seed%3),love=2+((seed+1)%4),money=3+((seed+2)%3);
  const titles=['軽く動くほど運がひらく日。','小さな違和感がヒント。','寄り道に発見がありそう。','人より自分のペースが正解。','いつもと違う色を選んでみて。'];
  const texts=['考えすぎる前の一歩がちょうどいい。','気になったものを一枚写真に残すと、あとでつながりそう。','帰り道を少し変えるだけで気分が切り替わりそう。','予定を詰めすぎず、余白を残すと調子が出そう。','服か小物に一色だけ遊びを入れると気分も上向き。'];
  $('#signTag').textContent=signNames[s];$('#fortuneScore').textContent=score;$('#fortuneTitle').textContent=titles[i];$('#fortuneText').textContent=texts[i];
  $('#workLuck').textContent=stars(Math.min(work,5));$('#loveLuck').textContent=stars(Math.min(love,5));$('#moneyLuck').textContent=stars(Math.min(money,5));
}
function savePrefs(show=false){localStorage.setItem('soramoPrefs',JSON.stringify({sign:$('#sign').value,cold:$('#cold').value,style:state.style}));if(show)showToast('好みを更新したで ✦')}
function applyStyle(style,show=true){state.style=style;setLook(state.weather?.current?.apparent_temperature??22);if(state.weather)render(state.weather);savePrefs(show)}
function showToast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1300)}
function loadPrefs(){try{const p=JSON.parse(localStorage.getItem('soramoPrefs'));if(p){$('#sign').value=p.sign||'libra';$('#cold').value=p.cold||'normal';state.style=p.style||'casual'}}catch{}setLook();fortune()}

$$('.style-chip').forEach(b=>b.addEventListener('click',()=>applyStyle(b.dataset.style)));
$('#sign').addEventListener('change',()=>{fortune();savePrefs(true)});
$('#cold').addEventListener('change',()=>{state.weather&&render(state.weather);savePrefs(true)});
$('#locateBtn').addEventListener('click',locate);
$('#date').textContent=new Intl.DateTimeFormat('ja-JP',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
loadPrefs();fetchWeather();
