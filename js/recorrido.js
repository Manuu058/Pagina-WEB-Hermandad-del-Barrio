/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Módulo de Recorrido Procesional — datos y mapa interactivo
   ============================================================ */

const RECORRIDO_KEY = 'hermandad_recorrido';

const RECORRIDO_DEFAULT = {
  dia: 'Miércoles Santo',
  itinerario: 'Dr Fleming · Av Azocarrem · Goya · Pablo Picasso · Av Azocarrem · Cristo de la Reconciliación · Av Cádiz · Alfonso X el Sabio · Montes de Oca · Antonio Sánchez Moguel · Marianistas · Av Cádiz · Dr Fleming · Paseo del Mercado · Palmar · Hoya de Mena · Tahivilla · San Sebastián · San Juan de Dios',
  bandas: [
    { nombre: 'BCT Nazareno Utrera', tipo: 'Banda de CC y TT', escudo: '' },
    { nombre: 'BM Juan Aguilar',     tipo: 'Banda de Música',  escudo: '' },
  ],
  /* Coordenadas reales del casco histórico de Medina Sidonia (Cádiz) */
  puntos: [
    { id: 'rp1', nombre: 'Salida',         hora: '19:00', lugar: 'San Juan de Dios', lat: 36.46462, lng: -5.93085, salida: true  },
    { id: 'rp2', nombre: 'Recta del Tití', hora: '20:30', lugar: 'Av Azocarrem',     lat: 36.46717, lng: -5.93466, salida: false },
    { id: 'rp3', nombre: 'Revirá del 40',  hora: '21:35', lugar: '',                 lat: 36.46449, lng: -5.92987, salida: false },
    { id: 'rp4', nombre: 'Santa Rita',     hora: '22:30', lugar: '',                 lat: 36.46466, lng: -5.93039, salida: false },
    { id: 'rp5', nombre: 'Tahivilla',      hora: '23:00', lugar: '',                 lat: 36.46306, lng: -5.92925, salida: false },
    { id: 'rp6', nombre: 'Encuentro',      hora: '23:30', lugar: 'San Juan de Dios', lat: 36.46478, lng: -5.93065, salida: false },
  ],
};

/* ── DATOS (Firestore, documento único: recorrido/data) ── */

let _recorridoCache = structuredClone(RECORRIDO_DEFAULT);
let _recorridoReady = false;
const _recorridoSubs = [];

function getRecorrido() {
  return _recorridoCache;
}

function onRecorridoChange(cb) {
  _recorridoSubs.push(cb);
  if (_recorridoReady) cb();
}

const _recorridoDocRef = db.collection('recorrido').doc('data');

_recorridoDocRef.onSnapshot(async snap => {
  if (!snap.exists) {
    if (auth.currentUser) {
      try { await _recorridoDocRef.set(RECORRIDO_DEFAULT); } catch (err) { console.error('No se pudo sembrar el recorrido por defecto', err); }
    }
    return;
  }
  const data = snap.data();
  _recorridoCache = data && Array.isArray(data.puntos) ? data : structuredClone(RECORRIDO_DEFAULT);
  _recorridoReady = true;
  _recorridoSubs.forEach(cb => cb());
}, err => console.error('Error escuchando recorrido', err));

function saveRecorridoData(data) {
  return _recorridoDocRef.set(data);
}

/* ── RENDERIZADO PÚBLICO ── */

let recorridoMapInstance = null;

function renderRecorridoPublic() {
  const data = getRecorrido();

  const badgeEl = document.getElementById('rec-badge-text');
  if (badgeEl) badgeEl.textContent = data.dia;

  const itEl = document.querySelector('.rp-itinerario-text');
  if (itEl) itEl.textContent = data.itinerario;

  const bandasEl = document.querySelector('.rp-bandas');
  if (bandasEl) {
    bandasEl.innerHTML = data.bandas.map(b => `
      <div class="rp-banda">
        <div class="rp-banda-icon">${b.escudo ? `<img src="${b.escudo}" alt="Escudo de ${b.nombre}">` : '<i class="fa-solid fa-music"></i>'}</div>
        <div>
          <p class="rp-banda-name">${b.nombre}</p>
          <p class="rp-banda-tipo">${b.tipo}</p>
        </div>
      </div>`).join('');
  }

  renderRecorridoMap(data.puntos);

  const gridEl = document.querySelector('.rec-puntos-grid');
  if (gridEl) {
    gridEl.innerHTML = data.puntos.map((p, i) => `
      <div class="rp-mini" data-punto="${i}" tabindex="0">
        <div class="rp-mini-num">${i + 1}</div>
        <div>
          <p class="rp-mini-title">${p.nombre}</p>
          ${p.lugar ? `<p class="rp-mini-place">${p.lugar}</p>` : ''}
          <p class="rp-time"><i class="fa-regular fa-clock"></i> ${p.hora} h</p>
        </div>
      </div>`).join('');

    gridEl.querySelectorAll('.rp-mini').forEach(card => {
      const goTo = () => focusRecorridoPunto(Number(card.dataset.punto));
      card.addEventListener('click', goTo);
      card.addEventListener('keydown', e => { if (e.key === 'Enter') goTo(); });
    });
  }
}

function renderRecorridoMap(puntos) {
  const el = document.getElementById('recorrido-map');
  if (!el || typeof L === 'undefined') return;

  el.innerHTML = '';
  if (recorridoMapInstance) { recorridoMapInstance.remove(); recorridoMapInstance = null; }

  const center = puntos.reduce((acc, p) => [acc[0] + p.lat / puntos.length, acc[1] + p.lng / puntos.length], [0, 0]);

  const map = L.map(el, {
    center,
    zoom: 16,
    scrollWheelZoom: false,
    zoomControl: false,
    attributionControl: false,
  });
  recorridoMapInstance = map;

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.control.attribution({ position: 'bottomleft', prefix: false })
    .addAttribution('© OpenStreetMap, © CARTO')
    .addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map);

  const latlngs = puntos.map(p => [p.lat, p.lng]);

  const markers = puntos.map((p, i) => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="map-pin${p.salida ? ' map-pin--salida' : ''}"><span class="map-pin-dot"></span></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -14],
    });

    const marker = L.marker([p.lat, p.lng], { icon, riseOnHover: true }).addTo(map);

    const popupHtml = `
      <div class="hs-tt-inner">
        <span class="hs-tt-num">${i + 1}</span>
        <div>
          <p class="hs-tt-nombre">${p.nombre}</p>
          ${p.lugar ? `<p class="hs-tt-lugar">${p.lugar}</p>` : ''}
          <p class="hs-tt-hora">${p.hora} h</p>
        </div>
      </div>`;
    marker.bindPopup(popupHtml, { className: 'hs-popup', closeButton: false, offset: [0, -4] });

    marker.on('mouseover', () => marker.openPopup());
    marker.on('mouseout',  () => marker.closePopup());

    return marker;
  });

  map.fitBounds(L.latLngBounds(latlngs), { padding: [36, 36], maxZoom: 17 });

  recorridoMapInstance._puntosMarkers = markers;

  /* Activa el zoom por rueda solo tras la primera interacción — evita
     atrapar el scroll de la página al pasar el ratón por el mapa */
  const hint = document.getElementById('map-scroll-hint');
  const enableScroll = () => {
    map.scrollWheelZoom.enable();
    if (hint) hint.classList.add('hidden');
  };
  el.addEventListener('click', enableScroll, { once: true });
  if (hint) hint.addEventListener('click', () => { enableScroll(); map.scrollWheelZoom.enable(); }, { once: true });
}

function focusRecorridoPunto(i) {
  const map = recorridoMapInstance;
  if (!map || !map._puntosMarkers || !map._puntosMarkers[i]) return;
  const marker = map._puntosMarkers[i];
  map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 17), { duration: .9 });
  setTimeout(() => marker.openPopup(), 700);
  document.getElementById('recorrido-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* Auto-render en la página principal — reactivo a cambios en Firestore */
if (document.getElementById('recorrido')) onRecorridoChange(renderRecorridoPublic);
