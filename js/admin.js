/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Panel de Control — lógica de administración e imágenes
   ============================================================ */

const PIN_KEY     = 'hermandad_admin_pin';
const AUTH_KEY    = 'hermandad_admin_auth';
const DEFAULT_PIN = '1975';

/* ── AUTENTICACIÓN ── */

function getPin() {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

function checkPin() {
  const input = document.getElementById('pin-input').value;
  if (input === getPin()) {
    sessionStorage.setItem(AUTH_KEY, '1');
    showPanel();
  } else {
    const err = document.getElementById('login-err');
    err.hidden = false;
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-input').focus();
    setTimeout(() => { err.hidden = true; }, 3500);
  }
}

function logout() {
  closeForm(true);
  closeEventForm(true);
  ['del-modal','pwd-modal','reset-modal','del-ev-modal','reset-ev-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m && !m.hidden) { m.classList.remove('open'); m.hidden = true; }
  });
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById('panel').hidden = true;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('pin-input').value = '';
  document.getElementById('pin-input').focus();
}

function showPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('panel').hidden = false;
  switchTab('noticias');
}

/* ── TABS ── */

function switchTab(tab) {
  document.getElementById('section-noticias').style.display = tab === 'noticias' ? 'block' : 'none';
  document.getElementById('section-agenda').style.display   = tab === 'agenda'   ? 'block' : 'none';
  document.getElementById('tab-noticias').classList.toggle('active', tab === 'noticias');
  document.getElementById('tab-agenda').classList.toggle('active', tab === 'agenda');

  const ns = document.getElementById('noticias-search');
  const es = document.getElementById('eventos-search');
  if (ns) ns.value = '';
  if (es) es.value = '';

  if (tab === 'noticias') renderList();
  if (tab === 'agenda')   renderEventosList();
}

/* ═══════════════════════════════════════════════════
   NOTICIAS
═══════════════════════════════════════════════════ */

/* ── LISTA ── */

function renderList() {
  const query   = (document.getElementById('noticias-search')?.value || '').toLowerCase().trim();
  const noticias = getNoticias();
  let sorted    = [...noticias].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
  if (query) {
    sorted = sorted.filter(n =>
      n.titulo.toLowerCase().includes(query) ||
      n.tag.toLowerCase().includes(query) ||
      n.extracto.toLowerCase().includes(query)
    );
  }

  const list  = document.getElementById('noticias-list');
  const count = document.getElementById('noticias-count');
  const total = noticias.length;

  count.textContent = query
    ? `${sorted.length} de ${total} noticia${total !== 1 ? 's' : ''} · Se muestran las 3 más recientes en la web`
    : `${total} noticia${total !== 1 ? 's' : ''} en total · Se muestran las 3 más recientes en la web`;

  if (sorted.length === 0) {
    list.innerHTML = query
      ? '<p class="nl-empty">No hay noticias que coincidan con la búsqueda.</p>'
      : '<p class="nl-empty">No hay noticias. Pulsa "Nueva noticia" para añadir la primera.</p>';
    return;
  }

  list.innerHTML = sorted.map((n, i) => `
    <div class="nl-item ${i < 3 && !query ? 'nl-item--featured' : ''}" data-list-id="${n.id}">
      <div class="nl-tipo ${n.tipo}"></div>
      <div class="nl-thumb-wrap">
        <div class="nl-thumb nl-thumb--empty" id="nlthumb-${n.id}">
          <i class="fa-solid fa-image"></i>
        </div>
      </div>
      <div class="nl-info">
        <div class="nl-tags">
          <span class="nl-tag">${n.tag}</span>
          ${i < 3 && !query ? '<span class="nl-badge">En portada</span>' : ''}
          ${n.hasMainImage ? '<span class="nl-badge nl-badge--img"><i class="fa-solid fa-image"></i></span>' : ''}
          ${(n.secImagesCount || 0) > 0 ? `<span class="nl-badge nl-badge--img"><i class="fa-solid fa-images"></i> ${n.secImagesCount}</span>` : ''}
        </div>
        <p class="nl-titulo">${n.titulo}</p>
        <p class="nl-fecha"><i class="fa-regular fa-calendar"></i> ${n.fecha}</p>
      </div>
      <div class="nl-btns">
        <button class="btn-icon" title="Duplicar" onclick="duplicateNoticia('${n.id}')">
          <i class="fa-solid fa-copy"></i>
        </button>
        <button class="btn-icon" title="Editar" onclick="openForm('${n.id}')">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn-icon btn-icon--del" title="Eliminar" onclick="confirmDel('${n.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  sorted.filter(n => n.hasMainImage).forEach(n => {
    getImage(`${n.id}_main`).then(dataUrl => {
      const el = document.getElementById(`nlthumb-${n.id}`);
      if (!el || !dataUrl) return;
      el.classList.remove('nl-thumb--empty');
      el.style.backgroundImage    = `url("${dataUrl}")`;
      el.style.backgroundSize     = 'cover';
      el.style.backgroundPosition = 'center';
      el.innerHTML = '';
    }).catch(() => {});
  });
}

/* ── DUPLICAR NOTICIA ── */

async function duplicateNoticia(id) {
  const noticias = getNoticias();
  const original = noticias.find(x => x.id === id);
  if (!original) return;

  const newId = uid();
  const copia = {
    ...original,
    id:     newId,
    titulo: `Copia de ${original.titulo}`,
    fecha:  formatFecha(original.fechaISO),
  };

  if (original.hasMainImage) {
    const dataUrl = await getImage(`${id}_main`).catch(() => null);
    if (dataUrl) await saveImage(`${newId}_main`, dataUrl).catch(() => {});
  }
  for (let i = 0; i < (original.secImagesCount || 0); i++) {
    const dataUrl = await getImage(`${id}_sec_${i}`).catch(() => null);
    if (dataUrl) await saveImage(`${newId}_sec_${i}`, dataUrl).catch(() => {});
  }

  noticias.push(copia);
  saveNoticias(noticias);
  renderList();
  showToast('Noticia duplicada correctamente');
}

/* ── COMPRESIÓN DE IMÁGENES ── */

function compressImage(file, maxW, maxH, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale  = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.naturalWidth  * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── ESTADO DE IMÁGENES EN EL FORMULARIO ── */

let adminImgState = {
  mainNew:      null,
  mainRemoved:  false,
  mainExisting: null,
  secImages:    [],
  prevSecCount: 0,
};

/* ── FORMULARIO DE NOTICIA (drawer lateral) ── */

async function openForm(id = null) {
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const title   = document.getElementById('drawer-title');
  const form    = document.getElementById('noticia-form');

  form.reset();
  document.getElementById('f-id').value = '';
  adminImgState = { mainNew: null, mainRemoved: false, mainExisting: null, secImages: [], prevSecCount: 0 };
  clearMainImgUI();
  renderSecGrid();
  updateCharCount();

  if (id) {
    const n = getNoticias().find(x => x.id === id);
    if (!n) return;
    title.textContent = 'Editar Noticia';
    document.getElementById('f-id').value       = n.id;
    document.getElementById('f-titulo').value   = n.titulo;
    document.getElementById('f-extracto').value = n.extracto;
    document.getElementById('f-tag').value      = n.tag;
    document.getElementById('f-icono').value    = n.icono || '';
    document.getElementById('f-fecha').value    = n.fechaISO;
    document.getElementById('f-tipo').value     = n.tipo;
    document.getElementById('f-enlace').value   = n.enlace === '#' ? '' : (n.enlace || '');
    updateCharCount();

    if (n.hasMainImage) {
      const dataUrl = await getImage(`${n.id}_main`).catch(() => null);
      if (dataUrl) { adminImgState.mainExisting = dataUrl; showMainImgPreview(dataUrl); }
    }

    adminImgState.prevSecCount = n.secImagesCount || 0;
    for (let i = 0; i < adminImgState.prevSecCount; i++) {
      const dataUrl = await getImage(`${n.id}_sec_${i}`).catch(() => null);
      if (dataUrl) adminImgState.secImages.push(dataUrl);
    }
    renderSecGrid();
  } else {
    title.textContent = 'Nueva Noticia';
    document.getElementById('f-fecha').value = new Date().toISOString().split('T')[0];
  }

  drawer.hidden  = false;
  overlay.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.getElementById('f-titulo').focus();
  });
}

function closeForm(instant = false) {
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer || drawer.hidden) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, instant ? 0 : 330);
}

/* ── CHARACTER COUNTER ── */

function updateCharCount() {
  const textarea = document.getElementById('f-extracto');
  const counter  = document.getElementById('f-extracto-count');
  if (!textarea || !counter) return;
  const len = textarea.value.length;
  counter.textContent = `${len} car.`;
  counter.classList.toggle('char-warn', len > 220);
}

/* ── UI FOTO PRINCIPAL ── */

function showMainImgPreview(dataUrl) {
  document.getElementById('main-empty').style.display   = 'none';
  const preview                                          = document.getElementById('main-preview');
  preview.src                                            = dataUrl;
  preview.style.display                                  = 'block';
  document.getElementById('main-actions').style.display = 'flex';
}

function clearMainImgUI() {
  document.getElementById('main-empty').style.display    = 'flex';
  document.getElementById('main-preview').style.display  = 'none';
  document.getElementById('main-preview').src            = '';
  document.getElementById('main-actions').style.display  = 'none';
  document.getElementById('main-file').value             = '';
}

async function handleMainDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  await handleMainFile({ target: { files: [file] } });
}

async function handleMainFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const btn = document.getElementById('main-upload-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Comprimiendo…'; }
  try {
    const dataUrl             = await compressImage(file, 900, 600, 0.72);
    adminImgState.mainNew     = dataUrl;
    adminImgState.mainRemoved = false;
    showMainImgPreview(dataUrl);
  } catch {
    showToast('No se pudo procesar la imagen. Prueba con otro archivo.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Cambiar foto'; }
    if (e.target?.value !== undefined) e.target.value = '';
  }
}

function removeMainImg() {
  adminImgState.mainNew      = null;
  adminImgState.mainRemoved  = true;
  adminImgState.mainExisting = null;
  clearMainImgUI();
}

/* ── UI FOTOS SECUNDARIAS ── */

async function handleSecFiles(e) {
  const files  = Array.from(e.target.files);
  if (!files.length) return;
  const addBtn = document.getElementById('sec-add-btn');
  if (addBtn) { addBtn.disabled = true; addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando…'; }
  try {
    for (const file of files) {
      const dataUrl = await compressImage(file, 600, 400, 0.68);
      adminImgState.secImages.push(dataUrl);
    }
    renderSecGrid();
  } catch {
    showToast('No se pudo procesar alguna imagen.', 'error');
  } finally {
    if (addBtn) { addBtn.disabled = false; addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Añadir fotos'; }
    e.target.value = '';
  }
}

function removeSecImg(idx) {
  adminImgState.secImages.splice(idx, 1);
  renderSecGrid();
}

function renderSecGrid() {
  const grid = document.getElementById('sec-grid');
  if (!grid) return;
  if (adminImgState.secImages.length === 0) {
    grid.innerHTML = '<p class="sec-empty">Sin fotos de galería</p>';
    return;
  }
  grid.innerHTML = adminImgState.secImages.map((dataUrl, i) => `
    <div class="sec-thumb">
      <img src="${dataUrl}" alt="Foto ${i + 1}">
      <button type="button" class="sec-thumb-del" onclick="removeSecImg(${i})" title="Eliminar">✕</button>
    </div>
  `).join('');
}

/* ── GUARDAR NOTICIA ── */

async function saveNoticia(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('[type=submit]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';

  try {
    const noticias    = getNoticias();
    const existingId  = document.getElementById('f-id').value;
    const id          = existingId || uid();
    const fechaISO    = document.getElementById('f-fecha').value;
    const enlaceRaw   = document.getElementById('f-enlace').value.trim();
    const prevNoticia = noticias.find(x => x.id === id) || null;

    const hasMainImage =
      adminImgState.mainNew !== null ||
      (adminImgState.mainExisting !== null && !adminImgState.mainRemoved);

    const noticia = {
      id,
      titulo:         document.getElementById('f-titulo').value.trim(),
      extracto:       document.getElementById('f-extracto').value.trim(),
      tag:            document.getElementById('f-tag').value.trim(),
      icono:          document.getElementById('f-icono').value.trim() || '✝',
      tipo:           document.getElementById('f-tipo').value,
      fechaISO,
      fecha:          formatFecha(fechaISO),
      enlace:         enlaceRaw || '#',
      hasMainImage,
      secImagesCount: adminImgState.secImages.length,
    };

    const idx = noticias.findIndex(x => x.id === id);
    if (idx >= 0) noticias[idx] = noticia;
    else noticias.push(noticia);
    saveNoticias(noticias);

    if (adminImgState.mainNew) {
      await saveImage(`${id}_main`, adminImgState.mainNew);
    } else if (adminImgState.mainRemoved) {
      await deleteImage(`${id}_main`);
    }

    const prevCount = prevNoticia?.secImagesCount || 0;
    await Promise.all(Array.from({ length: prevCount }, (_, i) => deleteImage(`${id}_sec_${i}`)));
    await Promise.all(adminImgState.secImages.map((dataUrl, i) => saveImage(`${id}_sec_${i}`, dataUrl)));

    closeForm();
    showToast(existingId ? 'Noticia actualizada correctamente' : 'Noticia creada correctamente');
    setTimeout(renderList, 340);
  } catch (err) {
    console.error(err);
    showToast('Error al guardar. Por favor inténtalo de nuevo.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar noticia';
  }
}

/* ── ELIMINAR NOTICIA ── */

let pendingDelId = null;

function confirmDel(id) {
  pendingDelId = id;
  const n   = getNoticias().find(x => x.id === id);
  const txt = document.getElementById('del-titulo-preview');
  if (txt && n) txt.textContent = `"${n.titulo}"`;
  showModal('del-modal');
}

async function executeDel() {
  if (!pendingDelId) return;
  const noticias = getNoticias();
  const n        = noticias.find(x => x.id === pendingDelId);
  if (n) await deleteAllNoticiaImages(n).catch(() => {});
  saveNoticias(noticias.filter(x => x.id !== pendingDelId));
  hideModal('del-modal');
  pendingDelId = null;
  renderList();
  showToast('Noticia eliminada');
}

/* ── EXPORTAR / IMPORTAR NOTICIAS ── */

function exportJSON() {
  _downloadJSON(getNoticias(), 'noticias.json');
}

function triggerImport() {
  document.getElementById('import-file').click();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  _readJSONFile(file, data => {
    if (!Array.isArray(data)) throw new Error();
    saveNoticias(data);
    renderList();
    showToast(`${data.length} noticias importadas correctamente`);
  });
  e.target.value = '';
}

function resetDefault() {
  showModal('reset-modal');
}

function executeReset() {
  localStorage.removeItem(NOTICIAS_KEY);
  hideModal('reset-modal');
  renderList();
  showToast('Noticias restauradas a los datos originales');
}

/* ═══════════════════════════════════════════════════
   AGENDA / EVENTOS
═══════════════════════════════════════════════════ */

const _EV_TIPO_COLORS = {
  'CULTO':       'linear-gradient(180deg,#6B35AA,#3D1070)',
  'CABILDO':     'linear-gradient(180deg,#AA8A35,#705A10)',
  'CONVIVENCIA': 'linear-gradient(180deg,#AA3550,#701030)',
  'FUNCIÓN':     'linear-gradient(180deg,#356BAA,#103D70)',
  'TRIDUO':      'linear-gradient(180deg,#35AA6B,#107040)',
  'BESAPIÉS':    'linear-gradient(180deg,#8A35AA,#5A1070)',
  'REUNIÓN':     'linear-gradient(180deg,#AA6B35,#704010)',
  'PROCESIÓN':   'linear-gradient(180deg,#AA3535,#701010)',
  'OTRO':        'linear-gradient(180deg,#556677,#334455)',
};

/* ── LISTA DE EVENTOS ── */

function renderEventosList() {
  const query   = (document.getElementById('eventos-search')?.value || '').toLowerCase().trim();
  const eventos = getEventos();
  let sorted    = [...eventos].sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
  if (query) {
    sorted = sorted.filter(ev =>
      ev.titulo.toLowerCase().includes(query) ||
      ev.tipo.toLowerCase().includes(query) ||
      ev.lugar.toLowerCase().includes(query)
    );
  }

  const list    = document.getElementById('eventos-list');
  const count   = document.getElementById('eventos-count');
  const total   = eventos.length;
  const today   = new Date().toISOString().slice(0, 10);
  const proximos = eventos.filter(ev => ev.fechaISO >= today).length;

  count.textContent = query
    ? `${sorted.length} de ${total} acto${total !== 1 ? 's' : ''}`
    : `${total} acto${total !== 1 ? 's' : ''} en total · ${proximos} próximo${proximos !== 1 ? 's' : ''}`;

  if (sorted.length === 0) {
    list.innerHTML = query
      ? '<p class="nl-empty">No hay actos que coincidan con la búsqueda.</p>'
      : '<p class="nl-empty">No hay actos programados. Pulsa "Nuevo acto" para añadir el primero.</p>';
    return;
  }

  list.innerHTML = sorted.map(ev => {
    const cfg    = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG['OTRO'];
    const pasado = ev.fechaISO < today;
    const color  = _EV_TIPO_COLORS[ev.tipo] || _EV_TIPO_COLORS['OTRO'];
    return `
      <div class="nl-item ${pasado ? '' : 'nl-item--featured'}" data-ev-id="${ev.id}">
        <div class="nl-tipo" style="background:${color}"></div>
        <div class="nl-info">
          <div class="nl-tags">
            <span class="nl-tag"><i class="fa-solid ${cfg.icon}"></i> ${ev.tipo}</span>
            ${!pasado
              ? '<span class="nl-badge">Próximo</span>'
              : '<span class="nl-badge nl-badge--past">Pasado</span>'}
          </div>
          <p class="nl-titulo">${ev.titulo}</p>
          <p class="nl-fecha">
            <i class="fa-regular fa-calendar"></i> ${_formatFechaEvento(ev.fechaISO)}
            &nbsp;·&nbsp;<i class="fa-regular fa-clock"></i> ${ev.hora} h
            &nbsp;·&nbsp;<i class="fa-solid fa-location-dot"></i> ${ev.lugar}
          </p>
        </div>
        <div class="nl-btns">
          <button class="btn-icon" title="Editar" onclick="openEventForm('${ev.id}')">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn-icon btn-icon--del" title="Eliminar" onclick="confirmDelEvento('${ev.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

/* ── FORMULARIO DE EVENTO ── */

function openEventForm(id = null) {
  const drawer  = document.getElementById('ev-drawer');
  const overlay = document.getElementById('ev-drawer-overlay');
  const title   = document.getElementById('ev-drawer-title');
  const form    = document.getElementById('evento-form');

  form.reset();
  document.getElementById('ef-id').value = '';

  if (id) {
    const ev = getEventos().find(x => x.id === id);
    if (!ev) return;
    title.textContent = 'Editar Acto';
    document.getElementById('ef-id').value     = ev.id;
    document.getElementById('ef-titulo').value = ev.titulo;
    document.getElementById('ef-tipo').value   = ev.tipo;
    document.getElementById('ef-fecha').value  = ev.fechaISO;
    document.getElementById('ef-hora').value   = ev.hora;
    document.getElementById('ef-lugar').value  = ev.lugar;
  } else {
    title.textContent = 'Nuevo Acto';
    document.getElementById('ef-fecha').value = new Date().toISOString().split('T')[0];
  }

  drawer.hidden  = false;
  overlay.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.getElementById('ef-titulo').focus();
  });
}

function closeEventForm(instant = false) {
  const drawer  = document.getElementById('ev-drawer');
  const overlay = document.getElementById('ev-drawer-overlay');
  if (!drawer || drawer.hidden) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, instant ? 0 : 330);
}

function saveEvento(e) {
  e.preventDefault();
  const eventos    = getEventos();
  const existingId = document.getElementById('ef-id').value;
  const id         = existingId || ('ev' + Date.now().toString(36));

  const evento = {
    id,
    titulo:   document.getElementById('ef-titulo').value.trim(),
    tipo:     document.getElementById('ef-tipo').value,
    fechaISO: document.getElementById('ef-fecha').value,
    hora:     document.getElementById('ef-hora').value,
    lugar:    document.getElementById('ef-lugar').value.trim(),
  };

  const idx = eventos.findIndex(x => x.id === id);
  if (idx >= 0) eventos[idx] = evento;
  else eventos.push(evento);
  saveEventos(eventos);

  closeEventForm();
  showToast(existingId ? 'Acto actualizado correctamente' : 'Acto añadido correctamente');
  setTimeout(renderEventosList, 340);
}

/* ── ELIMINAR EVENTO ── */

let pendingDelEvId = null;

function confirmDelEvento(id) {
  pendingDelEvId = id;
  const ev  = getEventos().find(x => x.id === id);
  const txt = document.getElementById('del-ev-titulo-preview');
  if (txt && ev) txt.textContent = `"${ev.titulo}"`;
  showModal('del-ev-modal');
}

function executeDelEvento() {
  if (!pendingDelEvId) return;
  saveEventos(getEventos().filter(x => x.id !== pendingDelEvId));
  hideModal('del-ev-modal');
  pendingDelEvId = null;
  renderEventosList();
  showToast('Acto eliminado');
}

/* ── RESTAURAR EVENTOS ── */

function resetEventosDefault() {
  showModal('reset-ev-modal');
}

function executeResetEventos() {
  localStorage.removeItem(EVENTOS_KEY);
  hideModal('reset-ev-modal');
  renderEventosList();
  showToast('Actos restaurados a los datos originales');
}

/* ── EXPORTAR / IMPORTAR EVENTOS ── */

function exportEventosJSON() {
  _downloadJSON(getEventos(), 'eventos.json');
}

function triggerImportEventos() {
  document.getElementById('import-ev-file').click();
}

function importEventosJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  _readJSONFile(file, data => {
    if (!Array.isArray(data)) throw new Error();
    saveEventos(data);
    renderEventosList();
    showToast(`${data.length} actos importados correctamente`);
  });
  e.target.value = '';
}

/* ═══════════════════════════════════════════════════
   UTILIDADES COMPARTIDAS
═══════════════════════════════════════════════════ */

/* ── CAMBIAR CONTRASEÑA ── */

function showChangePwd() {
  ['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('pwd-err').hidden = true;
  showModal('pwd-modal');
  setTimeout(() => document.getElementById('pwd-current').focus(), 60);
}

function changePwd() {
  const current = document.getElementById('pwd-current').value;
  const next    = document.getElementById('pwd-new').value;
  const confirm = document.getElementById('pwd-confirm').value;
  const err     = document.getElementById('pwd-err');
  err.hidden    = true;

  if (current !== getPin()) {
    err.textContent = 'La contraseña actual no es correcta.';
    err.hidden = false;
    document.getElementById('pwd-current').focus();
    return;
  }
  if (next.length < 4) {
    err.textContent = 'La nueva contraseña debe tener al menos 4 caracteres.';
    err.hidden = false;
    document.getElementById('pwd-new').focus();
    return;
  }
  if (next !== confirm) {
    err.textContent = 'Las contraseñas nuevas no coinciden.';
    err.hidden = false;
    document.getElementById('pwd-confirm').focus();
    return;
  }

  localStorage.setItem(PIN_KEY, next);
  hideModal('pwd-modal');
  showToast('Contraseña cambiada correctamente');
}

/* ── MODALES ── */

function showModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('open'));
}

function hideModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => { m.hidden = true; }, 290);
}

/* ── TOAST ── */

function showToast(msg, type = 'default') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = type === 'error' ? 'toast toast--error' : 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast--in'));
  setTimeout(() => {
    t.classList.remove('toast--in');
    setTimeout(() => t.remove(), 400);
  }, 3200);
}

/* ── HELPERS ── */

function _downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

function _readJSONFile(file, onData) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      onData(JSON.parse(ev.target.result));
    } catch {
      showToast('El archivo no tiene el formato correcto.', 'error');
    }
  };
  reader.onerror = () => showToast('No se pudo leer el archivo.', 'error');
  reader.readAsText(file);
}

function formatFecha(isoDate) {
  const months = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} de ${months[m - 1]}, ${y}`;
}

function uid() {
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ── TECLADO GLOBAL ── */

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const drawer   = document.getElementById('drawer');
  const evDrawer = document.getElementById('ev-drawer');
  if (drawer   && !drawer.hidden   && drawer.classList.contains('open'))   { closeForm();      return; }
  if (evDrawer && !evDrawer.hidden && evDrawer.classList.contains('open')) { closeEventForm(); return; }
  ['del-modal','pwd-modal','reset-modal','del-ev-modal','reset-ev-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m && !m.hidden && m.classList.contains('open')) hideModal(id);
  });
});

/* ── INIT ── */

document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPin();
});

document.getElementById('f-extracto').addEventListener('input', updateCharCount);

if (sessionStorage.getItem(AUTH_KEY) === '1') {
  showPanel();
}
