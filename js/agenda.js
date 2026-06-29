/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Módulo de Agenda/Eventos — datos y renderizado
   ============================================================ */

const EVENTOS_KEY = 'hermandad_eventos';

const TIPO_CONFIG = {
  'CULTO':       { icon: 'fa-church',        label: 'Culto' },
  'CABILDO':     { icon: 'fa-crown',          label: 'Cabildo' },
  'CONVIVENCIA': { icon: 'fa-heart',          label: 'Convivencia' },
  'FUNCIÓN':     { icon: 'fa-church',         label: 'Función' },
  'TRIDUO':      { icon: 'fa-cross',          label: 'Triduo' },
  'BESAPIÉS':    { icon: 'fa-hands-praying',  label: 'Besapiés' },
  'REUNIÓN':     { icon: 'fa-users',          label: 'Reunión' },
  'PROCESIÓN':   { icon: 'fa-person-walking', label: 'Procesión' },
  'OTRO':        { icon: 'fa-star',           label: 'Otro' },
};

const _MESES_ES_AG = ['enero','febrero','marzo','abril','mayo','junio',
                      'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const _MESES_CORTOS_AG = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

const EVENTOS_DEFAULT = [
  { id: 'ev001', titulo: 'Santo Rosario de la Aurora',            tipo: 'CULTO',       hora: '08:00', lugar: 'Parroquia San Juan de Dios, Medina Sidonia', fechaISO: '2026-07-05' },
  { id: 'ev002', titulo: 'Cabildo General Ordinario',             tipo: 'CABILDO',     hora: '19:30', lugar: 'Sede de la Hermandad',                       fechaISO: '2026-07-12' },
  { id: 'ev003', titulo: 'Convivencia Anual de Hermanos',         tipo: 'CONVIVENCIA', hora: '13:00', lugar: 'Recinto habitual del Barrio',                 fechaISO: '2026-07-19' },
  { id: 'ev004', titulo: 'Función Principal de Gloria',           tipo: 'FUNCIÓN',     hora: '12:00', lugar: 'Parroquia San Juan de Dios, Medina Sidonia', fechaISO: '2026-07-25' },
  { id: 'ev005', titulo: 'Inicio del Triduo al Santísimo Cristo', tipo: 'TRIDUO',      hora: '20:00', lugar: 'Parroquia San Juan de Dios',                  fechaISO: '2026-08-02' },
  { id: 'ev006', titulo: 'Besapiés a Nuestra Señora de los Dolores', tipo: 'BESAPIÉS', hora: '18:30', lugar: 'Parroquia San Juan de Dios, Medina Sidonia', fechaISO: '2026-09-15' },
];

function getEventos() {
  try {
    const raw = localStorage.getItem(EVENTOS_KEY);
    if (!raw) return [...EVENTOS_DEFAULT];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...EVENTOS_DEFAULT];
  } catch (_) {
    return [...EVENTOS_DEFAULT];
  }
}

function saveEventos(eventos) {
  localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
}

/* Devuelve { 'YYYY-MM-DD': 'titulo', ... } para el mini calendario */
function getAgendaEventsMap() {
  const map = {};
  getEventos().forEach(ev => { map[ev.fechaISO] = ev.titulo; });
  return map;
}

function _formatFechaEvento(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} de ${_MESES_ES_AG[m - 1]}, ${y}`;
}

/* Renderiza la lista de eventos en la sección de agenda */
function renderAgendaTimeline() {
  const container = document.getElementById('agenda-timeline');
  if (!container) return;

  const today    = new Date().toISOString().slice(0, 10);
  const todos    = getEventos().sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
  const proximos = todos.filter(ev => ev.fechaISO >= today);
  const toShow   = proximos.length > 0 ? proximos : todos;

  if (toShow.length === 0) {
    container.innerHTML = '<p style="color:var(--muted,#8A7A9A);text-align:center;padding:2rem 0;">No hay actos programados próximamente.</p>';
    _renderNextEvent(null);
    return;
  }

  container.innerHTML = toShow.map(ev => {
    const [, m, d] = ev.fechaISO.split('-').map(Number);
    const day = String(d).padStart(2, '0');
    const mon = _MESES_CORTOS_AG[m - 1];
    const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG['OTRO'];
    return `
      <div class="tl-entry">
        <div class="tl-diamond"></div>
        <div class="ev-date">
          <span class="ev-day">${day}</span>
          <span class="ev-mon">${mon}</span>
        </div>
        <div class="ev-info">
          <p class="ev-type"><i class="fa-solid ${cfg.icon}"></i> ${ev.tipo}</p>
          <h4 class="ev-title">${ev.titulo}</h4>
          <p class="ev-detail"><i class="fa-regular fa-clock"></i> ${ev.hora} h · ${ev.lugar}</p>
        </div>
        <div class="ev-arrow"><i class="fa-solid fa-chevron-right"></i></div>
      </div>`;
  }).join('');

  _renderNextEvent(proximos[0] || toShow[0]);
}

function _renderNextEvent(ev) {
  const dayEl   = document.getElementById('next-ev-day');
  const monEl   = document.getElementById('next-ev-mon');
  const typeEl  = document.getElementById('next-ev-type');
  const titleEl = document.getElementById('next-ev-title');
  const horaEl  = document.getElementById('next-ev-hora');
  const lugarEl = document.getElementById('next-ev-lugar');

  if (!ev) {
    if (dayEl) dayEl.textContent = '—';
    if (monEl) monEl.textContent = '—';
    if (typeEl) typeEl.textContent = 'Sin actos próximos';
    if (titleEl) titleEl.textContent = '';
    if (horaEl) horaEl.textContent = '';
    if (lugarEl) lugarEl.textContent = '';
    return;
  }

  const [, m, d] = ev.fechaISO.split('-').map(Number);
  const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG['OTRO'];

  if (dayEl)   dayEl.textContent   = String(d).padStart(2, '0');
  if (monEl)   monEl.textContent   = _MESES_CORTOS_AG[m - 1];
  if (typeEl)  typeEl.innerHTML    = `<i class="fa-solid ${cfg.icon}"></i> ${ev.tipo}`;
  if (titleEl) titleEl.textContent = ev.titulo;
  if (horaEl)  horaEl.innerHTML    = `<i class="fa-regular fa-clock"></i> ${ev.hora} h`;
  if (lugarEl) lugarEl.innerHTML   = `<i class="fa-solid fa-location-dot"></i> ${ev.lugar}`;
}

/* Auto-render en la página principal */
if (document.getElementById('agenda-timeline')) renderAgendaTimeline();
