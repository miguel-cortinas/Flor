'use strict';

/* ══════════════════════════════════════════════════════════════
   CONFIG — edita aquí los datos de la invitación
   ══════════════════════════════════════════════════════════════ */
const CONFIG = {
  eventDate:      new Date('2026-09-26T18:00:00'), // Fecha y hora del evento: Sábado 26 de septiembre 6:00 PM
  whatsappNumber: '526145211857',                  // Número con código de país
  whatsappMsg:    'Hola!\nConfirmo mi asistencia al evento de Flor.',
};

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Captura --vh ANTES de cualquier otra init para que CSS ya tenga el valor
  initViewportHeight();

  document.body.classList.add('scroll-locked');

  // Pausar el video en el primer frame para usarlo como fondo estático
  initOpeningVideo();
  initOpeningButton();
  initCountdown();
  initScrollAnimations();
  initRSVP();
  initScrollHint();
  initMusicPlayer();
});

/* ══════════════════════════════════════════════════════════════
   VIEWPORT HEIGHT FIJO — evita que el fondo se agrande/encoja
   cuando la barra URL del navegador móvil aparece/desaparece.

   Capturamos window.innerHeight UNA SOLA VEZ (al cargar la página)
   y lo guardamos como --vh en px.
   El CSS usa calc(var(--vh) * 100) en lugar de 100dvh/100vh.
   Solo actualizamos en orientationchange (rotar el teléfono), nunca
   en scroll ni en resize, así la altura queda completamente congelada.
   ══════════════════════════════════════════════════════════════ */
function initViewportHeight() {
  const setVh = () => {
    // --vh: altura del viewport en la carga inicial (small viewport)
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // --max-vh: altura máxima posible del pantalla (large viewport / max screen height)
    // Garantiza que .global-bg cubra toda la pantalla cuando la barra URL se oculta
    const maxH = Math.max(
      window.innerHeight,
      window.outerHeight || 0,
      (window.screen && window.screen.height) || 0
    );
    const maxVh = maxH * 0.01;
    document.documentElement.style.setProperty('--max-vh', `${maxVh}px`);
  };

  // Captura inicial completamente congelada
  setVh();

  // Solo re-captura al rotar el dispositivo
  window.addEventListener('orientationchange', () => {
    setTimeout(setVh, 400);
  });
}

/* ══════════════════════════════════════════════════════════════
   OPENING VIDEO — doble función:
   1) Fondo estático (primer frame) mientras el opening está visible.
   2) Se reproduce cuando se presiona el botón.
   ══════════════════════════════════════════════════════════════ */
function initOpeningVideo() {
  const video = document.getElementById('opening-video');
  if (!video) return;

  // Cuando los metadatos cargan, saltar al primer frame y pausar
  const freeze = () => {
    video.currentTime = 0;
    video.pause();
  };

  if (video.readyState >= 1) {
    freeze();
  } else {
    video.addEventListener('loadedmetadata', freeze, { once: true });
  }
}

/* ══════════════════════════════════════════════════════════════
   BOTÓN DE APERTURA
   ══════════════════════════════════════════════════════════════ */
function initOpeningButton() {
  const btn = document.getElementById('open-btn');
  if (btn) btn.addEventListener('click', startOpening);
}

function startOpening() {
  const btn     = document.getElementById('open-btn');
  const opening = document.getElementById('opening');
  const video   = document.getElementById('opening-video');

  // Iniciar la música de fondo con efecto atenuante (fade-in)
  fadeInMusic();

  // 1) Deshabilitar el botón para evitar doble click
  if (btn) {
    btn.disabled = true;
    btn.classList.add('exit'); // animación de desaparición neon
  }

  // 2) Reproducir el video
  if (video) {
    video.muted = false; // habilitar audio si existe
    video.play().catch(() => {
      // Si el navegador bloquea audio, reproducir en mute
      video.muted = true;
      video.play();
    });
  }

  // 3) Fade out del texto del opening (no del video)
  const openingContent = opening?.querySelector('.opening-overlay');
  if (openingContent) {
    openingContent.style.transition = 'opacity 0.7s ease';
    openingContent.style.opacity = '0';
    openingContent.style.pointerEvents = 'none';
  }

  // 4) Esperar a que termine el video (o un tiempo máximo de seguridad)
  if (video) {
    let ended = false;

    const onEnd = () => {
      if (ended) return;
      ended = true;
      triggerTransition(opening);
    };

    video.addEventListener('ended', onEnd, { once: true });

    // Seguridad: si el video dura más de 2 min, forzar transición
    const safeguard = setTimeout(() => {
      if (!ended) {
        ended = true;
        video.pause();
        triggerTransition(opening);
      }
    }, 120_000);

    // Limpiar el safeguard si el video termina naturalmente
    video.addEventListener('ended', () => clearTimeout(safeguard), { once: true });
  } else {
    // Sin video: transición directa después del exit del botón
    setTimeout(() => triggerTransition(opening), 600);
  }
}

/* ══════════════════════════════════════════════════════════════
   TRANSICIÓN: Fade Cinematográfico suave a la invitación
   ══════════════════════════════════════════════════════════════ */
function triggerTransition(opening) {
  revealContent();

  if (opening) {
    opening.classList.add('dissolve-out');
    setTimeout(() => {
      opening.style.display = 'none';
    }, 850);
  }
}

function revealContent() {
  document.body.classList.remove('scroll-locked');

  const main = document.getElementById('main-content');
  if (main) {
    main.classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'instant' });
    triggerVisibleCheck();

    // Mostrar la burbuja flotante de música
    document.getElementById('music-toggle-btn')?.classList.add('is-active');

    // 1) Mostrar indicador DESLIZAR para la primera sección (cartel).
    //    Se retrasa 1000ms porque el opening tarda 850ms en el dissolve-out;
    //    si se llama antes, la condición "opening aún visible" lo silencia.
    setTimeout(() => {
      if (typeof window.updateScrollHint === 'function') {
        window.updateScrollHint();
      }
    }, 1000);
    // Safety net para dispositivos lentos
    setTimeout(() => {
      if (typeof window.updateScrollHint === 'function') {
        window.updateScrollHint();
      }
    }, 1400);

    // 2) Lanzar confeti rosa y blanco en la sección inicial (cartel Se Busca)
    setTimeout(() => {
      launchConfetti();
    }, 250);

    // 3) Inicializar animación de la sección mensaje
    initMensajeReveal();
  }
}

/* ══════════════════════════════════════════════════════════════
   CUENTA REGRESIVA
   ══════════════════════════════════════════════════════════════ */
function initCountdown() {
  tick();
  setInterval(tick, 1000);
}

function tick() {
  const diff    = CONFIG.eventDate - new Date();
  const display = document.getElementById('countdown-display');
  const msg     = document.getElementById('countdown-msg');

  if (diff <= 0) {
    display?.classList.add('hidden');
    msg?.classList.remove('hidden');
    return;
  }

  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);

  setDigit('count-days',  d);
  setDigit('count-hours', h);
  setDigit('count-mins',  m);
  setDigit('count-secs',  s);
}

function setDigit(id, val) {
  const el  = document.getElementById(id);
  if (!el) return;
  const str = String(val).padStart(2, '0');
  if (el.textContent !== str) {
    el.textContent = str;
    el.style.color = '#ffffff';
    setTimeout(() => (el.style.color = ''), 220);
  }
}

/* ══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS
   ══════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  // Legacy IntersectionObserver for .animate-in elements
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -55px 0px' });

  document.querySelectorAll('.animate-in').forEach(el => obs.observe(el));

  // Reveal animado para la sección MENSAJE
  initMensajeReveal();
}

function initMensajeReveal() {
  const section = document.getElementById('mensaje');
  if (!section) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = Array.from(section.querySelectorAll('[data-reveal]'));
  if (!revealEls.length) return;

  // ── 1) Preparar divididos si no están listos
  revealEls.forEach(el => {
    if (!el.querySelector('.reveal-word') && !el.querySelector('.reveal-char')) {
      const type = el.dataset.reveal;
      if (type === 'title') prepareSplit(el, 'chars');
      else if (type === 'line' || type === 'gratitude') prepareSplit(el, 'words');
    }
  });

  if (typeof gsap === 'undefined' || prefersReduced) {
    section.classList.add('msg-revealed');
    return;
  }

  // Asegurar estado inicial oculto con GSAP antes de que inicie la secuencia
  revealEls.forEach(el => {
    const chars = el.querySelectorAll('.reveal-char');
    const words = el.querySelectorAll('.reveal-word');
    if (chars.length) gsap.set(chars, { opacity: 0, y: 22, filter: 'blur(6px)' });
    if (words.length) gsap.set(words, { opacity: 0, y: 16, filter: 'blur(6px)' });
    if (el.dataset.reveal === 'divider') gsap.set(el, { opacity: 0, scaleX: 0.1 });
  });

  // IntersectionObserver para disparar el reveal al llegar a la sección
  let fired = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        observer.disconnect();
        playMensajeSequence(revealEls);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  observer.observe(section);
}

/**
 * Divide el texto de `el` en spans inline (palabras o caracteres).
 * CSS ya los oculta con opacity:0 — no se necesita inline style para eso.
 */
function prepareSplit(el, mode) {
  el.setAttribute('aria-label', el.innerText);

  if (mode === 'words') {
    const withMarker = el.innerHTML.replace(/<br\s*\/?>/gi, '⏎');
    el.innerHTML = withMarker.split(/\s+/).filter(Boolean).map(w => {
      if (w.includes('⏎')) {
        return w.split('⏎').map((part, i) =>
          i === 0
            ? `<span class="reveal-word" aria-hidden="true">${part}</span>`
            : `<br><span class="reveal-word" aria-hidden="true">${part}</span>`
        ).join('');
      }
      return `<span class="reveal-word" aria-hidden="true">${w}</span>`;
    }).join(' ');

  } else {
    // chars — CSS ya aplica display:inline-block; no inline style necesario
    el.innerHTML = el.innerText.split('').map(ch =>
      ch === ' '
        ? `<span class="reveal-char" aria-hidden="true"> </span>`
        : `<span class="reveal-char" aria-hidden="true">${ch}</span>`
    ).join('');
  }
}

/**
 * Lanza todas las animaciones en cascada.
 * cursor = tiempo en el que COMIENZA el siguiente elemento
 * (delay del elemento actual + su propia duración).
 */
function playMensajeSequence(els) {
  let cursor = 0;

  els.forEach(el => {
    const type  = el.dataset.reveal;
    const delay = cursor;   // este elemento arranca en `cursor` segundos

    if (type === 'title') {
      const spans = el.querySelectorAll('.reveal-char');
      gsap.to(spans, {
        opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)',
        duration: 0.6, stagger: 0.04, ease: 'expo.out', delay
      });
      cursor = delay + 0.6 + (spans.length * 0.04) + 0.15;

    } else if (type === 'line') {
      const spans = el.querySelectorAll('.reveal-word');
      gsap.to(spans, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.55, stagger: 0.065, ease: 'power3.out', delay
      });
      cursor = delay + 0.55 + (spans.length * 0.065) + 0.1;

    } else if (type === 'divider') {
      gsap.to(el, {
        opacity: 1, scaleX: 1,
        duration: 0.55, ease: 'power2.out',
        transformOrigin: 'center center', delay
      });
      cursor = delay + 0.55 + 0.08;

    } else if (type === 'gratitude') {
      const spans = el.querySelectorAll('.reveal-word');
      gsap.to(spans, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.75, stagger: 0.09, ease: 'expo.out', delay
      });
    }
  });
}





function triggerVisibleCheck() {
  document.querySelectorAll('.animate-in').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.88) el.classList.add('visible');
  });
}


/* ══════════════════════════════════════════════════════════════
   RSVP — WhatsApp + confetti
   ══════════════════════════════════════════════════════════════ */
function initRSVP() {
  const btn = document.getElementById('rsvp-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const msg = CONFIG.whatsappMsg || 'Hola!\nConfirmo mi asistencia al evento de Flor. 🎉';
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}


function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const container = canvas.parentElement || document.getElementById('invitacion');
  const w = canvas.offsetWidth  || container?.offsetWidth  || window.innerWidth;
  const h = canvas.offsetHeight || container?.offsetHeight || window.innerHeight;
  canvas.width  = w;
  canvas.height = h;

  // Paleta Rosa y Blanco (Pink Cowgirl / Festivo)
  const palette = [
    '#d4447a', // Rosa acento principal
    '#e8699a', // Rosa claro
    '#ff80ab', // Rosa vibrante
    '#ffffff', // Blanco puro
    '#fff0f5', // Blanco rosado
    '#f5e6c8', // Crema vintage
    '#d4a84b'  // Dorado artesanal
  ];

  const parts = Array.from({ length: 180 }, () => ({
    x:   Math.random() * w,
    y:   Math.random() * -200 - 10,
    w:   Math.random() * 11 + 5,
    h:   Math.random() * 6  + 4,
    col: palette[Math.floor(Math.random() * palette.length)],
    vx:  (Math.random() - 0.5) * 3.5,
    vy:  Math.random() * 3.5 + 2.2,
    rot: Math.random() * 360,
    rs:  (Math.random() - 0.5) * 7,
    shape: Math.random() > 0.35 ? 'rect' : 'circle'
  }));

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    let alive = false;
    parts.forEach(p => {
      if (p.y < h + 20) alive = true;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.05;
      p.rot += p.rs;

      // Mantener opacidad 100% durante toda la caída sobre el cartel
      // y desvanecer suavemente solo en el último 18% inferior de la sección
      const op = p.y > h * 0.82 ? Math.max(0, (h - p.y) / (h * 0.18)) : 1;

      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.col;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    if (alive) rafId = requestAnimationFrame(draw);
    else { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, w, h); }
  }

  cancelAnimationFrame(rafId);
  draw();
}

/* ══════════════════════════════════════════════════════════════
   INDICADOR DE SCROLL ("DESLIZAR")
   ══════════════════════════════════════════════════════════════ */
function initScrollHint() {
  const hint = document.getElementById('scroll-hint');
  if (!hint) return;

  function updateHintVisibility() {
    const opening = document.getElementById('opening');
    // El opening se considera "aún visible" solo si existe, NO está en dissolve-out
    // y su display no es 'none'. Durante dissolve-out ya no bloquea el hint.
    const openingVisible = opening
      && !opening.classList.contains('dissolve-out')
      && opening.style.display !== 'none';

    if (openingVisible) {
      hint.classList.remove('is-visible');
      return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Mostrar el indicador SOLO en la parte superior (Sección 1 Cartel).
    // Al hacer scroll hacia abajo (> 60px), ocultar para no encimarse con los textos
    if (scrollTop <= 60) {
      hint.classList.add('is-visible');
    } else {
      hint.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', updateHintVisibility, { passive: true });
  window.addEventListener('resize', updateHintVisibility, { passive: true });

  window.updateScrollHint = updateHintVisibility;
}

/* ══════════════════════════════════════════════════════════════
   REPRODUCTOR DE MÚSICA DE FONDO (BGM) CON ATENUACIÓN (FADE IN/OUT)
   ══════════════════════════════════════════════════════════════ */
let bgmAudio = null;
let bgmFadeTimer = null;
const BGM_TARGET_VOL = 0.8;
const BGM_FADE_DURATION = 1200; // 1.2 segundos para atenuación suave

function initMusicPlayer() {
  bgmAudio = new Audio('audio/musica.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0;

  const btn = document.getElementById('music-toggle-btn');
  if (btn) {
    btn.addEventListener('click', toggleMusic);
  }
}

function fadeInMusic() {
  if (!bgmAudio) return;

  if (bgmFadeTimer) clearInterval(bgmFadeTimer);

  if (bgmAudio.paused) {
    bgmAudio.volume = 0;
    bgmAudio.play().catch(err => console.log('Autoplay bloqueado:', err));
  }

  const startTime = Date.now();
  const startVol = bgmAudio.volume;

  bgmFadeTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / BGM_FADE_DURATION);

    bgmAudio.volume = startVol + (BGM_TARGET_VOL - startVol) * progress;

    if (progress >= 1) {
      clearInterval(bgmFadeTimer);
      bgmFadeTimer = null;
    }
  }, 30);

  updateMusicButtonUI(true);
}

function fadeOutMusic(callback) {
  if (!bgmAudio) return;

  if (bgmFadeTimer) clearInterval(bgmFadeTimer);

  const startTime = Date.now();
  const startVol = bgmAudio.volume;

  bgmFadeTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / BGM_FADE_DURATION);

    bgmAudio.volume = Math.max(0, startVol * (1 - progress));

    if (progress >= 1) {
      clearInterval(bgmFadeTimer);
      bgmFadeTimer = null;
      bgmAudio.pause();
      if (typeof callback === 'function') callback();
    }
  }, 30);

  updateMusicButtonUI(false);
}

function toggleMusic() {
  if (!bgmAudio) return;

  if (bgmAudio.paused || (bgmFadeTimer && bgmAudio.volume < 0.2)) {
    fadeInMusic();
  } else {
    fadeOutMusic();
  }
}

function updateMusicButtonUI(isPlaying) {
  const btn = document.getElementById('music-toggle-btn');
  if (!btn) return;

  if (isPlaying) {
    btn.classList.add('is-playing');
    btn.setAttribute('aria-label', 'Pausar música de fondo');
  } else {
    btn.classList.remove('is-playing');
    btn.setAttribute('aria-label', 'Reproducir música de fondo');
  }
}
