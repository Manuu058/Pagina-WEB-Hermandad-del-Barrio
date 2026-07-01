/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Módulo de Vela Virtual — configuración (Firestore, doc único)
   ============================================================ */

const VELA_CONFIG_DEFAULT = {
  enabled:   true,
  base:      1183,
  frase:     '"Enciende una vela virtual por los Titulares del Barrio"',
  subtitulo: 'Por el Santísimo Cristo de la Reconciliación y Paz\ny Nuestra Señora de los Dolores',
};

/* ── CONFIG (Firestore velas/config) ── */

let _velaConfigCache = { ...VELA_CONFIG_DEFAULT };
let _velaConfigReady = false;
const _velaConfigSubs = [];

function getVelaConfig() {
  return _velaConfigCache;
}

function onVelaConfigChange(cb) {
  _velaConfigSubs.push(cb);
  if (_velaConfigReady) cb();
}

const _velaConfigRef = db.collection('velas').doc('config');

_velaConfigRef.onSnapshot(async snap => {
  if (!snap.exists) {
    try { await _velaConfigRef.set(VELA_CONFIG_DEFAULT); } catch (err) { console.error('No se pudo sembrar la config de la vela', err); }
    return;
  }
  _velaConfigCache = { ...VELA_CONFIG_DEFAULT, ...snap.data() };
  _velaConfigReady = true;
  _velaConfigSubs.forEach(cb => cb());
}, err => console.error('Error escuchando config de la vela', err));

function saveVelaConfig(cfg) {
  return _velaConfigRef.set(cfg);
}

/* ── CONTADOR COMPARTIDO (Firestore velas/counter) ── */

const _velaCounterRef = db.collection('velas').doc('counter');

let _velaCounterDelta = 0;

_velaCounterRef.onSnapshot(async snap => {
  if (!snap.exists) {
    try { await _velaCounterRef.set({ delta: 0 }); } catch (err) { console.error('No se pudo crear el contador de velas', err); }
    return;
  }
  _velaCounterDelta = snap.data().delta || 0;
  /* Notifica al modal si está abierto para actualizar el total en tiempo real */
  if (typeof _onVelaCounterUpdate === 'function') _onVelaCounterUpdate(_velaCounterDelta);
}, err => console.error('Error escuchando contador de velas', err));

function getVelaCounterDelta() {
  return _velaCounterDelta;
}

function incrementVelaCounter() {
  return _velaCounterRef.update({
    delta: firebase.firestore.FieldValue.increment(1),
  });
}
