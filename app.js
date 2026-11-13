'use strict';
// ===== Configuración =====
const CFG = window.CONFIG || {};
const MODO_LOCAL = !window.supabase || !CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes('TU-PROYECTO');
const sb = MODO_LOCAL ? null : window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
const KEY = 'bloc-rossi:v2';
const CAMPOS = ['id', 'tipo', 'titulo', 'cuerpo', 'items', 'color', 'fijada', 'eliminada', 'creada_en', 'actualizada_en'];
const COLORS = ['rosa', 'menta', 'sol', 'lila', 'cielo'];

// Para cambiar los mensajes diarios, edita esta lista. Cada día se muestra uno distinto.
const MSGS = [
"Buenos días, mi amor. Hoy no tienes que ser perfecta, solo tienes que ser tú. Eso ya me parece lo mejor del mundo.",
"Rossi, todo lo que estás construyendo ahora te va a llevar lejos. Te lo digo porque te veo esforzarte todos los días.",
"Si hoy se complica algo, respira. Lo vas a resolver como siempre lo haces, y yo estoy aquí para lo que necesites.",
"Quiero que hoy te trates con el mismo cariño con el que me tratas a mí.",
"Tu sonrisa me arregla el día, así que sonríe aunque sea un ratico. Acuérdate de que alguien acá te quiere un montón.",
"Un paso pequeño también cuenta. Hoy da uno, el que puedas, y ya habrás ganado.",
"Eres más fuerte de lo que crees y más bonita de lo que te dejas ver. Hoy acuérdate de las dos cosas.",
"No importa qué tan largo sea el día: al final siempre quiero llegar a hablar contigo.",
"Descansar también es avanzar. Si hoy toca parar un rato, páralo sin culpa.",
"Gracias por ser como eres, Rossi. Haces mi vida más linda sin darte cuenta.",
"Hoy te mando toda la energía buena que tengo. Úsala para lo que quieras.",
"Lo que te preocupa hoy probablemente se va a ver más pequeño mañana. Y si no, lo enfrentamos juntos.",
"Qué orgulloso estoy de ti. Lo digo en serio, y no lo digo lo suficiente.",
"Tómate agua, come rico y date un abrazo fuerte. Cuando pueda, el abrazo es mío.",
"Mereces cosas bonitas y las vas a tener. Mientras llegan, aquí tienes un mensaje con todo mi cariño.",
"No tienes que tener todo resuelto hoy. Solo tienes que seguir, y yo sigo contigo.",
"Hoy es un buen día para acordarte de lo mucho que has logrado.",
"Si te sientes cansada, escríbelo aquí, suéltalo y después vuelve más tranquila. Para eso es este bloc.",
"Me encanta imaginar todo lo que vamos a vivir. Hoy es un pedacito más de eso.",
"Eres mi persona favorita, y eso no cambia con los días buenos ni con los malos.",
"Confía en ti. Yo ya lo hago desde hace rato.",
"Que hoy te salga algo bien bonito, aunque sea pequeño. Y si no, igual me tienes a mí.",
"Cada día contigo me enseña algo nuevo sobre querer bien. Gracias por eso, Rossi.",
"Haz lo que tengas que hacer hoy, pero guarda un ratico para ti.",
"Eres capaz de cosas enormes. Empieza por la primera tarea de tu lista.",
"Te pienso más de lo que te digo. Hoy te lo digo.",
"Si hoy te equivocas, no pasa nada. Aprender también es ir bien.",
"Vas a llegar a donde quieres, y yo quiero estar ahí cuando llegues.",
"Hoy te regalo esta frase: eres suficiente, justo como estás.",
"Cierra los ojos un segundo, respira hondo y recuerda que te quiero muchísimo."
];

const TPL = [
 {name:'Nota en blanco',color:'rosa',tipo:'text',titulo:'',cuerpo:''},
 {name:'Pendientes de hoy',color:'sol',tipo:'list',titulo:'Pendientes de hoy',items:['','','']},
 {name:'Tres cosas buenas',color:'rosa',tipo:'text',titulo:'Tres cosas buenas de hoy',cuerpo:'1. \n2. \n3. '},
 {name:'Plan del día',color:'cielo',tipo:'text',titulo:'Mi día',cuerpo:'Mañana: \nTarde: \nNoche: \n\nLo más importante: '},
 {name:'Lista de compras',color:'menta',tipo:'list',titulo:'Compras',items:['','','']},
 {name:'¿Cómo me siento?',color:'lila',tipo:'text',titulo:'¿Cómo me siento?',cuerpo:'Hoy me siento: \nPorque: \nLo que necesito: '},
 {name:'Meta de la semana',color:'menta',tipo:'list',titulo:'Meta de la semana',items:['Mi meta: ','Paso 1','Paso 2','Paso 3']},
 {name:'Para contarle a Ever',color:'rosa',tipo:'text',titulo:'Para contarle a Ever',cuerpo:'Hoy pasó que…'}
];

// ===== Estado local (offline-first) =====
let S = { notes: [], abierto: '', ultimaSync: '', usuario: '' };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); } catch (e) {}
const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const $ = s => document.querySelector(s);
let q = '', foco = null, sincronizando = false, errorSync = false, timer = null;

function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const grow = t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; };
const ahora = () => new Date().toISOString();
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });

// ===== Estado visible =====
function estado() {
  const el = $('#estado'); if (!el) return;
  const sucias = S.notes.some(n => n._sucia);
  el.textContent = MODO_LOCAL ? 'Modo local: solo en este celular'
    : !navigator.onLine ? 'Sin conexión: se guarda en tu celular'
    : errorSync ? 'No se pudo sincronizar, reintento pronto'
    : (sincronizando || sucias) ? 'Sincronizando…' : 'Todo guardado ✓';
}

// ===== Sincronización con Supabase =====
function programarSync() { clearTimeout(timer); timer = setTimeout(sincronizar, 1500); estado(); }
function tocar(n) { n.actualizada_en = ahora(); n._sucia = true; guardar(); programarSync(); }

async function sincronizar() {
  if (MODO_LOCAL || !navigator.onLine || sincronizando) return estado();
  sincronizando = true; errorSync = false; estado();
  try {
    // 1) Subir notas con cambios pendientes
    const pend = S.notes.filter(n => n._sucia).map(n => ({ n, v: n.actualizada_en }));
    if (pend.length) {
      const filas = pend.map(({ n }) => Object.fromEntries(CAMPOS.map(c => [c, n[c]])));
      const { error } = await sb.from('notas').upsert(filas, { onConflict: 'id' });
      if (error) throw error;
      pend.forEach(({ n, v }) => { if (n.actualizada_en === v) n._sucia = false; }); // si se editó mientras subía, sigue pendiente
    }
    // 2) Traer cambios remotos (gana la edición más reciente)
    const { data, error } = await sb.from('notas').select(CAMPOS.join(',')).gte('actualizada_en', S.ultimaSync || '1970-01-01T00:00:00Z');
    if (error) throw error;
    for (const r of data) {
      const l = S.notes.find(n => n.id === r.id);
      if (!l) S.notes.push(r);
      else if (!l._sucia && Date.parse(r.actualizada_en) > Date.parse(l.actualizada_en)) Object.assign(l, r);
      if (r.actualizada_en > (S.ultimaSync || '')) S.ultimaSync = r.actualizada_en;
    }
    guardar(); render();
  } catch (e) { errorSync = true; setTimeout(sincronizar, 15000); }
  sincronizando = false; estado();
}

// ===== Mensaje del día =====
const d = new Date();
const hoy = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const msg = MSGS[Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) % MSGS.length];
function mostrarCarta() { $('#env').hidden = true; $('#cap').hidden = true; $('#msg').textContent = msg; $('#letter').hidden = false; }

// ===== Notas =====
function agregar(t, enfocar = true) {
  const t0 = ahora();
  const n = { id: uuid(), tipo: t.tipo, titulo: t.titulo || '', cuerpo: t.tipo === 'text' ? (t.cuerpo || '') : '',
    items: t.tipo === 'list' ? t.items.map(x => ({ t: x, d: false })) : [], color: t.color, fijada: false, eliminada: false, creada_en: t0, actualizada_en: t0, _sucia: true };
  S.notes.push(n); guardar(); programarSync();
  $('#picker').hidden = true; q = ''; $('#q').value = '';
  if (enfocar) foco = { id: n.id, f: t.titulo ? (t.tipo === 'list' ? 'i0' : 'body') : 'title' };
  render();
}

function fmt(ts) {
  const x = new Date(ts), o = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
  if (x.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
  return x.toLocaleString('es-CO', o);
}

function notaEl(n, i) {
  const card = h('article', { class: 'note n-' + n.color, 'data-id': n.id, style: `--r:${[-1.2, .8, -.6, 1.1][i % 4]}deg` });
  const del = h('button', { class: 'ib', title: 'Borrar nota', 'aria-label': 'Borrar nota', onclick: () => {
    if (del.classList.contains('sure')) { n.eliminada = true; tocar(n); render(); }
    else { del.classList.add('sure'); del.textContent = '¿Borrar?'; setTimeout(() => { del.classList.remove('sure'); del.textContent = '🗑'; }, 2500); }
  } }, '🗑');
  card.append(h('div', { class: 'nh' },
    h('input', { class: 'ntitle', value: n.titulo, placeholder: 'Título', 'aria-label': 'Título de la nota', 'data-f': 'title', oninput: e => { n.titulo = e.target.value; } }),
    h('button', { class: 'ib' + (n.fijada ? ' on' : ''), title: n.fijada ? 'Quitar de arriba' : 'Fijar arriba', 'aria-label': 'Fijar arriba', onclick: () => { n.fijada = !n.fijada; tocar(n); render(); } }, '📌'),
    del));
  if (n.tipo === 'list') {
    const box = h('div', { class: 'items' });
    n.items.forEach((it, k) => {
      const row = h('div', { class: 'row' + (it.d ? ' done' : '') },
        h('input', { type: 'checkbox', checked: it.d, 'aria-label': 'Marcar como hecho', onchange: e => { it.d = e.target.checked; row.classList.toggle('done', it.d); } }),
        h('input', { type: 'text', class: 'itxt', value: it.t, placeholder: 'Escribe algo…', 'data-f': 'i' + k,
          oninput: e => { it.t = e.target.value; },
          onkeydown: e => {
            if (e.key === 'Enter') { e.preventDefault(); n.items.splice(k + 1, 0, { t: '', d: false }); tocar(n); foco = { id: n.id, f: 'i' + (k + 1) }; render(); }
            else if (e.key === 'Backspace' && !it.t && n.items.length > 1) { e.preventDefault(); n.items.splice(k, 1); tocar(n); foco = { id: n.id, f: 'i' + Math.max(0, k - 1) }; render(); }
          } }));
      box.append(row);
    });
    card.append(box, h('button', { class: 'add', onclick: () => { n.items.push({ t: '', d: false }); tocar(n); foco = { id: n.id, f: 'i' + (n.items.length - 1) }; render(); } }, '+ Agregar'));
  } else {
    const ta = h('textarea', { class: 'nbody', placeholder: 'Escribe aquí…', 'aria-label': 'Texto de la nota', 'data-f': 'body', oninput: e => { n.cuerpo = e.target.value; grow(e.target); } }, n.cuerpo || '');
    card.append(ta); requestAnimationFrame(() => grow(ta));
  }
  card.append(h('div', { class: 'dots' }, COLORS.map(c => h('button', { class: 'dot', 'aria-label': 'Color ' + c, style: `background:var(--c-${c})`,
    onclick: () => { card.classList.remove('n-' + n.color); n.color = c; card.classList.add('n-' + c); tocar(n); } }))));
  const stamp = h('p', { class: 'stamp' });
  const poner = () => { stamp.textContent = 'Creada ' + fmt(n.creada_en) + (Date.parse(n.actualizada_en) - Date.parse(n.creada_en) > 60000 ? ' · Editada ' + fmt(n.actualizada_en) : ''); };
  // Cualquier escritura o casilla marcada actualiza fecha, guarda y programa la sincronización
  card.addEventListener('input', () => { tocar(n); poner(); });
  card.addEventListener('change', e => { if (e.target.type === 'checkbox') { tocar(n); poner(); } });
  poner(); card.append(stamp);
  return card;
}

function render() {
  const grid = $('#grid'); grid.replaceChildren();
  const txt = n => (n.titulo + ' ' + (n.cuerpo || '') + ' ' + (n.items || []).map(i => i.t).join(' ')).toLowerCase();
  const vivas = S.notes.filter(n => !n.eliminada);
  vivas.filter(n => !q || txt(n).includes(q))
    .sort((a, b) => (b.fijada ? 1 : 0) - (a.fijada ? 1 : 0) || Date.parse(b.creada_en) - Date.parse(a.creada_en))
    .forEach((n, i) => grid.append(notaEl(n, i)));
  $('#empty').hidden = vivas.length > 0;
  if (foco) { const el = grid.querySelector(`[data-id="${foco.id}"] [data-f="${foco.f}"]`); if (el) el.focus(); foco = null; }
}

// ===== Pantallas =====
function mostrarApp() {
  $('#login').hidden = true; $('#app').hidden = false; $('#logout').hidden = MODO_LOCAL;
  const hr = d.getHours();
  $('#hello').textContent = (hr < 12 ? 'Buenos días' : hr < 19 ? 'Buenas tardes' : 'Buenas noches') + ', Rossi.';
  if (S.abierto === hoy) mostrarCarta();
  render(); estado(); sincronizar();
}
function mostrarLogin() { $('#app').hidden = true; $('#login').hidden = false; }

async function iniciar() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  if (MODO_LOCAL) return mostrarApp();
  const { data } = await sb.auth.getSession();
  // Sin internet y con sesión previa: abrir igual, las notas están guardadas en el celular
  (data.session || (S.usuario && !navigator.onLine)) ? mostrarApp() : mostrarLogin();
}

// ===== Eventos =====
$('#env').addEventListener('click', () => { $('#env').classList.add('open'); S.abierto = hoy; guardar(); setTimeout(mostrarCarta, 650); });
$('#keep').addEventListener('click', e => { agregar({ tipo: 'text', color: 'rosa', titulo: 'Mensajito de Ever', cuerpo: msg + '\n— Ever' }, false); e.target.textContent = 'Guardado en tu bloc'; e.target.disabled = true; });
TPL.forEach(t => $('#tpls').append(h('button', { class: 'tpl n-' + t.color, onclick: () => agregar(t) }, t.name)));
$('#new').addEventListener('click', () => { const p = $('#picker'); p.hidden = !p.hidden; });
$('#q').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#loginErr').textContent = '';
  const { error } = await sb.auth.signInWithPassword({ email: $('#email').value.trim(), password: $('#pass').value });
  if (error) { $('#loginErr').textContent = navigator.onLine ? 'Correo o contraseña incorrectos.' : 'Necesitas internet para entrar la primera vez.'; return; }
  S.usuario = $('#email').value.trim(); guardar(); mostrarApp();
});
$('#logout').addEventListener('click', async () => {
  await sincronizar();
  if (S.notes.some(n => n._sucia) && !confirm('Hay notas sin sincronizar y se perderían. ¿Cerrar sesión igual?')) return;
  await sb.auth.signOut(); S = { notes: [], abierto: '', ultimaSync: '', usuario: '' }; guardar(); mostrarLogin();
});

// Instalación (Android/Chrome)
let promptInstalar = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInstalar = e; $('#install').hidden = false; });
$('#install').addEventListener('click', async () => { if (!promptInstalar) return; promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; $('#install').hidden = true; });
window.addEventListener('appinstalled', () => { $('#install').hidden = true; });

// Reintentar al volver la conexión o al abrir la app
window.addEventListener('online', sincronizar);
window.addEventListener('offline', estado);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizar(); });

iniciar();
