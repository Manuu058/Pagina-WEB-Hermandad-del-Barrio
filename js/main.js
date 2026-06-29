/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   JavaScript principal
   ============================================================ */

/* === NAVBAR SCROLL === */
const navbar = document.querySelector('.navbar');
const scrollThreshold = 60;

window.addEventListener('scroll', () => {
  navbar.classList.toggle('solid', window.scrollY > scrollThreshold);
  updateActiveNav();
}, { passive: true });

/* === ACTIVE NAV LINK === */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';

  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= 120) current = section.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

/* === MOBILE MENU === */
const hamburger = document.querySelector('.hamburger');
const mobileNav  = document.querySelector('.mobile-nav');

hamburger?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* === COUNTDOWN TIMER === */
// Miércoles Santo 2027
const TARGET_DATE = new Date('2027-04-21T20:00:00');

function zeroPad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now  = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    document.querySelectorAll('.cd-number').forEach(el => el.textContent = '00');
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  const el = (id) => document.getElementById(id);
  if (el('cd-days'))    el('cd-days').textContent    = zeroPad(days);
  if (el('cd-hours'))   el('cd-hours').textContent   = zeroPad(hours);
  if (el('cd-minutes')) el('cd-minutes').textContent = zeroPad(minutes);
  if (el('cd-seconds')) el('cd-seconds').textContent = zeroPad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* === PARTICLES === */
function spawnParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `width: ${Math.random() * 3 + 1}px`,
      `height: ${Math.random() * 3 + 1}px`,
      `animation-duration: ${Math.random() * 12 + 10}s`,
      `animation-delay: ${Math.random() * 12}s`,
    ].join(';');
    container.appendChild(p);
  }
}

spawnParticles();

/* === SCROLL REVEAL === */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal, .tl-item').forEach(el => {
    revealObserver.observe(el);
  });
}

/* Staggered reveal for grids */
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const children = entry.target.querySelectorAll('.reveal');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 90);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.noticias-grid, .titulares-grid, .pat-grid, .ig-grid').forEach(grid => {
  staggerObserver.observe(grid);
});

initReveal();

/* === PASO INTERACTIVO === */
const hotspotsData = {
  1:  { num: '05', title: 'Canastilla',      text: 'Cuerpo principal del paso. Estructura de madera tallada y dorada que conforma el escenario procesional. En la Hermandad, destaca por sus frisos y cartelas de excelente factura artesanal.' },
  2:  { num: '02', title: 'Candelabros',     text: 'Los cuatro grandes ciriales de esquina y los candelabros menores conforman el techo de luz del paso. Realizados en plata o metal plateado, crean un halo luminoso sobre los titulares.' },
  3:  { num: '03', title: 'Exorno Floral',   text: 'Composición floral que viste la canastilla. En la salida extraordinaria del 50 Aniversario se sustituyó el monte habitual por una composición especial con frisos en la canastilla y flores de temporada.' },
  4:  { num: '01', title: 'Imagen Titular',  text: 'El Santísimo Cristo de la Reconciliación y Paz preside el paso de misterio. Imagen de gran devoción en el Barrio, con una iconografía de profunda expresión y serenidad.' },
  5:  { num: '06', title: 'Respiraderos',    text: 'Aberturas laterales del paso que permiten la ventilación de los portadores (costaleros). Los respiraderos de nuestra Hermandad presentan decoración en orfebrería de gran valor artístico.' },
  6:  { num: '08', title: 'Faldones',        text: 'Telas bordadas que cubren el lateral y frontal del paso. Elaborados en terciopelo con bordados en oro fino, son uno de los elementos más representativos del ajuar procesional.' },
  7:  { num: '04', title: 'Estatuas',        text: 'Figuras escultóricas que custodian el paso, dispuestas en las esquinas de la canastilla. Su presencia solemne enmarca la imagen del Santísimo Cristo y realza la majestuosidad del conjunto procesional.' },
  8:  { num: '07', title: 'Llamador',        text: 'Pieza de orfebrería situada en la parte delantera inferior del paso. El capataz golpea el llamador para dar las señales de mando a los costaleros: levantad, parad, arranquemos.' },
  9:  { num: '09', title: 'Banda',           text: 'El paso del Santísimo Cristo es acompañado musicalmente por la Banda del Nazareno de Utrera, cuyas marchas procesionales llenan de solemnidad y emoción cada momento del recorrido.' },
  10: { title: 'Cuadrilla',       text: 'Los costaleros son el alma del paso. Portadores que cargan la imagen bajo la canastilla, guiados únicamente por la voz y el llamador del capataz. Un trabajo de entrega y fe.' },
  11: { title: 'Capataz',         text: 'Figura fundamental que dirige la cuadrilla de costaleros. Con su caña y su voz, coordina cada movimiento del paso, desde el levantamiento hasta las paradas en los puntos más emotivos del recorrido.' },
  17: { num: '07', title: 'Varales',    text: 'Los varales son las barras metálicas que sostienen el palio de la Virgen. Cada varal es una donación de distintas familias de la Hermandad, convirtiéndose en uno de los elementos más emotivos del paso, símbolo de la devoción y generosidad de sus hermanos.' },
  12: { num: '02', title: 'Candelería', text: 'La candelería del paso de palio ilumina y enmarca a la Virgen durante la procesión. Compuesta por candelabros de diferente altura dispuestos en la peana, su luz cálida crea el ambiente de recogimiento y devoción que caracteriza el paso de Nuestra Señora.' },
  13: { title: 'Techo de Palio',  text: 'El techo del palio es la parte superior bordada que cubre a la Virgen a modo de dosel. Realizado en terciopelo con bordados en hilo de oro, recoge motivos florales y religiosos de gran belleza. Es uno de los elementos de mayor valor artístico y devocional del ajuar de Nuestra Señora de los Dolores.' },
  14: { title: 'Corona',          text: 'La corona de Nuestra Señora de los Dolores es una de las piezas de orfebrería más valiosas del ajuar de la Hermandad. Elaborada en metal dorado con pedrería, corona a la Virgen en sus salidas procesionales como símbolo de su reinado espiritual sobre el Barrio.' },
  15: { title: 'Manto',           text: 'El manto procesional es la prenda bordada que cae desde los hombros de la Virgen hasta cubrir la peana del paso. Realizado en terciopelo con bordados en hilo de oro de gran finura, es uno de los elementos más suntuosos del ajuar de Nuestra Señora de los Dolores.' },
  16: { title: 'Nuestra Señora',  text: 'Nuestra Señora de los Dolores preside el segundo paso de la Hermandad del Barrio. Imagen de vestir de gran belleza y profunda expresión dolorosa, es el centro de la devoción mariana de la Hermandad desde su fundación en 1975. Sale procesionalmente cada Miércoles Santo acompañada por la Banda Juan Aguilar de El Bosque.' },
};

const hotspots    = document.querySelectorAll('.hotspot');
const pasoDefault = document.querySelector('.paso-default');
let pasoTimer     = null;

hotspots.forEach(hs => {
  hs.addEventListener('click', () => {
    const id   = parseInt(hs.dataset.id);
    const data = hotspotsData[id];
    if (!data) return;

    const wasActive = hs.classList.contains('active');

    clearTimeout(pasoTimer);
    hotspots.forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.paso-content').forEach(c => c.classList.remove('active'));

    if (wasActive) {
      if (pasoDefault) pasoDefault.style.display = '';
      return;
    }

    pasoTimer = setTimeout(() => {
      hs.classList.add('active');
      if (pasoDefault) pasoDefault.style.display = 'none';

      let content = document.getElementById('pc-' + id);
      if (!content) {
        content = document.createElement('div');
        content.className = 'paso-content';
        content.id = 'pc-' + id;
        content.innerHTML = `
          <div class="pc-num">${data.num || String(id).padStart(2,'0')}</div>
          <h3 class="pc-title">${data.title}</h3>
          <div class="pc-rule"></div>
          <p class="pc-text">${data.text}</p>
        `;
        document.querySelector('.paso-panel').appendChild(content);
      }
      content.classList.add('active');
    }, 200);
  });
});

/* === PATRIMONIO FILTERS === */
const patFilters = document.querySelectorAll('.pat-filter');
const enserCards = document.querySelectorAll('.enser-card');

patFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    patFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    enserCards.forEach(card => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.style.display = show ? 'block' : 'none';
      if (show) {
        card.style.animation = 'fadeIn .35s ease';
      }
    });
  });
});

/* === MINI CALENDAR === */
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const agendaEvents = (typeof getAgendaEventsMap === 'function') ? getAgendaEventsMap() : {};

let calMonth = new Date().getMonth();
let calYear  = new Date().getFullYear();

function renderMiniCal() {
  const title = document.querySelector('.mc-title');
  const grid  = document.querySelector('.mc-grid');
  if (!title || !grid) return;

  title.textContent = `${MONTHS_ES[calMonth]} ${calYear}`;

  grid.querySelectorAll('.mc-d').forEach(el => el.remove());

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date();

  for (let i = 0; i < offset; i++) {
    const cell = document.createElement('div');
    cell.className = 'mc-d empty';
    grid.appendChild(cell);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell    = document.createElement('div');
    const dateKey = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    cell.className = 'mc-d';
    cell.textContent = d;

    if (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) {
      cell.classList.add('today');
    }
    if (agendaEvents[dateKey]) {
      cell.classList.add('has-ev');
      cell.title = agendaEvents[dateKey];
    }

    grid.appendChild(cell);
  }
}

document.querySelector('.mc-prev')?.addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderMiniCal();
});

document.querySelector('.mc-next')?.addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderMiniCal();
});

renderMiniCal();

/* === VELA VIRTUAL === */
let velasEncendidas = parseInt(localStorage.getItem('velas') || '0');

document.querySelectorAll('.vela-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    velasEncendidas++;
    localStorage.setItem('velas', velasEncendidas);
    btn.innerHTML = `<span class="vela-flame">🕯️</span> Vela encendida · ${velasEncendidas} velas`;
    btn.classList.add('lit');
    btn.disabled = true;

    // Small particle burst
    const rect = btn.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => createSparkle(rect.left + rect.width/2, rect.top), i * 60);
    }
  });
});

function createSparkle(x, y) {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 6px;
    height: 6px;
    background: #9B4DCC;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    animation: sparkle .8s ease-out forwards;
  `;
  document.body.appendChild(el);
  const angle = Math.random() * Math.PI * 2;
  const dist  = Math.random() * 60 + 20;
  el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
  el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
  setTimeout(() => el.remove(), 900);
}

/* Add sparkle animation */
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
  @keyframes sparkle {
    from { opacity: 1; transform: translate(0, 0) scale(1); }
    to   { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
  }
`;
document.head.appendChild(sparkleStyle);

/* === MODAL === */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

window.openModal  = openModal;
window.closeModal = closeModal;

/* === FORM SUBMISSION (demo) === */
document.querySelectorAll('form.js-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.textContent = '¡Enviado! Gracias.';
    btn.disabled = true;
    btn.style.background = 'rgba(155,77,204,.2)';
    setTimeout(() => {
      btn.textContent = 'Enviar';
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 3500);
  });
});

/* === SMOOTH SECTION TRANSITIONS === */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id  = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* === EMBLEM PARALLAX === */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-content');
  if (!hero) return;
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.25}px)`;
  }
}, { passive: true });

/* === INSTAGRAM EMBED NOTE (placeholder logic) === */
/* Cuando la cuenta de Instagram esté disponible, reemplazar
   los placeholders .ig-thumb con el widget embed oficial de Instagram
   o usar una librería como 'EmbedFeed' para el muro automático. */

console.log('%c✝ Hermandad del Barrio | Medina Sidonia ✝', 'color:#9B4DCC;font-size:14px;font-family:Georgia,serif');
console.log('%c Fe, barrio y devoción desde 1975.', 'color:#8A7A6A;font-style:italic;');

/* === MODALES TITULARES === */
function openTitularModal(id) {
  const overlay = document.getElementById('tit-modal-' + id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.tit-modal-close')?.focus();
}

function closeTitularModal(overlay) {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.titular-card').forEach(card => {
  card.addEventListener('click', () => {
    const id = card.dataset.titular;
    if (id) openTitularModal(id);
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = card.dataset.titular;
      if (id) openTitularModal(id);
    }
  });
});

document.querySelectorAll('.tit-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeTitularModal(overlay);
  });
  overlay.querySelector('.tit-modal-close')?.addEventListener('click', () => {
    closeTitularModal(overlay);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.tit-modal-overlay.open').forEach(closeTitularModal);
  }
});
