/* ============ RUMBO ============ */
const STORE_KEY = 'rumbo_v1';
const WORKER_URL = 'https://soft-silence-4fe6.rumboapp-oficial.workers.dev/';
let draftImportStages = [];   // etapas extraídas de un archivo importado
// Banco de frases = frases base del idioma + frases que la IA fue generando y guardando.
function getMotivBank(){
  const base = t('motiv') || [];
  let extra = [];
  try{
    const stored = (data.aiMotivBank && data.aiMotivBank[CURRENT_LANG]) || [];
    extra = Array.isArray(stored) ? stored : [];
  }catch(e){}
  return base.concat(extra);
}
function getMotiv(){ return getMotivBank(); }
let lastMotivShown = '';   // última frase elegida (para redibujar sin gastar otra)
// Elige una frase NUEVA evitando repetir hasta agotar el banco. Solo al marcar progreso.
function motivFor(done){
  const list = getMotivBank();
  if(list.length===0) return '';
  if(done<=0){ lastMotivShown=list[0]; return list[0]; }
  let picked;
  try{
    data._shown = data._shown || {};
    let shown = data._shown[CURRENT_LANG] || [];
    if(shown.length >= list.length) shown = [];           // reiniciar al agotar
    const avail = [];
    for(let i=0;i<list.length;i++) if(!shown.includes(i)) avail.push(i);
    const pick = avail.length ? avail[Math.floor(Math.random()*avail.length)] : ((done-1)%list.length);
    shown.push(pick);
    data._shown[CURRENT_LANG] = shown;
    save();
    picked = list[pick];
  }catch(e){
    picked = list[(done-1) % list.length];
  }
  lastMotivShown = picked;
  return picked;
}
// Muestra una frase SIN gastar una nueva (para redibujar el detalle).
function motivShow(done){
  if(lastMotivShown) return lastMotivShown;
  const list=getMotivBank();
  return list.length ? list[(Math.max(1,done)-1)%list.length] : '';
}
function getFinishMsg(){ return t('finishMsg'); }
const EMOJIS = ["🎯","📚","🏃","💪","🧠","💰","🎸","🎨","🧘","🌱","💻","✍️","🍎","💧","⭐","🔥"];
/* Unidades comunes para metas numéricas. v = valor guardado (vacío = sin unidad), k = clave i18n */
const UNITS = [
  {v:'',   k:'unitNone'},
  {v:'km', k:'unitKm'}, {v:'m', k:'unitM'}, {v:'pasos', k:'unitSteps'},
  {v:'páginas', k:'unitPages'}, {v:'capítulos', k:'unitChapters'}, {v:'palabras', k:'unitWords'},
  {v:'horas', k:'unitHours'}, {v:'minutos', k:'unitMinutes'},
  {v:'sesiones', k:'unitSessions'}, {v:'repeticiones', k:'unitReps'}, {v:'series', k:'unitSets'},
  {v:'litros', k:'unitLiters'}, {v:'vasos', k:'unitGlasses'}, {v:'calorías', k:'unitCalories'},
  {v:'€', k:'unitEuro'}, {v:'$', k:'unitDollar'}
];
/* Mostrar/ocultar el campo de unidad propia al cambiar el selector */
function onUnitChange(){
  const sel=document.getElementById('fUnitSel');
  const wrap=document.getElementById('unitOtherWrap');
  if(!sel||!wrap) return;
  wrap.style.display = sel.value==='__other__' ? '' : 'none';
  if(sel.value==='__other__'){ const fu=document.getElementById('fUnit'); if(fu) fu.focus(); }
}
/* Validar una unidad escrita a mano: corta, sin letras repetidas en cadena, sin símbolos raros */
function validateCustomUnit(raw){
  let u=String(raw||'').trim();
  if(!u) return {ok:false};
  if(u.length>16) return {ok:false};
  // 4+ letras iguales seguidas (kmmmm) -> inválido
  if(/(.)\1{3,}/.test(u)) return {ok:false};
  // permitir letras (con acentos), números, €, $, %, /, espacio y . -
  if(!/^[\p{L}0-9€$%./\- ]+$/u.test(u)) return {ok:false};
  // al menos una letra o un símbolo de moneda
  if(!/[\p{L}€$%]/u.test(u)) return {ok:false};
  return {ok:true, value:u};
}
// Modern line icons (Lucide-style). Usage: icon('name')
const ICONS = {
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  note:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  message:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus:'<line x1="5" y1="12" x2="19" y2="12"/>',
  chevronLeft:'<polyline points="15 18 9 12 15 6"/>',
  chevronRight:'<polyline points="9 18 15 12 9 6"/>',
  trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  calClock:'<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="18" cy="18" r="4"/><path d="M18 16.5V18l1 1"/>',
  hash:'<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  pen:'<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  undo:'<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>'
};
function icon(name,size){
  const s=size||18;
  return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`;
}

let data = { goals: [], settings:{ theme:'light', notif:false } };
let currentGoalId = null;
let draftType = 'days';
let draftEmoji = '🎯';
let draftFreq = 'daily';           // 'daily' | 'weekly' | 'manual'
let draftWeekdays = [];            // 0=Dom ... 6=Sáb
let draftManualDates = [];         // ISO strings
let draftStart = '';               // fecha de inicio en edición
let draftCount = 30;               // cantidad de etapas en edición
let aiPlanMode = false;            // true cuando las etapas vienen de la IA (no de importar archivo)

/* ---------- storage ---------- */
function load(){
  try{ const raw=localStorage.getItem(STORE_KEY); if(raw) data=JSON.parse(raw); }catch(e){}
  if(!data.settings) data.settings={theme:'light',notif:false};
  if(!data.goals) data.goals=[];
  if(!Array.isArray(data.trophies)) data.trophies=[];
  backfillTrophies();   // dar trofeo a metas que ya estaban completas antes de esta función
  cleanupBank();   // depurar frases malas que se hayan guardado antes
}
// Crea trofeos retroactivos para metas ya completadas al 100%
function backfillTrophies(){
  let changed=false;
  data.goals.forEach(g=>{
    const pct=goalProgress(g).pct;
    if(pct===100){
      g.celebrated=true;   // no volver a lanzar la celebración por una vieja
      if(!data.trophies.some(tr=>tr.goalId===g.id)){
        data.trophies.push({goalId:g.id,title:g.title,emoji:g.emoji||'🎯',type:g.type,date:g.endDate||todayISO()});
        changed=true;
      }
    }
  });
  if(changed){ try{ save(); }catch(e){} }
}
// Revisa el banco de frases IA y quita las que ya no pasan el filtro de calidad
function cleanupBank(){
  if(!data.aiMotivBank) return;
  let changed=false;
  Object.keys(data.aiMotivBank).forEach(lang=>{
    const arr = data.aiMotivBank[lang];
    if(!Array.isArray(arr)) return;
    const clean = arr.filter(f=>{
      const c = cleanMotivMsg(f, '');
      return c && c===f && looksRightLanguage(f, lang);
    });
    if(clean.length !== arr.length){ data.aiMotivBank[lang]=clean; changed=true; }
  });
  if(changed){ try{ save(); }catch(e){} }
}
function save(){ try{ localStorage.setItem(STORE_KEY,JSON.stringify(data)); }catch(e){ toast(t('toastNoSpace')); } if(typeof cloudSync==='function') cloudSync(); }

/* ---------- helpers ---------- */
function uid(){ return 'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function pad2(n){ return (n<10?'0':'')+n; }
// Build a LOCAL date object from an ISO yyyy-mm-dd string (no UTC conversion)
function parseISO(iso){ const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d); }
// Convert a local Date to yyyy-mm-dd (no UTC conversion)
function toISO(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function todayISO(){ return toISO(new Date()); }
function fmtDate(iso){
  if(!iso) return '';
  return parseISO(iso).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
}
function fmtDateShort(iso){
  if(!iso) return '';
  return parseISO(iso).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}
function addDays(iso,n){ const d=parseISO(iso); d.setDate(d.getDate()+n); return toISO(d); }
function weekdayOf(iso){ return parseISO(iso).getDay(); }
// Generate an array of ISO dates given frequency settings
function genDates(start,count,freq,weekdays){
  const out=[];
  if(freq==='weekly' && weekdays && weekdays.length){
    let cursor=start, guard=0;
    while(out.length<count && guard<4000){
      if(weekdays.includes(weekdayOf(cursor))) out.push(cursor);
      cursor=addDays(cursor,1); guard++;
    }
  } else { // daily
    for(let i=0;i<count;i++) out.push(addDays(start,i));
  }
  return out;
}
// Días de la semana desde el idioma activo
function WD_LABEL(i){ return t('weekdays')[i]; }
function WD_FULL_NAME(i){ return t('weekdaysFull')[i]; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
// Pone en mayúscula la primera letra (para mostrar el nombre del logro con estilo). No afecta a alfabetos sin mayúsculas.
function capFirst(s){ s=String(s||'').trim(); return s ? s.charAt(0).toLocaleUpperCase()+s.slice(1) : s; }

function goalProgress(g){
  if(g.type==='number'){
    const pct = g.target>0 ? Math.min(100,Math.round(g.current/g.target*100)) : 0;
    return {pct, done:g.current, total:g.target};
  } else {
    const done = g.days.filter(d=>d.done).length;
    const total = g.days.length;
    const pct = total>0 ? Math.round(done/total*100) : 0;
    return {pct, done, total};
  }
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg){
  const el=document.getElementById('toast');
  el.innerHTML=''; el.textContent=msg; el.classList.remove('progress'); el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2200);
}
// Toast especial con porcentaje grande + mensaje motivador (para cuando marcas progreso)
function progressToast(pct, msg){
  const el=document.getElementById('toast');
  el.classList.add('progress');
  el.innerHTML=`<span class="pt-pct">${pct}%</span><span class="pt-msg">${esc(msg)}</span>`;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),5600);
}

/* ---------- navigation ---------- */
/* show(view) está definido más abajo (maneja también las pantallas de cuenta) */

/* ---------- ring svg ---------- */
function ring(pct,size,stroke){
  const r=(size-stroke)/2, c=2*Math.PI*r, off=c-(pct/100)*c;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent-soft)" stroke-width="${stroke}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)"/>
  </svg>`;
}

/* ---------- HOME ---------- */
function renderHome(){
  const el=document.getElementById('homeContent');
  if(data.goals.length===0){
    el.innerHTML=`<div class="empty">
      <div class="big">🎯</div>
      <h3>${t('emptyTitle')}</h3>
      <p>${t('emptyDesc')}</p>
      <div class="empty-arrow">↓</div>
    </div>`;
    return;
  }
  // overall: cuántas metas completadas del total (sin promediar porcentajes de metas distintas)
  const done=data.goals.filter(g=>goalProgress(g).pct>=100).length;
  const total=data.goals.length;
  const active=total-done;
  const ringPct = total>0 ? Math.round(done/total*100) : 0;
  let html=`<div class="hero"><div class="hero-top">
    <div class="ring-wrap">${ring(ringPct,88,9)}<div class="ring-label"><b>${done}/${total}</b><span>${t('manyGoals')}</span></div></div>
    <div class="hero-txt"><h2>${done} ${t('ofDays')} ${total} ${done===1?t('completed'):t('completedPl')}</h2>
    <p>${active>0?(t('youHave')+' '+active+' '+(active===1?t('activeOne'):t('activeMany'))):t('allDone')}</p></div>
  </div></div>`;
  html+=`<div class="section-label">${t('myGoals')}</div>`;
  data.goals.forEach(g=>{
    const p=goalProgress(g);
    const sub = g.type==='number' ? `${p.done} / ${p.total} ${esc(g.unit||'')}` : `${p.done} / ${p.total} ${t('daysUnit')}`;
    const deadline = g.endDate ? t('goalDeadline')+' '+fmtDateShort(g.endDate) : '';
    const doneClass = p.pct===100 ? ' is-done' : '';
    html+=`<div class="goal${doneClass}" onclick="openDetail('${g.id}')">
      <div class="goal-head">
        <div class="goal-disc">${goalIconSVG(g.emoji)}</div>
        <div class="goal-title"><h3 dir="auto">${esc(g.title)}</h3><div class="meta">${sub}</div></div>
        <div class="goal-pct">${p.pct}<span>%</span></div>
      </div>
      <div class="mini-track"><div class="mini-fill" style="width:${p.pct}%"></div></div>
      <div class="goal-foot"><span class="gf-status">${p.pct===100?('✓ '+t('done')):t('inProgress')}</span><span>${deadline}</span></div>
    </div>`;
  });
  el.innerHTML=html;
}
// icono de línea (mismo set que las medallas) sobre un disco, para la tarjeta de meta
function goalIconSVG(emoji){
  const key = EMOJI_TO_MEDAL[emoji] || 'star';
  const paths = MEDAL_ICONS[key];
  return `<svg viewBox="0 0 48 48" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/* ---------- SALÓN DE TROFEOS (tarjetas 2D) ---------- */
function trophyList(){
  return Array.isArray(data.trophies)
    ? data.trophies.map((tr,i)=>({tr,i})).sort((a,b)=> (b.tr.date||'').localeCompare(a.tr.date||'') || b.i-a.i).map(o=>o.tr)
    : [];
}
function renderTrophies(){
  const el=document.getElementById('trophiesContent');
  if(!el) return;
  const all = trophyList();
  if(all.length===0){
    el.innerHTML=`<div class="trophy-hero"><h2>${t('trophiesTitle')}</h2><p>${t('trophiesEmptySub')}</p></div>
      <div class="trophy-empty"><div class="trophy-empty-ic">🏆</div><div class="trophy-empty-tx">${t('trophiesEmpty')}</div></div>`;
    return;
  }
  let html=`<div class="trophy-hero"><h2>${t('trophiesTitle')}</h2>
    <p>${all.length+' '+(all.length===1?t('trophyOne'):t('trophyMany'))}</p></div>`;
  // agrupar por mes-año (más reciente primero; trophyList ya viene ordenado desc)
  const groups=[]; const idx={};
  all.forEach(tr=>{
    const d=parseISO(tr.date);
    const key=d.getFullYear()+'-'+d.getMonth();
    if(idx[key]===undefined){ idx[key]=groups.length; groups.push({key, date:d, items:[]}); }
    groups[idx[key]].items.push(tr);
  });
  groups.forEach(g=>{
    html+=`<div class="trophy-month">${esc(monthYearLabel(g.date))}</div>`;
    html+=`<div class="trophy-grid">`;
    g.items.forEach(tr=>{ html+=trophyCard(tr); });
    html+=`</div>`;
  });
  el.innerHTML=html;
}
// "Octubre 2026" en el idioma activo, con mayúscula inicial
function monthYearLabel(d){
  const loc=(typeof CURRENT_LANG!=='undefined'?CURRENT_LANG:'es');
  let s;
  try{ s=d.toLocaleDateString(loc,{month:'long',year:'numeric'}); }
  catch(e){ s=d.toLocaleDateString('es',{month:'long',year:'numeric'}); }
  return s.charAt(0).toLocaleUpperCase()+s.slice(1);
}
// mapa de emoji de meta -> icono de línea elegante para la medalla
const MEDAL_ICONS={
  target:'<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="2.5" fill="currentColor"/>',
  book:'<path d="M12 10a3 3 0 0 1 3-3h20v30H15a3 3 0 0 0-3 3z"/><path d="M12 40a3 3 0 0 1 3-3h20"/>',
  run:'<circle cx="28" cy="11" r="3.5"/><path d="M26 17l-6 5 4 5 2 9"/><path d="M20 22l-6 2"/><path d="M24 27l7 2 4 6"/>',
  muscle:'<path d="M14 30c0-6 3-11 9-11 3 0 5 2 5 5 0 4-4 5-4 9 0 3 3 4 6 4 5 0 8-4 8-9"/><circle cx="12" cy="31" r="3"/>',
  brain:'<path d="M24 12a6 6 0 0 0-6 6 5 5 0 0 0-2 9 5 5 0 0 0 8 4 5 5 0 0 0 8-4 5 5 0 0 0-2-9 6 6 0 0 0-6-6z"/><path d="M24 12v24"/>',
  money:'<circle cx="24" cy="24" r="14"/><path d="M24 16v16M20 20h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6"/>',
  music:'<path d="M20 32V14l14-3v18"/><circle cx="17" cy="33" r="3.5"/><circle cx="31" cy="30" r="3.5"/>',
  art:'<path d="M24 10a14 14 0 1 0 0 28c2 0 3-1 3-3 0-1-1-2-1-3s1-2 3-2h3a6 6 0 0 0 6-6c0-7-7-14-14-14z"/><circle cx="18" cy="22" r="1.8" fill="currentColor"/><circle cx="24" cy="18" r="1.8" fill="currentColor"/><circle cx="30" cy="22" r="1.8" fill="currentColor"/>',
  yoga:'<circle cx="24" cy="12" r="3"/><path d="M24 17v10M14 36l10-9 10 9M14 27h20"/>',
  plant:'<path d="M24 38V22"/><path d="M24 26c-6 0-9-4-9-9 6 0 9 4 9 9z"/><path d="M24 22c5 0 8-3 8-8-5 0-8 3-8 8z"/>',
  code:'<path d="M18 16l-8 8 8 8M30 16l8 8-8 8"/>',
  pen:'<path d="M30 12l6 6-16 16-8 2 2-8z"/>',
  apple:'<path d="M24 18c-3-4-10-3-11 3-1 8 5 16 11 16s12-8 11-16c-1-6-8-7-11-3z"/><path d="M24 18c0-3 2-6 5-6"/>',
  water:'<path d="M24 10c6 8 10 13 10 19a10 10 0 0 1-20 0c0-6 4-11 10-19z"/>',
  star:'<path d="M24 10l4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1z"/>',
  fire:'<path d="M24 10c3 5 8 7 8 14a8 8 0 0 1-16 0c0-3 2-5 3-7 1 3 3 3 3 1 0-3-1-5 2-8z"/>'
};
const EMOJI_TO_MEDAL={'🎯':'target','📚':'book','🏃':'run','💪':'muscle','🧠':'brain','💰':'money','🎸':'music','🎨':'art','🧘':'yoga','🌱':'plant','💻':'code','✍️':'pen','🍎':'apple','💧':'water','⭐':'star','🔥':'fire'};
// Dibuja una COPA/TROFEO dorado hermoso con el icono grabado en la copa.
// size: alto en px. En papelera se usa un poco más pequeño y grisáceo.
function trophyCupSVG(tr, size){
  const gid = ((tr.goalId||'x')+'-'+(tr.date||'')).replace(/[^a-zA-Z0-9]/g,'');
  const iconKey = EMOJI_TO_MEDAL[tr.emoji] || 'star';
  const iconPaths = MEDAL_ICONS[iconKey];
  const h = size || 104;
  const w = Math.round(h*0.82);
  return `<svg viewBox="0 0 100 122" width="${w}" height="${h}">
    <defs>
      <linearGradient id="cup-${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFF0C2"/><stop offset=".42" stop-color="#F2C042"/><stop offset="1" stop-color="#B07E1A"/>
      </linearGradient>
      <linearGradient id="cupSh-${gid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".35" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- asas -->
    <path d="M27 20 C9 20 9 48 30 50" fill="none" stroke="url(#cup-${gid})" stroke-width="6" stroke-linecap="round"/>
    <path d="M73 20 C91 20 91 48 70 50" fill="none" stroke="url(#cup-${gid})" stroke-width="6" stroke-linecap="round"/>
    <!-- copa (bowl) -->
    <path d="M24 16 H76 V36 C76 56 65 68 50 68 C35 68 24 56 24 36 Z" fill="url(#cup-${gid})" stroke="#8a6508" stroke-width="1.4"/>
    <!-- borde superior -->
    <rect x="21" y="12" width="58" height="7" rx="3.5" fill="url(#cup-${gid})" stroke="#8a6508" stroke-width="1"/>
    <!-- brillo -->
    <path d="M30 18 H48 V34 C48 48 42 56 33 58 C29 52 28 42 28 34 Z" fill="url(#cupSh-${gid})"/>
    <!-- icono grabado -->
    <g transform="translate(29,22) scale(0.9)" fill="none" stroke="#6a4e08" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".92">${iconPaths}</g>
    <!-- cuello -->
    <path d="M45 68 H55 L54 78 H46 Z" fill="url(#cup-${gid})" stroke="#8a6508" stroke-width="1"/>
    <!-- base -->
    <rect x="38" y="78" width="24" height="7" rx="2.5" fill="url(#cup-${gid})" stroke="#8a6508" stroke-width="1"/>
    <rect x="30" y="86" width="40" height="10" rx="3.5" fill="url(#cup-${gid})" stroke="#8a6508" stroke-width="1.2"/>
  </svg>`;
}
// una tarjeta de trofeo premium (copa dorada con icono grabado)
function trophyCard(tr){
  return `<div class="tcard2">
    <button class="tcard2-del" onclick="deleteTrophy('${tr.goalId}','${esc(tr.date)}')" aria-label="${t('delete')}">${icon('trash',14)}</button>
    <span class="tc2-star s1">✦</span><span class="tc2-star s2">✦</span>
    <div class="tc2-badge">${trophyCupSVG(tr,104)}</div>
    <div class="tc2-name" dir="auto">${esc(capFirst(tr.title))}</div>
    <div class="tc2-date">${fmtDate(tr.date)}</div>
  </div>`;
}
function trophyCenterText(tr){ return tr.title; }
// Borrar un trofeo = enviarlo a la PAPELERA (borrado reversible)
function deleteTrophy(goalId, date){
  const tr=(data.trophies||[]).find(x=>x.goalId===goalId && x.date===date);
  const name = tr ? tr.title : '';
  confirmSheet(t('trophyDelTitle'), t('trophyToTrashMsg1')+' "'+esc(name)+'". '+t('trophyToTrashMsg2'), t('trophyToTrashBtn'), ()=>{
    if(!Array.isArray(data.trash)) data.trash=[];
    if(tr){ data.trash.push(Object.assign({}, tr, {trashedAt: todayISO()})); }
    data.trophies = (data.trophies||[]).filter(x=>!(x.goalId===goalId && x.date===date));
    save();
    renderTrophies();
    toast(t('trophyToTrashDone'));
  });
}

/* ---------- PAPELERA DE TROFEOS ---------- */
function trashList(){
  return Array.isArray(data.trash)
    ? data.trash.map((tr,i)=>({tr,i})).sort((a,b)=> (b.tr.trashedAt||'').localeCompare(a.tr.trashedAt||'') || b.i-a.i).map(o=>o.tr)
    : [];
}
function openTrash(){ show('trash'); renderTrash(); }
function renderTrash(){
  const el=document.getElementById('trashContent');
  if(!el) return;
  const all=trashList();
  if(all.length===0){
    el.innerHTML=`<div class="trophy-hero"><h2>${t('trashTitle')}</h2><p>${t('trashSub')}</p></div>
      <div class="trophy-empty"><div class="trophy-empty-ic">🗑️</div><div class="trophy-empty-tx">${t('trashEmpty')}</div></div>`;
    return;
  }
  let html=`<div class="trophy-hero"><h2>${t('trashTitle')}</h2><p>${t('trashSub')}</p></div>`;
  html+=`<button class="btn ghost block trash-empty-btn" onclick="emptyTrash()">${icon('trash',16)} ${t('trashEmptyAll')}</button>`;
  html+=`<div class="trophy-grid">`;
  all.forEach(tr=>{ html+=trashCard(tr); });
  html+=`</div>`;
  el.innerHTML=html;
}
function trashCard(tr){
  return `<div class="tcard2 trashed">
    <span class="tc2-star s1">✦</span><span class="tc2-star s2">✦</span>
    <div class="tc2-badge">${trophyCupSVG(tr,92)}</div>
    <div class="tc2-name" dir="auto">${esc(capFirst(tr.title))}</div>
    <div class="tc2-date">${fmtDate(tr.date)}</div>
    <div class="trash-acts">
      <button class="trash-restore" onclick="restoreTrophy('${tr.goalId}','${esc(tr.date)}')">${icon('undo',14)} ${t('trashRestore')}</button>
      <button class="trash-del" onclick="purgeTrophy('${tr.goalId}','${esc(tr.date)}')" aria-label="${t('trashDeleteForever')}">${icon('trash',14)}</button>
    </div>
  </div>`;
}
function restoreTrophy(goalId, date){
  const tr=(data.trash||[]).find(x=>x.goalId===goalId && x.date===date);
  if(tr){
    if(!Array.isArray(data.trophies)) data.trophies=[];
    const copy=Object.assign({},tr); delete copy.trashedAt;
    data.trophies.push(copy);
  }
  data.trash=(data.trash||[]).filter(x=>!(x.goalId===goalId && x.date===date));
  save(); renderTrash(); toast(t('trashRestored'));
}
function purgeTrophy(goalId, date){
  const tr=(data.trash||[]).find(x=>x.goalId===goalId && x.date===date);
  const name=tr?tr.title:'';
  confirmSheet(t('trashDeleteForever'), t('trashPurgeMsg1')+' "'+esc(name)+'". '+t('trashPurgeMsg2'), t('trashDeleteForever'), ()=>{
    data.trash=(data.trash||[]).filter(x=>!(x.goalId===goalId && x.date===date));
    save(); renderTrash();
  });
}
function emptyTrash(){
  if(!(data.trash||[]).length) return;
  confirmSheet(t('trashEmptyAll'), t('trashEmptyMsg'), t('trashDeleteForever'), ()=>{
    data.trash=[]; save(); renderTrash();
  });
}

/* ---------- DETAIL ---------- */
function openDetail(id){
  currentGoalId=id;
  // iconos y acciones de los botones superiores de editar/eliminar
  const eb=document.getElementById('detailEdit');
  const db=document.getElementById('detailDelete');
  if(eb){ eb.innerHTML=icon('edit',18); eb.onclick=()=>openEdit(id); }
  if(db){ db.innerHTML=icon('trash',18); db.onclick=()=>deleteGoal(id); }
  renderDetail();
  show('detail');
}
function renderDetail(){
  const g=data.goals.find(x=>x.id===currentGoalId);
  if(!g){ show('home'); return; }
  const p=goalProgress(g);
  const el=document.getElementById('detailContent');
  let html=`<div class="detail-hero">
    <div class="ddisc">${goalIconSVG(g.emoji)}</div>
    <h2>${esc(capFirst(g.title))}</h2>
    <div class="dmeta">${g.startDate?fmtDate(g.startDate):''}${g.endDate?' → '+fmtDate(g.endDate):''}</div>
    <div class="big-ring">${ring(p.pct,150,12)}<div class="lbl"><b>${p.pct}%</b><span>${t('percentDone')}</span></div></div>
    <div class="detail-count">${g.type==='number'?`${p.done} ${t('ofDays')} ${p.total} ${esc(g.unit||'')}`:`${p.done} ${t('ofDays')} ${p.total} ${t('daysUnit')}`}</div>
    <div class="motiv" id="motivBox"><span class="ico">🌟</span><span id="motivText">${p.pct===100?getFinishMsg():(p.done>0?motivShow(p.done):t('firstStepMsg'))}</span></div>
  </div>`;

  if(g.type==='number'){
    const atMin = p.done<=0;
    const atMax = g.target>0 && p.done>=g.target;
    html+=`<div class="num-panel">
      <div class="stepper">
        <button class="step-btn minus" onclick="quickAdd(-1)" ${atMin?'disabled':''} aria-label="−1">${icon('minus',22)}</button>
        <div class="step-val"><b>${p.done}</b><span>/ ${p.total} ${esc(g.unit||'')}</span></div>
        <button class="step-btn plus" onclick="quickAdd(1)" ${atMax?'disabled':''} aria-label="+1">${icon('plus',22)}</button>
      </div>
      <div class="num-add">
        <input type="number" id="numInput" placeholder="${t('addAmountPh')}" inputmode="decimal" min="0">
        <button class="btn primary" onclick="addNumber()">${t('add')}</button>
      </div>
    </div>`;
  } else {
    html+=`<div class="days-head"><h3>${t('stages')} (${p.done}/${p.total})</h3></div>`;
    g.days.forEach((d,i)=>{
      const nk='n'+i;
      html+=`<div class="day${d.done?' done':''}">
        <div class="day-top">
          <button class="check ${d.done?'on':''}" onclick="toggleDay(${i})" aria-label="Marcar">${d.done?'✓':''}</button>
          <div class="day-info"><div class="dtitle">${esc(d.label||(t('dayLabel')+' '+(i+1)))}</div><div class="ddate">${d.date?fmtDate(d.date):''}</div></div>
          <button class="day-edit" onclick="editStage(${i})" aria-label="${t('editGoal')}">${icon('pen',16)}</button>
        </div>
        <div class="stage-edit" id="se-${i}">
          <input type="text" id="sl-${i}" maxlength="80" placeholder="${t('stageName')}" value="${esc(d.label||(t('dayLabel')+' '+(i+1)))}">
          <input type="date" id="sd-${i}" value="${d.date||''}">
          <div class="note-actions">
            <button class="btn sm primary" onclick="saveStage(${i})">${t('save')}</button>
            <button class="btn sm ghost" onclick="cancelStage(${i})">${t('cancel')}</button>
            <button class="btn sm danger ghost" onclick="deleteStage(${i})">${t('deleteStage')}</button>
          </div>
        </div>
        <button class="note-btn" onclick="toggleNote(${i})">${icon(d.note?'note':'message',14)} ${d.note?t('viewNote'):t('addNote')}</button>
        <div class="note-view ${d.note?'open':''}" id="nv-${i}">
          <div class="ntext">${d.note?esc(d.note):''}</div>
          <div class="nmeta"><span>${icon('calendar',13)} ${d.noteDate?'Guardada: '+d.noteDate:''}</span>
            <button class="btn sm ghost" onclick="editNote(${i})">Editar</button>
            <button class="btn sm danger ghost" onclick="delNote(${i})">Eliminar</button>
          </div>
        </div>
        <div class="note-edit" id="ne-${i}">
          <textarea id="nt-${i}" placeholder="${t('notePh')}">${d.note?esc(d.note):''}</textarea>
          <div class="note-actions"><button class="btn sm primary" onclick="saveNote(${i})">${t('saveNote')}</button><button class="btn sm ghost" onclick="cancelNote(${i})">${t('cancel')}</button></div>
        </div>
      </div>`;
    });
    html+=`<button class="btn ghost block" style="margin-top:4px" onclick="addStage()">${icon('plus',16)} ${t('addStage')}</button>`;
  }
  el.innerHTML=html;
}

/* ---------- day actions ---------- */
function toggleDay(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  g.days[i].done=!g.days[i].done;
  if(g.days[i].done && !g.days[i].date) g.days[i].date=todayISO();
  save();
  const p=goalProgress(g);
  // Actualizar en el sitio sin redibujar toda la pantalla (no se pierde el scroll)
  const row=document.querySelectorAll('.day')[getDayDomIndex(i)];
  if(row){
    const chk=row.querySelector('.check');
    if(chk){ chk.classList.toggle('on',g.days[i].done); chk.textContent=g.days[i].done?'✓':''; }
    row.classList.toggle('done',g.days[i].done);
  }
  // Actualizar barra/anillo y contador del hero de detalle
  updateDetailProgress(p);
  if(g.days[i].done){
    const msg = p.pct===100 ? getFinishMsg() : motivFor(p.done);
    flashMotiv(p, msg);
    progressToast(p.pct, msg);
    // La IA genera frases nuevas en segundo plano y las guarda en el banco (no cambia la pantalla)
    if(p.pct<100 && data.settings.aiMotiv!==false){
      fetchAiMotiv(g.title, p.done, p.total, p.pct);
    }
  }
  maybeCelebrate(g, p);
}
// Dispara la celebración solo la PRIMERA vez que la meta llega al 100%
function maybeCelebrate(g, p){
  if(p.pct===100 && !g.celebrated){
    g.celebrated=true;
    awardTrophy(g);           // guardar el logro en el salón de trofeos
    save();
    celebrateGoal(g.title);
  } else if(p.pct<100 && g.celebrated){
    g.celebrated=false; save();   // si vuelve a bajar, podrá celebrar de nuevo al recompletar
  }
}
// Añadir (o actualizar) un trofeo cuando se completa una meta
function awardTrophy(g){
  if(!Array.isArray(data.trophies)) data.trophies=[];
  // si ya hay trofeo de esta meta, no duplicar
  if(data.trophies.some(tr=>tr.goalId===g.id)) return;
  data.trophies.push({
    goalId: g.id,
    title: g.title,
    emoji: g.emoji || '🎯',
    type: g.type,
    date: todayISO()
  });
}
// Las etapas en el DOM incluyen las de tipo festivo/orden; aquí el índice coincide 1:1
function getDayDomIndex(i){ return i; }
// Actualiza el anillo, porcentaje y contador del detalle sin redibujar la lista
function updateDetailProgress(p){
  const pctEl=document.querySelector('.big-ring .lbl b');
  if(pctEl) pctEl.textContent=p.pct+'%';
  const g=data.goals.find(x=>x.id===currentGoalId);
  const countEl=document.querySelector('.detail-count');
  if(countEl && g) countEl.textContent = g.type==='number'
    ? `${p.done} ${t('ofUnit')} ${p.total} ${esc(g.unit||'')}`
    : `${p.done} ${t('ofDays')} ${p.total} ${t('dayLabel').toLowerCase()}s`;
  // redibujar el anillo (el arco)
  const ringHost=document.querySelector('.big-ring');
  if(ringHost){
    const svg=ring(p.pct,150,12);
    ringHost.innerHTML = svg + ringHost.querySelector('.lbl').outerHTML;
  }
  // actualizar también el contador de "Etapas (x/y)" si existe
  const dh=document.querySelector('.days-head h3');
  if(dh) dh.textContent=`${t('stages')} (${p.done}/${p.total})`;
}
function editStage(i){
  document.querySelectorAll('.stage-edit').forEach(e=>e.classList.remove('open'));
  document.getElementById('se-'+i).classList.add('open');
}
function cancelStage(i){ document.getElementById('se-'+i).classList.remove('open'); }
function saveStage(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  const label=document.getElementById('sl-'+i).value.trim();
  const date=document.getElementById('sd-'+i).value;
  g.days[i].label = label || (t('dayLabel')+' '+(i+1));
  g.days[i].date = date || g.days[i].date;
  // keep order by date
  g.days.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  save(); renderDetail(); toast(t('toastStageUpdated'));
}
function deleteStage(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  if(g.days.length<=1){ toast(t('toastNeedOneStage')); return; }
  confirmSheet(t('deleteStage'),t('confirmDelStage'),t('delete'),()=>{
    g.days.splice(i,1); save(); renderDetail();
  });
}
function addStage(){
  const g=data.goals.find(x=>x.id===currentGoalId);
  const last=g.days[g.days.length-1];
  const nextDate = last&&last.date ? addDays(last.date,1) : todayISO();
  g.days.push({label:t('dayLabel')+' '+(g.days.length+1),date:nextDate,done:false});
  save(); renderDetail();
  toast(t('toastStageAdded'));
}
// Pide una frase motivadora genérica a la IA y la GUARDA en el banco (no cambia la pantalla).
// Así el banco crece en silencio y las próximas veces hay más variedad sin repetir.
let aiMotivBusy = false;
const AI_BANK_MAX = 300;   // tope de frases guardadas por idioma
async function fetchAiMotiv(goalTitle, done, total, pct){
  if(aiMotivBusy) return;       // evitar peticiones solapadas
  aiMotivBusy = true;
  const lang = CURRENT_LANG;
  try{
    const resp = await fetch(WORKER_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'motivate', lang: activeLangName(), goalTitle, done, total, pct })
    });
    const res = await resp.json();
    const clean = cleanMotivMsg(res && res.message, goalTitle);
    // solo guardar si pasa el filtro Y parece estar en el idioma correcto
    if(clean && looksRightLanguage(clean, lang)){
      data.aiMotivBank = data.aiMotivBank || {};
      const bank = data.aiMotivBank[lang] || [];
      const base = (I18N[lang] && I18N[lang].motiv) ? I18N[lang].motiv : [];
      const exists = bank.some(f=>f.toLowerCase()===clean.toLowerCase())
                  || base.some(f=>f.toLowerCase()===clean.toLowerCase());
      if(!exists){
        bank.push(clean);
        if(bank.length>AI_BANK_MAX) bank.shift();
        data.aiMotivBank[lang]=bank;
        save();
      }
    }
  }catch(e){ /* si falla, no pasa nada: el banco sigue como estaba */ }
  finally{ aiMotivBusy=false; }
}
// Limpia y valida el mensaje de la IA; devuelve null si no sirve (y se queda el local)
function cleanMotivMsg(raw, goalTitle){
  if(!raw || typeof raw!=='string') return null;
  let m = raw.trim();
  // 1) descartar JSON crudo o restos de cronograma
  if(/^[\{\[]/.test(m) || m.includes('"date"') || m.includes('"stages"') || m.includes('"label"') || m.includes('":')) return null;
  // 2) quedarse solo con la primera línea (a veces devuelve varias)
  m = m.split(/[\r\n]/)[0].trim();
  // 3) quitar comillas y signos sueltos de los extremos
  m = m.replace(/^[\s"'`{}\[\]:,.;\-–—]+/, '').replace(/[\s"'`{}\[\]:,;]+$/, '').trim();
  // 4) quitar prefijos tipo "mensaje:", "frase:", etc.
  m = m.replace(/^(message|mensaje|msg|texto|text|frase|phrase)\s*[:：]\s*/i, '').replace(/^["'`]+|["'`]+$/g,'').trim();
  // 5) validaciones de calidad
  if(m.length < 10) return null;                         // demasiado corta (un fragmento)
  if(m.length > 140) return null;                        // demasiado larga: probablemente mal formada
  const words = m.split(/\s+/).filter(Boolean);
  if(words.length < 3) return null;                      // al menos 3 palabras
  if(goalTitle && m.toLowerCase() === goalTitle.trim().toLowerCase()) return null;
  // 6) debe parecer una frase COMPLETA: terminar en puntuación de cierre
  //    (evita guardar frases cortadas como "cada paso que")
  if(!/[.!?…。！？]$/.test(m)) return null;
  // 7) sin caracteres raros de código
  if(/[<>{}]|https?:\/\//.test(m)) return null;
  return m;
}
// Comprueba que la frase está en el idioma esperado (evita guardar inglés cuando la app está en español, etc.)
function looksRightLanguage(msg, lang){
  if(lang==='en' || lang==='zh' || lang==='ja' || lang==='ar' || lang==='he' || lang==='ru') return true; // difícil de validar, se confía en el prompt
  // para idiomas latinos, rechazar si parece claramente inglés
  const lower = ' '+msg.toLowerCase()+' ';
  const englishWords = [' the ',' you ',' your ',' keep ',' step ',' already ',' started ',' going ',' every ',' progress ',' goal ',' done '];
  let hits=0; englishWords.forEach(w=>{ if(lower.includes(w)) hits++; });
  // si tiene 2+ palabras típicas de inglés y el idioma no es inglés, rechazar
  return !(hits>=2 && lang!=='en');
}
function flashMotiv(p, msg){
  const box=document.getElementById('motivBox');
  if(!box) return;
  const text = p.pct===100 ? getFinishMsg() : (msg || motivFor(p.done));
  box.style.opacity=0;
  setTimeout(()=>{
    const mt=document.getElementById('motivText');
    if(mt) mt.textContent = text;
    const ico=box.querySelector('.ico'); if(ico) ico.textContent=p.pct===100?'🎉':'🌟';
    box.style.opacity=1;
  },180);
}
function toggleNote(i){
  const nv=document.getElementById('nv-'+i), g=data.goals.find(x=>x.id===currentGoalId);
  if(g.days[i].note){ nv.classList.toggle('open'); }
  else { document.getElementById('ne-'+i).classList.toggle('open'); }
}
function editNote(i){ document.getElementById('nv-'+i).classList.remove('open'); document.getElementById('ne-'+i).classList.add('open'); }
function cancelNote(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  document.getElementById('nt-'+i).value=g.days[i].note||'';
  document.getElementById('ne-'+i).classList.remove('open');
  if(g.days[i].note) document.getElementById('nv-'+i).classList.add('open');
}
function saveNote(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  const v=document.getElementById('nt-'+i).value.trim();
  if(!v){ toast(t('toastEmptyNote')); return; }
  g.days[i].note=v; g.days[i].noteDate=fmtDate(todayISO());
  save(); renderDetail(); toast(t('toastNoteSaved'));
}
function delNote(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  confirmSheet(t('delete'),t('confirmDelNote'),t('delete'),()=>{
    delete g.days[i].note; delete g.days[i].noteDate; save(); renderDetail();
  });
}

/* ---------- number actions ---------- */
function addNumber(){
  const inp=document.getElementById('numInput');
  let v=parseFloat(inp.value);
  if(isNaN(v)){ toast(t('toastNeedNumber')); return; }
  v=Math.abs(v);               // el campo siempre suma; usa los botones −/+ para ajustar
  applyNumber(v);
  inp.value='';
}
function quickAdd(v){ applyNumber(v); }
function applyNumber(v){
  const g=data.goals.find(x=>x.id===currentGoalId);
  let next = Math.round((g.current+v)*100)/100;
  next = Math.max(0, next);                       // no bajar de 0
  if(g.target>0) next = Math.min(next, g.target); // no pasar del total definido
  const wasAdded = next > g.current;              // solo subió el progreso
  g.current = next;
  save();
  const p=goalProgress(g);
  renderDetail();
  // Restar (o no cambiar) es una corrección: no mostramos motivación, pero sí ajustamos el estado de celebración
  if(!wasAdded){ maybeCelebrate(g, p); return; }
  const msg = p.pct===100 ? getFinishMsg() : motivFor(p.done);
  flashMotiv(p, msg);
  progressToast(p.pct, msg);
  if(p.pct<100 && data.settings.aiMotiv!==false){
    fetchAiMotiv(g.title, p.done, p.total, p.pct);
  }
  maybeCelebrate(g, p);
}

/* ---------- elegir modo de nueva meta: IA o manual ---------- */
function chooseNewGoalMode(){
  const sheet=document.getElementById('editSheet');
  sheet.innerHTML=`
    <div class="sheet-grip"></div>
    <h2>${t('newGoal')}</h2>
    <div class="mode-choice">
      <button class="mode-card" onclick="openEdit(null,'ai')">
        <div class="mode-ic">${icon('star',26)}</div>
        <div class="mode-tx"><b>${t('modeAiTitle')}</b><span>${t('modeAiDesc')}</span></div>
      </button>
      <button class="mode-card" onclick="openEdit(null,'manual')">
        <div class="mode-ic">${icon('edit',24)}</div>
        <div class="mode-tx"><b>${t('modeManualTitle')}</b><span>${t('modeManualDesc')}</span></div>
      </button>
    </div>
    <button class="btn ghost block" onclick="closeEdit()" style="margin-top:14px">${t('cancel')}</button>`;
  document.getElementById('editScrim').classList.add('open');
}

/* ---------- create / edit ---------- */
function openEdit(id, mode){
  const editing = !!id;
  const showAi = !editing && mode==='ai';   // recuadro de IA solo en modo IA
  let g = editing ? data.goals.find(x=>x.id===id) : null;
  draftType = g ? g.type : 'days';
  draftEmoji = g ? (g.emoji||'🎯') : '🎯';
  iconUserPicked = !!g;   // al editar se respeta su icono; al crear, la app lo detecta sola
  draftFreq = g && g.freq ? g.freq : 'daily';
  draftWeekdays = g && g.weekdays ? g.weekdays.slice() : [];
  draftManualDates = g && g.type==='days' && g.freq==='manual' ? g.days.map(d=>d.date) : [];
  draftImportStages = [];
  aiPlanMode = false;
  draftStart = g && g.startDate ? g.startDate : todayISO();
  draftCount = g && g.type==='days' ? g.days.length : 30;
  const sheet=document.getElementById('editSheet');
  sheet.innerHTML=`
    <div class="sheet-grip"></div>
    <h2>${editing?t('editGoal'):t('newGoal')}</h2>
    <div class="sub"></div>

    ${!showAi ? '' : `
    <div class="ai-gen-box">
      <div class="ai-gen-head"><span>${t('aiPlanTitle')}</span>${icon('star',18)}</div>
      <div class="ai-gen-sub">${t('aiPlanSub')}</div>
      <textarea id="aiGoalText" rows="2" placeholder="${t('aiPlanPh')}"></textarea>
      <button class="btn primary block" id="aiGenBtn" onclick="generatePlan()">${icon('star',16)} ${t('aiPlanBtn')}</button>
      <div id="aiGenStatus"></div>
    </div>
    `}

    <div id="manualFields"${showAi ? ' style="display:none"' : ''}>
    <div class="field"><label>${t('whatAchieve')}</label>
      <input id="fTitle" type="text" maxlength="60" placeholder="${t('goalNamePh')}" value="${g?esc(g.title):''}" oninput="autoIcon(this.value)"></div>

    <div class="field"><label>${t('icon')}</label>
      <div class="icon-auto-row">
        <div class="icon-auto-preview" id="iconPreview">${draftEmoji}</div>
        <button type="button" class="icon-change-btn" id="iconChangeBtn" onclick="toggleIconPicker()">${t('changeIcon')}</button>
      </div>
      <div class="emoji-picker" id="emojiPicker" style="display:none;margin-top:10px">${EMOJIS.map(e=>`<button type="button" class="emoji-opt${e===draftEmoji?' sel':''}" onclick="pickEmoji('${e}',this)">${e}</button>`).join('')}</div></div>

    <div class="field"><label>${t('goalType')}</label>
      <div class="type-toggle">
        <div class="type-opt${draftType==='days'?' sel':''}" id="typeDays" onclick="pickType('days')">
          <div class="te">${icon('calendar',24)}</div><div class="tt">${t('typeDays')}</div><div class="td">${t('typeDaysDesc')}</div></div>
        <div class="type-opt${draftType==='number'?' sel':''}" id="typeNum" onclick="pickType('number')">
          <div class="te">${icon('hash',24)}</div><div class="tt">${t('typeNum')}</div><div class="td">${t('typeNumDesc')}</div></div>
      </div></div>

    <div id="typeFields"></div>

    <button class="btn primary block" onclick="commitGoal(${editing?`'${id}'`:'null'})">${editing?t('saveChanges'):t('createGoal')}</button>
    <div style="height:8px"></div>
    </div>
    <button class="btn ghost block" onclick="closeEdit()">${t('cancel')}</button>
  `;
  renderTypeFields(g);
  document.getElementById('editScrim').classList.add('open');
}
let iconUserPicked=false;   // ¿el usuario eligió el icono a mano?
function pickEmoji(e,btn){
  draftEmoji=e; iconUserPicked=true;
  document.querySelectorAll('#emojiPicker .emoji-opt').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel');
  const pv=document.getElementById('iconPreview'); if(pv) pv.textContent=e;
}
function toggleIconPicker(){
  const p=document.getElementById('emojiPicker'); if(!p) return;
  p.style.display = p.style.display==='none' ? 'flex' : 'none';
}
/* Palabras clave -> emoji, para elegir el icono automáticamente según la meta.
   Multilenguaje: incluye términos comunes en los 10 idiomas. */
const ICON_KEYWORDS=[
  ['🏃','corr|run|jog|troti|marat|5k|10k|ריצ|جري|бег|跑|courir|走|correr|caminar|walk|hik|senderis'],
  ['💪','gimnas|gym|pesas|fuerz|muscul|workout|entren|fit|múscul|musculo|כושר|لياقة|силов|健身|muscu|flex'],
  ['📚','le[eo]r|libro|lectur|read|book|idiom|langu|inglés|ingles|english|ספר|كتاب|قراءة|чита|книг|读书|lire|livre|読書'],
  ['🎸','guitar|músic|music|cant|sing|piano|bater|instrument|מוסיק|موسيقى|музык|音乐|musique|音楽|toca'],
  ['🎨','pint|dibuj|art|draw|paint|diseñ|design|craft|צייר|אמנות|رسم|فن|рисов|искусств|画|艺术|dessin|絵'],
  ['💰','ahorr|dinero|money|save|invert|invest|budget|presup|financ|deud|debt|כסף|לחסוך|مال|توفير|деньг|накоп|钱|存钱|argent|épargn|お金|貯金'],
  ['🧠','mente|medit|mindful|focus|concentr|memoria|brain|think|מדיט|تأمل|ум|медит|冥想|专注|médit|瞑想'],
  ['🧘','yoga|pilat|estir|stretch|relaj|relax|respir|breath|calm|יוגה|يوغا|йог|瑜伽|yoga|ヨガ'],
  ['🌱','plant|jardin|garden|cultiv|crec|grow|huert|siembr|צמח|גינ|نبات|زراعة|растен|сад|种植|植物|jardin|plante|植物'],
  ['💻','program|código|code|develop|software|web|app|comput|tech|teclad|קוד|תכנות|برمجة|код|программ|编程|代码|code|プログラ'],
  ['✍️','escrib|writ|redact|blog|diario|journal|novela|poem|כתיב|لكتابة|пис|写作|écri|書く'],
  ['🍎','com[ei]r|aliment|diet|nutri|eat|food|cocin|cook|recet|saludable|healthy|אכיל|תזונ|طعام|أكل|еда|пита|吃|饮食|manger|食べ|食事|fruta|verdur|veget'],
  ['💧','agua|water|hidrat|beber|drink|מים|ماء|вод|水|eau|hydrat|水を'],
  ['🔥','rach|streak|hábito|habit|diari|daily|consist|constan|רצף|عادة|привыч|连续|习惯|habitude|継続'],
  ['📚','aprend|estud|learn|study|curso|clase|ללמוד|学习|勉強|apprendre|étudier'],
  ['⭐','meta|goal|objetiv|sueñ|dream|logr|achiev|propósit|מטרה|هدف|цель|目标|objectif|目標']
];
function detectIcon(text){
  const s=String(text||'').toLowerCase();
  if(!s.trim()) return '🎯';
  for(const [emoji,pat] of ICON_KEYWORDS){
    if(new RegExp(pat,'i').test(s)) return emoji;
  }
  return '🎯';   // genérico: la diana representa "una meta"
}
function autoIcon(text){
  if(iconUserPicked) return;          // respetar la elección manual del usuario
  const e=detectIcon(text);
  draftEmoji=e;
  const pv=document.getElementById('iconPreview'); if(pv) pv.textContent=e;
  // reflejar en la rejilla por si está abierta
  document.querySelectorAll('#emojiPicker .emoji-opt').forEach(b=>b.classList.toggle('sel', b.textContent===e));
}
function pickType(t){
  draftType=t;
  document.getElementById('typeDays').classList.toggle('sel',t==='days');
  document.getElementById('typeNum').classList.toggle('sel',t==='number');
  renderTypeFields(null);
}
function renderTypeFields(g){
  const el=document.getElementById('typeFields');
  if(draftType==='days'){
    const n = g&&g.type==='days' ? g.days.length : 30;
    const start = g&&g.startDate ? g.startDate : todayISO();
    if(aiPlanMode){
      // Plan creado por la IA: solo mostramos la vista previa de las etapas, sin selector
      // de frecuencia ni zona de subir archivo (no se está importando nada).
      el.innerHTML=`<div id="freqFields"></div>`;
      renderFreqFields(g,start,n);
    } else {
      el.innerHTML=`
        <div class="field"><label>${t('frequency')}</label>
          <div class="freq-toggle">
            <button type="button" class="freq-opt${draftFreq==='daily'?' sel':''}" onclick="pickFreq('daily')">${icon('calendar',17)} ${t('freqDaily')}</button>
            <button type="button" class="freq-opt${draftFreq==='weekly'?' sel':''}" onclick="pickFreq('weekly')">${icon('calClock',17)} ${t('freqWeekly')}</button>
            <button type="button" class="freq-opt${draftFreq==='manual'?' sel':''}" onclick="pickFreq('manual')">${icon('pen',17)} ${t('freqManual')}</button>
            <button type="button" class="freq-opt${draftFreq==='import'?' sel':''}" onclick="pickFreq('import')">${icon('upload',17)} ${t('freqImport')}</button>
          </div>
        </div>
        <div id="freqFields"></div>`;
      renderFreqFields(g,start,n);
    }
  } else {
    const tgt = g&&g.type==='number' ? g.target : '';
    const curUnit = g&&g.type==='number' ? (g.unit||'') : '';
    // valor de cada opción = texto mostrado en el idioma actual (se guarda tal cual en la meta)
    const unitVals = UNITS.map(u=> u.v==='' ? '' : t(u.k));
    const isKnown = curUnit==='' || unitVals.includes(curUnit);
    const optsHtml = UNITS.map((u,i)=>{ const val=unitVals[i];
      return `<option value="${esc(val)}"${val===curUnit?' selected':''}>${esc(t(u.k))}</option>`; }).join('')
      + `<option value="__other__"${(!isKnown)?' selected':''}>${esc(t('unitOther'))}</option>`;
    el.innerHTML=`<div class="field"><label>${t('targetNum')}</label>
      <input id="fTarget" type="number" min="1" inputmode="decimal" placeholder="Ej: 100" value="${tgt}"></div>
      <div class="field"><label>${t('unitOpt')}</label>
      <select id="fUnitSel" onchange="onUnitChange()">${optsHtml}</select></div>
      <div class="field" id="unitOtherWrap" style="${isKnown?'display:none':''}"><label>${t('unitOtherLabel')}</label>
      <input id="fUnit" type="text" maxlength="16" placeholder="${t('unitPh')}" value="${esc(isKnown?'':curUnit)}"></div>
      <div class="field"><label>${t('startDate')}</label>
      <input id="fStart" type="date" value="${g&&g.startDate?g.startDate:todayISO()}"></div>`;
  }
}
function pickFreq(f){
  // preserve whatever the user already typed before redrawing
  const curStart=document.getElementById('fStart')?.value;
  const curCount=parseInt(document.getElementById('fCount')?.value);
  if(curStart) draftStart=curStart;
  if(!isNaN(curCount)) draftCount=curCount;
  draftFreq=f;
  const idx={daily:0,weekly:1,manual:2,import:3}[f];
  document.querySelectorAll('.freq-opt').forEach(b=>b.classList.remove('sel'));
  document.querySelectorAll('.freq-opt')[idx].classList.add('sel');
  renderFreqFields(null, draftStart||todayISO(), draftCount||30);
}
function renderFreqFields(g,start,n){
  const el=document.getElementById('freqFields');
  start = start || draftStart || todayISO();
  n = n || draftCount || 30;
  if(draftFreq==='import'){
    if(aiPlanMode){
      // Plan de la IA: sin zona de subir archivo, solo la vista previa de las etapas
      el.innerHTML=`
        <div class="field"><label>${t('aiPlanStagesLabel')}</label></div>
        <div id="importStatus"></div>
        <div id="importPreview"></div>`;
      return;
    }
    el.innerHTML=`
      <div class="field">
        <label>${t('uploadSchedule')}</label>
        <div class="import-zone" id="importZone" onclick="document.getElementById('importFileInput').click()">
          <div class="iz-icon">${icon('upload',26)}</div>
          <div class="iz-main">${t('tapToChoose')}</div>
          <div class="iz-sub">${t('importFormats')}</div>
        </div>
        <input type="file" id="importFileInput" accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.webp,.docx" style="display:none" onchange="handleImportFile(this)">
        <div class="import-badges">
          <span class="ib ib-free">${icon('calendar',12)} ${t('freeBadge')}</span>
          <span class="ib ib-ai">${icon('upload',12)} ${t('aiBadge')}</span>
        </div>
        <div class="hint">${t('importHint')}</div>
      </div>
      <div id="importStatus"></div>
      <div id="importPreview"></div>`;
    return;
  }
  if(draftFreq==='manual'){
    el.innerHTML=`
      <div class="field"><label id="manualLbl">${t('yourDates')} (${draftManualDates.length})</label>
        <div class="num-add" style="margin-bottom:10px">
          <input type="date" id="manualPick" value="${todayISO()}">
          <button type="button" class="btn primary" onclick="addManualDate()">${t('addDate')}</button>
        </div>
        <div class="manual-list" id="manualList">${renderManualList()}</div>
        <div class="hint">${t('manualHint')}</div>
      </div>`;
  } else if(draftFreq==='weekly'){
    el.innerHTML=`
      <div class="field"><label>${t('whichWeekdays')}</label>
        <div class="wd-picker">${[1,2,3,4,5,6,0].map(i=>`<button type="button" class="wd-opt${draftWeekdays.includes(i)?' sel':''}" onclick="toggleWd(${i})" aria-label="${WD_FULL_NAME(i)}">${WD_LABEL(i)}</button>`).join('')}</div>
        <div class="hint">${t('weekdaysHint')}</div>
      </div>
      <div class="field"><label>${t('howManyStages')}</label>
        <input id="fCount" type="number" min="1" max="366" inputmode="numeric" value="${n}">
        <div class="hint">${t('stagesHint')}</div></div>
      <div class="field"><label>${t('startDate')}</label>
        <input id="fStart" type="date" value="${start}"></div>`;
  } else { // daily
    el.innerHTML=`
      <div class="field"><label>${t('howManyDays')}</label>
        <input id="fCount" type="number" min="1" max="366" inputmode="numeric" value="${n}">
        <div class="hint">${t('daysHint')}</div></div>
      <div class="field"><label>${t('startDate')}</label>
        <input id="fStart" type="date" value="${start}"></div>`;
  }
}
function renderManualList(){
  if(draftManualDates.length===0) return `<div class="hint" style="margin:0">${t('noDatesYet')}</div>`;
  const sorted=draftManualDates.slice().sort();
  return sorted.map(d=>`<div class="manual-chip">${fmtDate(d)}<button type="button" onclick="removeManualDate('${d}')" aria-label="Quitar">✕</button></div>`).join('');
}
function refreshManualLbl(){
  const lbl=document.getElementById('manualLbl');
  if(lbl) lbl.textContent=t('yourDates')+' ('+draftManualDates.length+')';
}
function addManualDate(){
  const el=document.getElementById('manualPick');
  const v=el&&el.value;
  if(!v){ toast(t('toastPickDate')); return; }
  if(draftManualDates.includes(v)){ toast(t('toastDateExists')); return; }
  draftManualDates.push(v);
  document.getElementById('manualList').innerHTML=renderManualList();
  refreshManualLbl();
}
function removeManualDate(d){
  draftManualDates=draftManualDates.filter(x=>x!==d);
  document.getElementById('manualList').innerHTML=renderManualList();
  refreshManualLbl();
}
function toggleWd(i){
  if(draftWeekdays.includes(i)) draftWeekdays=draftWeekdays.filter(x=>x!==i);
  else draftWeekdays.push(i);
  const pos=[1,2,3,4,5,6,0].indexOf(i);
  document.querySelectorAll('.wd-opt')[pos].classList.toggle('sel');
}

/* =============== IMPORTAR CRONOGRAMA =============== */
function importStatus(html){ const el=document.getElementById('importStatus'); if(el) el.innerHTML=html; }
function importSpinner(msg){ importStatus(`<div class="import-loading"><div class="spinner"></div><span>${msg}</span></div>`); }

async function handleImportFile(input){
  const file = input.files && input.files[0];
  if(!file) return;
  draftImportStages = [];
  document.getElementById('importPreview').innerHTML='';
  const name = file.name.toLowerCase();
  try{
    if(name.endsWith('.csv')){
      importSpinner(t('importReadingCsv'));
      const text = await file.text();
      const stages = parseCSV(text);
      finishImport(stages);
    } else if(name.endsWith('.xlsx') || name.endsWith('.xls')){
      importSpinner(t('importReadingExcel'));
      const stages = await parseExcel(file);
      finishImport(stages);
    } else if(name.endsWith('.pdf') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')){
      importSpinner(t('importAnalyzing'));
      const stages = await parseWithAI_file(file);
      finishImport(stages);
    } else if(name.endsWith('.docx')){
      importSpinner(t('importReadingWord'));
      const text = await parseDocxText(file);
      importSpinner(t('importAnalyzing'));
      const stages = await parseWithAI_text(text);
      finishImport(stages);
    } else {
      importStatus(`<div class="import-err">${t('importBadFormat')}</div>`);
    }
  }catch(err){
    if(err && err.notSchedule){
      importStatus(`<div class="import-err">${esc(String(err.message))}</div>`);
    } else {
      importStatus(`<div class="import-err">${t('importReadError')} ${esc(String(err.message||err))}</div>`);
    }
  }
  input.value='';
}

/* ---- CSV (sin IA) ---- */
function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length===0) throw new Error(t('toastInvalidFile'));
  const rows = lines.map(l=>splitCSVLine(l));
  // detectar si la primera fila es encabezado:
  // es encabezado solo si NINGUNA de sus celdas es una fecha válida
  // y alguna celda parece un título de columna
  const first = rows[0].map(c=>c.toLowerCase());
  const firstHasDate = rows[0].some(c=>normalizeDate(c));
  const hasHeader = !firstHasDate && first.some(c=>/fecha|date|día|dia|tema|clase|nombre|actividad|title|label|asunto/.test(c));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  // detectar columna de fecha y de nombre
  let dateCol=0, labelCol=1;
  if(hasHeader){
    first.forEach((c,i)=>{ if(/fecha|date|día|dia/.test(c)) dateCol=i; if(/tema|clase|nombre|actividad|title|label|asunto/.test(c)) labelCol=i; });
  }
  const stages=[];
  for(const r of dataRows){
    const rawDate = (r[dateCol]||'').trim();
    const iso = normalizeDate(rawDate);
    if(!iso) continue;
    const label = (r[labelCol]||r.find((c,i)=>i!==dateCol&&c.trim())||'').trim() || 'Etapa';
    stages.push({date:iso, label});
  }
  return stages;
}
function splitCSVLine(line){
  const out=[]; let cur=''; let q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(q){ if(c==='"'){ if(line[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }
    else { if(c==='"') q=true; else if(c===',' || c===';' || c==='\t') {out.push(cur);cur='';} else cur+=c; }
  }
  out.push(cur);
  return out.map(s=>s.trim());
}

/* ---- Excel (sin IA, con SheetJS) ---- */
async function parseExcel(file){
  await ensureSheetJS();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, {type:'array', cellDates:true});
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {header:1, raw:false, dateNF:'yyyy-mm-dd'});
  const clean = rows.filter(r=>r && r.some(c=>c!=null && String(c).trim()));
  if(clean.length===0) throw new Error(t('toastInvalidFile'));
  const first = clean[0].map(c=>String(c||'').toLowerCase());
  const firstHasDate = clean[0].some(c=>normalizeDate(String(c||'')));
  const hasHeader = !firstHasDate && first.some(c=>/fecha|date|día|dia|tema|clase|nombre|actividad|title|label|asunto/.test(c));
  let dateCol=0, labelCol=1;
  if(hasHeader){
    first.forEach((c,i)=>{ if(/fecha|date|día|dia/.test(c)) dateCol=i; if(/tema|clase|nombre|actividad|title|label|asunto/.test(c)) labelCol=i; });
  }
  const dataRows = hasHeader ? clean.slice(1) : clean;
  const stages=[];
  for(const r of dataRows){
    const iso = normalizeDate(String(r[dateCol]||''));
    if(!iso) continue;
    const label = String(r[labelCol]|| r.find((c,i)=>i!==dateCol&&String(c||'').trim()) ||'').trim() || 'Etapa';
    stages.push({date:iso, label});
  }
  return stages;
}
let _sheetjsLoaded=false;
function ensureSheetJS(){
  if(_sheetjsLoaded && window.XLSX) return Promise.resolve();
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>{_sheetjsLoaded=true;res();};
    s.onerror=()=>rej(new Error('No se pudo cargar el lector de Excel'));
    document.head.appendChild(s);
  });
}

/* ---- Word: extraer texto (con Mammoth) ---- */
async function parseDocxText(file){
  await ensureMammoth();
  const buf = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({arrayBuffer:buf});
  return result.value || '';
}
let _mammothLoaded=false;
function ensureMammoth(){
  if(_mammothLoaded && window.mammoth) return Promise.resolve();
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    s.onload=()=>{_mammothLoaded=true;res();};
    s.onerror=()=>rej(new Error('No se pudo cargar el lector de Word'));
    document.head.appendChild(s);
  });
}

/* ---- IA: archivo (PDF/imagen) ---- */
// Nombre del idioma activo para pedirle al servidor que traduzca a él
function activeLangName(){
  const L = I18N[CURRENT_LANG];
  if(L && L._en) return L._en;               // nombre en inglés: el más fiable para la IA
  if(L && L._name) return L._name;
  return 'Spanish';
}

/* ---------- Generador de metas con IA ---------- */
let planBusy = false;
async function generatePlan(){
  if(planBusy) return;
  const ta = document.getElementById('aiGoalText');
  const goalText = (ta && ta.value || '').trim();
  const statusEl = document.getElementById('aiGenStatus');
  if(!goalText){ if(statusEl) statusEl.innerHTML=`<div class="import-err">${t('aiPlanNeedText')}</div>`; return; }
  planBusy = true;
  if(statusEl) statusEl.innerHTML=`<div class="import-loading"><div class="spinner"></div><span>${t('aiPlanLoading')}</span></div>`;
  const btn=document.getElementById('aiGenBtn'); if(btn) btn.disabled=true;
  const startDate = addDays(todayISO(),1);   // empieza el día después de hoy
  try{
    const resp = await fetch(WORKER_URL, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'plan', lang: activeLangName(), goalText, startDate })
    });
    const res = await resp.json();
    if(res.error){ if(statusEl) statusEl.innerHTML=`<div class="import-err">${esc(res.error)}</div>`; return; }
    const stages = (Array.isArray(res.stages)?res.stages:[])
      .map(s=>({date:normalizeDate(s.date)||s.date, label:(s.label||t('stageLabel')).trim()}))
      .filter(s=>s.date && s.label);
    if(stages.length===0){ if(statusEl) statusEl.innerHTML=`<div class="import-err">${t('aiPlanNoStages')}</div>`; return; }
    // Mostrar los campos (título, icono, tipo, vista previa) ya rellenos para revisar y crear
    const mf=document.getElementById('manualFields'); if(mf) mf.style.display='';
    // Rellenar el formulario con el plan y pasarlo a modo "fechas manuales" (cada etapa su fecha)
    if(res.title){ const ft=document.getElementById('fTitle'); if(ft) ft.value=res.title.slice(0,60); }
    if(res.emoji){ draftEmoji=res.emoji; iconUserPicked=true; const pv=document.getElementById('iconPreview'); if(pv) pv.textContent=res.emoji; }
    draftType='days';
    draftFreq='import';          // reutiliza el flujo de etapas con fecha+nombre
    aiPlanMode=true;             // ...pero en modo IA: sin selector ni zona de subir archivo
    draftImportStages = stages.slice().sort((a,b)=>a.date.localeCompare(b.date));
    // refrescar la vista del formulario para que muestre solo la vista previa de etapas
    renderTypeFields(null);
    finishImport(draftImportStages);   // muestra la vista previa de etapas
    if(statusEl) statusEl.innerHTML=`<div class="import-ok">${icon('star',14)} ${t('aiPlanReady')}</div>`;
    // llevar al usuario a la vista previa
    const prev=document.getElementById('importPreview'); if(prev) prev.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(e){
    if(statusEl) statusEl.innerHTML=`<div class="import-err">${t('aiPlanError')}</div>`;
  }finally{
    planBusy=false;
    const b=document.getElementById('aiGenBtn'); if(b) b.disabled=false;
  }
}
async function parseWithAI_file(file){
  const base64 = await fileToBase64(file);
  const mimeType = file.type || guessMime(file.name);
  const resp = await fetch(WORKER_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ fileBase64: base64, mimeType, lang: activeLangName() })
  });
  return await handleAIResponse(resp);
}
/* ---- IA: texto (Word) ---- */
async function parseWithAI_text(text){
  const resp = await fetch(WORKER_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text, lang: activeLangName() })
  });
  return await handleAIResponse(resp);
}
async function handleAIResponse(resp){
  const data = await resp.json().catch(()=>({error:'Respuesta no legible del servidor'}));
  // La IA determinó que el archivo NO es un cronograma
  if(data && data.notSchedule){
    const e = new Error(t('importNotSchedule'));
    e.notSchedule = true;
    throw e;
  }
  if(!resp.ok || !Array.isArray(data.stages)){
    let msg = data.error || t('importReadError');
    const extra = [];
    if(data.status) extra.push('HTTP '+data.status);
    if(data.finishReason) extra.push('motivo: '+data.finishReason);
    if(data.detail) extra.push('detalle: '+String(data.detail).substring(0,300));
    if(data.raw) extra.push('respuesta: '+String(data.raw).substring(0,300));
    if(extra.length) msg += ' ['+extra.join(' · ')+']';
    throw new Error(msg);
  }
  return data.stages.map(s=>({date:normalizeDate(s.date)||s.date, label:(s.label||t('stageLabel')).trim()})).filter(s=>s.date);
}
function fileToBase64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>{ const s=r.result; res(s.substring(s.indexOf(',')+1)); };
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}
function guessMime(name){
  name=name.toLowerCase();
  if(name.endsWith('.pdf')) return 'application/pdf';
  if(name.endsWith('.png')) return 'image/png';
  if(name.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

/* ---- Normalizar fechas de cualquier formato a YYYY-MM-DD ---- */
function normalizeDate(raw){
  if(!raw) return null;
  raw = String(raw).trim();
  // Ya en ISO
  let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m) return `${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`;
  // DD/MM/YYYY o DD-MM-YYYY o DD.MM.YYYY
  m = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if(m){
    let d=+m[1], mo=+m[2], y=+m[3];
    if(y<100) y+=2000;
    // si el primero es claramente > 12, es día; asumimos DD/MM (formato común fuera de EEUU)
    if(d>31 || mo>12){ // orden invertido improbable, intento MM/DD
      [d,mo]=[mo,d];
    }
    if(mo>12) return null;
    return `${y}-${pad2(mo)}-${pad2(d)}`;
  }
  return null;
}

/* ---- Mostrar vista previa de etapas importadas ---- */
let previewExpanded=false;
function finishImport(stages){
  if(!stages || stages.length===0){
    importStatus(`<div class="import-err">${t('importNoDates')}</div>`);
    return;
  }
  stages.sort((a,b)=>a.date.localeCompare(b.date));
  draftImportStages = stages;
  previewExpanded=false;   // siempre empieza colapsada
  importStatus(`<div class="import-ok">${icon('calendar',14)} ${t('importFound')} ${stages.length} ${stages.length===1?t('importFoundStage'):t('importFoundStages')}</div>`);
  renderPreviewRows();
}
// Dibuja las etapas; si hay más de 8 y no está expandida, muestra solo 8 + botón "Ver todas"
function renderPreviewRows(){
  const stages=draftImportStages||[];
  const COLLAPSED=8;
  const showAll = previewExpanded || stages.length<=COLLAPSED;
  const list = showAll ? stages : stages.slice(0,COLLAPSED);
  const rows = list.map(s=>`<div class="prev-row"><span class="prev-date">${fmtDateShort(s.date)}</span><span class="prev-label">${esc(s.label)}</span></div>`).join('');
  let toggle='';
  if(stages.length>COLLAPSED){
    toggle = previewExpanded
      ? `<button type="button" class="prev-toggle" onclick="togglePreview()">${t('previewShowLess')}</button>`
      : `<button type="button" class="prev-toggle" onclick="togglePreview()">${t('previewShowAll')} (${stages.length})</button>`;
  }
  const el=document.getElementById('importPreview');
  if(el) el.innerHTML=`<div class="import-prev${previewExpanded?' full':''}">${rows}</div>${toggle}`;
}
function togglePreview(){ previewExpanded=!previewExpanded; renderPreviewRows(); }

function commitGoal(id, forceDuplicate){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){ toast(t('toastNeedName')); return; }
  // Aviso de nombre duplicado (solo al crear una meta nueva, no al editar)
  if(!id && !forceDuplicate){
    const exists = data.goals.some(g=>g.title.trim().toLowerCase()===title.toLowerCase());
    if(exists){
      confirmSheet(
        t('dupName'),
        `Ya tienes una meta llamada "${esc(title)}". ¿Quieres crear otra con el mismo nombre de todas formas?`,
        t('createAnyway'),
        ()=>{ commitGoal(null, true); }
      );
      return;
    }
  }
  if(draftType==='days'){
    // Caso especial: cronograma importado (trae fecha + nombre por etapa)
    if(draftFreq==='import'){
      if(!draftImportStages || draftImportStages.length===0){ toast(t('toastNeedSchedule')); return; }
      const imp = draftImportStages.slice().sort((a,b)=>a.date.localeCompare(b.date));
      const start = imp[0].date;
      const endDate = imp[imp.length-1].date;
      const days = imp.map(s=>({label:s.label||t('stageLabel'), date:s.date, done:false}));
      if(id){
        const g=data.goals.find(x=>x.id===id);
        g.title=title; g.emoji=draftEmoji; g.startDate=start; g.freq='import'; g.weekdays=[];
        g.type='days'; g.days=days; g.endDate=endDate;
      } else {
        data.goals.push({id:uid(),title,emoji:draftEmoji,type:'days',freq:'import',weekdays:[],startDate:start,endDate,days});
      }
      save(); closeEdit();
      if(id){ renderDetail(); } else { show('home'); }
      renderHome();
      // Mensaje correcto según el origen de las etapas: IA o archivo importado
      toast(aiPlanMode ? t('toastGoalAi') : t('toastGoalImported'));
      return;
    }
    // Build the list of dates according to frequency
    let dates=[];
    let start=todayISO();
    if(draftFreq==='manual'){
      if(draftManualDates.length===0){ toast(t('toastNeedDate')); return; }
      dates=draftManualDates.slice().sort();
      start=dates[0];
    } else {
      const startEl=document.getElementById('fStart');
      const countEl=document.getElementById('fCount');
      start=(startEl&&startEl.value)||draftStart||todayISO();
      let count=countEl?parseInt(countEl.value):draftCount;
      if(isNaN(count)||count<1){ toast(t('toastNeedStages')); return; }
      count=Math.min(count,366);
      if(draftFreq==='weekly'){
        if(draftWeekdays.length===0){ toast(t('toastNeedWeekday')); return; }
        dates=genDates(start,count,'weekly',draftWeekdays);
      } else {
        dates=genDates(start,count,'daily');
      }
    }
    if(dates.length===0){ toast(t('toastNoDatesGen')); return; }
    const endDate=dates[dates.length-1];
    if(id){
      const g=data.goals.find(x=>x.id===id);
      g.title=title; g.emoji=draftEmoji; g.startDate=start; g.freq=draftFreq; g.weekdays=draftWeekdays.slice();
      const old = g.type==='days' ? g.days : [];
      g.type='days';
      g.days=dates.map((d,i)=>{
        const prev=old[i];
        return {label: prev&&prev.label ? prev.label : (t('dayLabel')+' '+(i+1)),
                date:d, done: prev?prev.done:false,
                note: prev?prev.note:undefined, noteDate: prev?prev.noteDate:undefined};
      });
      g.endDate=endDate;
    } else {
      const days=dates.map((d,i)=>({label:t('dayLabel')+' '+(i+1),date:d,done:false}));
      data.goals.push({id:uid(),title,emoji:draftEmoji,type:'days',freq:draftFreq,weekdays:draftWeekdays.slice(),startDate:start,endDate,days});
    }
  } else {
    const start=document.getElementById('fStart').value||todayISO();
    const target=parseFloat(document.getElementById('fTarget').value);
    if(isNaN(target)||target<=0){ toast(t('toastNeedTarget')); return; }
    // Unidad: del selector, o personalizada validada
    const sel=document.getElementById('fUnitSel');
    let unit='';
    if(sel && sel.value==='__other__'){
      const raw=document.getElementById('fUnit').value;
      const res=validateCustomUnit(raw);
      if(!res.ok){ toast(t('toastBadUnit')); return; }
      unit=res.value;
    } else if(sel){
      unit=sel.value;   // '' si eligió "Sin unidad"
    }
    if(id){
      const g=data.goals.find(x=>x.id===id);
      g.title=title; g.emoji=draftEmoji; g.startDate=start; g.endDate='';
      if(g.type!=='number'){ g.type='number'; g.current=0; }
      g.target=target; g.unit=unit;
    } else {
      data.goals.push({id:uid(),title,emoji:draftEmoji,type:'number',startDate:start,endDate:'',target,unit,current:0});
    }
  }
  save();
  closeEdit();
  if(id){ renderDetail(); } else { show('home'); }
  renderHome();
  toast(id?t('toastGoalUpdated'):t('toastGoalCreated'));
}
function closeEdit(){ document.getElementById('editScrim').classList.remove('open'); }

function deleteGoal(id){
  confirmSheet(t('delete'),t('confirmDelGoal'),t('delete'),()=>{
    data.goals=data.goals.filter(x=>x.id!==id);
    save(); renderHome(); show('home');
  });
}

/* ---------- confirm sheet ---------- */
let confirmCb=null;
function confirmSheet(title,msg,okLabel,cb,extraHtml){
  confirmCb=cb;
  const s=document.getElementById('confirmSheet');
  s.innerHTML=`<div class="sheet-grip"></div><h2>${title}</h2><div class="sub">${msg}</div>${extraHtml||''}
    <button class="btn ${okLabel===t('delete')?'danger':'primary'} block" id="confirmOk" style="margin-top:12px">${okLabel}</button>
    <div style="height:8px"></div><button class="btn ghost block" onclick="closeConfirm()">Cancelar</button>`;
  document.getElementById('confirmScrim').classList.add('open');
  document.getElementById('confirmOk').onclick=()=>{ const cb2=confirmCb; closeConfirm(); if(cb2) cb2(); };
}
function closeConfirm(){ document.getElementById('confirmScrim').classList.remove('open'); confirmCb=null; }

/* ---------- confetti ---------- */
const CONFETTI_COLORS=['#E8A93C','#F0C06A','#C98A22','#FBD88A','#D4941A','#FFE9B8','#B07E1A'];
function confetti(){
  // lluvia desde arriba (fondo)
  for(let i=0;i<80;i++){
    const c=document.createElement('div');
    c.className='confetti';
    c.style.left=Math.random()*100+'vw'; c.style.top='-20px';
    c.style.background=CONFETTI_COLORS[i%CONFETTI_COLORS.length];
    document.body.appendChild(c);
    const dur=1800+Math.random()*1600;
    const delay=Math.random()*400;
    c.animate([{transform:'translateY(0) rotate(0)',opacity:1},{transform:`translateY(${innerHeight+40}px) rotate(${720*Math.random()}deg)`,opacity:.25}],{duration:dur,delay,easing:'cubic-bezier(.3,.6,.4,1)'});
    setTimeout(()=>c.remove(),dur+delay);
  }
}
// estallido de confeti desde un punto (centro de la pantalla)
function confettiBurst(){
  const cx=innerWidth/2, cy=innerHeight*0.42;
  for(let i=0;i<60;i++){
    const c=document.createElement('div');
    c.className='confetti';
    c.style.left=cx+'px'; c.style.top=cy+'px';
    c.style.background=CONFETTI_COLORS[i%CONFETTI_COLORS.length];
    document.body.appendChild(c);
    const ang=Math.random()*Math.PI*2, dist=120+Math.random()*260;
    const dx=Math.cos(ang)*dist, dy=Math.sin(ang)*dist;
    const dur=900+Math.random()*700;
    c.animate([
      {transform:'translate(0,0) rotate(0) scale(1)',opacity:1},
      {transform:`translate(${dx}px,${dy+120}px) rotate(${720*Math.random()}deg) scale(.6)`,opacity:0}
    ],{duration:dur,easing:'cubic-bezier(.15,.7,.4,1)'});
    setTimeout(()=>c.remove(),dur);
  }
}
/* ---------- celebración al completar una meta ---------- */
let celebrating=false;
function celebrateGoal(goalTitle){
  if(celebrating) return;
  celebrating=true;
  const ov=document.getElementById('celebrateOverlay');
  if(!ov){ celebrating=false; confetti(); return; }
  ov.querySelector('.cel-title').textContent=t('celTitle');
  ov.querySelector('.cel-sub').textContent=goalTitle ? `"${goalTitle}"` : '';
  ov.querySelector('.cel-msg').textContent=t('celMsg');
  ov.querySelector('.cel-see').textContent=t('celSeeTrophy');
  ov.querySelector('.cel-btn').textContent=t('celBtn');
  ov.classList.add('open');
  confetti(); confettiBurst();
  setTimeout(confettiBurst,350);
  setTimeout(confettiBurst,700);
}
function closeCelebrate(){
  const ov=document.getElementById('celebrateOverlay');
  if(ov) ov.classList.remove('open');
  celebrating=false;
}
// Desde la celebración, ir directo al salón a ver el trofeo recién ganado
function seeMyTrophy(){
  closeCelebrate();
  show('trophies'); renderTrophies();
}

/* ---------- settings ---------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme',data.settings.theme);
  document.getElementById('themeSwitch').classList.toggle('on',data.settings.theme==='dark');
  document.querySelector('meta[name=theme-color]').setAttribute('content',data.settings.theme==='dark'?'#111110':'#F5F3EF');
}
function toggleTheme(){ data.settings.theme=data.settings.theme==='dark'?'light':'dark'; save(); applyTheme(); }

function exportData(){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='rumbo-backup-'+todayISO()+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast(t('toastExported'));
}
function importData(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const obj=JSON.parse(r.result);
      if(!obj.goals) throw 0;
      confirmSheet(t('importData'),t('confirmImport'),t('importData'),()=>{
        data=obj; if(!data.settings)data.settings={theme:'light',notif:false};
        save(); applyTheme(); renderHome(); show('home'); toast(t('toastImported'));
      });
    }catch(e){ toast(t('toastInvalidFile')); }
  };
  r.readAsText(file);
}

/* ---------- notifications ---------- */
let notifTimer = null;
async function toggleNotif(){
  if(!data.settings.notif){
    if(!('Notification' in window)){ toast(t('toastNoNotif')); return; }
    const perm=await Notification.requestPermission();
    if(perm!=='granted'){ toast(t('toastNotifDenied')); return; }
    data.settings.notif=true;
    if(!data.settings.notifTime) data.settings.notifTime='20:00';
    save();
    document.getElementById('notifSwitch').classList.add('on');
    toast(t('toastNotifOn'));
    renderSettingsNotifTime();   // mostrar el selector de hora
    scheduleNotif();
  } else {
    data.settings.notif=false; save();
    document.getElementById('notifSwitch').classList.remove('on');
    toast(t('toastNotifOff'));
    renderSettingsNotifTime();   // ocultar el selector
    if(notifTimer){ clearTimeout(notifTimer); notifTimer=null; }
  }
}
// ¿hay metas sin completar?
function hasPendingGoals(){
  return data.goals.some(g=>goalProgress(g).pct < 100);
}
// mensaje variado para el recordatorio
function reminderMessage(){
  const L = I18N[CURRENT_LANG] || I18N.es;
  const bank = Array.isArray(L.reminderMsgs) ? L.reminderMsgs : (I18N.es.reminderMsgs||[]);
  if(bank.length===0) return t('reminderBody');
  return bank[Math.floor(Math.random()*bank.length)];
}
function cambiarNotifTime(val){
  if(!val) return;
  data.settings.notifTime = val;
  save();
  scheduleNotif();
}
// mostrar u ocultar la fila de hora según el estado del recordatorio
function renderSettingsNotifTime(){
  const row=document.getElementById('notifTimeRow');
  const inp=document.getElementById('notifTimeInput');
  if(!row) return;
  if(data.settings.notif){
    row.style.display='';
    if(inp) inp.value = data.settings.notifTime || '20:00';
  } else {
    row.style.display='none';
  }
}
function scheduleNotif(){
  // Recordatorio local: se dispara mientras la app está abierta/instalada en segundo plano.
  if(notifTimer){ clearTimeout(notifTimer); notifTimer=null; }
  if(!data.settings.notif || !('Notification' in window) || Notification.permission!=='granted') return;
  const [hh,mm] = (data.settings.notifTime||'20:00').split(':').map(Number);
  const now=new Date();
  const target=new Date();
  target.setHours(hh||20, mm||0, 0, 0);
  if(target<=now) target.setDate(target.getDate()+1);   // si ya pasó hoy, mañana
  notifTimer=setTimeout(()=>{
    if(data.settings.notif && Notification.permission==='granted' && hasPendingGoals()){
      try{ new Notification('Rumbo', {body: reminderMessage()}); }catch(e){}
    }
    scheduleNotif();   // reprogramar para el día siguiente
  }, target-now);
}

/* ---------- init ---------- */
/* ---------- i18n: aplicar traducciones al HTML fijo ---------- */
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if(typeof val === 'string') el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  // etiqueta del idioma actual en ajustes
  const lc = document.getElementById('langCurrent');
  if(lc) lc.textContent = (I18N[CURRENT_LANG]?._name || 'Español') + ' ›';
  // tagline / descripción de la app
  const md = document.querySelector('meta[name=description]');
  if(md) md.setAttribute('content', t('appTagline'));
}

function openLangPicker(){
  const sheet = document.getElementById('langSheet');
  const langs = Object.keys(I18N);
  sheet.innerHTML = `<div class="sheet-grip"></div><h2>${t('language')}</h2><div class="sub">${t('languageDesc')}</div>
    <div class="lang-list">${langs.map(l=>`
      <button class="lang-opt${l===CURRENT_LANG?' sel':''}" onclick="chooseLang('${l}')">
        <span>${I18N[l]._name}</span>${l===CURRENT_LANG?icon('calendar',0)+'<span class="lang-check">✓</span>':''}
      </button>`).join('')}</div>
    <div style="height:8px"></div><button class="btn ghost block" onclick="closeLang()">${t('cancel')}</button>`;
  document.getElementById('langScrim').classList.add('open');
}
function closeLang(){ const s=document.getElementById('langScrim'); s.classList.remove('open'); s.classList.remove('above-welcome'); }
let langFromWelcome=false;
function openLangFromWelcome(){ langFromWelcome=true; openLangPicker(); document.getElementById('langScrim').classList.add('above-welcome'); }
function chooseLang(lang){
  setLang(lang);
  data.settings.lang = lang;
  save();
  applyI18n();
  renderHome();
  closeLang();
  if(langFromAuth){
    langFromAuth=false;
    renderAuth();             // re-dibuja la pantalla de cuenta en el nuevo idioma
  } else if(langFromWelcome){
    langFromWelcome=false;
    renderWelcome();          // re-dibuja la bienvenida en el nuevo idioma
  } else {
    show('settings');
  }
}

/* ---------- Bienvenida (onboarding) ---------- */
let welStep=0;
function welSlides(){
  // iconos de línea grandes para cada slide
  const ic=(p)=>`<svg viewBox="0 0 48 48" fill="none" stroke="#241A06" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  return [
    { ic: ic('<path d="M24 15 L30 24 L24 21 L18 24 Z" fill="#241A06" stroke="none"/><path d="M24 33 L18 24 L24 27 L30 24 Z" fill="#fff8e8" stroke="none"/><circle cx="24" cy="24" r="17"/>'),
      title: t('wel1Title'), text: t('wel1Text') },
    { ic: ic('<circle cx="24" cy="24" r="15"/><path d="M24 24 L24 13 M24 24 L32 29"/>'),
      title: t('wel2Title'), text: t('wel2Text') },
    { ic: ic('<path d="M24 8l4 9 10 1-7.5 7 2 10-8.5-5-8.5 5 2-10L10 18l10-1z"/>'),
      title: t('wel3Title'), text: t('wel3Text') },
    { ic: ic('<path d="M14 24l7 7 13-14"/>'),
      title: t('wel4Title'), text: t('wel4Text') }
  ];
}
function showWelcome(){
  welStep=0;
  const ov=document.getElementById('welOverlay');
  if(!ov) return;
  renderWelcome();
  ov.classList.add('open');
}
function renderWelcome(){
  const slides=welSlides();
  const s=slides[welStep];
  const sl=document.getElementById('welSlide');
  sl.innerHTML=`<div class="wel-ic">${s.ic}</div><div class="wel-title">${esc(s.title)}</div><div class="wel-text">${esc(s.text)}</div>`;
  document.getElementById('welDots').innerHTML=slides.map((_,i)=>`<span class="wel-dot${i===welStep?' on':''}"></span>`).join('');
  const last=welStep===slides.length-1;
  document.getElementById('welNext').textContent = last ? t('welStart') : t('welNext');
  const skip=document.getElementById('welSkip');
  skip.textContent=t('welSkip'); skip.style.visibility = last ? 'hidden' : 'visible';
}
function nextWelcome(){
  const slides=welSlides();
  if(welStep < slides.length-1){ welStep++; renderWelcome(); }
  else finishWelcome();
}
function skipWelcome(){ finishWelcome(); }
function finishWelcome(){
  const ov=document.getElementById('welOverlay');
  if(ov) ov.classList.remove('open');
  data.settings.seenWelcome=true; save();
  // La primera vez, la bienvenida enlaza directo con la guía de globos
  if(!data.settings.seenTour){ setTimeout(()=>startTour(true),320); }
}

/* ---------- Tour con globos (guía guiada paso a paso) ---------- */
let tourStep=0, tourItems=[], tourFirstRun=false;
function startTour(firstRun){
  tourFirstRun=!!firstRun;
  tourSheetState='';
  // Nos aseguramos de arrancar desde Inicio y cerrar cualquier hoja abierta
  closeEdit(); show('home'); renderHome();
  // Recorrido completo: cada paso resalta una parte real y explica para qué sirve.
  // action: qué hacer al mostrar el paso (p.ej. abrir el selector de modo).
  tourItems=[
    {sel:null,            title:t('tourWelcomeTitle'),  text:t('tourWelcomeText')},
    {sel:'#fab',          title:t('tourFabTitle'),      text:t('tourFab')},
    {sel:'.mode-choice',  title:t('tourModeTitle'),     text:t('tourMode'),      action:'openMode'},
    // Entramos a CREAR CON IA y explicamos sus partes
    {sel:'.ai-gen-box',   title:t('tourAiTitle'),       text:t('tourAiBox'),     action:'openAi'},
    {sel:'#aiGenBtn',     title:t('tourAiBtnTitle'),    text:t('tourAiBtn'),     action:'openAi'},
    // Entramos a CREAR MANUALMENTE y explicamos cada campo
    {sel:'#fTitle',       title:t('tourManTitleTitle'), text:t('tourManTitle'),  action:'openManual'},
    {sel:'.icon-auto-row',title:t('tourManIconTitle'),  text:t('tourManIcon'),   action:'openManual'},
    {sel:'.type-toggle',  title:t('tourManTypeTitle'),  text:t('tourManType'),   action:'openManual'},
    {sel:'#typeFields',   title:t('tourManWhenTitle'),  text:t('tourManWhen'),   action:'openManual'},
    // Volvemos a Inicio y seguimos con el resto
    {sel:'#trophiesBtn',  title:t('tourTrophiesTitle'), text:t('tourTrophies'),  before:'closeSheet'},
    {sel:'#settingsBtn',  title:t('tourSettingsTitle'), text:t('tourSettings')},
    {sel:null,            title:t('tourEndTitle'),      text:t('tourEnd')}
  ];
  tourStep=0;
  const ov=document.getElementById('tourOverlay');
  if(!ov) return;
  ov.classList.add('open');
  renderTourStep();
}
function tourCloseMode(){
  const scrim=document.getElementById('editScrim');
  if(scrim && scrim.classList.contains('open')) closeEdit();
  tourSheetState='';
}
let tourSheetState=''; // '', 'mode', 'ai' o 'manual': qué hay abierto ahora en la hoja
function renderTourStep(){
  const item=tourItems[tourStep];
  const scrim=document.getElementById('editScrim');
  const sheetOpen = scrim && scrim.classList.contains('open');
  let changedSheet=false;
  if(item.action==='openMode'){
    if(!(sheetOpen && tourSheetState==='mode')){ chooseNewGoalMode(); tourSheetState='mode'; changedSheet=true; }
  } else if(item.action==='openAi'){
    if(!(sheetOpen && tourSheetState==='ai')){ openEdit(null,'ai'); tourSheetState='ai'; changedSheet=true; }
  } else if(item.action==='openManual'){
    if(!(sheetOpen && tourSheetState==='manual')){ openEdit(null,'manual'); tourSheetState='manual'; changedSheet=true; }
  } else {
    // Paso fuera del formulario: cerrar la hoja si está abierta
    if(sheetOpen){ tourCloseMode(); changedSheet=true; }
  }
  // Damos un respiro para que el DOM se acomode tras abrir/cerrar la hoja
  setTimeout(()=>positionTour(item), changedSheet?280:0);
}
function positionTour(item){
  const spot=document.getElementById('tourSpot');
  const bub=document.getElementById('tourBubble');
  const el=item.sel ? document.querySelector(item.sel) : null;
  const last=tourStep===tourItems.length-1;
  // Texto del globo (título en negrita + descripción)
  document.getElementById('tourText').innerHTML =
    (item.title?`<b class="tour-h">${esc(item.title)}</b>`:'')+`<span>${esc(item.text)}</span>`;
  document.getElementById('tourCount').textContent=(tourStep+1)+' / '+tourItems.length;
  document.getElementById('tourBtn').textContent = last ? t('tourDone') : t('tourNext');
  const skip=document.getElementById('tourSkip');
  if(skip){ skip.textContent=t('tourSkip'); skip.style.display = (last||tourStep>0) ? 'none' : ''; }
  const back=document.getElementById('tourBack');
  if(back){ back.textContent=t('tourBack'); back.style.display = tourStep>0 ? '' : 'none'; }
  const bw=Math.min(300, innerWidth-24);
  const bh=bub.offsetHeight||140;
  if(!el){
    // Paso sin elemento: globo centrado, sin foco
    spot.style.width='0px'; spot.style.height='0px';
    spot.style.left=(innerWidth/2)+'px'; spot.style.top=(innerHeight/2)+'px';
    bub.style.left=Math.max(12,(innerWidth-bw)/2)+'px';
    bub.style.top=Math.max(12,(innerHeight-bh)/2)+'px';
    bub.style.maxWidth=bw+'px';
    return;
  }
  const r=el.getBoundingClientRect();
  const pad=8;
  spot.style.left=(r.left-pad)+'px'; spot.style.top=(r.top-pad)+'px';
  spot.style.width=(r.width+pad*2)+'px'; spot.style.height=(r.height+pad*2)+'px';
  let left=Math.min(Math.max(12, r.left+r.width/2-bw/2), innerWidth-bw-12);
  let top = r.bottom+14;
  if(top+bh > innerHeight-12) top = r.top - bh - 14;
  if(top<12) top=12;
  bub.style.left=left+'px'; bub.style.top=top+'px'; bub.style.maxWidth=bw+'px';
}
function tourNext(){
  if(tourStep < tourItems.length-1){ tourStep++; renderTourStep(); }
  else endTour();
}
function tourPrev(){
  if(tourStep > 0){ tourStep--; renderTourStep(); }
}
function endTour(){
  tourCloseMode();
  const ov=document.getElementById('tourOverlay'); if(ov) ov.classList.remove('open');
  data.settings.seenTour=true; save();
  show('home'); renderHome();
}
function skipTour(){ endTour(); }

/* ---------- Pantallas de cuenta (login / registro) ---------- */
let authMode='login';   // 'login' | 'signup'
function show(view){
  // Las pantallas de cuenta son overlays, no vistas normales
  const lo=document.getElementById('loadingOverlay');
  const ao=document.getElementById('authOverlay');
  if(view==='loading'){ if(lo) lo.classList.add('open'); return; }
  if(lo) lo.classList.remove('open');
  if(view!=='auth' && ao) ao.classList.remove('open');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const el=document.getElementById('view-'+view);
  if(el) el.classList.add('active');
  window.scrollTo(0,0);
  const fab=document.getElementById('fab');
  if(fab) fab.style.display = view==='home' ? 'flex':'none';
}
function showLogin(){
  authMode='login';
  const ao=document.getElementById('authOverlay');
  const lo=document.getElementById('loadingOverlay');
  if(lo) lo.classList.remove('open');
  if(ao) ao.classList.add('open');
  renderAuth();
}
function renderAuth(){
  const signup = authMode==='signup';
  document.getElementById('authTitle').textContent = signup ? t('authSignupTitle') : t('authLoginTitle');
  // El login no lleva subtítulo (más limpio); el registro sí lo explica
  const sub=document.getElementById('authSub');
  if(signup){ sub.textContent=t('authSignupSub'); sub.style.display=''; }
  else { sub.textContent=''; sub.style.display='none'; }
  document.getElementById('authMainBtn').textContent = signup ? t('authSignupBtn') : t('authLoginBtn');
  document.getElementById('authForgot').textContent = t('authForgot');
  document.getElementById('authForgot').style.display = signup ? 'none':'';
  document.getElementById('authOrText').textContent = t('authOr');
  document.getElementById('authGoogleText').textContent = t('authGoogle');
  document.getElementById('authFacebookText').textContent = t('authFacebook');
  document.getElementById('authSwitch').innerHTML = signup
    ? t('authHaveAccount')+' <b>'+t('authLoginBtn')+'</b>'
    : t('authNoAccount')+' <b>'+t('authSignupBtn')+'</b>';
  document.getElementById('authPass').setAttribute('autocomplete', signup?'new-password':'current-password');
  const ph=document.getElementById('authPassHint');
  if(ph){ ph.style.display = signup ? '' : 'none'; ph.textContent = t('authPassRule'); }
  document.getElementById('authErr').textContent='';
  const wl=document.getElementById('authLangName'); if(wl) wl.textContent=(I18N[CURRENT_LANG]?._name||'Español');
}
function toggleAuthMode(){ authMode = authMode==='login'?'signup':'login'; renderAuth(); }
// Devuelve la lista de requisitos que le FALTAN a la contraseña
function passwordMissing(p){
  const m=[];
  if((p||'').length<8) m.push(t('authPassLen'));
  if(!/[A-ZÁÉÍÓÚÑ]/.test(p)) m.push(t('authPassUpper'));
  if(!/[a-záéíóúñ]/.test(p)) m.push(t('authPassLower'));
  if(!/[0-9]/.test(p)) m.push(t('authPassNum'));
  if(!/[^A-Za-z0-9]/.test(p)) m.push(t('authPassSym'));
  return m;
}
function authErr(msg){ const e=document.getElementById('authErr'); if(e) e.textContent=msg||''; }
async function submitAuth(){
  const email=(document.getElementById('authEmail').value||'').trim();
  const pass=(document.getElementById('authPass').value||'');
  authErr('');
  if(!email || !pass){ authErr(t('authFillAll')); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ authErr(t('authBadEmail')); return; }
  // Al registrarse, exigir contraseña robusta
  if(authMode==='signup'){
    const miss=passwordMissing(pass);
    if(miss.length){ authErr(t('authPassWeak')+miss.join(', ')+'.'); return; }
  }
  const btn=document.getElementById('authMainBtn');
  btn.disabled=true; const old=btn.textContent; btn.textContent='…';
  try{
    const isSignup = authMode==='signup';
    const res = isSignup ? await authSignUp(email,pass) : await authSignIn(email,pass);
    if(res.error){ authErr(res.error); return; }
    if(res.needsConfirm){ authErr(t('authConfirmEmail')); return; }
    // Entrar: sincronizar y abrir la app
    await syncOnLogin(isSignup);
    document.getElementById('authOverlay').classList.remove('open');
    if(isSignup) toast(t('authCreatedOk'));   // aviso discreto de que la cuenta se creó
    enterApp();
  } finally { btn.disabled=false; btn.textContent=old; }
}
async function authForgotPass(){
  const email=(document.getElementById('authEmail').value||'').trim();
  if(!email){ authErr(t('authNeedEmailReset')); return; }
  const res=await authResetPassword(email);
  if(res.error){ authErr(res.error); } else { authErr(''); toast(t('authResetSent')); }
}
async function authProvider(p){
  authErr('');
  const res=await authSignInProvider(p);
  if(res.error) authErr(res.error);
  // si ok, el navegador redirige al proveedor
}
function openLangFromAuth(){ langFromAuth=true; openLangPicker(); document.getElementById('langScrim').classList.add('above-welcome'); }
let langFromAuth=false;

function init(){
  load();
  // Idioma: el guardado en ajustes, o el del dispositivo
  setLang((data.settings && data.settings.lang) ? data.settings.lang : detectLang());
  applyI18n();
  applyTheme();
  document.getElementById('notifSwitch').classList.toggle('on',data.settings.notif);
  renderSettingsNotifTime();
  renderHome();

  document.getElementById('fab').onclick=()=>chooseNewGoalMode();
  document.getElementById('settingsBtn').onclick=()=>{ renderAccountRow(); show('settings'); };
  document.getElementById('settingsBack').onclick=()=>{ show('home'); renderHome(); };
  document.getElementById('trophiesBtn').onclick=()=>{ show('trophies'); renderTrophies(); };
  document.getElementById('trophiesBack').onclick=()=>{ show('home'); renderHome(); };
  const tb=document.getElementById('trashBtn'); if(tb) tb.onclick=()=>openTrash();
  const tbk=document.getElementById('trashBack'); if(tbk) tbk.onclick=()=>{ show('trophies'); renderTrophies(); };
  document.getElementById('detailBack').onclick=()=>{ show('home'); renderHome(); };
  document.getElementById('themeSwitch').onclick=toggleTheme;
  document.getElementById('notifSwitch').onclick=toggleNotif;
  document.getElementById('exportRow').onclick=exportData;
  document.getElementById('importRow').onclick=()=>document.getElementById('importFile').click();
  document.getElementById('importFile').onchange=e=>{ if(e.target.files[0]) importData(e.target.files[0]); e.target.value=''; };
  document.getElementById('wipeRow').onclick=()=>confirmSheet(t('wipe'),t('confirmWipe'),t('delete'),()=>{
    data={goals:[],settings:data.settings}; save(); renderHome(); show('home');
  });
  document.getElementById('langRow').onclick=openLangPicker;
  // Botón para subir al principio: aparece al bajar, sube suave al tocarlo
  const scrollBtn=document.getElementById('scrollTopBtn');
  scrollBtn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  window.addEventListener('scroll',()=>{
    // mostrar solo si se bajó bastante y estamos en la pantalla de detalle
    const show = window.scrollY>300 && document.getElementById('view-detail').classList.contains('active');
    scrollBtn.classList.toggle('show',show);
  },{passive:true});
  // close sheets on scrim tap
  document.getElementById('editScrim').addEventListener('click',e=>{ if(e.target.id==='editScrim') closeEdit(); });
  document.getElementById('confirmScrim').addEventListener('click',e=>{ if(e.target.id==='confirmScrim') closeConfirm(); });
  document.getElementById('langScrim').addEventListener('click',e=>{ if(e.target.id==='langScrim') closeLang(); });

  if(data.settings.notif) scheduleNotif();
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }

  // Botón de Ajustes para volver a ver la guía con globos cuando el usuario quiera
  const htb=document.getElementById('howToBtn');
  if(htb) htb.onclick=()=>{ show('home'); renderHome(); setTimeout(()=>startTour(false),350); };

  // ---- Botones de la pantalla de cuenta ----
  document.getElementById('authMainBtn').onclick=submitAuth;
  document.getElementById('authForgot').onclick=authForgotPass;
  document.getElementById('authSwitch').onclick=toggleAuthMode;
  document.getElementById('authGoogle').onclick=()=>authProvider('google');
  document.getElementById('authFacebook').onclick=()=>authProvider('facebook');
  document.getElementById('authPass').addEventListener('keydown',e=>{ if(e.key==='Enter') submitAuth(); });

  // ---- Cerrar sesión y borrar cuenta (Ajustes) ----
  const soR=document.getElementById('signOutRow');
  if(soR) soR.onclick=()=>confirmSheet(t('signOut'), t('signOutMsg'), t('signOut'), async()=>{
    await authSignOut();
    location.reload();   // volver a la pantalla de login limpia
  });
  const daR=document.getElementById('deleteAccountRow');
  if(daR) daR.onclick=()=>confirmSheet(t('deleteAccount'), t('deleteAccountMsg'), t('deleteAccount'), async()=>{
    const res=await authDeleteAccount();
    if(res && res.error){ toast(res.error); return; }
    try{ localStorage.removeItem(STORE_KEY); }catch(e){}
    location.reload();
  });

  // ---- Cuentas: la app requiere iniciar sesión ----
  bootAuth();
}
// Muestra u oculta el bloque de cuenta en Ajustes según haya sesión
function renderAccountRow(){
  const grp=document.getElementById('accountGroup');
  if(!grp) return;
  if(typeof isLoggedIn==='function' && isLoggedIn()){
    grp.style.display='';
    const em=document.getElementById('accountEmail');
    if(em) em.textContent=userEmail();
  } else {
    grp.style.display='none';
  }
}

// Arranca la autenticación: si no hay sesión, muestra el login; si la hay, sincroniza.
async function bootAuth(){
  show('loading');
  let user=null;
  try{ user = await initAuth(); }catch(e){ user=null; }
  if(!cloudReady){
    // Sin conexión con el servidor de cuentas: dejamos entrar en modo local para no bloquear.
    enterApp();
    return;
  }
  if(user){
    await syncOnLogin();
    enterApp();
  } else {
    showLogin();
  }
}

// Tras iniciar sesión: baja los datos de la nube y los funde con lo local.
// isSignup=true cuando es una cuenta recién creada (debe ver bienvenida + guía).
async function syncOnLogin(isSignup){
  const cloud = await cloudPull();
  if(cloud){
    const cloudHasProfile = cloud.settings && Object.keys(cloud.settings).length>0;
    // La nube manda para metas/trofeos; conservamos tema/idioma local salvo que la nube los tenga.
    const keepLocal = { theme:(data.settings||{}).theme, lang:(data.settings||{}).lang };
    data.goals = cloud.goals || [];
    data.trophies = cloud.trophies || [];
    data.trash = cloud.trash || [];
    data.settings = Object.assign({}, keepLocal, cloud.settings||{});
    // Cuenta nueva (o perfil en la nube sin onboarding): mostrar bienvenida + guía,
    // sin importar que este dispositivo ya las hubiera visto en pruebas.
    if(isSignup || !cloudHasProfile){
      data.settings.seenWelcome = false;
      data.settings.seenTour = false;
    }
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }catch(e){}
    setLang(data.settings.lang || CURRENT_LANG);
    applyI18n(); applyTheme();
  }
  // Empuja de vuelta por si había cambios locales previos al login
  doCloudPush();
}

// Entra a la app ya autenticado (o en modo local): muestra inicio y onboarding si toca.
function enterApp(){
  renderHome(); show('home');
  if(!data.settings.seenWelcome){ setTimeout(showWelcome,300); }
  else if(!data.settings.seenTour){ setTimeout(()=>startTour(true),400); }
}
init();
