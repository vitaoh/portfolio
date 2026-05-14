// EDITMODE persisted defaults
  window.__TWEAKS = /*EDITMODE-BEGIN*/{
    "theme": "noir",
    "density": "normal",
    "intensity": "bold",
    "projectsLayout": "horizontal",
    "cursor": true
  }/*EDITMODE-END*/;

/* ============================================================
   APP
   ============================================================ */
(() => {
  'use strict';

  const T = window.__TWEAKS;
  const body = document.body;

  /* ── apply tweaks to DOM ─────────────────────────────────── */
  const applyTweaks = () => {
    body.setAttribute('data-theme', T.theme);
    body.setAttribute('data-density', T.density);
    body.setAttribute('data-intensity', T.intensity);
    body.setAttribute('data-projects-layout', T.projectsLayout);
    body.classList.toggle('cursor-on', T.cursor === true || T.cursor === 'true');

    document.querySelectorAll('[data-tweak]').forEach(btn => {
      const key = btn.dataset.tweak;
      const val = btn.dataset.value;
      const active = String(T[key]) === val;
      btn.classList.toggle('active', active);
    });
  };

  const setTweak = (key, value) => {
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    T[key] = value;
    applyTweaks();
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
    } catch (e) {}
  };

  applyTweaks();

  /* ── tweaks panel wiring ─────────────────────────────────── */
  const panel = document.getElementById('tweaks');
  const toggle = document.getElementById('tweaksToggle');
  const closeBtn = document.getElementById('tweaksClose');

  document.querySelectorAll('[data-tweak]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTweak(btn.dataset.tweak, btn.dataset.value);
    });
  });

  let editModeOn = false;
  const showPanel = () => { editModeOn = true; panel.classList.add('open'); toggle.classList.remove('visible'); };
  const hidePanel = () => {
    editModeOn = false;
    panel.classList.remove('open');
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
  };

  closeBtn.addEventListener('click', hidePanel);
  toggle.addEventListener('click', showPanel);

  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (!msg || !msg.type) return;
    if (msg.type === '__activate_edit_mode') showPanel();
    if (msg.type === '__deactivate_edit_mode') hidePanel();
  });

  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  /* fallback: keyboard 't' to toggle panel */
  document.addEventListener('keydown', (e) => {
    if (e.key === 't' && !e.target.matches('input,textarea')) {
      editModeOn ? hidePanel() : showPanel();
    }
  });

  /* ── nav scroll state ─────────────────────────────────────── */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = ['about', 'work', 'vision', 'contact'].map(id => document.getElementById(id));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 30);

      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = pct + '%';

      const cur = y + window.innerHeight * 0.3;
      let activeIdx = -1;
      sections.forEach((sec, i) => {
        if (sec && sec.offsetTop <= cur) activeIdx = i;
      });
      navLinks.forEach((l, i) => l.classList.toggle('active', i === activeIdx));

      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── intersection reveals ─────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal, [data-stagger], .skill, .about__bio').forEach(el => io.observe(el));

  /* hero title — fire shortly after load */
  setTimeout(() => {
    document.getElementById('heroTitle').classList.add('in');
  }, 220);

  /* number counter animation for hero stats */
  const animateCount = (el, target) => {
    const dur = 1400;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('.hero__side__stat__num').forEach(el => {
    const raw = el.textContent.trim();
    const num = parseInt(raw, 10);
    const suffix = raw.replace(/[0-9]/g, '');
    el.dataset.suffix = suffix;
    el.textContent = '0' + suffix;
    setTimeout(() => animateCount(el, num), 800);
  });

  /* magnetic effect on buttons */
  document.querySelectorAll('.nav__cta, .form__submit, .projects__nav-btn').forEach(el => {
    el.classList.add('magnetic');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      const k = T.intensity === 'subtle' ? 0.08 : T.intensity === 'bold' ? 0.25 : 0.15;
      el.style.transform = `translate(${x * k}px, ${y * k}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* 3D tilt on project cards */
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      if (T.intensity === 'subtle') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const k = T.intensity === 'bold' ? 8 : 4;
      card.style.transform = `perspective(1000px) rotateY(${x * k}deg) rotateX(${-y * k}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ── projects horizontal scroll buttons ───────────────────── */
  const strip = document.getElementById('prjStrip');
  const prjPrev = document.getElementById('prj-prev');
  const prjNext = document.getElementById('prj-next');

  const scrollByCard = (dir) => {
    const card = strip.querySelector('.project');
    if (!card) return;
    const gap = 28;
    const dist = card.offsetWidth + gap;
    strip.scrollBy({ left: dir * dist, behavior: 'smooth' });
  };
  prjPrev.addEventListener('click', () => scrollByCard(-1));
  prjNext.addEventListener('click', () => scrollByCard(1));

  /* keyboard nav for projects when section is in view */
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input,textarea')) return;
    const work = document.getElementById('work');
    const rect = work.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (T.projectsLayout !== 'horizontal') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByCard(-1); }
  });

  /* drag to scroll on the strip */
  let isDown = false, startX = 0, scrollLeft = 0;
  strip.addEventListener('pointerdown', (e) => {
    if (T.projectsLayout !== 'horizontal') return;
    if (e.target.closest('a, button')) return;
    isDown = true;
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
    strip.setPointerCapture(e.pointerId);
    strip.style.cursor = 'grabbing';
  });
  strip.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - strip.offsetLeft;
    strip.scrollLeft = scrollLeft - (x - startX) * 1.4;
  });
  const endDrag = () => { isDown = false; strip.style.cursor = ''; };
  strip.addEventListener('pointerup', endDrag);
  strip.addEventListener('pointerleave', endDrag);
  strip.addEventListener('pointercancel', endDrag);

  /* ── smooth anchor scroll ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' });
    });
  });

  /* ── custom cursor ────────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
  const followCursor = () => {
    cx += (tx - cx) * 0.22;
    cy += (ty - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(followCursor);
  };
  followCursor();
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const isHover = t.closest('a, button, [data-cursor="hover"]');
    const isText = t.matches('input, textarea');
    cursor.classList.toggle('cursor--hover', !!isHover && !isText);
    cursor.classList.toggle('cursor--text', !!isText);
  });

  /* ── form ─────────────────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.name || !data.email || !data.subject || !data.message) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    const subject = encodeURIComponent(data.subject);
    const body = encodeURIComponent(
      `Olá Victor!\n\nNome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}\n\n--\nVia portfolio`
    );
    window.location.href = `mailto:herculinvictorr@gmail.com?subject=${subject}&body=${body}`;
  });

  /* ── parallax for vision pillars ──────────────────────────── */
  const visionPillars = document.querySelectorAll('.pillar');
  window.addEventListener('scroll', () => {
    if (T.intensity === 'subtle') return;
    visionPillars.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      const center = (r.top + r.bottom) / 2 - window.innerHeight / 2;
      const k = T.intensity === 'bold' ? 0.04 : 0.02;
      p.style.transform = `translateY(${center * k * (i - 1)}px)`;
    });
  }, { passive: true });

  /* show fallback toggle after 1.5s if host hasn't activated edit mode */
  setTimeout(() => {
    if (!editModeOn && !document.referrer.includes('omnimode')) {
      toggle.classList.add('visible');
    }
  }, 1500);

})();
