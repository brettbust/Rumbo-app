/* ============ RUMBO ============ */
const STORE_KEY = 'rumbo_v1';
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
  // overall
  let totPct=0;
  data.goals.forEach(g=>totPct+=goalProgress(g).pct);
  const avg=Math.round(totPct/data.goals.length);
  const active=data.goals.filter(g=>goalProgress(g).pct<100).length;
  let html=`<div class="hero"><div class="hero-top">
    <div class="ring-wrap">${ring(avg,88,9)}<div class="ring-label"><b>${avg}%</b><span>en total</span></div></div>
    <div class="hero-txt"><h2>${data.goals.length} ${data.goals.length===1?'meta':'metas'} en marcha</h2>
    <p>${active>0?active+(active===1?' activa, ':' activas, '):''}${data.goals.length-active} completada${data.goals.length-active===1?'':'s'}</p></div>
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
          <button class="day-edit" onclick="editStage(${i})" aria-label="Editar etapa">✏️</button>
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
        <button class="note-btn" onclick="toggleNote(${i})">${d.note?'📝 Ver nota':'💬 Añadir nota'}</button>
        <div class="note-view ${d.note?'open':''}" id="nv-${i}">
          <div class="ntext">${d.note?esc(d.note):''}</div>
          <div class="nmeta"><span>🗓️ ${d.noteDate?'Guardada: '+d.noteDate:''}</span>
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
    html+=`<button class="btn ghost block" style="margin-top:4px" onclick="addStage()">+ Añadir etapa</button>`;
  }
  html+=`<div class="btn-row" style="margin-top:20px"><button class="btn ghost" onclick="openEdit('${g.id}')">✏️ Editar meta</button><button class="btn danger ghost" onclick="deleteGoal('${g.id}')">🗑️ Eliminar</button></div>`;
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
          <div class="te">📅</div><div class="tt">Por días</div><div class="td">Marca cada día o etapa</div></div>
        <div class="type-opt${draftType==='number'?' sel':''}" id="typeNum" onclick="pickType('number')">
          <div class="te">🔢</div><div class="tt">Numérica</div><div class="td">Suma hacia un total</div></div>
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
          <button type="button" class="freq-opt${draftFreq==='daily'?' sel':''}" onclick="pickFreq('daily')">📆 Días seguidos</button>
          <button type="button" class="freq-opt${draftFreq==='weekly'?' sel':''}" onclick="pickFreq('weekly')">🗓️ Días de la semana</button>
          <button type="button" class="freq-opt${draftFreq==='manual'?' sel':''}" onclick="pickFreq('manual')">✍️ Fechas manuales</button>
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
  document.querySelectorAll('.freq-opt').forEach(b=>b.classList.remove('sel'));
  document.querySelectorAll('.freq-opt')[f==='daily'?0:f==='weekly'?1:2].classList.add('sel');
  renderFreqFields(null, draftStart||todayISO(), draftCount||30);
}
function renderFreqFields(g,start,n){
  const el=document.getElementById('freqFields');
  start = start || draftStart || todayISO();
  n = n || draftCount || 30;
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
function commitGoal(id){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){ toast('Ponle un nombre a tu meta.'); return; }
  if(draftType==='days'){
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
