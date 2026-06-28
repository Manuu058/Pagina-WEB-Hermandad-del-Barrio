/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Panel de Control — lógica de administración e imágenes
   ============================================================ */

const PIN_KEY  = 'hermandad_admin_pin';
const AUTH_KEY = 'hermandad_admin_auth';
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
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById('panel').hidden = true;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('pin-input').value = '';
  document.getElementById('pin-input').focus();
}

function showPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('panel').hidden = false;
  renderList();
}

/* ── LISTA ── */

function renderList() {
  const noticias = getNoticias();
  const sorted   = [...noticias].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
  const list     = document.getElementById('noticias-list');
  const count    = document.getElementById('noticias-count');

  const total = sorted.length;
  count.textContent =
    `${total} noticia${total !== 1 ? 's' : ''} en total · Se muestran las 3 más recientes en la web`;

  if (total === 0) {
    list.innerHTML =
      '<p class="nl-empty">No hay noticias. Pulsa "Nueva noticia" para añadir la primera.</p>';
    return;
  }

  list.innerHTML = sorted.map((n, i) => `
    <div class="nl-item ${i < 3 ? 'nl-item--featured' : ''}" data-list-id="${n.id}">
      <div class="nl-tipo ${n.tipo}"></div>
      <div class="nl-thumb-wrap">
        <div class="nl-thumb nl-thumb--empty" id="nlthumb-${n.id}">
          <i class="fa-solid fa-image"></i>
        </div>
      </div>
      <div class="nl-info">
        <div class="nl-tags">
          <span class="nl-tag">${n.tag}</span>
          ${i < 3 ? '<span class="nl-badge">En portada</span>' : ''}
          ${n.hasMainImage ? '<span class="nl-badge nl-badge--img"><i class="fa-solid fa-image"></i></span>' : ''}
          ${(n.secImagesCount || 0) > 0 ? `<span class="nl-badge nl-badge--img"><i class="fa-solid fa-images"></i> ${n.secImagesCount}</span>` : ''}
        </div>
        <p class="nl-titulo">${n.titulo}</p>
        <p class="nl-fecha"><i class="fa-regular fa-calendar"></i> ${n.fecha}</p>
      </div>
      <div class="nl-btns">
        <button class="btn-icon" title="Editar" onclick="openForm('${n.id}')">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn-icon btn-icon--del" title="Eliminar" onclick="confirmDel('${n.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  /* Cargar miniaturas de forma asíncrona */
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
  mainNew:      null,   /* base64 de nueva foto principal */
  mainRemoved:  false,  /* true si el usuario quitó la foto existente */
  mainExisting: null,   /* base64 de la foto ya guardada (para display en edición) */
  secImages:    [],     /* array de base64: estado actual de la galería */
  prevSecCount: 0,      /* cuántas fotos secundarias había antes de editar */
};

/* ── FORMULARIO (drawer lateral) ── */

async function openForm(id = null) {
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const title   = document.getElementById('drawer-title');
  const form    = document.getElementById('noticia-form');

  form.reset();
  document.getElementById('f-id').value = '';

  /* Resetear estado de imágenes */
  adminImgState = { mainNew: null, mainRemoved: false, mainExisting: null, secImages: [], prevSecCount: 0 };
  clearMainImgUI();
  renderSecGrid();

  if (id) {
    const n = getNoticias().find(x => x.id === id);
    if (!n) return;
    title.textContent = 'Editar Noticia';
    document.getElementById('f-id').value      = n.id;
    document.getElementById('f-titulo').value  = n.titulo;
    document.getElementById('f-extracto').value= n.extracto;
    document.getElementById('f-tag').value     = n.tag;
    document.getElementById('f-icono').value   = n.icono || '';
    document.getElementById('f-fecha').value   = n.fechaISO;
    document.getElementById('f-tipo').value    = n.tipo;
    document.getElementById('f-enlace').value  = n.enlace === '#' ? '' : (n.enlace || '');

    /* Cargar foto principal existente */
    if (n.hasMainImage) {
      const dataUrl = await getImage(`${n.id}_main`).catch(() => null);
      if (dataUrl) {
        adminImgState.mainExisting = dataUrl;
        showMainImgPreview(dataUrl);
      }
    }

    /* Cargar fotos secundarias existentes */
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

function closeForm() {
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  setTimeout(() => {
    drawer.hidden  = true;
    overlay.hidden = true;
  }, 330);
}

/* ── UI FOTO PRINCIPAL ── */

function showMainImgPreview(dataUrl) {
  document.getElementById('main-empty').style.display    = 'none';
  const preview = document.getElementById('main-preview');
  preview.src   = dataUrl;
  preview.style.display = 'block';
  document.getElementById('main-actions').style.display  = 'flex';
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
  await handleMainFile({ target: { files: [file], value: '' } });
}

async function handleMainFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const btn = document.getElementById('main-upload-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Comprimiendo…'; }

  try {
    const dataUrl = await compressImage(file, 900, 600, 0.72);
    adminImgState.mainNew      = dataUrl;
    adminImgState.mainRemoved  = false;
    showMainImgPreview(dataUrl);
  } catch {
    alert('No se pudo procesar la imagen. Inténtalo con otro archivo.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Cambiar foto'; }
    e.target.value = '';
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
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const addBtn = document.getElementById('sec-add-btn');
  if (addBtn) { addBtn.disabled = true; addBtn.textContent = 'Procesando…'; }

  try {
    for (const file of files) {
      const dataUrl = await compressImage(file, 600, 400, 0.68);
      adminImgState.secImages.push(dataUrl);
    }
    renderSecGrid();
  } catch {
    alert('No se pudo procesar alguna imagen.');
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
    const noticias   = getNoticias();
    const existingId = document.getElementById('f-id').value;
    const id         = existingId || uid();
    const fechaISO   = document.getElementById('f-fecha').value;
    const enlaceRaw  = document.getElementById('f-enlace').value.trim();
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

    /* Actualizar array de noticias */
    const idx = noticias.findIndex(x => x.id === id);
    if (idx >= 0) noticias[idx] = noticia;
    else noticias.push(noticia);
    saveNoticias(noticias);

    /* Guardar / eliminar foto principal en IndexedDB */
    if (adminImgState.mainNew) {
      await saveImage(`${id}_main`, adminImgState.mainNew);
    } else if (adminImgState.mainRemoved) {
      await deleteImage(`${id}_main`);
    }

    /* Reconstruir fotos secundarias: borrar las antiguas y guardar las actuales */
    const prevCount = prevNoticia?.secImagesCount || 0;
    await Promise.all(
      Array.from({ length: prevCount }, (_, i) => deleteImage(`${id}_sec_${i}`))
    );
    await Promise.all(
      adminImgState.secImages.map((dataUrl, i) => saveImage(`${id}_sec_${i}`, dataUrl))
    );

    closeForm();
    setTimeout(renderList, 340);

  } catch (err) {
    console.error(err);
    alert('Ocurrió un error al guardar. Por favor inténtalo de nuevo.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar noticia';
  }
}

/* ── ELIMINAR ── */

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
}

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
  err.hidden = true;

  if (current !== getPin()) {
    err.textContent = 'La contraseña actual no es correcta.';
    err.hidden = false;
    return;
  }
  if (next.length < 4) {
    err.textContent = 'La nueva contraseña debe tener al menos 4 caracteres.';
    err.hidden = false;
    return;
  }
  if (next !== confirm) {
    err.textContent = 'Las contraseñas nuevas no coinciden.';
    err.hidden = false;
    return;
  }

  localStorage.setItem(PIN_KEY, next);
  hideModal('pwd-modal');
  showToast('Contraseña cambiada correctamente');
}

/* ── MODALES ── */

function showModal(id) {
  const m = document.getElementById(id);
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('open'));
}

function hideModal(id) {
  const m = document.getElementById(id);
  m.classList.remove('open');
  setTimeout(() => { m.hidden = true; }, 290);
}

/* ── EXPORTAR / IMPORTAR ── */

function exportJSON() {
  const data = getNoticias();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'noticias.json' });
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  document.getElementById('import-file').click();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error('formato inválido');
      saveNoticias(data);
      renderList();
      showToast(`${data.length} noticias importadas correctamente`);
    } catch {
      alert('Error al importar: el archivo no tiene el formato correcto.');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
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

/* ── TOAST ── */

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast--in'));
  setTimeout(() => {
    t.classList.remove('toast--in');
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

/* ── UTILIDADES ── */

function formatFecha(isoDate) {
  const months = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} de ${months[m - 1]}, ${y}`;
}

function uid() {
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ── INIT ── */

document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPin();
});

if (sessionStorage.getItem(AUTH_KEY) === '1') {
  showPanel();
}
