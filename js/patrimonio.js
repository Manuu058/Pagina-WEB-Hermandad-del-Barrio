/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Módulo de Patrimonio/Enseres — datos, filtrado, paginación
   ============================================================ */

const PATRIMONIO_KEY = 'hermandad_patrimonio';
const PAT_PAGE_SIZE   = 8;

const CATEGORIAS_PATRIMONIO = {
  orf: { label: 'Orfebrería',  icon: '⚜️' },
  bor: { label: 'Bordados',    icon: '🧵' },
  ins: { label: 'Insignias',   icon: '🏺' },
  aju: { label: 'Ajuar Virgen', icon: '👑' },
  doc: { label: 'Documentos',  icon: '📜' },
  fot: { label: 'Fotografías', icon: '📷' },
};

const PATRIMONIO_DEFAULT = [
  { id: 'p001', nombre: 'Cruz de Guía',                       categoria: 'orf', material: 'Plata',                anio: '2003',   icono: '⚜️', hasImage: false, fechaAlta: '2003-01-01', historia: 'Realizada en plata de ley por un orfebre local, abre el cortejo procesional desde 2003. Sustituyó a una pieza más antigua donada por una familia de hermanos fundadores.' },
  { id: 'p002', nombre: 'Faldón delantero del paso',          categoria: 'bor', material: 'Terciopelo y oro',      anio: '1998',   icono: '🧵', hasImage: false, fechaAlta: '1998-01-01', historia: 'Bordado en oro fino sobre terciopelo burdeos, fue costeado por suscripción popular entre los hermanos y estrenado en la Cuaresma de 1998.' },
  { id: 'p003', nombre: 'Estandarte de la Hermandad',         categoria: 'ins', material: 'Seda y plata',          anio: '1980',   icono: '🏺', hasImage: false, fechaAlta: '1980-01-01', historia: 'Una de las insignias más antiguas que conserva la corporación, representa el escudo fundacional bordado en seda y plata.' },
  { id: 'p004', nombre: 'Corona de la Virgen de los Dolores', categoria: 'aju', material: 'Plata dorada',          anio: '1992',   icono: '👑', hasImage: false, fechaAlta: '1992-01-01', historia: 'Donada por una camarera de la Virgen con motivo de su coronación canónica, está realizada en plata dorada con incrustaciones de pedrería.' },
  { id: 'p005', nombre: 'Candelabros del paso (x4)',          categoria: 'orf', material: 'Metal plateado',        anio: '1985',   icono: '🕯️', hasImage: false, fechaAlta: '1985-01-01', historia: 'Los cuatro candelabros de cola que iluminan el paso fueron adquiridos en 1985 a un taller sevillano especializado en orfebrería procesional.' },
  { id: 'p006', nombre: 'Manto de la Virgen — Granate',       categoria: 'bor', material: 'Terciopelo y oro fino', anio: '2010',   icono: '🌸', hasImage: false, fechaAlta: '2010-01-01', historia: 'Estrenado en 2010, este manto de salida combina terciopelo granate con bordados en oro fino realizados a mano por el taller de bordados de la Hermandad.' },
  { id: 'p007', nombre: 'Acta Fundacional (1975)',            categoria: 'doc', material: 'Manuscrito original',  anio: '1975',   icono: '📜', hasImage: false, fechaAlta: '1975-01-01', historia: 'Documento manuscrito que recoge la constitución de la Hermandad en 1975, firmado por los hermanos fundadores y custodiado en el archivo de la corporación.' },
  { id: 'p008', nombre: 'Colección fotográfica años 80',      categoria: 'fot', material: '1980–1990 · +120 piezas', anio: 'c.1980', icono: '📷', hasImage: false, fechaAlta: '1980-01-01', historia: 'Más de 120 fotografías que documentan las salidas procesionales y la vida de la Hermandad durante la década de 1980, donadas por varias familias de hermanos.' },
];

/* ── DATOS (Firestore, con caché local en tiempo real) ── */

let _patrimonioCache   = [...PATRIMONIO_DEFAULT];
let _patrimonioReady   = false;
let _patrimonioSeeding = false;
const _patrimonioSubs  = [];

function getPatrimonio() {
  return _patrimonioCache;
}

function onPatrimonioChange(cb) {
  _patrimonioSubs.push(cb);
  if (_patrimonioReady) cb();
}

db.collection('patrimonio').onSnapshot(async snap => {
  if (snap.empty && !_patrimonioReady && !_patrimonioSeeding && auth.currentUser) {
    _patrimonioSeeding = true;
    const batch = db.batch();
    PATRIMONIO_DEFAULT.forEach(p => batch.set(db.collection('patrimonio').doc(p.id), p));
    try { await batch.commit(); } catch (err) { console.error('No se pudo sembrar el patrimonio por defecto', err); }
    _patrimonioSeeding = false;
    return;
  }
  _patrimonioCache = snap.docs.map(d => ({ ...d.data(), id: d.id }));
  _patrimonioReady = true;
  _patrimonioSubs.forEach(cb => cb());
}, err => console.error('Error escuchando patrimonio', err));

function setPatrimonioDoc(id, data) {
  return db.collection('patrimonio').doc(id).set(data);
}

function deletePatrimonioDoc(id) {
  return db.collection('patrimonio').doc(id).delete();
}

async function replaceAllPatrimonio(array) {
  const col  = db.collection('patrimonio');
  const snap = await col.get();
  const batch  = db.batch();
  const newIds = new Set(array.map(p => p.id));
  snap.forEach(doc => { if (!newIds.has(doc.id)) batch.delete(doc.ref); });
  array.forEach(p => batch.set(col.doc(p.id), p));
  await batch.commit();
}

/* ── ESTADO Y FILTRADO/PAGINACIÓN COMPARTIDOS ── */

const _patState = { filter: 'all', page: 1 };

function _patFiltered(items, filter) {
  const sorted = [...items].sort((a, b) => (b.fechaAlta || '').localeCompare(a.fechaAlta || ''));
  return filter === 'all' ? sorted : sorted.filter(p => p.categoria === filter);
}

/* ── RENDERIZADO PÚBLICO ── */

function _patCardHTML(p) {
  const cfg = CATEGORIAS_PATRIMONIO[p.categoria] || { label: p.categoria, icon: '✦' };
  return `
    <div class="enser-card reveal" data-cat="${p.categoria}" data-pid="${p.id}">
      <div class="en-img ${p.categoria}" data-year="${p.anio || ''}"><span>${p.icono || cfg.icon}</span></div>
      <div class="en-body">
        <p class="en-cat">${cfg.label}</p>
        <h4 class="en-name">${p.nombre}</h4>
        <div class="en-rule"></div>
        ${p.material ? `<p class="en-meta">Material: <strong>${p.material}</strong></p>` : ''}
      </div>
    </div>`;
}

function renderPatrimonioGrid() {
  const grid = document.getElementById('pat-grid');
  const pagination = document.getElementById('pat-pagination');
  if (!grid) return;

  const items    = _patFiltered(getPatrimonio(), _patState.filter);
  const pages    = Math.max(1, Math.ceil(items.length / PAT_PAGE_SIZE));
  _patState.page = Math.min(Math.max(1, _patState.page), pages);

  const start  = (_patState.page - 1) * PAT_PAGE_SIZE;
  const toShow = items.slice(start, start + PAT_PAGE_SIZE);

  grid.innerHTML = toShow.length
    ? toShow.map(_patCardHTML).join('')
    : '<p class="pat-empty">No hay piezas en esta categoría.</p>';

  toShow.filter(p => p.hasImage).forEach(p => {
    getImage(`${p.id}_main`).then(dataUrl => {
      if (!dataUrl) return;
      const el = grid.querySelector(`[data-pid="${p.id}"] .en-img`);
      if (!el) return;
      el.style.backgroundImage = `linear-gradient(to bottom, rgba(10,6,2,.25) 0%, rgba(8,5,2,.78) 100%), url("${dataUrl}")`;
      el.style.backgroundSize     = 'cover';
      el.style.backgroundPosition = 'center';
    }).catch(() => {});
  });

  _renderPatPagination(pagination, pages);

  /* Las tarjetas se inyectan tras la carga inicial: se muestran directamente
     en lugar de depender del IntersectionObserver de scroll-reveal de main.js */
  grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

function _renderPatPagination(container, pages) {
  if (!container) return;
  if (pages <= 1) { container.innerHTML = ''; return; }

  const cur = _patState.page;
  let nums = '';
  let lastShown = 0;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - cur) <= 1) {
      if (i - lastShown > 1) nums += '<span class="pat-page-dots">…</span>';
      nums += `<button class="pat-page-btn ${i === cur ? 'active' : ''}" data-page="${i}">${i}</button>`;
      lastShown = i;
    }
  }

  container.innerHTML = `
    <button class="pat-page-btn pat-page-nav" data-page="${cur - 1}" ${cur === 1 ? 'disabled' : ''} aria-label="Página anterior">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    ${nums}
    <button class="pat-page-btn pat-page-nav" data-page="${cur + 1}" ${cur === pages ? 'disabled' : ''} aria-label="Página siguiente">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  container.querySelectorAll('.pat-page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page, 10);
      if (!p || p === _patState.page) return;
      _patState.page = p;
      renderPatrimonioGrid();
      document.getElementById('patrimonio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── MODAL DE DETALLE / HISTORIA DE LA PIEZA ── */

function _setupPatCardClicks() {
  const grid = document.getElementById('pat-grid');
  if (!grid) return;
  grid.addEventListener('click', e => {
    const card = e.target.closest('.enser-card');
    if (card) openPatModal(card.dataset.pid);
  });
}

async function openPatModal(id) {
  const overlay = document.getElementById('pat-modal-overlay');
  if (!overlay) return;
  const p = getPatrimonio().find(x => x.id === id);
  if (!p) return;
  const cfg = CATEGORIAS_PATRIMONIO[p.categoria] || { label: p.categoria, icon: '✦' };

  document.getElementById('pat-modal-cat').textContent   = cfg.label;
  document.getElementById('pat-modal-title').textContent = p.nombre;
  document.getElementById('pat-modal-historia').textContent =
    p.historia?.trim() || 'Aún no se ha añadido la historia de esta pieza.';

  const metaGrid = document.getElementById('pat-modal-meta');
  let metaHTML = '';
  if (p.material) metaHTML += `
    <div class="tit-meta-item">
      <i class="fa-solid fa-gem tit-meta-icon"></i>
      <div><span class="tit-meta-label">Material</span><span class="tit-meta-value">${p.material}</span></div>
    </div>`;
  if (p.anio) metaHTML += `
    <div class="tit-meta-item">
      <i class="fa-regular fa-calendar tit-meta-icon"></i>
      <div><span class="tit-meta-label">Año</span><span class="tit-meta-value">${p.anio}</span></div>
    </div>`;
  metaGrid.innerHTML = metaHTML;
  metaGrid.style.display = metaHTML ? 'grid' : 'none';

  const imgBox  = document.getElementById('pat-modal-img');
  const iconEl  = document.getElementById('pat-modal-icon');
  iconEl.textContent = p.icono || cfg.icon;
  imgBox.style.backgroundImage = '';
  imgBox.classList.remove(...Object.keys(CATEGORIAS_PATRIMONIO));
  imgBox.classList.add(p.categoria);
  imgBox.dataset.pid = p.id;

  if (p.hasImage) {
    getImage(`${p.id}_main`).then(dataUrl => {
      if (!dataUrl || imgBox.dataset.pid !== p.id) return;
      imgBox.style.backgroundImage = `linear-gradient(to right, rgba(10,6,2,.15) 0%, rgba(8,5,2,.55) 100%), url("${dataUrl}")`;
      imgBox.style.backgroundSize     = 'cover';
      imgBox.style.backgroundPosition = 'center';
    }).catch(() => {});
  }

  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closePatModal() {
  const overlay = document.getElementById('pat-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  setTimeout(() => { overlay.hidden = true; }, 350);
}

document.getElementById('pat-modal-overlay')?.addEventListener('click', e => {
  if (e.target.id === 'pat-modal-overlay') closePatModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('pat-modal-overlay')?.classList.contains('open')) {
    closePatModal();
  }
});

function _setupPatFilters() {
  const filters = document.querySelectorAll('.pat-filter');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _patState.filter = btn.dataset.filter;
      _patState.page   = 1;
      renderPatrimonioGrid();
    });
  });
}

/* Auto-render en la página principal — reactivo a cambios en Firestore */
if (document.getElementById('pat-grid')) {
  _setupPatFilters();
  _setupPatCardClicks();
  onPatrimonioChange(renderPatrimonioGrid);
}
