/* ============================================================
   Rumbo - Cuentas y sincronización con Supabase
   Carga supabase-js, maneja sesión (login/registro/logout),
   y sincroniza metas + perfil (ajustes, trofeos, papelera).
   ============================================================ */

const SUPA_URL = 'https://xdjixzfqkcpscjmwbqeq.supabase.co';
const SUPA_KEY = 'sb_publishable_UyFCBTK_q_LfcDfLoUm5Bg_DBmt3FIc';

let supa = null;          // cliente supabase
let currentUser = null;   // usuario logueado (o null)
let syncTimer = null;     // para agrupar guardados en la nube
let cloudReady = false;   // supabase-js cargado y cliente creado

// Carga la librería supabase-js desde CDN (una sola vez)
function loadSupabaseLib(){
  return new Promise((resolve, reject)=>{
    if(window.supabase && window.supabase.createClient){ resolve(); return; }
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('No se pudo cargar Supabase'));
    document.head.appendChild(s);
  });
}

// Inicializa el cliente y recupera la sesión guardada (si la hay)
async function initAuth(){
  try{
    await loadSupabaseLib();
    supa = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
      auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
    });
    cloudReady = true;
    // ¿hay sesión activa?
    const { data:{ session } } = await supa.auth.getSession();
    currentUser = session ? session.user : null;
    // reaccionar a cambios de sesión (login social, logout, refresco)
    supa.auth.onAuthStateChange((_event, sess)=>{
      currentUser = sess ? sess.user : null;
    });
    return currentUser;
  }catch(e){
    cloudReady = false;
    return null;
  }
}

function isLoggedIn(){ return !!currentUser; }
function userEmail(){ return currentUser ? (currentUser.email || '') : ''; }

/* ---------- Autenticación ---------- */
async function authSignUp(email, password){
  if(!supa) return { error: t('authNoConn') };
  const { data, error } = await supa.auth.signUp({ email, password });
  if(error) return { error: mapAuthError(error) };
  currentUser = data.user;
  return { user: data.user, needsConfirm: !data.session };
}
async function authSignIn(email, password){
  if(!supa) return { error: t('authNoConn') };
  const { data, error } = await supa.auth.signInWithPassword({ email, password });
  if(error) return { error: mapAuthError(error) };
  currentUser = data.user;
  return { user: data.user };
}
async function authSignInProvider(provider){
  if(!supa) return { error: t('authNoConn') };
  const redirectTo = location.origin + location.pathname;
  const { error } = await supa.auth.signInWithOAuth({ provider, options:{ redirectTo } });
  if(error) return { error: mapAuthError(error) };
  return { ok:true }; // redirige fuera; al volver, initAuth recupera la sesión
}
async function authResetPassword(email){
  if(!supa) return { error: t('authNoConn') };
  const redirectTo = location.origin + location.pathname;
  const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo });
  if(error) return { error: mapAuthError(error) };
  return { ok:true };
}
async function authSignOut(){
  if(supa) { try{ await supa.auth.signOut(); }catch(e){} }
  currentUser = null;
}
async function authDeleteAccount(){
  // Borra las metas y el perfil del usuario (RLS garantiza que solo borra lo suyo).
  // La cuenta en sí (auth.users) solo se puede borrar desde el servidor; aquí
  // limpiamos sus datos y cerramos sesión. (Ver nota en la guía.)
  if(!supa || !currentUser) return { error: t('authNoConn') };
  try{
    await supa.from('goals').delete().eq('user_id', currentUser.id);
    await supa.from('profiles').delete().eq('id', currentUser.id);
    await supa.auth.signOut();
    currentUser = null;
    return { ok:true };
  }catch(e){ return { error:String(e.message||e) }; }
}

// Traduce errores comunes de Supabase a mensajes amigables
function mapAuthError(error){
  const m=(error && error.message || '').toLowerCase();
  if(m.includes('invalid login')) return t('authBadLogin');
  if(m.includes('already registered') || m.includes('already exists')) return t('authEmailTaken');
  if(m.includes('password')) return t('authWeakPass');
  if(m.includes('email')) return t('authBadEmail');
  return (error && error.message) || t('authError');
}

/* ---------- Sincronización de datos ---------- */
// Sube el estado local a la nube (metas + perfil). Se agrupa para no spamear.
function cloudSync(){
  if(!cloudReady || !currentUser) return;
  if(syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(doCloudPush, 1200);
}
async function doCloudPush(){
  if(!cloudReady || !currentUser) return;
  const uid = currentUser.id;
  try{
    // Perfil: ajustes, trofeos, papelera
    await supa.from('profiles').upsert({
      id: uid,
      email: currentUser.email || '',
      settings: data.settings || {},
      trophies: data.trophies || [],
      trash: data.trash || [],
      updated_at: new Date().toISOString()
    }, { onConflict:'id' });
    // Metas: una fila por meta
    const rows = (data.goals||[]).map(g=>goalToRow(g, uid));
    if(rows.length){
      await supa.from('goals').upsert(rows, { onConflict:'id' });
    }
    // Borrar en la nube las metas que ya no están localmente
    const localIds = (data.goals||[]).map(g=>g.id);
    const { data:cloudGoals } = await supa.from('goals').select('id').eq('user_id', uid);
    if(Array.isArray(cloudGoals)){
      const toDelete = cloudGoals.map(r=>r.id).filter(id=>!localIds.includes(id));
      if(toDelete.length) await supa.from('goals').delete().in('id', toDelete);
    }
  }catch(e){ /* sin conexión: se reintentará en el próximo save */ }
}
// Baja el estado de la nube y lo vuelca en local (al iniciar sesión)
async function cloudPull(){
  if(!cloudReady || !currentUser) return false;
  const uid = currentUser.id;
  try{
    const { data:prof } = await supa.from('profiles').select('*').eq('id', uid).maybeSingle();
    const { data:goals } = await supa.from('goals').select('*').eq('user_id', uid);
    const cloudData = {
      goals: Array.isArray(goals) ? goals.map(rowToGoal) : [],
      settings: (prof && prof.settings) ? prof.settings : (data.settings||{}),
      trophies: (prof && Array.isArray(prof.trophies)) ? prof.trophies : [],
      trash: (prof && Array.isArray(prof.trash)) ? prof.trash : []
    };
    return cloudData;
  }catch(e){ return false; }
}

// Convierte una meta de la app a una fila de la tabla goals
function goalToRow(g, uid){
  return {
    id: g.id, user_id: uid,
    title: g.title||'', emoji: g.emoji||'🎯', type: g.type||'days',
    freq: g.freq||null, weekdays: g.weekdays||[],
    start_date: g.startDate||null, end_date: g.endDate||null,
    days: g.days||[], target: (g.target!==undefined?g.target:null),
    unit: g.unit||null, current: (g.current||0), celebrated: !!g.celebrated,
    updated_at: new Date().toISOString()
  };
}
// Convierte una fila de la tabla goals a una meta de la app
function rowToGoal(r){
  const g = {
    id: r.id, title: r.title||'', emoji: r.emoji||'🎯', type: r.type||'days',
    startDate: r.start_date||'', endDate: r.end_date||'',
    celebrated: !!r.celebrated
  };
  if(r.type==='number'){
    g.target = (r.target!==null?Number(r.target):0);
    g.unit = r.unit||''; g.current = Number(r.current||0);
  } else {
    g.freq = r.freq||'daily'; g.weekdays = r.weekdays||[];
    g.days = Array.isArray(r.days)?r.days:[];
  }
  return g;
}
