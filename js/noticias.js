/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Módulo de Noticias — datos, imágenes (IndexedDB) y renderizado
   ============================================================ */

/* ── DATOS (localStorage) ── */

const NOTICIAS_KEY = 'hermandad_noticias';

const NOTICIAS_DEFAULT = [
  {
    id: 'n001',
    titulo: 'Salida Extraordinaria del 50 Aniversario Fundacional',
    extracto: 'La Hermandad celebró su salida extraordinaria con un recorrido especial por las calles del Barrio, con un exorno floral singular y la presencia de hermandades invitadas de toda la provincia.',
    contenido: `
      <p>En la tarde del sábado 28 de junio de 2025, la Hermandad del Barrio de Medina Sidonia vivió uno de los momentos más emocionantes de su historia al celebrar su <strong>Salida Extraordinaria del Cincuentenario Fundacional</strong>.</p>
      <p>El paso salió a las ocho de la tarde desde la Parroquia Mayor, recorriendo un itinerario especial diseñado para este año jubilar. Las calles del Barrio, engalanadas con flores y mantillas, se llenaron de devoción y recogimiento mientras el Santísimo Cristo de la Reconciliación y Paz y Nuestra Señora de los Dolores recorrían juntos el camino que tantas veces han transitado en los últimos cincuenta años.</p>
      <p>El exorno floral de este año fue singular: una composición de claveles blancos y rojos, azucenas y ramas de olivo adornaba la canastilla, en homenaje a los fundadores y a cuantos han dado su entrega y devoción a esta Hermandad a lo largo de su historia.</p>
      <p>Hermandades invitadas de toda la provincia —entre ellas la Hermandad de la Vera Cruz de Jerez y la del Gran Poder de Algeciras— acompañaron el cortejo en señal de fraternidad cofrade. La banda de música interpretó marchas de especial devoción, y en el momento de la levantá el silencio del Barrio se rompió con un aplauso unánime que emocionó a propios y extraños.</p>
      <p>El Hermano Mayor, en nombre de la Junta de Gobierno, expresó su gratitud a todos los hermanos, costaleros, músicos y devotos que hicieron posible esta jornada histórica: <em>"Cincuenta años de fe, de barrio y de devoción se resumían esta tarde en cada paso que daban nuestros titulares por estas calles que los vieron nacer."</em></p>
    `,
    tag: '50 Aniversario',
    tipo: 'tipo-a',
    icono: '✝',
    fecha: '28 de junio, 2025',
    fechaISO: '2025-06-28',
    enlace: '#',
    hasMainImage: false,
    secImagesCount: 0,
  },
  {
    id: 'n002',
    titulo: 'Función Principal de Gloria en Honor a Nuestra Señora de los Dolores',
    extracto: 'El próximo domingo se celebrará la Función Principal de Gloria en la Parroquia Mayor. La Hermandad invita a todos los fieles y hermanos a participar de este solemne acto litúrgico.',
    contenido: `
      <p>La Hermandad del Barrio tiene el honor de invitar a todos sus hermanos, devotos y fieles a la <strong>Función Principal de Gloria</strong> en honor a Nuestra Señora de los Dolores, que tendrá lugar el próximo domingo 10 de julio de 2026 en la Parroquia Mayor de Medina Sidonia.</p>
      <p>El acto comenzará a las doce del mediodía con la Santa Misa solemne, presidida por el Arcipreste de la ciudad. Durante la función, la imagen de Nuestra Señora de los Dolores lucirá sus mejores galas, con el manto de salida bordado en oro sobre terciopelo granate y la corona de plata dorada que luce en los grandes cultos.</p>
      <p>La coral parroquial interpretará el <em>Salve Regina</em> y diversas piezas de polifonía sacra, acompañadas al órgano. Al término de la misa se procederá al <strong>besamanos</strong> de la Virgen, que permanecerá expuesta al culto de los fieles hasta las dos de la tarde.</p>
      <p>La Junta de Gobierno recuerda a todos los hermanos que la asistencia con el hábito de la Hermandad es un signo de especial devoción y pertenencia a nuestra corporación. Se ruega puntualidad y recogimiento durante los actos litúrgicos.</p>
      <p>Para cualquier consulta o información adicional sobre el programa de cultos, pueden dirigirse a la sede canónica o contactar con la secretaría de la Hermandad.</p>
    `,
    tag: 'Cultos',
    tipo: 'tipo-b',
    icono: '🌹',
    fecha: '10 de julio, 2026',
    fechaISO: '2026-07-10',
    enlace: '#',
    hasMainImage: false,
    secImagesCount: 0,
  },
  {
    id: 'n003',
    titulo: 'Cabildo General de Elecciones y Presentación de Cuentas',
    extracto: 'Se convoca a todos los hermanos al Cabildo General que tendrá lugar en la sede canónica. En el orden del día figura la presentación de cuentas del ejercicio y la renovación parcial de la Junta.',
    contenido: `
      <p>Por mandato del Hermano Mayor y en cumplimiento de lo establecido en los Estatutos de la Hermandad, se convoca a todos los hermanos de número y de mérito al <strong>Cabildo General Ordinario de Elecciones y Presentación de Cuentas</strong>, que tendrá lugar el miércoles 15 de julio de 2026 en la sede canónica de la Hermandad, a las ocho de la tarde en primera convocatoria y a las ocho y media en segunda.</p>
      <h3>Orden del Día</h3>
      <p><strong>1.</strong> Lectura y aprobación, si procede, del acta de la sesión anterior.</p>
      <p><strong>2.</strong> Presentación de cuentas del ejercicio 2025–2026 por el Tesorero de la Hermandad. Examen y aprobación, si procede.</p>
      <p><strong>3.</strong> Renovación parcial de la Junta de Gobierno según lo previsto en los Estatutos: elección de Hermano Mayor, Teniente Hermano Mayor, Secretario y Tesorero.</p>
      <p><strong>4.</strong> Presentación del programa de actos del próximo año cofrade 2026–2027.</p>
      <p><strong>5.</strong> Ruegos y preguntas.</p>
      <p>Para ejercer el derecho de voto es imprescindible estar al corriente en el pago de la cuota anual de hermano. Se recuerda que las candidaturas para los cargos electivos deberán presentarse por escrito en la secretaría con al menos cinco días de antelación a la celebración del Cabildo.</p>
      <p>La Junta de Gobierno agradece la puntual asistencia de todos los hermanos, pues su participación es fundamental para el buen gobierno y el futuro de nuestra corporación.</p>
    `,
    tag: 'Convocatoria',
    tipo: 'tipo-c',
    icono: '📜',
    fecha: '15 de julio, 2026',
    fechaISO: '2026-07-15',
    enlace: '#',
    hasMainImage: false,
    secImagesCount: 0,
  },
];

/* ── DATOS (Firestore, con caché local en tiempo real) ──
   getNoticias() sigue siendo síncrona: devuelve la caché poblada
   por el listener onSnapshot de más abajo. Así el resto del código
   (admin.js, render público) no necesita volverse asíncrono. */

let _noticiasCache   = [...NOTICIAS_DEFAULT];
let _noticiasReady   = false;
let _noticiasSeeding = false;
const _noticiasSubs  = [];

function getNoticias() {
  return _noticiasCache;
}

function onNoticiasChange(cb) {
  _noticiasSubs.push(cb);
  if (_noticiasReady) cb();
}

db.collection('noticias').onSnapshot(async snap => {
  if (snap.empty && !_noticiasReady && !_noticiasSeeding && auth.currentUser) {
    _noticiasSeeding = true;
    const batch = db.batch();
    NOTICIAS_DEFAULT.forEach(n => batch.set(db.collection('noticias').doc(n.id), n));
    try { await batch.commit(); } catch (err) { console.error('No se pudieron sembrar las noticias por defecto', err); }
    _noticiasSeeding = false;
    return; /* el commit disparará un nuevo snapshot ya con los datos */
  }
  _noticiasCache = snap.docs.map(d => ({ ...d.data(), id: d.id }));
  _noticiasReady = true;
  _noticiasSubs.forEach(cb => cb());
}, err => console.error('Error escuchando noticias', err));

function setNoticiaDoc(id, data) {
  return db.collection('noticias').doc(id).set(data);
}

function deleteNoticiaDoc(id) {
  return db.collection('noticias').doc(id).delete();
}

/* Reemplaza toda la colección (usado por Importar JSON / Restaurar valores originales) */
async function replaceAllNoticias(array) {
  const col  = db.collection('noticias');
  const snap = await col.get();
  const batch  = db.batch();
  const newIds = new Set(array.map(n => n.id));
  snap.forEach(doc => { if (!newIds.has(doc.id)) batch.delete(doc.ref); });
  array.forEach(n => batch.set(col.doc(n.id), n));
  await batch.commit();
}

/* ── IMÁGENES (Firebase Storage) ──
   Misma clave determinista que antes (`${id}_main`, `${id}_sec_${i}`),
   compartida globalmente con patrimonio.js y admin.js sin cambios. */

/* Imágenes guardadas como base64 en Firestore (colección 'imagenes'),
   sin necesidad de Firebase Storage. Mismo contrato de API que antes. */

const _imgCache = new Map();
const _imgCol   = () => db.collection('imagenes');

async function saveImage(key, dataUrl) {
  await _imgCol().doc(key).set({ dataUrl });
  _imgCache.set(key, dataUrl);
}

async function getImage(key) {
  if (_imgCache.has(key)) return _imgCache.get(key);
  const snap = await _imgCol().doc(key).get();
  const val  = snap.exists ? (snap.data().dataUrl || null) : null;
  _imgCache.set(key, val);
  return val;
}

async function deleteImage(key) {
  _imgCache.delete(key);
  await _imgCol().doc(key).delete().catch(() => {});
}

async function deleteAllNoticiaImages(n) {
  const keys = [];
  if (n.hasMainImage) keys.push(`${n.id}_main`);
  for (let i = 0; i < (n.secImagesCount || 0); i++) keys.push(`${n.id}_sec_${i}`);
  await Promise.all(keys.map(k => deleteImage(k)));
}

/* ── RENDERIZADO ── */

function applyMainImageToCard(imgEl, dataUrl) {
  if (!imgEl || !dataUrl) return;
  imgEl.style.backgroundImage =
    `linear-gradient(to bottom, rgba(10,6,2,.22) 0%, rgba(8,5,2,.80) 100%), url("${dataUrl}")`;
  imgEl.style.backgroundSize     = 'cover';
  imgEl.style.backgroundPosition = 'center';
  const iconWrap = imgEl.querySelector('.nc-icon-wrap');
  if (iconWrap) iconWrap.style.display = 'none';
  const chrRow = imgEl.querySelector('.nc-chr-row');
  if (chrRow) chrRow.style.opacity = '0';
}

function renderNoticiasGrid(noticias, container) {
  if (!container) return;
  const sorted = [...noticias].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
  const recent = sorted.slice(0, 3);

  container.innerHTML = recent.map(n => `
    <article class="noticia-card reveal">
      <div class="nc-top-line"></div>
      <div class="nc-corner nc-corner--tl"></div>
      <div class="nc-corner nc-corner--br"></div>
      <div class="nc-img ${n.tipo}" data-nid="${n.id}">
        <div class="nc-img-vignette"></div>
        <div class="nc-chr-row">
          <span class="nc-chr-rule"></span>
          <span class="nc-tag">${n.tag}</span>
          <span class="nc-chr-rule nc-chr-rule--r"></span>
        </div>
      </div>
      <div class="nc-body">
        <div class="nc-accent-bar"></div>
        <p class="nc-date"><i class="fa-regular fa-calendar"></i> ${n.fecha}</p>
        <h3 class="nc-title">${n.titulo}</h3>
        <p class="nc-excerpt">${n.extracto}</p>
        <div class="nc-footer">
          <a href="${n.enlace || '#'}" class="nc-link">
            Leer más <i class="fa-solid fa-arrow-right nc-arrow-icon"></i>
          </a>
        </div>
      </div>
    </article>
  `).join('');

  /* Carga asíncrona de fotos principales */
  recent.filter(n => n.hasMainImage).forEach(n => {
    getImage(`${n.id}_main`).then(dataUrl => {
      const imgEl = container.querySelector(`[data-nid="${n.id}"]`);
      applyMainImageToCard(imgEl, dataUrl);
    }).catch(() => {});
  });

  setupNoticiasHover(container);
  setupNoticiasClick(container, recent);
}

function spawnNoticiasParticle(card) {
  const p = document.createElement('div');
  p.className = 'nc-particle';
  const colors = [
    'rgba(201,168,76,.7)',
    'rgba(220,160,55,.75)',
    'rgba(180,120,40,.6)',
    'rgba(240,195,85,.65)',
  ];
  p.style.cssText = [
    `left: ${Math.random() * 80 + 10}%`,
    `bottom: ${Math.random() * 30 + 5}%`,
    `width: ${Math.random() * 3 + 1.5}px`,
    `height: ${Math.random() * 3 + 1.5}px`,
    `background: ${colors[Math.floor(Math.random() * colors.length)]}`,
    `animation-duration: ${(Math.random() * 1.5 + 1.2).toFixed(2)}s`,
  ].join(';');
  card.appendChild(p);
  setTimeout(() => p.remove(), 2800);
}

function setupNoticiasHover(container) {
  container.querySelectorAll('.noticia-card').forEach(card => {
    let spawnInterval = null;
    card.addEventListener('mouseenter', () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnNoticiasParticle(card), i * 120);
      }
      spawnInterval = setInterval(() => spawnNoticiasParticle(card), 900);
    });
    card.addEventListener('mouseleave', () => {
      clearInterval(spawnInterval);
    });
  });
}

/* ── MODAL DE NOTICIA ── */

let _ncModal = null;

function _buildNoticiaModal() {
  if (_ncModal) return _ncModal;
  _ncModal = document.createElement('div');
  _ncModal.className = 'nc-modal-overlay';
  _ncModal.setAttribute('role', 'dialog');
  _ncModal.setAttribute('aria-modal', 'true');
  _ncModal.innerHTML = `
    <div class="nc-modal">
      <div class="nc-modal-header" id="nc-modal-header"></div>
      <div class="nc-modal-inner">
        <button class="nc-modal-close" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="nc-modal-meta" id="nc-modal-meta"></div>
        <h2 class="nc-modal-title" id="nc-modal-title"></h2>
        <div class="nc-modal-ornament">
          <span class="nc-modal-line"></span>
          <span class="nc-modal-gem">✦</span>
          <span class="nc-modal-line"></span>
        </div>
        <div class="nc-modal-body" id="nc-modal-body"></div>
        <div class="nc-modal-gallery" id="nc-modal-gallery" hidden></div>
      </div>
    </div>
  `;
  document.body.appendChild(_ncModal);
  _ncModal.addEventListener('click', e => { if (e.target === _ncModal) _closeNoticiaModal(); });
  _ncModal.querySelector('.nc-modal-close').addEventListener('click', _closeNoticiaModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _ncModal.classList.contains('open')) _closeNoticiaModal();
  });
  return _ncModal;
}

async function _openNoticiaModal(n) {
  const el = _buildNoticiaModal();

  /* Cabecera imagen / gradiente */
  const header = el.querySelector('#nc-modal-header');
  header.className = `nc-modal-header ${n.tipo}`;
  header.style.backgroundImage = '';
  if (n.hasMainImage) {
    getImage(`${n.id}_main`).then(dataUrl => {
      if (dataUrl) {
        header.style.backgroundImage =
          `linear-gradient(to bottom, rgba(8,4,18,.1) 0%, rgba(8,4,18,.72) 100%), url("${dataUrl}")`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
      }
    }).catch(() => {});
  }

  /* Meta */
  el.querySelector('#nc-modal-meta').innerHTML = `
    <span class="nc-modal-tag">${n.tag}</span>
    <span class="nc-modal-date"><i class="fa-regular fa-calendar"></i> ${n.fecha}</span>
  `;

  /* Título */
  el.querySelector('#nc-modal-title').textContent = n.titulo;

  /* Cuerpo */
  el.querySelector('#nc-modal-body').innerHTML =
    n.contenido || `<p>${n.extracto}</p>`;

  /* Galería de fotos del evento */
  const galleryEl = el.querySelector('#nc-modal-gallery');
  galleryEl.innerHTML = '';
  galleryEl.hidden = true;
  if ((n.secImagesCount || 0) > 0) {
    Promise.all(
      Array.from({ length: n.secImagesCount }, (_, i) =>
        getImage(`${n.id}_sec_${i}`).catch(() => null)
      )
    ).then(imgs => {
      const valid = imgs.filter(Boolean);
      if (valid.length === 0) return;
      galleryEl.hidden = false;
      galleryEl.innerHTML = `
        <div class="nc-modal-gallery-label">
          <span class="nc-modal-line"></span>
          <span class="nc-modal-gallery-label-text">Galería de fotos</span>
          <span class="nc-modal-line"></span>
        </div>
        <div class="nc-modal-gallery-grid">
          ${valid.map((_, i) => `
            <div class="nc-gallery-thumb" data-gi="${i}" tabindex="0" role="button" aria-label="Ver foto ${i + 1}">
              <img src="${valid[i]}" alt="Foto del evento ${i + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      `;
      galleryEl.querySelectorAll('.nc-gallery-thumb').forEach((thumb, i) => {
        thumb.addEventListener('click', () => _openLightbox(valid, i));
        thumb.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _openLightbox(valid, i); }
        });
      });
    }).catch(() => {});
  }

  el.classList.add('open');
  document.body.style.overflow = 'hidden';

  /* Reset scroll */
  el.querySelector('.nc-modal').scrollTop = 0;
}

function _closeNoticiaModal() {
  if (!_ncModal) return;
  _ncModal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── LIGHTBOX ── */

let _lightbox = null;
let _lightboxImages = [];
let _lightboxIdx = 0;

function _buildLightbox() {
  if (_lightbox) return _lightbox;
  _lightbox = document.createElement('div');
  _lightbox.className = 'nc-lightbox';
  _lightbox.setAttribute('role', 'dialog');
  _lightbox.setAttribute('aria-modal', 'true');
  _lightbox.setAttribute('aria-label', 'Galería de fotos');
  _lightbox.innerHTML = `
    <button class="nc-lightbox-close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
    <button class="nc-lightbox-nav nc-lightbox-nav--prev" aria-label="Foto anterior"><i class="fa-solid fa-chevron-left"></i></button>
    <img class="nc-lightbox-img" src="" alt="Foto del evento">
    <button class="nc-lightbox-nav nc-lightbox-nav--next" aria-label="Foto siguiente"><i class="fa-solid fa-chevron-right"></i></button>
    <div class="nc-lightbox-counter" id="nc-lightbox-counter"></div>
  `;
  document.body.appendChild(_lightbox);
  _lightbox.querySelector('.nc-lightbox-close').addEventListener('click', _closeLightbox);
  _lightbox.querySelector('.nc-lightbox-nav--prev').addEventListener('click', () => _lightboxStep(-1));
  _lightbox.querySelector('.nc-lightbox-nav--next').addEventListener('click', () => _lightboxStep(1));
  _lightbox.addEventListener('click', e => { if (e.target === _lightbox) _closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!_lightbox?.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  _lightboxStep(-1);
    if (e.key === 'ArrowRight') _lightboxStep(1);
    if (e.key === 'Escape')     _closeLightbox();
  });
  return _lightbox;
}

function _lightboxRender() {
  const lb = _lightbox;
  lb.querySelector('.nc-lightbox-img').src = _lightboxImages[_lightboxIdx];
  const showNav = _lightboxImages.length > 1;
  lb.querySelector('.nc-lightbox-nav--prev').style.display = showNav ? 'flex' : 'none';
  lb.querySelector('.nc-lightbox-nav--next').style.display = showNav ? 'flex' : 'none';
  const counter = lb.querySelector('#nc-lightbox-counter');
  counter.style.display = showNav ? 'block' : 'none';
  if (showNav) counter.textContent = `${_lightboxIdx + 1} / ${_lightboxImages.length}`;
}

function _openLightbox(images, idx) {
  _lightboxImages = images;
  _lightboxIdx    = idx;
  _buildLightbox();
  _lightboxRender();
  _lightbox.classList.add('open');
}

function _lightboxStep(dir) {
  _lightboxIdx = (_lightboxIdx + dir + _lightboxImages.length) % _lightboxImages.length;
  _lightboxRender();
}

function _closeLightbox() {
  if (_lightbox) _lightbox.classList.remove('open');
}

function setupNoticiasClick(container, noticias) {
  container.querySelectorAll('.noticia-card').forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => _openNoticiaModal(noticias[i]));
  });
}

/* Auto-render en la página principal — se vuelve a ejecutar solo
   cada vez que cambian las noticias en Firestore (tiempo real) */
const _grid = document.getElementById('noticias-grid');
if (_grid) onNoticiasChange(() => renderNoticiasGrid(getNoticias(), _grid));
