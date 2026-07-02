/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Panel de Control — lógica de administración e imágenes
   ============================================================ */

/* ── AUTENTICACIÓN (Firebase Auth) ── */

async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const err      = document.getElementById('login-err');
  err.hidden     = true;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (_) {
    err.hidden = false;
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').focus();
    setTimeout(() => { err.hidden = true; }, 4000);
  }
}

async function forgotPassword() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    alert('Introduce tu correo electrónico y pulsa "¿Olvidaste tu contraseña?"');
    document.getElementById('login-email').focus();
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    alert('Se ha enviado un correo de restablecimiento a ' + email);
  } catch (_) {
    alert('No se pudo enviar el correo. Verifica la dirección.');
  }
}

function logout() {
  closeForm(true);
  closeEventForm(true);
  closePatForm(true);
  ['del-modal','pwd-modal','reset-modal','del-ev-modal','reset-ev-modal','del-pat-modal','reset-pat-modal','reset-rec-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m && !m.hidden) { m.classList.remove('open'); m.hidden = true; }
  });
  auth.signOut();
}

function showPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('panel').hidden = false;
  switchTab('noticias');
}

function showLoginScreen() {
  document.getElementById('panel').hidden = true;
  document.getElementById('login-screen').style.display = 'flex';
  const emailEl = document.getElementById('login-email');
  if (emailEl) { document.getElementById('login-password').value = ''; emailEl.focus(); }
}

/* ── TABS ── */

function switchTab(tab) {
  document.getElementById('section-noticias').style.display   = tab === 'noticias'   ? 'block' : 'none';
  document.getElementById('section-agenda').style.display     = tab === 'agenda'     ? 'block' : 'none';
  document.getElementById('section-velas').style.display      = tab === 'velas'      ? 'block' : 'none';
  document.getElementById('section-patrimonio').style.display = tab === 'patrimonio' ? 'block' : 'none';
  document.getElementById('section-recorrido').style.display  = tab === 'recorrido'  ? 'block' : 'none';
  document.getElementById('tab-noticias').classList.toggle('active', tab === 'noticias');
  document.getElementById('tab-agenda').classList.toggle('active', tab === 'agenda');
  document.getElementById('tab-velas').classList.toggle('active', tab === 'velas');
  document.getElementById('tab-patrimonio').classList.toggle('active', tab === 'patrimonio');
  document.getElementById('tab-recorrido').classList.toggle('active', tab === 'recorrido');

  const ns = document.getElementById('noticias-search');
  const es = document.getElementById('eventos-search');
  const ps = document.getElementById('patrimonio-search');
  if (ns) ns.value = '';
  if (es) es.value = '';
  if (ps) ps.value = '';

  if (tab === 'noticias')   renderList();
  if (tab === 'agenda')     renderEventosList();
  if (tab === 'velas')      renderVelasSection();
  if (tab === 'patrimonio') renderPatrimonioList();
  if (tab === 'recorrido')  renderRecorridoSection();
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

  await setNoticiaDoc(newId, copia);
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

    /* Guardar en Firestore (por documento, no el array completo) */
    await setNoticiaDoc(id, noticia);

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
  const n = getNoticias().find(x => x.id === pendingDelId);
  if (n) await deleteAllNoticiaImages(n).catch(() => {});
  await deleteNoticiaDoc(pendingDelId);
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
  _readJSONFile(file, async data => {
    if (!Array.isArray(data)) throw new Error();
    await replaceAllNoticias(data);
    renderList();
    showToast(`${data.length} noticias importadas correctamente`);
  });
  e.target.value = '';
}

function resetDefault() {
  showModal('reset-modal');
}

async function executeReset() {
  await replaceAllNoticias(NOTICIAS_DEFAULT);
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

async function saveEvento(e) {
  e.preventDefault();
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

  await setEventoDoc(id, evento);

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

async function executeDelEvento() {
  if (!pendingDelEvId) return;
  await deleteEventoDoc(pendingDelEvId);
  hideModal('del-ev-modal');
  pendingDelEvId = null;
  renderEventosList();
  showToast('Acto eliminado');
}

/* ── RESTAURAR EVENTOS ── */

function resetEventosDefault() {
  showModal('reset-ev-modal');
}

async function executeResetEventos() {
  await replaceAllEventos(EVENTOS_DEFAULT);
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
  _readJSONFile(file, async data => {
    if (!Array.isArray(data)) throw new Error();
    await replaceAllEventos(data);
    renderEventosList();
    showToast(`${data.length} actos importados correctamente`);
  });
  e.target.value = '';
}

/* ═══════════════════════════════════════════════════
   VELA VIRTUAL
═══════════════════════════════════════════════════ */

function renderVelasSection() {
  const cfg = getVelaConfig();
  document.getElementById('vc-enabled').checked = cfg.enabled;
  document.getElementById('vc-frase').value     = cfg.frase;
  document.getElementById('vc-subtitulo').value = cfg.subtitulo;
  document.getElementById('vc-base').value      = cfg.base;
}

async function saveVelasConfigForm(e) {
  e.preventDefault();
  const base = parseInt(document.getElementById('vc-base').value, 10);

  const cfg = {
    enabled:   document.getElementById('vc-enabled').checked,
    frase:     document.getElementById('vc-frase').value.trim() || VELA_CONFIG_DEFAULT.frase,
    subtitulo: document.getElementById('vc-subtitulo').value.trim() || VELA_CONFIG_DEFAULT.subtitulo,
    base:      Number.isFinite(base) && base >= 0 ? base : VELA_CONFIG_DEFAULT.base,
  };

  await saveVelaConfig(cfg);
  renderVelasSection();
  showToast('Configuración de la vela virtual guardada');
}

async function resetVelasConfigDefault() {
  await saveVelaConfig(VELA_CONFIG_DEFAULT);
  renderVelasSection();
  showToast('Vela virtual restaurada a los valores originales');
}

/* ═══════════════════════════════════════════════════
   PATRIMONIO / ENSERES
═══════════════════════════════════════════════════ */

/* ── LISTA ── */

function renderPatrimonioList() {
  const query = (document.getElementById('patrimonio-search')?.value || '').toLowerCase().trim();
  const items = getPatrimonio();
  let sorted  = [...items].sort((a, b) => (b.fechaAlta || '').localeCompare(a.fechaAlta || ''));
  if (query) {
    sorted = sorted.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      (CATEGORIAS_PATRIMONIO[p.categoria]?.label || '').toLowerCase().includes(query) ||
      (p.material || '').toLowerCase().includes(query)
    );
  }

  const list  = document.getElementById('patrimonio-list');
  const count = document.getElementById('patrimonio-count');
  const total = items.length;

  count.textContent = query
    ? `${sorted.length} de ${total} pieza${total !== 1 ? 's' : ''}`
    : `${total} pieza${total !== 1 ? 's' : ''} en total · ${PAT_PAGE_SIZE} por página en la web`;

  if (sorted.length === 0) {
    list.innerHTML = query
      ? '<p class="nl-empty">No hay piezas que coincidan con la búsqueda.</p>'
      : '<p class="nl-empty">No hay piezas. Pulsa "Nueva pieza" para añadir la primera.</p>';
    return;
  }

  list.innerHTML = sorted.map(p => {
    const cfg = CATEGORIAS_PATRIMONIO[p.categoria] || { label: p.categoria, icon: '✦' };
    return `
      <div class="nl-item" data-pat-id="${p.id}">
        <div class="nl-tipo" style="background:radial-gradient(circle,#3d2200,#100700)"></div>
        <div class="nl-thumb-wrap">
          <div class="nl-thumb nl-thumb--empty" id="patthumb-${p.id}">
            ${p.hasImage ? '<i class="fa-solid fa-image"></i>' : (p.icono || cfg.icon)}
          </div>
        </div>
        <div class="nl-info">
          <div class="nl-tags">
            <span class="nl-tag">${cfg.label}</span>
            ${p.hasImage ? '<span class="nl-badge nl-badge--img"><i class="fa-solid fa-image"></i></span>' : ''}
          </div>
          <p class="nl-titulo">${p.nombre}</p>
          <p class="nl-fecha">
            ${p.material ? `<i class="fa-solid fa-gem"></i> ${p.material}` : ''}
            ${p.anio ? `&nbsp;·&nbsp;<i class="fa-regular fa-calendar"></i> ${p.anio}` : ''}
          </p>
        </div>
        <div class="nl-btns">
          <button class="btn-icon" title="Duplicar" onclick="duplicatePatrimonioItem('${p.id}')">
            <i class="fa-solid fa-copy"></i>
          </button>
          <button class="btn-icon" title="Editar" onclick="openPatForm('${p.id}')">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn-icon btn-icon--del" title="Eliminar" onclick="confirmDelPat('${p.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>`;
  }).join('');

  sorted.filter(p => p.hasImage).forEach(p => {
    getImage(`${p.id}_main`).then(dataUrl => {
      const el = document.getElementById(`patthumb-${p.id}`);
      if (!el || !dataUrl) return;
      el.classList.remove('nl-thumb--empty');
      el.style.backgroundImage    = `url("${dataUrl}")`;
      el.style.backgroundSize     = 'cover';
      el.style.backgroundPosition = 'center';
      el.innerHTML = '';
    }).catch(() => {});
  });
}

/* ── DUPLICAR PIEZA ── */

async function duplicatePatrimonioItem(id) {
  const items    = getPatrimonio();
  const original = items.find(x => x.id === id);
  if (!original) return;

  const newId = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const copia = {
    ...original,
    id:        newId,
    nombre:    `Copia de ${original.nombre}`,
    fechaAlta: new Date().toISOString().slice(0, 10),
  };

  if (original.hasImage) {
    const dataUrl = await getImage(`${id}_main`).catch(() => null);
    if (dataUrl) await saveImage(`${newId}_main`, dataUrl).catch(() => {});
  }

  await setPatrimonioDoc(newId, copia);
  renderPatrimonioList();
  showToast('Pieza duplicada correctamente');
}

/* ── ESTADO DE IMAGEN EN EL FORMULARIO ── */

let patImgState = { mainNew: null, mainRemoved: false, mainExisting: null };

/* ── FORMULARIO DE PIEZA (drawer lateral) ── */

async function openPatForm(id = null) {
  const drawer  = document.getElementById('pat-drawer');
  const overlay = document.getElementById('pat-drawer-overlay');
  const title   = document.getElementById('pat-drawer-title');
  const form    = document.getElementById('patrimonio-form');

  form.reset();
  document.getElementById('pf-id').value = '';
  patImgState = { mainNew: null, mainRemoved: false, mainExisting: null };
  clearPatMainImgUI();

  if (id) {
    const p = getPatrimonio().find(x => x.id === id);
    if (!p) return;
    title.textContent = 'Editar Pieza';
    document.getElementById('pf-id').value        = p.id;
    document.getElementById('pf-nombre').value     = p.nombre;
    document.getElementById('pf-categoria').value  = p.categoria;
    document.getElementById('pf-material').value   = p.material || '';
    document.getElementById('pf-anio').value       = p.anio || '';
    document.getElementById('pf-icono').value      = p.icono || '';
    document.getElementById('pf-historia').value   = p.historia || '';

    if (p.hasImage) {
      const dataUrl = await getImage(`${p.id}_main`).catch(() => null);
      if (dataUrl) { patImgState.mainExisting = dataUrl; showPatMainImgPreview(dataUrl); }
    }
  } else {
    title.textContent = 'Nueva Pieza';
  }

  drawer.hidden  = false;
  overlay.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.getElementById('pf-nombre').focus();
  });
}

function closePatForm(instant = false) {
  const drawer  = document.getElementById('pat-drawer');
  const overlay = document.getElementById('pat-drawer-overlay');
  if (!drawer || drawer.hidden) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, instant ? 0 : 330);
}

/* ── UI FOTO DE LA PIEZA ── */

function showPatMainImgPreview(dataUrl) {
  document.getElementById('pat-main-empty').style.display   = 'none';
  const preview                                              = document.getElementById('pat-main-preview');
  preview.src                                                = dataUrl;
  preview.style.display                                      = 'block';
  document.getElementById('pat-main-actions').style.display = 'flex';
}

function clearPatMainImgUI() {
  document.getElementById('pat-main-empty').style.display    = 'flex';
  document.getElementById('pat-main-preview').style.display  = 'none';
  document.getElementById('pat-main-preview').src             = '';
  document.getElementById('pat-main-actions').style.display  = 'none';
  document.getElementById('pat-main-file').value              = '';
}

async function handlePatMainDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  await handlePatMainFile({ target: { files: [file] } });
}

async function handlePatMainFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const btn = document.getElementById('pat-main-upload-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Comprimiendo…'; }
  try {
    const dataUrl           = await compressImage(file, 700, 500, 0.72);
    patImgState.mainNew     = dataUrl;
    patImgState.mainRemoved = false;
    showPatMainImgPreview(dataUrl);
  } catch {
    showToast('No se pudo procesar la imagen. Prueba con otro archivo.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Cambiar foto'; }
    if (e.target?.value !== undefined) e.target.value = '';
  }
}

function removePatMainImg() {
  patImgState.mainNew      = null;
  patImgState.mainRemoved  = true;
  patImgState.mainExisting = null;
  clearPatMainImgUI();
}

/* ── GUARDAR PIEZA ── */

async function savePatrimonioItem(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('[type=submit]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';

  try {
    const items      = getPatrimonio();
    const existingId = document.getElementById('pf-id').value;
    const id         = existingId || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5));
    const prevItem   = items.find(x => x.id === id) || null;

    const hasImage =
      patImgState.mainNew !== null ||
      (patImgState.mainExisting !== null && !patImgState.mainRemoved);

    const item = {
      id,
      nombre:    document.getElementById('pf-nombre').value.trim(),
      categoria: document.getElementById('pf-categoria').value,
      material:  document.getElementById('pf-material').value.trim(),
      anio:      document.getElementById('pf-anio').value.trim(),
      icono:     document.getElementById('pf-icono').value.trim(),
      historia:  document.getElementById('pf-historia').value.trim(),
      hasImage,
      fechaAlta: prevItem?.fechaAlta || new Date().toISOString().slice(0, 10),
    };

    await setPatrimonioDoc(id, item);

    if (patImgState.mainNew) {
      await saveImage(`${id}_main`, patImgState.mainNew);
    } else if (patImgState.mainRemoved) {
      await deleteImage(`${id}_main`);
    }

    closePatForm();
    showToast(existingId ? 'Pieza actualizada correctamente' : 'Pieza creada correctamente');
    setTimeout(renderPatrimonioList, 340);
  } catch (err) {
    console.error(err);
    showToast('Error al guardar. Por favor inténtalo de nuevo.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar pieza';
  }
}

/* ── ELIMINAR PIEZA ── */

let pendingDelPatId = null;

function confirmDelPat(id) {
  pendingDelPatId = id;
  const p   = getPatrimonio().find(x => x.id === id);
  const txt = document.getElementById('del-pat-titulo-preview');
  if (txt && p) txt.textContent = `"${p.nombre}"`;
  showModal('del-pat-modal');
}

async function executeDelPat() {
  if (!pendingDelPatId) return;
  const p = getPatrimonio().find(x => x.id === pendingDelPatId);
  if (p?.hasImage) await deleteImage(`${p.id}_main`).catch(() => {});
  await deletePatrimonioDoc(pendingDelPatId);
  hideModal('del-pat-modal');
  pendingDelPatId = null;
  renderPatrimonioList();
  showToast('Pieza eliminada');
}

/* ── EXPORTAR / IMPORTAR PATRIMONIO ── */

function exportPatJSON() {
  _downloadJSON(getPatrimonio(), 'patrimonio.json');
}

function triggerImportPat() {
  document.getElementById('import-pat-file').click();
}

function importPatJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  _readJSONFile(file, async data => {
    if (!Array.isArray(data)) throw new Error();
    await replaceAllPatrimonio(data);
    renderPatrimonioList();
    showToast(`${data.length} piezas importadas correctamente`);
  });
  e.target.value = '';
}

function resetPatDefault() {
  showModal('reset-pat-modal');
}

async function executeResetPat() {
  await replaceAllPatrimonio(PATRIMONIO_DEFAULT);
  hideModal('reset-pat-modal');
  renderPatrimonioList();
  showToast('Patrimonio restaurado a los datos originales');
}

/* ═══════════════════════════════════════════════════
   RECORRIDO PROCESIONAL
═══════════════════════════════════════════════════ */

let recState = {
  bandas: [],
  puntos: [],
};

function _attrEsc(s) {
  return String(s ?? '').replace(/"/g, '&quot;');
}

async function renderRecorridoSection() {
  const data = getRecorrido();

  document.getElementById('rf-dia').value         = data.dia;
  document.getElementById('rf-itinerario').value   = data.itinerario;

  recState.bandas = data.bandas.map(b => ({ escudo: '', ...b }));
  recState.puntos = data.puntos.map(p => ({ ...p }));
  recPickingIndex = null;
  renderBandasRows();
  renderPuntosRows();
  renderRecMiniMap();
}

/* ── BANDAS ── */

function renderBandasRows() {
  const wrap = document.getElementById('rec-bandas-list');
  if (!wrap) return;
  if (recState.bandas.length === 0) {
    wrap.innerHTML = '<p class="sec-empty">Sin bandas añadidas</p>';
    return;
  }
  wrap.innerHTML = recState.bandas.map((b, i) => `
    <div class="rec-row">
      <div class="rec-escudo-upload">
        <input type="file" id="banda-escudo-${i}" accept="image/*" hidden onchange="handleBandaEscudo(${i}, event)">
        <label for="banda-escudo-${i}" class="rec-escudo-thumb" title="Subir escudo de la banda">
          ${b.escudo ? `<img src="${b.escudo}" alt="">` : '<i class="fa-solid fa-shield-halved"></i>'}
        </label>
        ${b.escudo ? `<button type="button" class="rec-escudo-del" title="Quitar escudo" onclick="removeBandaEscudo(${i})"><i class="fa-solid fa-xmark"></i></button>` : ''}
      </div>
      <input type="text" value="${_attrEsc(b.nombre)}" placeholder="Nombre de la banda"
             oninput="recState.bandas[${i}].nombre=this.value">
      <input type="text" value="${_attrEsc(b.tipo)}" placeholder="Tipo (Banda de Música…)"
             oninput="recState.bandas[${i}].tipo=this.value">
      <button type="button" class="btn-icon btn-icon--del" title="Eliminar" onclick="removeBandaRow(${i})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function addBandaRow() {
  recState.bandas.push({ nombre: '', tipo: '', escudo: '' });
  renderBandasRows();
}

function removeBandaRow(i) {
  recState.bandas.splice(i, 1);
  renderBandasRows();
}

async function handleBandaEscudo(i, e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    recState.bandas[i].escudo = await compressImage(file, 160, 160, 0.85);
    renderBandasRows();
  } catch {
    showToast('No se pudo procesar la imagen. Prueba con otro archivo.', 'error');
  }
}

function removeBandaEscudo(i) {
  recState.bandas[i].escudo = '';
  renderBandasRows();
}

/* ── MINI-MAPA: elegir coordenadas con un clic ── */

let recMiniMap      = null;
let recMiniMarkers  = [];
let recPickingIndex = null;

function renderRecMiniMap() {
  const el = document.getElementById('rec-mini-map');
  if (!el || typeof L === 'undefined') return;

  if (recMiniMap) { recMiniMap.remove(); recMiniMap = null; }
  recMiniMarkers = [];

  const puntos = recState.puntos;
  const center = puntos.length
    ? puntos.reduce((acc, p) => [acc[0] + (p.lat || 0) / puntos.length, acc[1] + (p.lng || 0) / puntos.length], [0, 0])
    : [36.4646, -5.9308];

  const map = L.map(el, { center, zoom: 16, scrollWheelZoom: true, zoomControl: false });
  recMiniMap = map;

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map);

  if (puntos.length > 1) {
    L.polyline(puntos.map(p => [p.lat, p.lng]), {
      color: '#C9A84C', weight: 3, opacity: .8, dashArray: '1,8',
    }).addTo(map);
  }

  puntos.forEach((p, i) => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="map-pin${p.salida ? ' map-pin--salida' : ''}"><span class="map-pin-dot"></span></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const marker = L.marker([p.lat, p.lng], { icon, draggable: true }).addTo(map);
    marker.bindTooltip(`${i + 1}. ${p.nombre || 'Punto sin nombre'}`, { direction: 'top', offset: [0, -12] });
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      updatePuntoCoords(i, lat, lng);
    });
    recMiniMarkers.push(marker);
  });

  if (puntos.length) {
    map.fitBounds(L.latLngBounds(puntos.map(p => [p.lat, p.lng])), { padding: [30, 30], maxZoom: 17 });
  }

  map.on('click', e => {
    if (recPickingIndex === null) return;
    updatePuntoCoords(recPickingIndex, e.latlng.lat, e.latlng.lng);
    recPickingIndex = null;
    renderPuntosRows();
    renderRecMiniMap();
  });
}

function updatePuntoCoords(i, lat, lng) {
  if (!recState.puntos[i]) return;
  recState.puntos[i].lat = Number(lat.toFixed(5));
  recState.puntos[i].lng = Number(lng.toFixed(5));
  const row = document.querySelectorAll('.rec-punto-row')[i];
  if (row) {
    const inputs = row.querySelectorAll('.rec-pos-inputs input');
    if (inputs[0]) inputs[0].value = recState.puntos[i].lat;
    if (inputs[1]) inputs[1].value = recState.puntos[i].lng;
  }
}

function syncMarkerPosition(i) {
  const p = recState.puntos[i];
  const marker = recMiniMarkers[i];
  if (p && marker && Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
    marker.setLatLng([p.lat, p.lng]);
  }
}

function togglePickPunto(i) {
  recPickingIndex = recPickingIndex === i ? null : i;
  renderPuntosRows();
  const hint = document.getElementById('rec-mini-map-hint');
  if (hint) {
    hint.textContent = recPickingIndex !== null
      ? 'Haz clic en el mapa para situar el punto seleccionado.'
      : 'Arrastra los marcadores para ajustar su posición, o pulsa "Elegir en el mapa" en un punto y haz clic donde quieras situarlo.';
  }
}

/* ── PUNTOS DEL RECORRIDO ── */

function renderPuntosRows() {
  const wrap = document.getElementById('rec-puntos-list');
  if (!wrap) return;
  if (recState.puntos.length === 0) {
    wrap.innerHTML = '<p class="sec-empty">Sin puntos añadidos</p>';
    return;
  }
  wrap.innerHTML = recState.puntos.map((p, i) => `
    <div class="rec-punto-row">
      <div class="rec-punto-num">${i + 1}</div>
      <div class="rec-punto-fields">
        <div class="fg-row">
          <div class="fg">
            <label>Nombre *</label>
            <input type="text" value="${_attrEsc(p.nombre)}" placeholder="Ej: Recta del Tití"
                   oninput="recState.puntos[${i}].nombre=this.value">
          </div>
          <div class="fg">
            <label>Hora *</label>
            <input type="time" value="${_attrEsc(p.hora)}"
                   oninput="recState.puntos[${i}].hora=this.value">
          </div>
        </div>
        <div class="fg-row">
          <div class="fg">
            <label>Lugar <span class="lbl-opt">(opcional)</span></label>
            <input type="text" value="${_attrEsc(p.lugar || '')}" placeholder="Ej: San Juan de Dios"
                   oninput="recState.puntos[${i}].lugar=this.value">
          </div>
          <div class="fg">
            <label>Coordenadas (latitud / longitud)</label>
            <div class="rec-pos-inputs">
              <input type="number" step="0.00001" value="${p.lat}" placeholder="Latitud"
                     oninput="recState.puntos[${i}].lat=Number(this.value); syncMarkerPosition(${i})">
              <input type="number" step="0.00001" value="${p.lng}" placeholder="Longitud"
                     oninput="recState.puntos[${i}].lng=Number(this.value); syncMarkerPosition(${i})">
            </div>
            <button type="button" class="btn-ghost-sm rec-pick-btn ${recPickingIndex === i ? 'rec-pick-btn--active' : ''}"
                    onclick="togglePickPunto(${i})">
              <i class="fa-solid fa-location-crosshairs"></i>
              ${recPickingIndex === i ? 'Pulsa en el mapa…' : 'Elegir en el mapa'}
            </button>
          </div>
        </div>
        <label class="rec-checkbox">
          <input type="checkbox" ${p.salida ? 'checked' : ''}
                 onchange="recState.puntos[${i}].salida=this.checked; renderRecMiniMap();">
          Marcar como punto de salida (color distinto en el mapa)
        </label>
      </div>
      <div class="rec-punto-btns">
        <button type="button" class="btn-icon" title="Subir" ${i === 0 ? 'disabled' : ''} onclick="movePuntoRow(${i},-1)">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <button type="button" class="btn-icon" title="Bajar" ${i === recState.puntos.length - 1 ? 'disabled' : ''} onclick="movePuntoRow(${i},1)">
          <i class="fa-solid fa-arrow-down"></i>
        </button>
        <button type="button" class="btn-icon btn-icon--del" title="Eliminar" onclick="removePuntoRow(${i})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function addPuntoRow() {
  const last = recState.puntos[recState.puntos.length - 1];
  recState.puntos.push({
    id: 'rp' + Date.now().toString(36), nombre: '', hora: '', lugar: '',
    lat: last ? last.lat : 36.4646, lng: last ? last.lng : -5.9308,
    salida: false,
  });
  recPickingIndex = null;
  renderPuntosRows();
  renderRecMiniMap();
}

function removePuntoRow(i) {
  recState.puntos.splice(i, 1);
  recPickingIndex = null;
  renderPuntosRows();
  renderRecMiniMap();
}

function movePuntoRow(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= recState.puntos.length) return;
  [recState.puntos[i], recState.puntos[j]] = [recState.puntos[j], recState.puntos[i]];
  recPickingIndex = null;
  renderPuntosRows();
  renderRecMiniMap();
}

/* ── GUARDAR RECORRIDO ── */

async function saveRecorridoForm(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('[type=submit]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';

  try {
    const dia        = document.getElementById('rf-dia').value.trim();
    const itinerario = document.getElementById('rf-itinerario').value.trim();

    const bandas = recState.bandas
      .map(b => ({ nombre: b.nombre.trim(), tipo: b.tipo.trim(), escudo: b.escudo || '' }))
      .filter(b => b.nombre);

    const puntos = recState.puntos.map(p => ({
      id:     p.id,
      nombre: p.nombre.trim(),
      hora:   p.hora,
      lugar:  (p.lugar || '').trim(),
      lat:    Number(p.lat) || 0,
      lng:    Number(p.lng) || 0,
      salida: !!p.salida,
    }));

    if (puntos.length === 0 || puntos.some(p => !p.nombre || !p.hora || !p.lat || !p.lng)) {
      showToast('Cada punto necesita nombre, hora y coordenadas.', 'error');
      return;
    }

    await saveRecorridoData({ dia, itinerario, bandas, puntos });

    showToast('Recorrido actualizado correctamente');
  } catch (err) {
    console.error(err);
    showToast('Error al guardar. Por favor inténtalo de nuevo.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar recorrido';
  }
}

/* ── RESTAURAR RECORRIDO ── */

function resetRecorridoDefault() {
  showModal('reset-rec-modal');
}

async function executeResetRecorrido() {
  await saveRecorridoData(RECORRIDO_DEFAULT);
  hideModal('reset-rec-modal');
  renderRecorridoSection();
  showToast('Recorrido restaurado a los datos originales');
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

async function changePwd() {
  const current = document.getElementById('pwd-current').value;
  const next    = document.getElementById('pwd-new').value;
  const confirm = document.getElementById('pwd-confirm').value;
  const err     = document.getElementById('pwd-err');
  err.hidden    = true;

  if (next.length < 6) {
    err.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
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

  try {
    const user       = auth.currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, current);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(next);
    hideModal('pwd-modal');
    showToast('Contraseña cambiada correctamente');
  } catch (_) {
    err.textContent = 'La contraseña actual no es correcta.';
    err.hidden = false;
    document.getElementById('pwd-current').value = '';
    document.getElementById('pwd-current').focus();
  }
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
  const drawer    = document.getElementById('drawer');
  const evDrawer  = document.getElementById('ev-drawer');
  const patDrawer = document.getElementById('pat-drawer');
  if (drawer    && !drawer.hidden    && drawer.classList.contains('open'))    { closeForm();      return; }
  if (evDrawer  && !evDrawer.hidden  && evDrawer.classList.contains('open'))  { closeEventForm(); return; }
  if (patDrawer && !patDrawer.hidden && patDrawer.classList.contains('open')) { closePatForm();   return; }
  ['del-modal','pwd-modal','reset-modal','del-ev-modal','reset-ev-modal','del-pat-modal','reset-pat-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m && !m.hidden && m.classList.contains('open')) hideModal(id);
  });
});

/* ── INIT ── */

document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

document.getElementById('f-extracto').addEventListener('input', updateCharCount);

auth.onAuthStateChanged(user => {
  if (user) showPanel();
  else showLoginScreen();
});
