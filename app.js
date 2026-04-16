'use strict';

/* =============================================================
   VICTOR HERCULINI — Portfolio · app.js
   ============================================================= */

class Portfolio {
  constructor() {
    this.navbar      = document.getElementById('navbar');
    this.navToggle   = document.getElementById('nav-toggle');
    this.navMenu     = document.getElementById('nav-menu');
    this.navLinks    = document.querySelectorAll('.nav-link');
    this.contactForm = document.getElementById('contact-form');
    this.isMenuOpen  = false;
    this.skillsAnimated = false;

    this.init();
  }

  /* ── INIT ──────────────────────────────────────────────────── */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAll());
    } else {
      this.setupAll();
    }
  }

  setupAll() {
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupFadeObserver();
    this.setupSkillsAnimation();
    this.setupCarousel();
    this.setupImageCarousels();
    this.setupContactForm();
    this.setupSmoothScrolling();
    this.setupTypingAnimation();
  }

  /* ── NAVEGAÇÃO ─────────────────────────────────────────────── */
  setupNavigation() {
    if (!this.navToggle || !this.navMenu) return;

    this.navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isMenuOpen = !this.isMenuOpen;
      this.navMenu.classList.toggle('active', this.isMenuOpen);
      this.navToggle.classList.toggle('active', this.isMenuOpen);
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    });

    this.navLinks.forEach(link => link.addEventListener('click', () => this.closeMenu()));

    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.navbar.contains(e.target)) this.closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) this.closeMenu();
    });
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ── EFEITOS DE SCROLL ─────────────────────────────────────── */
  setupScrollEffects() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.navbar.classList.toggle('scrolled', window.scrollY > 50);
          this.updateActiveNavLink();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  updateActiveNavLink() {
    const scrollPos = window.scrollY + 100;
    let activeId = null;

    document.querySelectorAll('section[id]').forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        activeId = sec.id;
      }
    });

    this.navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  /* ── OBSERVER FADE-IN ──────────────────────────────────────── */
  setupFadeObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('skills-section')) this.animateSkills();
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  /* ── ANIMAÇÃO DAS HABILIDADES ──────────────────────────────── */
  setupSkillsAnimation() { this.skillsAnimated = false; }

  animateSkills() {
    if (this.skillsAnimated) return;
    this.skillsAnimated = true;
    document.querySelectorAll('.skill-progress').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = `${bar.getAttribute('data-width')}%`;
      }, i * 180);
    });
  }

  /* ── CARROSSEL PRINCIPAL (slides de projeto) ───────────────── */
  setupCarousel() {
    const track     = document.getElementById('carousel-track');
    const slides    = document.querySelectorAll('.carousel-slide');
    const prevBtn   = document.getElementById('carousel-prev');
    const nextBtn   = document.getElementById('carousel-next');
    const viewport  = document.getElementById('carousel-viewport');
    const currentEl = document.getElementById('carousel-current');
    const totalEl   = document.getElementById('carousel-total');

    if (!track || !slides.length) return;

    const total = slides.length;
    let current = 0;
    let touchStartX = 0;

    // Autoplay: avança a cada 6 segundos
    const AUTOPLAY_DELAY = 6000;
    let autoTimer = null;

    const startAutoplay = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), AUTOPLAY_DELAY);
    };
    const stopAutoplay = () => clearInterval(autoTimer);

    if (totalEl) totalEl.textContent = total;

    const goTo = (index) => {
      current = ((index % total) + total) % total;

      // Move o track via translateX
      track.style.transform = `translateX(-${current * 100}%)`;

      // Atualiza dots principais
      document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', String(active));
      });

      // aria-hidden nos slides
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== current));
      });

      if (currentEl) currentEl.textContent = current + 1;
    };

    // Botões de seta
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

    // Dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
    });

    // Pausa o autoplay ao hover
    if (viewport) {
      viewport.addEventListener('mouseenter', stopAutoplay);
      viewport.addEventListener('mouseleave', startAutoplay);
    }

    // Navegação por teclado (←/→) quando seção visível
    document.addEventListener('keydown', (e) => {
      const section = document.getElementById('projects');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); startAutoplay(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); startAutoplay(); }
    });

    // Swipe tátil
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? goTo(current + 1) : goTo(current - 1);
          startAutoplay();
        }
      }, { passive: true });
    }

    goTo(0);
    startAutoplay();
  }

  /* ── MINI CARROSSEIS DE IMAGEM ─────────────────────────────── */
  setupImageCarousels() {
    document.querySelectorAll('[data-img-carousel]').forEach(carousel => {
      const track    = carousel.querySelector('.img-carousel-track');
      const slides   = carousel.querySelectorAll('.img-carousel-slide');
      const prevBtn  = carousel.querySelector('.img-carousel-prev');
      const nextBtn  = carousel.querySelector('.img-carousel-next');
      const dotsWrap = carousel.querySelector('.img-dots');
      const images   = carousel.querySelectorAll('img');

      if (!track || !slides.length) return;

      const total = slides.length;
      let current = 0;
      let startX  = 0;
      let loadedCount = 0;
      let imgTimer = null;

      // Gera dots dinamicamente
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < total; i++) {
          const dot = document.createElement('button');
          dot.className = 'img-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', `Imagem ${i + 1}`);
          dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); restartAuto(); });
          dotsWrap.appendChild(dot);
        }
      }

      const goTo = (index) => {
        current = ((index % total) + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        carousel.querySelectorAll('.img-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === current);
          dot.setAttribute('aria-selected', String(i === current));
        });
      };

      // Autoplay interno: troca imagem a cada 3.5 s
      const IMG_DELAY = 3500;
      const startAuto   = () => { clearInterval(imgTimer); imgTimer = setInterval(() => goTo(current + 1), IMG_DELAY); };
      const stopAuto    = () => clearInterval(imgTimer);
      const restartAuto = () => startAuto();

      // Pausa ao hover
      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);

      // Botões prev/next
      if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(current - 1); restartAuto(); });
      if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(current + 1); restartAuto(); });

      // Swipe
      carousel.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
      carousel.addEventListener('touchend', (e) => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { diff > 0 ? goTo(current + 1) : goTo(current - 1); restartAuto(); }
      }, { passive: true });

      // Detecta imagens carregadas — revela carrossel sobre mockup
      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === 1) {
          // Primeira imagem OK → mostra carrossel
          carousel.classList.add('has-images');
          startAuto();
        }
      };

      images.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          onImageLoad();
        } else {
          img.addEventListener('load', onImageLoad, { once: true });
          // Se falhar, não conta → mockup permanece visível
        }
      });

      goTo(0);
    });
  }

  /* ── SCROLL SUAVE ──────────────────────────────────────────── */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
          this.closeMenu();
        }
      });
    });
  }

  /* ── EFEITO DE DIGITAÇÃO ───────────────────────────────────── */
  setupTypingAnimation() {
    const el = document.querySelector('.typing-text');
    if (!el) return;

    const text = el.textContent;
    el.textContent = '';

    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        setTimeout(type, 95);
      } else {
        setTimeout(() => { el.style.borderRight = 'none'; }, 1200);
      }
    };

    setTimeout(type, 1200);
  }

  /* ── FORMULÁRIO DE CONTATO ─────────────────────────────────── */
  setupContactForm() {
    if (!this.contactForm) return;

    this.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(this.contactForm));
      if (this.validateForm(data)) this.submitForm(data);
    });

    this.contactForm.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        input.classList.remove('error');
        this.removeFieldError(input);
      });
    });
  }

  validateForm(data) {
    let ok = true;
    this.clearFormErrors();

    if (!data.name || data.name.trim().length < 2) {
      this.showFieldError('name', 'Nome deve ter pelo menos 2 caracteres');
      ok = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      this.showFieldError('email', 'Por favor, insira um email válido');
      ok = false;
    }
    if (!data.subject || data.subject.trim().length < 3) {
      this.showFieldError('subject', 'Assunto deve ter pelo menos 3 caracteres');
      ok = false;
    }
    if (!data.message || data.message.trim().length < 10) {
      this.showFieldError('message', 'Mensagem deve ter pelo menos 10 caracteres');
      ok = false;
    }
    return ok;
  }

  validateField(field) {
    const val = field.value.trim();
    const checks = {
      name:    () => val.length < 2  && 'Nome deve ter pelo menos 2 caracteres',
      email:   () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && 'Por favor, insira um email válido',
      subject: () => val.length < 3  && 'Assunto deve ter pelo menos 3 caracteres',
      message: () => val.length < 10 && 'Mensagem deve ter pelo menos 10 caracteres',
    };
    const check = checks[field.name];
    const msg = check && check();
    if (msg) { this.showFieldError(field.name, msg); return false; }
    this.removeFieldError(field);
    return true;
  }

  showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    field.classList.add('error');
    const group = field.closest('.form-group');
    group.querySelector('.error-message')?.remove();
    const span = document.createElement('span');
    span.className = 'error-message';
    span.textContent = message;
    group.appendChild(span);
  }

  removeFieldError(field) {
    field.closest('.form-group')?.querySelector('.error-message')?.remove();
    field.classList.remove('error');
  }

  clearFormErrors() {
    this.contactForm.querySelectorAll('.error-message').forEach(e => e.remove());
    this.contactForm.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
  }

  async submitForm(data) {
    const btn  = this.contactForm.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;

    btn.textContent = 'Enviando…';
    btn.disabled = true;

    try {
      this.showFormMessage('✅ Formulário validado! Redirecionando para seu cliente de email…', 'success');
      await new Promise(r => setTimeout(r, 1000));

      const subject = encodeURIComponent(data.subject);
      const body    = encodeURIComponent(
        `Olá Victor!\n\nNome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}\n\n---\nEnviado pelo portfólio`
      );
      window.location.href = `mailto:herculinvictorr@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        this.contactForm.reset();
        this.showFormMessage('📧 Cliente de email aberto! Caso não abra, envie para: herculinvictorr@gmail.com', 'success');
      }, 2000);

    } catch (err) {
      this.showFormMessage('❌ Erro ao processar. Contato direto: herculinvictorr@gmail.com', 'error');
    } finally {
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2000);
    }
  }

  showFormMessage(message, type) {
    this.contactForm.querySelector('.form-message')?.remove();
    const div = document.createElement('div');
    div.className = `form-message form-message--${type}`;
    div.textContent = message;
    this.contactForm.insertBefore(div, this.contactForm.firstChild);
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const delay = type === 'success' ? 8000 : 10000;
    setTimeout(() => {
      div.style.opacity = '0';
      div.style.transform = 'translateY(-8px)';
      div.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => div.remove(), 320);
    }, delay);
  }
}

/* ── INICIALIZAÇÃO ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => new Portfolio());

/* Fecha o menu ao redimensionar para desktop */
window.addEventListener('resize', (() => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.innerWidth > 768) {
        document.getElementById('nav-menu')?.classList.remove('active');
        document.getElementById('nav-toggle')?.classList.remove('active');
        document.body.style.overflow = '';
      }
    }, 250);
  };
})());

/* Pausa animações quando a aba fica oculta */
document.addEventListener('visibilitychange', () => {
  const state = document.hidden ? 'paused' : 'running';
  document.querySelectorAll('[style*="animation"]').forEach(el => {
    el.style.animationPlayState = state;
  });
});