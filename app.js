/* ============ RUMBO ============ */
const STORE_KEY = 'rumbo_v1';
const WORKER_URL = 'https://soft-silence-4fe6.rumboapp-oficial.workers.dev/';
let draftImportStages = [];   // etapas extraídas de un archivo importado
const MOTIV = [
 "Cada paso cuenta, y acabas de dar uno.",
 "La constancia vence al talento. Sigue así.",
 "Bien hecho. Tu yo del futuro te lo agradece.",
 "Lo empezado ya no vuelve a cero. Adelante.",
 "Pequeños avances diarios construyen grandes logros.",
 "Hoy estás más cerca que ayer. Eso es progreso.",
 "No subestimes lo lejos que has llegado.",
 "El impulso se construye un día a la vez. ¡Vas bien!",
 "Avanzar es ganar. Y hoy ganaste otra vez.",
 "Lo difícil de hoy será lo natural de mañana.",
 "Tu esfuerzo se nota en esa barra. ¡Sigue!",
 "Terminar lo que empiezas es un superpoder. Lo tienes.",
 "Un paso más, una excusa menos. Orgulloso de ti.",
 "La disciplina de hoy es la libertad de mañana.",
 "Estás convirtiendo la intención en hábito. Genial.",
 "Nada detiene a quien avanza con propósito.",
 "Mira cuánto has recorrido. La meta se acerca.",
 "Cada marca es una promesa que te cumples.",
 "El progreso no siempre se ve, pero hoy sí. ¡Bravo!",
 "Sigue el ritmo: lo estás haciendo de verdad.",
 "Que nada apague tus ganas. Vas por buen camino.",
 "Hoy elegiste avanzar. Esa decisión suma.",
 "La meta está más cerca del final que del inicio.",
 "Constancia sobre motivación. Y aquí sigues.",
 "El último tramo sabe distinto. Sigue subiendo.",
 "Estás a un paso más de lograrlo. No aflojes.",
 "Grande no es el paso, grande es no detenerse.",
 "Lo estás haciendo. Punto. Sigue adelante.",
 "Tu compromiso contigo mismo se ve hoy.",
 "Casi en la cima. Este avance pesa. ¡Vamos!"
];
const FINISH_MSG = "¡Lo lograste! Completaste tu meta. Date el crédito que mereces. 🎉";
const EMOJIS = ["🎯","📚","🏃","💪","🧠","💰","🎸","🎨","🧘","🌱","💻","✍️","🍎","💧","⭐","🔥"];
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
  trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  calClock:'<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="18" cy="18" r="4"/><path d="M18 16.5V18l1 1"/>',
  hash:'<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  pen:'<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'
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

/* ---------- storage ---------- */
function load(){
  try{ const raw=localStorage.getItem(STORE_KEY); if(raw) data=JSON.parse(raw); }catch(e){}
  if(!data.settings) data.settings={theme:'light',notif:false};
  if(!data.goals) data.goals=[];
}
function save(){ try{ localStorage.setItem(STORE_KEY,JSON.stringify(data)); }catch(e){ toast('No se pudo guardar. ¿Espacio lleno?'); } }

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
const WD_LABELS=['D','L','M','X','J','V','S'];
const WD_FULL=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

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
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ---------- navigation ---------- */
function show(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+view).classList.add('active');
  window.scrollTo(0,0);
  document.getElementById('fab').style.display = view==='home' ? 'flex':'none';
}

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
      <h3>Empieza tu primera meta</h3>
      <p>Elige algo que quieras lograr, ponle un plazo y marca tu avance cada día. Pulsa el botón <b>Nueva meta</b> de abajo para empezar.</p>
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
    <div class="ring-wrap">${ring(ringPct,88,9)}<div class="ring-label"><b>${done}/${total}</b><span>metas</span></div></div>
    <div class="hero-txt"><h2>${done} de ${total} completada${done===1?'':'s'}</h2>
    <p>${active>0?('Tienes '+active+(active===1?' meta activa':' metas activas')):'¡Todo completado! 🎉'}</p></div>
  </div></div>`;
  html+=`<div class="section-label">Mis metas</div>`;
  data.goals.forEach(g=>{
    const p=goalProgress(g);
    const sub = g.type==='number' ? `${p.done} / ${p.total} ${esc(g.unit||'')}` : `${p.done} / ${p.total} días`;
    const deadline = g.endDate ? 'Meta: '+fmtDateShort(g.endDate) : '';
    html+=`<div class="goal" onclick="openDetail('${g.id}')">
      <div class="accent-strip"></div>
      <div class="goal-head">
        <div class="goal-emoji">${g.emoji||'🎯'}</div>
        <div class="goal-title"><h3>${esc(g.title)}</h3><div class="meta">${sub}</div></div>
        <div class="goal-pct">${p.pct}%</div>
      </div>
      <div class="mini-track"><div class="mini-fill" style="width:${p.pct}%"></div></div>
      <div class="goal-foot"><span>${p.pct===100?'✅ Completada':'En progreso'}</span><span>${deadline}</span></div>
    </div>`;
  });
  el.innerHTML=html;
}

/* ---------- DETAIL ---------- */
function openDetail(id){
  currentGoalId=id;
  renderDetail();
  show('detail');
}
function renderDetail(){
  const g=data.goals.find(x=>x.id===currentGoalId);
  if(!g){ show('home'); return; }
  const p=goalProgress(g);
  const el=document.getElementById('detailContent');
  let html=`<div class="detail-hero">
    <div class="demoji">${g.emoji||'🎯'}</div>
    <h2>${esc(g.title)}</h2>
    <div class="dmeta">${g.startDate?fmtDate(g.startDate):''}${g.endDate?' → '+fmtDate(g.endDate):''}</div>
    <div class="big-ring">${ring(p.pct,150,12)}<div class="lbl"><b>${p.pct}%</b><span>completado</span></div></div>
    <div class="detail-count">${g.type==='number'?`${p.done} de ${p.total} ${esc(g.unit||'')}`:`${p.done} de ${p.total} días`}</div>
    <div class="motiv" id="motivBox"><span class="ico">🌟</span><span id="motivText">${p.pct===100?FINISH_MSG:(p.done>0?MOTIV[Math.min(p.done-1,MOTIV.length-1)]:'Marca tu primer avance para arrancar.')}</span></div>
  </div>`;

  if(g.type==='number'){
    html+=`<div class="num-panel">
      <div class="num-row"><span class="cur">${p.done}</span><span class="of">/ ${p.total} ${esc(g.unit||'')}</span></div>
      <div class="num-add">
        <input type="number" id="numInput" placeholder="¿Cuánto sumaste?" inputmode="decimal">
        <button class="btn primary" onclick="addNumber()">Sumar</button>
      </div>
      <div class="btn-row"><button class="btn sm ghost" onclick="quickAdd(1)">+1</button><button class="btn sm ghost" onclick="quickAdd(5)">+5</button><button class="btn sm ghost" onclick="quickAdd(10)">+10</button><button class="btn sm ghost" onclick="setNumber()">Ajustar total…</button></div>
    </div>`;
  } else {
    html+=`<div class="days-head"><h3>Etapas (${p.done}/${p.total})</h3></div>`;
    g.days.forEach((d,i)=>{
      const nk='n'+i;
      html+=`<div class="day${d.done?' done':''}">
        <div class="day-top">
          <button class="check ${d.done?'on':''}" onclick="toggleDay(${i})" aria-label="Marcar">${d.done?'✓':''}</button>
          <div class="day-info"><div class="dtitle">${esc(d.label||('Día '+(i+1)))}</div><div class="ddate">${d.date?fmtDate(d.date):''}</div></div>
          <button class="day-edit" onclick="editStage(${i})" aria-label="Editar etapa">${icon('pen',16)}</button>
        </div>
        <div class="stage-edit" id="se-${i}">
          <input type="text" id="sl-${i}" maxlength="80" placeholder="Nombre de la etapa" value="${esc(d.label||('Día '+(i+1)))}">
          <input type="date" id="sd-${i}" value="${d.date||''}">
          <div class="note-actions">
            <button class="btn sm primary" onclick="saveStage(${i})">Guardar</button>
            <button class="btn sm ghost" onclick="cancelStage(${i})">Cancelar</button>
            <button class="btn sm danger ghost" onclick="deleteStage(${i})">Borrar etapa</button>
          </div>
        </div>
        <button class="note-btn" onclick="toggleNote(${i})">${icon(d.note?'note':'message',14)} ${d.note?'Ver nota':'Añadir nota'}</button>
        <div class="note-view ${d.note?'open':''}" id="nv-${i}">
          <div class="ntext">${d.note?esc(d.note):''}</div>
          <div class="nmeta"><span>${icon('calendar',13)} ${d.noteDate?'Guardada: '+d.noteDate:''}</span>
            <button class="btn sm ghost" onclick="editNote(${i})">Editar</button>
            <button class="btn sm danger ghost" onclick="delNote(${i})">Eliminar</button>
          </div>
        </div>
        <div class="note-edit" id="ne-${i}">
          <textarea id="nt-${i}" placeholder="Escribe una nota para esta etapa…">${d.note?esc(d.note):''}</textarea>
          <div class="note-actions"><button class="btn sm primary" onclick="saveNote(${i})">Guardar nota</button><button class="btn sm ghost" onclick="cancelNote(${i})">Cancelar</button></div>
        </div>
      </div>`;
    });
    html+=`<button class="btn ghost block" style="margin-top:4px" onclick="addStage()">${icon('plus',16)} Añadir etapa</button>`;
  }
  html+=`<div class="btn-row" style="margin-top:20px"><button class="btn ghost" onclick="openEdit('${g.id}')">${icon('edit',15)} Editar meta</button><button class="btn danger ghost" onclick="deleteGoal('${g.id}')">${icon('trash',15)} Eliminar</button></div>`;
  el.innerHTML=html;
}

/* ---------- day actions ---------- */
function toggleDay(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  g.days[i].done=!g.days[i].done;
  if(g.days[i].done && !g.days[i].date) g.days[i].date=todayISO();
  save();
  const p=goalProgress(g);
  renderDetail();
  if(g.days[i].done){ flashMotiv(p); }
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
  g.days[i].label = label || ('Día '+(i+1));
  g.days[i].date = date || g.days[i].date;
  // keep order by date
  g.days.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  save(); renderDetail(); toast('Etapa actualizada');
}
function deleteStage(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  if(g.days.length<=1){ toast('Una meta necesita al menos una etapa.'); return; }
  confirmSheet('Borrar etapa','Se eliminará esta etapa con su nota. ¿Continuar?','Eliminar',()=>{
    g.days.splice(i,1); save(); renderDetail();
  });
}
function addStage(){
  const g=data.goals.find(x=>x.id===currentGoalId);
  const last=g.days[g.days.length-1];
  const nextDate = last&&last.date ? addDays(last.date,1) : todayISO();
  g.days.push({label:'Día '+(g.days.length+1),date:nextDate,done:false});
  save(); renderDetail();
  toast('Etapa añadida. Pulsa el lápiz para nombrarla.');
}
function flashMotiv(p){
  const box=document.getElementById('motivBox');
  if(!box) return;
  box.style.opacity=0;
  setTimeout(()=>{
    const t=document.getElementById('motivText');
    if(t) t.textContent = p.pct===100?FINISH_MSG:MOTIV[Math.min(p.done-1,MOTIV.length-1)];
    const ico=box.querySelector('.ico'); if(ico) ico.textContent=p.pct===100?'🎉':'🌟';
    box.style.opacity=1;
  },180);
  if(p.pct===100) confetti();
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
  if(!v){ toast('Escribe algo antes de guardar.'); return; }
  g.days[i].note=v; g.days[i].noteDate=fmtDate(todayISO());
  save(); renderDetail(); toast('Nota guardada');
}
function delNote(i){
  const g=data.goals.find(x=>x.id===currentGoalId);
  confirmSheet('Eliminar nota','¿Seguro que quieres borrar esta nota?','Eliminar',()=>{
    delete g.days[i].note; delete g.days[i].noteDate; save(); renderDetail();
  });
}

/* ---------- number actions ---------- */
function addNumber(){
  const inp=document.getElementById('numInput');
  const v=parseFloat(inp.value);
  if(isNaN(v)){ toast('Escribe un número.'); return; }
  applyNumber(v);
  inp.value='';
}
function quickAdd(v){ applyNumber(v); }
function applyNumber(v){
  const g=data.goals.find(x=>x.id===currentGoalId);
  g.current=Math.max(0,Math.round((g.current+v)*100)/100);
  save();
  const p=goalProgress(g);
  renderDetail();
  flashMotiv(p);
}
function setNumber(){
  const g=data.goals.find(x=>x.id===currentGoalId);
  confirmSheet('Ajustar total','Escribe el total acumulado que quieres fijar.','Guardar',()=>{
    const v=parseFloat(document.getElementById('cfInput').value);
    if(isNaN(v)){ toast('Número no válido'); return; }
    g.current=Math.max(0,v); save(); renderDetail();
  },`<input class="field" id="cfInput" type="number" inputmode="decimal" value="${g.current}" style="width:100%;padding:12px 13px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);border-radius:12px;font-size:15px;margin-top:4px">`);
}

/* ---------- create / edit ---------- */
function openEdit(id){
  const editing = !!id;
  let g = editing ? data.goals.find(x=>x.id===id) : null;
  draftType = g ? g.type : 'days';
  draftEmoji = g ? (g.emoji||'🎯') : '🎯';
  draftFreq = g && g.freq ? g.freq : 'daily';
  draftWeekdays = g && g.weekdays ? g.weekdays.slice() : [];
  draftManualDates = g && g.type==='days' && g.freq==='manual' ? g.days.map(d=>d.date) : [];
  draftImportStages = [];
  draftStart = g && g.startDate ? g.startDate : todayISO();
  draftCount = g && g.type==='days' ? g.days.length : 30;
  const sheet=document.getElementById('editSheet');
  sheet.innerHTML=`
    <div class="sheet-grip"></div>
    <h2>${editing?'Editar meta':'Nueva meta'}</h2>
    <div class="sub">${editing?'Cambia los detalles de tu meta.':'Define qué quieres lograr y en cuánto tiempo.'}</div>

    <div class="field"><label>¿Qué quieres lograr?</label>
      <input id="fTitle" type="text" maxlength="60" placeholder="Ej: Leer un libro, correr 5K…" value="${g?esc(g.title):''}"></div>

    <div class="field"><label>Icono</label>
      <div class="emoji-picker" id="emojiPicker">${EMOJIS.map(e=>`<button class="emoji-opt${e===draftEmoji?' sel':''}" onclick="pickEmoji('${e}',this)">${e}</button>`).join('')}</div></div>

    <div class="field"><label>Tipo de meta</label>
      <div class="type-toggle">
        <div class="type-opt${draftType==='days'?' sel':''}" id="typeDays" onclick="pickType('days')">
          <div class="te">${icon('calendar',24)}</div><div class="tt">Por días</div><div class="td">Marca cada día o etapa</div></div>
        <div class="type-opt${draftType==='number'?' sel':''}" id="typeNum" onclick="pickType('number')">
          <div class="te">${icon('hash',24)}</div><div class="tt">Numérica</div><div class="td">Suma hacia un total</div></div>
      </div></div>

    <div id="typeFields"></div>

    <button class="btn primary block" onclick="commitGoal(${editing?`'${id}'`:'null'})">${editing?'Guardar cambios':'Crear meta'}</button>
    <div style="height:8px"></div>
    <button class="btn ghost block" onclick="closeEdit()">Cancelar</button>
  `;
  renderTypeFields(g);
  document.getElementById('editScrim').classList.add('open');
}
function pickEmoji(e,btn){ draftEmoji=e; document.querySelectorAll('#emojiPicker .emoji-opt').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel'); }
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
    el.innerHTML=`
      <div class="field"><label>¿Con qué frecuencia?</label>
        <div class="freq-toggle">
          <button type="button" class="freq-opt${draftFreq==='daily'?' sel':''}" onclick="pickFreq('daily')">${icon('calendar',17)} Días seguidos</button>
          <button type="button" class="freq-opt${draftFreq==='weekly'?' sel':''}" onclick="pickFreq('weekly')">${icon('calClock',17)} Días de la semana</button>
          <button type="button" class="freq-opt${draftFreq==='manual'?' sel':''}" onclick="pickFreq('manual')">${icon('pen',17)} Fechas manuales</button>
          <button type="button" class="freq-opt${draftFreq==='import'?' sel':''}" onclick="pickFreq('import')">${icon('upload',17)} Importar cronograma</button>
        </div>
      </div>
      <div id="freqFields"></div>`;
    renderFreqFields(g,start,n);
  } else {
    const tgt = g&&g.type==='number' ? g.target : '';
    const unit = g&&g.type==='number' ? esc(g.unit||'') : '';
    el.innerHTML=`<div class="field"><label>Meta a alcanzar (número)</label>
      <input id="fTarget" type="number" min="1" inputmode="decimal" placeholder="Ej: 100" value="${tgt}"></div>
      <div class="field"><label>Unidad (opcional)</label>
      <input id="fUnit" type="text" maxlength="20" placeholder="páginas, km, €, sesiones…" value="${unit}"></div>
      <div class="field"><label>Fecha de inicio</label>
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
    el.innerHTML=`
      <div class="field">
        <label>Sube tu cronograma</label>
        <div class="import-zone" id="importZone" onclick="document.getElementById('importFileInput').click()">
          <div class="iz-icon">${icon('upload',26)}</div>
          <div class="iz-main">Toca para elegir un archivo</div>
          <div class="iz-sub">CSV · Excel · PDF · Imagen · Word</div>
        </div>
        <input type="file" id="importFileInput" accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.webp,.docx" style="display:none" onchange="handleImportFile(this)">
        <div class="import-badges">
          <span class="ib ib-free">${icon('calendar',12)} CSV y Excel: gratis</span>
          <span class="ib ib-ai">${icon('upload',12)} PDF, imagen y Word: con IA</span>
        </div>
        <div class="hint">La app leerá tu cronograma y creará una etapa por cada fecha. Podrás revisarlas antes de crear la meta.</div>
      </div>
      <div id="importStatus"></div>
      <div id="importPreview"></div>`;
    return;
  }
  if(draftFreq==='manual'){
    el.innerHTML=`
      <div class="field"><label id="manualLbl">Tus fechas (${draftManualDates.length})</label>
        <div class="num-add" style="margin-bottom:10px">
          <input type="date" id="manualPick" value="${todayISO()}">
          <button type="button" class="btn primary" onclick="addManualDate()">Añadir fecha</button>
        </div>
        <div class="manual-list" id="manualList">${renderManualList()}</div>
        <div class="hint">Añade una por una las fechas en las que quieras una etapa. El orden se ajusta solo. Luego podrás nombrarlas.</div>
      </div>`;
  } else if(draftFreq==='weekly'){
    el.innerHTML=`
      <div class="field"><label>¿Qué días de la semana?</label>
        <div class="wd-picker">${[1,2,3,4,5,6,0].map(i=>`<button type="button" class="wd-opt${draftWeekdays.includes(i)?' sel':''}" onclick="toggleWd(${i})" aria-label="${WD_FULL[i]}">${WD_LABELS[i]}</button>`).join('')}</div>
        <div class="hint">Elige uno o más días. Las etapas caerán en esos días.</div>
      </div>
      <div class="field"><label>¿Cuántas etapas en total?</label>
        <input id="fCount" type="number" min="1" max="366" inputmode="numeric" value="${n}">
        <div class="hint">Cuántas clases, sesiones o repeticiones quieres en total.</div></div>
      <div class="field"><label>Fecha de inicio</label>
        <input id="fStart" type="date" value="${start}"></div>`;
  } else { // daily
    el.innerHTML=`
      <div class="field"><label>¿Cuántos días seguidos?</label>
        <input id="fCount" type="number" min="1" max="366" inputmode="numeric" value="${n}">
        <div class="hint">Una etapa por día consecutivo desde la fecha de inicio.</div></div>
      <div class="field"><label>Fecha de inicio</label>
        <input id="fStart" type="date" value="${start}"></div>`;
  }
}
function renderManualList(){
  if(draftManualDates.length===0) return `<div class="hint" style="margin:0">Aún no has añadido fechas.</div>`;
  const sorted=draftManualDates.slice().sort();
  return sorted.map(d=>`<div class="manual-chip">${fmtDate(d)}<button type="button" onclick="removeManualDate('${d}')" aria-label="Quitar">✕</button></div>`).join('');
}
function refreshManualLbl(){
  const lbl=document.getElementById('manualLbl');
  if(lbl) lbl.textContent='Tus fechas ('+draftManualDates.length+')';
}
function addManualDate(){
  const el=document.getElementById('manualPick');
  const v=el&&el.value;
  if(!v){ toast('Elige una fecha primero.'); return; }
  if(draftManualDates.includes(v)){ toast('Esa fecha ya está en la lista.'); return; }
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
      importSpinner('Leyendo tu archivo CSV…');
      const text = await file.text();
      const stages = parseCSV(text);
      finishImport(stages);
    } else if(name.endsWith('.xlsx') || name.endsWith('.xls')){
      importSpinner('Leyendo tu Excel…');
      const stages = await parseExcel(file);
      finishImport(stages);
    } else if(name.endsWith('.pdf') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')){
      importSpinner('Analizando con IA… esto puede tardar unos segundos.');
      const stages = await parseWithAI_file(file);
      finishImport(stages);
    } else if(name.endsWith('.docx')){
      importSpinner('Leyendo el documento Word…');
      const text = await parseDocxText(file);
      importSpinner('Analizando con IA… esto puede tardar unos segundos.');
      const stages = await parseWithAI_text(text);
      finishImport(stages);
    } else {
      importStatus(`<div class="import-err">Formato no admitido. Usa CSV, Excel, PDF, imagen o Word.</div>`);
    }
  }catch(err){
    importStatus(`<div class="import-err">No se pudo leer el archivo: ${esc(String(err.message||err))}</div>`);
  }
  input.value='';
}

/* ---- CSV (sin IA) ---- */
function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length===0) throw new Error('El archivo está vacío');
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
  if(clean.length===0) throw new Error('La hoja está vacía');
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
async function parseWithAI_file(file){
  const base64 = await fileToBase64(file);
  const mimeType = file.type || guessMime(file.name);
  const resp = await fetch(WORKER_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ fileBase64: base64, mimeType })
  });
  return await handleAIResponse(resp);
}
/* ---- IA: texto (Word) ---- */
async function parseWithAI_text(text){
  const resp = await fetch(WORKER_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text })
  });
  return await handleAIResponse(resp);
}
async function handleAIResponse(resp){
  if(!resp.ok){
    let msg='El servicio de IA no respondió bien.';
    try{ const j=await resp.json(); if(j.error) msg=j.error; }catch(e){}
    throw new Error(msg);
  }
  const data = await resp.json();
  if(!Array.isArray(data.stages)) throw new Error('La IA no devolvió etapas válidas.');
  return data.stages.map(s=>({date:normalizeDate(s.date)||s.date, label:(s.label||'Etapa').trim()})).filter(s=>s.date);
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
function finishImport(stages){
  if(!stages || stages.length===0){
    importStatus(`<div class="import-err">No encontré fechas en el archivo. Revisa que tenga una columna de fecha, o prueba con otro formato.</div>`);
    return;
  }
  stages.sort((a,b)=>a.date.localeCompare(b.date));
  draftImportStages = stages;
  importStatus(`<div class="import-ok">${icon('calendar',14)} Encontré ${stages.length} ${stages.length===1?'etapa':'etapas'}. Revísalas y crea la meta.</div>`);
  const prev = stages.slice(0,8).map(s=>`<div class="prev-row"><span class="prev-date">${fmtDateShort(s.date)}</span><span class="prev-label">${esc(s.label)}</span></div>`).join('');
  const more = stages.length>8 ? `<div class="prev-more">y ${stages.length-8} más…</div>` : '';
  document.getElementById('importPreview').innerHTML=`<div class="import-prev">${prev}${more}</div>`;
}

function commitGoal(id){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){ toast('Ponle un nombre a tu meta.'); return; }
  if(draftType==='days'){
    // Caso especial: cronograma importado (trae fecha + nombre por etapa)
    if(draftFreq==='import'){
      if(!draftImportStages || draftImportStages.length===0){ toast('Sube un cronograma primero.'); return; }
      const imp = draftImportStages.slice().sort((a,b)=>a.date.localeCompare(b.date));
      const start = imp[0].date;
      const endDate = imp[imp.length-1].date;
      const days = imp.map(s=>({label:s.label||'Etapa', date:s.date, done:false}));
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
      toast('¡Meta creada desde tu cronograma!');
      return;
    }
    // Build the list of dates according to frequency
    let dates=[];
    let start=todayISO();
    if(draftFreq==='manual'){
      if(draftManualDates.length===0){ toast('Añade al menos una fecha.'); return; }
      dates=draftManualDates.slice().sort();
      start=dates[0];
    } else {
      const startEl=document.getElementById('fStart');
      const countEl=document.getElementById('fCount');
      start=(startEl&&startEl.value)||draftStart||todayISO();
      let count=countEl?parseInt(countEl.value):draftCount;
      if(isNaN(count)||count<1){ toast('Indica cuántas etapas.'); return; }
      count=Math.min(count,366);
      if(draftFreq==='weekly'){
        if(draftWeekdays.length===0){ toast('Elige al menos un día de la semana.'); return; }
        dates=genDates(start,count,'weekly',draftWeekdays);
      } else {
        dates=genDates(start,count,'daily');
      }
    }
    if(dates.length===0){ toast('No se pudieron generar las fechas. Revisa los datos.'); return; }
    const endDate=dates[dates.length-1];
    if(id){
      const g=data.goals.find(x=>x.id===id);
      g.title=title; g.emoji=draftEmoji; g.startDate=start; g.freq=draftFreq; g.weekdays=draftWeekdays.slice();
      const old = g.type==='days' ? g.days : [];
      g.type='days';
      g.days=dates.map((d,i)=>{
        const prev=old[i];
        return {label: prev&&prev.label ? prev.label : ('Día '+(i+1)),
                date:d, done: prev?prev.done:false,
                note: prev?prev.note:undefined, noteDate: prev?prev.noteDate:undefined};
      });
      g.endDate=endDate;
    } else {
      const days=dates.map((d,i)=>({label:'Día '+(i+1),date:d,done:false}));
      data.goals.push({id:uid(),title,emoji:draftEmoji,type:'days',freq:draftFreq,weekdays:draftWeekdays.slice(),startDate:start,endDate,days});
    }
  } else {
    const start=document.getElementById('fStart').value||todayISO();
    const target=parseFloat(document.getElementById('fTarget').value);
    if(isNaN(target)||target<=0){ toast('Indica el número a alcanzar.'); return; }
    const unit=document.getElementById('fUnit').value.trim();
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
  toast(id?'Meta actualizada':'¡Meta creada!');
}
function closeEdit(){ document.getElementById('editScrim').classList.remove('open'); }

function deleteGoal(id){
  confirmSheet('Eliminar meta','Se borrará esta meta con todo su progreso y notas. No se puede deshacer.','Eliminar',()=>{
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
    <button class="btn ${okLabel==='Eliminar'?'danger':'primary'} block" id="confirmOk" style="margin-top:12px">${okLabel}</button>
    <div style="height:8px"></div><button class="btn ghost block" onclick="closeConfirm()">Cancelar</button>`;
  document.getElementById('confirmScrim').classList.add('open');
  document.getElementById('confirmOk').onclick=()=>{ const cb2=confirmCb; closeConfirm(); if(cb2) cb2(); };
}
function closeConfirm(){ document.getElementById('confirmScrim').classList.remove('open'); confirmCb=null; }

/* ---------- confetti ---------- */
function confetti(){
  const colors=['#0F6E56','#1D9E75','#F4B740','#7CE0BE','#C24A3E'];
  for(let i=0;i<70;i++){
    const c=document.createElement('div');
    c.className='confetti';
    c.style.left=Math.random()*100+'vw'; c.style.top='-20px';
    c.style.background=colors[i%colors.length];
    document.body.appendChild(c);
    const dur=1800+Math.random()*1400;
    c.animate([{transform:'translateY(0) rotate(0)',opacity:1},{transform:`translateY(${innerHeight+40}px) rotate(${720*Math.random()}deg)`,opacity:.3}],{duration:dur,easing:'ease-in'});
    setTimeout(()=>c.remove(),dur);
  }
}

/* ---------- settings ---------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme',data.settings.theme);
  document.getElementById('themeSwitch').classList.toggle('on',data.settings.theme==='dark');
  document.querySelector('meta[name=theme-color]').setAttribute('content',data.settings.theme==='dark'?'#141714':'#0F6E56');
}
function toggleTheme(){ data.settings.theme=data.settings.theme==='dark'?'light':'dark'; save(); applyTheme(); }

function exportData(){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='rumbo-backup-'+todayISO()+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('Copia descargada');
}
function importData(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const obj=JSON.parse(r.result);
      if(!obj.goals) throw 0;
      confirmSheet('Importar datos','Esto reemplazará tus metas actuales por las de la copia. ¿Continuar?','Importar',()=>{
        data=obj; if(!data.settings)data.settings={theme:'light',notif:false};
        save(); applyTheme(); renderHome(); show('home'); toast('Datos importados');
      });
    }catch(e){ toast('Archivo no válido'); }
  };
  r.readAsText(file);
}

/* ---------- notifications ---------- */
async function toggleNotif(){
  if(!data.settings.notif){
    if(!('Notification' in window)){ toast('Tu navegador no admite avisos'); return; }
    const perm=await Notification.requestPermission();
    if(perm!=='granted'){ toast('Permiso denegado'); return; }
    data.settings.notif=true; save();
    document.getElementById('notifSwitch').classList.add('on');
    toast('Recordatorio activado');
    scheduleNotif();
  } else {
    data.settings.notif=false; save();
    document.getElementById('notifSwitch').classList.remove('on');
    toast('Recordatorio desactivado');
  }
}
function scheduleNotif(){
  // lightweight: fires while app/tab is open, next 20:00
  if(!data.settings.notif || Notification.permission!=='granted') return;
  const now=new Date(); const t=new Date(); t.setHours(20,0,0,0);
  if(t<=now) t.setDate(t.getDate()+1);
  setTimeout(()=>{
    if(data.settings.notif && Notification.permission==='granted'){
      new Notification('Rumbo',{body:'¿Ya avanzaste hoy en tus metas? Un pequeño paso cuenta.'});
    }
    scheduleNotif();
  }, t-now);
}

/* ---------- init ---------- */
function init(){
  load();
  applyTheme();
  document.getElementById('notifSwitch').classList.toggle('on',data.settings.notif);
  renderHome();

  document.getElementById('fab').onclick=()=>openEdit();
  document.getElementById('settingsBtn').onclick=()=>show('settings');
  document.getElementById('settingsBack').onclick=()=>{ show('home'); renderHome(); };
  document.getElementById('detailBack').onclick=()=>{ show('home'); renderHome(); };
  document.getElementById('themeSwitch').onclick=toggleTheme;
  document.getElementById('notifSwitch').onclick=toggleNotif;
  document.getElementById('exportRow').onclick=exportData;
  document.getElementById('importRow').onclick=()=>document.getElementById('importFile').click();
  document.getElementById('importFile').onchange=e=>{ if(e.target.files[0]) importData(e.target.files[0]); e.target.value=''; };
  document.getElementById('wipeRow').onclick=()=>confirmSheet('Borrar todo','Se eliminarán todas tus metas, avances y notas de este dispositivo. No se puede deshacer.','Eliminar',()=>{
    data={goals:[],settings:data.settings}; save(); renderHome(); show('home');
  });
  // close sheets on scrim tap
  document.getElementById('editScrim').addEventListener('click',e=>{ if(e.target.id==='editScrim') closeEdit(); });
  document.getElementById('confirmScrim').addEventListener('click',e=>{ if(e.target.id==='confirmScrim') closeConfirm(); });

  if(data.settings.notif) scheduleNotif();
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
}
init();
