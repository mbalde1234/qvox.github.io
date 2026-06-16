/* ═══════════════════════════════════════════════════
  Qvox — Ultra-Premium Interactions
   Particles, 3D tilt, parallax, magnetic btns,
   morphing glows, typing fx, stagger reveals
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════
  //  0 · HELPER UTILITIES
  // ══════════════════════════════════════════════════
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (a, b) => Math.random() * (b - a) + a;
  const isMobile = () => window.innerWidth < 768;

  // ══════════════════════════════════════════════════
  //  1 · PARTICLE CANVAS (Hero Background)
  // ══════════════════════════════════════════════════
  const heroSection = document.querySelector('.hero');
  if (heroSection && !isMobile()) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.6';
    heroSection.style.position = 'relative';
    heroSection.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = rand(0, W);
        this.y = rand(0, H);
        this.r = rand(1, 3);
        this.vx = rand(-0.3, 0.3);
        this.vy = rand(-0.2, -0.8);
        this.alpha = rand(0.1, 0.5);
        this.color = ['#AEEA00', '#7C3AED', '#06B6D4', '#FF6B35'][Math.floor(rand(0, 4))];
        this.life = rand(60, 200);
        this.maxLife = this.life;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = (this.life / this.maxLife) * 0.5;
        if (this.life <= 0 || this.y < -10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    // Connection lines between nearby particles
    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(174,234,0,' + (1 - dist / 120) * 0.08 + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ══════════════════════════════════════════════════
  //  2 · STAGGERED SCROLL REVEAL (enhanced)
  // ══════════════════════════════════════════════════
  const revealElements = document.querySelectorAll('.reveal');
  let revealIndex = 0;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.querySelectorAll('.reveal:not(.visible)')) : [];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.max(0, idx) * 100;
          setTimeout(() => {
            entry.target.classList.add('visible');
            entry.target.style.transitionDelay = '0s'; // Reset after animation
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // ══════════════════════════════════════════════════
  //  3 · PARALLAX on Scroll
  // ══════════════════════════════════════════════════
  const parallaxEls = document.querySelectorAll('.hero__bg-glow, .hero__phone, .chefpilot::before');
  const glowEl = document.querySelector('.hero__bg-glow');
  const phoneEl = document.querySelector('.hero__phone');

  function onScroll() {
    const y = window.scrollY;
    // Header
    header.classList.toggle('scrolled', y > 60);

    // Parallax for hero glow
    if (glowEl) {
      glowEl.style.transform = `scale(${1 + y * 0.0002}) translateY(${y * 0.15}px)`;
    }
    // Phone subtle parallax
    if (phoneEl && !isMobile()) {
      phoneEl.style.transform = `translateY(${Math.sin(Date.now() / 1000) * 14 + y * -0.04}px)`;
    }
  }

  // ══════════════════════════════════════════════════
  //  4 · 3D TILT on Feature Cards
  // ══════════════════════════════════════════════════
  if (!isMobile()) {
    document.querySelectorAll('.feature-card, .price-card, .cp-feature').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const mx = e.clientX - cx;
        const my = e.clientY - cy;
        const rotX = clamp(-(my / rect.height) * 12, -12, 12);
        const rotY = clamp((mx / rect.width) * 12, -12, 12);
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.boxShadow = `${-rotY * 2}px ${rotX * 2}px 40px rgba(174,234,0,0.08), 0 12px 40px rgba(0,0,0,.3)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  5 · MAGNETIC BUTTONS
  // ══════════════════════════════════════════════════
  if (!isMobile()) {
    document.querySelectorAll('.btn--primary, .btn--lg').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.2 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  6 · HEADER with scroll
  // ══════════════════════════════════════════════════
  const header = document.querySelector('.header');
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mobile Nav Toggle ──
  const burger = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  function openNav() {
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-top', `-${scrollY}px`);
    document.body.classList.add('nav-open');
    nav.classList.add('open');
    burger.classList.add('active');
    burger.setAttribute('aria-label', 'Menü schliessen');
  }

  function closeNav() {
    nav.classList.remove('open');
    burger.classList.remove('active');
    burger.setAttribute('aria-label', 'Menü öffnen');
    const scrollY = document.documentElement.style.getPropertyValue('--scroll-top');
    document.body.classList.remove('nav-open');
    document.documentElement.style.removeProperty('--scroll-top');
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }

  if (burger && nav) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on link click
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          closeNav();
        }
      })
    );

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeNav();
      }
    });

    // Close on outside click
    nav.addEventListener('click', (e) => {
      if (e.target === nav) {
        closeNav();
      }
    });
  }

  // ══════════════════════════════════════════════════
  //  7 · COUNTER ANIMATION (enhanced with easing)
  // ══════════════════════════════════════════════════
  const counterElements = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counterElements.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = target > 1000 ? 2800 : 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Elastic ease-out
      const eased = 1 - Math.pow(2, -10 * progress) * Math.cos(progress * Math.PI * 1.3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString('de-CH');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ══════════════════════════════════════════════════
  //  8 · TYPING EFFECT for Hero Title
  // ══════════════════════════════════════════════════
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const originalHTML = heroTitle.innerHTML;
    heroTitle.style.opacity = '0';
    const titleObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          heroTitle.style.opacity = '1';
          heroTitle.classList.add('title-animate');
          titleObserver.unobserve(heroTitle);
        }
      },
      { threshold: 0.3 }
    );
    titleObserver.observe(heroTitle);
  }

  // ══════════════════════════════════════════════════
  //  9 · WATER GLASS CLICK ANIMATION (Phone Mockup)
  // ══════════════════════════════════════════════════
  document.querySelectorAll('.water-glass').forEach((glass) => {
    glass.addEventListener('click', () => {
      glass.style.transform = 'translateY(-6px) scale(1.2)';
      glass.style.filter = 'brightness(1.5) drop-shadow(0 0 8px rgba(56,189,248,.5))';
      setTimeout(() => {
        glass.style.transform = '';
        glass.style.filter = '';
      }, 400);
    });
  });

  // ══════════════════════════════════════════════════
  //  10 · CURSOR GLOW FOLLOWER
  // ══════════════════════════════════════════════════
  if (!isMobile()) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText =
      'position:fixed;top:0;left:0;width:400px;height:400px;pointer-events:none;z-index:9999;' +
      'background:radial-gradient(circle,rgba(174,234,0,.04) 0%,rgba(124,58,237,.02) 40%,transparent 70%);' +
      'border-radius:50%;transform:translate(-50%,-50%);transition:opacity .3s;opacity:0;mix-blend-mode:screen';
    document.body.appendChild(glow);

    let glowX = 0, glowY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

    function followCursor() {
      glowX = lerp(glowX, targetX, 0.08);
      glowY = lerp(glowY, targetY, 0.08);
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();
  }

  // ══════════════════════════════════════════════════
  //  11 · SCROLL PROGRESS BAR
  // ══════════════════════════════════════════════════
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText =
    'position:fixed;top:0;left:0;height:3px;z-index:10001;' +
    'background:linear-gradient(90deg,#AEEA00,#7C3AED,#06B6D4);' +
    'transform-origin:left;transform:scaleX(0);transition:none;pointer-events:none';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    progressBar.style.transform = `scaleX(${pct})`;
  }, { passive: true });

  // ══════════════════════════════════════════════════
  //  12 · PRICING (tabs removed — standalone sections now)
  // ══════════════════════════════════════════════════

  // ══════════════════════════════════════════════════
  //  13 · LEGAL TABS
  // ══════════════════════════════════════════════════
  const legalTabs = document.querySelectorAll('.legal__tab');
  legalTabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      const target = tab.dataset.legal;
      legalTabs.forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.legal__panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
        panel.style.animation = 'fadeSlideUp .4s ease forwards';
      }
    })
  );

  // ══════════════════════════════════════════════════
  //  14 · SMOOTH SCROLL (with legal tab support)
  // ══════════════════════════════════════════════════
  const legalPanelIds = ['agb', 'datenschutz', 'impressum'];

  function activateLegalTab(panelId) {
    const legalTabsAll = document.querySelectorAll('.legal__tab');
    const legalPanelsAll = document.querySelectorAll('.legal__panel');
    legalTabsAll.forEach((t) => t.classList.remove('active'));
    legalPanelsAll.forEach((p) => p.classList.remove('active'));
    const tab = document.querySelector(`.legal__tab[data-legal="${panelId}"]`);
    const panel = document.getElementById(panelId);
    if (tab) tab.classList.add('active');
    if (panel) {
      panel.classList.add('active');
      panel.style.animation = 'fadeSlideUp .4s ease forwards';
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const rawId = id.substring(1);

      // If clicking a legal panel link (#agb, #datenschutz, #impressum),
      // activate the correct tab and scroll to the legal section
      if (legalPanelIds.includes(rawId)) {
        e.preventDefault();
        activateLegalTab(rawId);
        const legalSection = document.getElementById('legal');
        if (legalSection) {
          const offset = header.offsetHeight + 20;
          const top = legalSection.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
      }

      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    })
  );



  // ══════════════════════════════════════════════════
  //  16 · AUTO-ROTATE TESTIMONIALS (optional carousel)
  // ══════════════════════════════════════════════════
  const testimonials = document.querySelectorAll('.testimonial');
  if (testimonials.length > 1 && isMobile()) {
    let currentTestimonial = 0;
    testimonials.forEach((t, i) => { if (i > 0) t.style.display = 'none'; });
    setInterval(() => {
      testimonials[currentTestimonial].style.display = 'none';
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      testimonials[currentTestimonial].style.display = '';
      testimonials[currentTestimonial].style.animation = 'fadeSlideUp .5s ease forwards';
    }, 4000);
  }

  // ══════════════════════════════════════════════════
  //  17 · FLOATING ACTION BADGES  (scroll-triggered)
  // ══════════════════════════════════════════════════
  const badgeNew = document.querySelector('.phone-activity__badge-new');
  if (badgeNew) {
    setInterval(() => {
      badgeNew.style.transform = `scale(${1 + Math.sin(Date.now() / 500) * 0.1})`;
    }, 50);
  }

  // ══════════════════════════════════════════════════
  //  18 · PHONE RING COUNTER ANIMATION
  // ══════════════════════════════════════════════════
  const ringVal = document.querySelector('.phone-ring-val');
  if (ringVal) {
    const phoneObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let count = 0;
          const target = 1847;
          const step = Math.ceil(target / 60);
          const interval = setInterval(() => {
            count = Math.min(count + step, target);
            ringVal.textContent = count.toLocaleString('de-CH');
            if (count >= target) clearInterval(interval);
          }, 25);
          phoneObserver.unobserve(ringVal);
        }
      },
      { threshold: 0.5 }
    );
    phoneObserver.observe(ringVal);
  }

  // ══════════════════════════════════════════════════
  //  19 · DYNAMIC WATER COUNTER
  // ══════════════════════════════════════════════════
  const waterVal = document.getElementById('waterVal');
  if (waterVal) {
    let waterCount = 0;
    const waterTarget = 2.13;
    const waterObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const start = performance.now();
          function animateWater(now) {
            const progress = Math.min((now - start) / 1500, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            waterVal.textContent = (eased * waterTarget).toFixed(2).replace('.', ',');
            if (progress < 1) requestAnimationFrame(animateWater);
          }
          requestAnimationFrame(animateWater);
          waterObserver.unobserve(waterVal);
        }
      },
      { threshold: 0.5 }
    );
    waterObserver.observe(waterVal);
  }

  // ══════════════════════════════════════════════════
  //  20 · HOW-STEPS CONNECTOR GLOW
  // ══════════════════════════════════════════════════
  document.querySelectorAll('.how__num').forEach((num) => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          num.style.animation = 'numPop .6s cubic-bezier(.34,1.56,.64,1) forwards';
          obs.unobserve(num);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(num);
  });

  // ══════════════════════════════════════════════════
  //  CALCULATORS
  // ══════════════════════════════════════════════════
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const calcType = this.dataset.calc;
      if (calcType === 'bmi') calcBMI();
      else if (calcType === 'calorie') calcCalories();
      else if (calcType === 'ideal') calcIdealWeight();
      else if (calcType === 'burn') calcBurn();
    });
  });

  function calcBMI() {
    const height = parseFloat(document.querySelector('.bmi-height').value);
    const weight = parseFloat(document.querySelector('.bmi-weight').value);
    if (!height || !weight) { alert('Bitte alle Felder ausfüllen'); return; }
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let category = '';
    if (bmi < 18.5) category = 'Untergewicht';
    else if (bmi < 25) category = 'Normalgewicht';
    else if (bmi < 30) category = 'Übergewicht';
    else category = 'Adipositas';
    showResult('bmi-result', bmi, category);
  }

  function calcCalories() {
    const age = parseFloat(document.querySelector('.cal-age').value);
    const weight = parseFloat(document.querySelector('.cal-weight').value);
    const height = parseFloat(document.querySelector('.cal-height').value);
    const gender = document.querySelector('.cal-gender').value;
    const activity = parseFloat(document.querySelector('.cal-activity').value);
    if (!age || !weight || !height) { alert('Bitte alle Felder ausfüllen'); return; }

    // Harris-Benedict formula
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    const tdee = Math.round(bmr * activity);
    let recommendation = `Für Gewichtsverlust: ~${Math.round(tdee - 500)} kcal/Tag`;
    showResult('cal-result', tdee, recommendation);
  }

  function calcIdealWeight() {
    const height = parseFloat(document.querySelector('.ideal-height').value);
    const gender = document.querySelector('.ideal-gender').value;
    if (!height) { alert('Bitte Größe eingeben'); return; }
    const ideal = (height - 100 - (gender === 'male' ? 10 : 5) * 0.01 * (height - 150)).toFixed(0);
    const range = `BMI 22: ${ideal} kg · Range: ${Math.round(ideal * 0.9)}–${Math.round(ideal * 1.1)} kg`;
    showResult('ideal-result', ideal, range);
  }

  function calcBurn() {
    const sport = document.querySelector('.burn-sport').value;
    const duration = parseFloat(document.querySelector('.burn-duration').value);
    const weight = parseFloat(document.querySelector('.burn-weight').value);
    if (!sport || sport === '— Wähle eine Sportart —' || !duration || !weight)
      { alert('Bitte alle Felder ausfüllen'); return; }

    const mets = { walking: 3.5, jogging: 8, running: 12, cycling: 9.8, swimming: 8, gym: 6, yoga: 2.5, hiit: 10 };
    const met = mets[sport] || 6;
    const burned = Math.round((met * weight * duration) / 60);
    showResult('burn-result', burned, '');
  }

  function showResult(elementId, num, category) {
    const elem = document.getElementById(elementId);
    elem.querySelector('.result-num').textContent = num.toLocaleString('de-CH');
    if (elem.querySelector('.result-category')) {
      elem.querySelector('.result-category').textContent = category;
    }
    elem.style.display = 'block';
    elem.style.animation = 'fadeIn 0.5s ease-out';
  }

  // ════════════════════════════════════════════════
  //  CONTACT FORM (FormSubmit)
  // ════════════════════════════════════════════════
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if (contactForm && formMsg) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      formMsg.textContent = 'Wird gesendet...';
      const data = new FormData(contactForm);
      data.append('_replyto', data.get('email') || '');
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          formMsg.textContent = 'Danke! Wir melden uns in Kürze.';
          contactForm.reset();
        } else {
          throw new Error('Send failed');
        }
      } catch (err) {
        formMsg.textContent = 'Senden fehlgeschlagen. Bitte per E-Mail an info@qvox.ch schreiben.';
        formMsg.style.color = '#ef4444';
      }
    });
  }

  // ══════════════════════════════════════════════════
  //  APP PERMISSIONS MODAL
  // ══════════════════════════════════════════════════
  window.closePermissions = function() {
    const modal = document.getElementById('permissionsModal');
    if (modal) modal.style.display = 'none';
    localStorage.setItem('permissionsShown', 'true');
  };

  window.savePermissions = function() {
    const perms = {
      health: document.getElementById('perm-health')?.checked,
      photos: document.getElementById('perm-photos')?.checked,
      location: document.getElementById('perm-location')?.checked,
      camera: document.getElementById('perm-camera')?.checked,
      contacts: document.getElementById('perm-contacts')?.checked,
      calendar: document.getElementById('perm-calendar')?.checked
    };
    localStorage.setItem('appPermissions', JSON.stringify(perms));
    closePermissions();
  };

  // Show permissions modal on first visit
  if (!localStorage.getItem('permissionsShown')) {
    setTimeout(() => {
      const modal = document.getElementById('permissionsModal');
      if (modal) modal.style.display = 'flex';
    }, 2000);
  }

  // ══════════════════════════════════════════════════
  //  PHONES CAROUSEL (3-PHONE SHOWCASE)
  // ══════════════════════════════════════════════════
  const phonesTrack = document.getElementById('phonesTrack');
  const phoneDots = document.querySelectorAll('.dot');
  
  let currentSlide = 0;
  let isDragging = false;
  let startX = 0;
  let offsetX = 0;
  
  function updatePhoneSlide(slideIndex) {
    if (!phonesTrack) return;
    currentSlide = slideIndex;
    // Track is 300% wide; each slide = 33.333% of track = 100% of visible area
    const offset = -(currentSlide * (100 / 3));
    phonesTrack.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    phoneDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }
  
  // Dot click nav
  if (phonesTrack && phoneDots.length) {
    phoneDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        updatePhoneSlide(idx);
      });
    });
  }

  // Handle initial URL hash for legal tabs
  const initialHash = window.location.hash.substring(1);
  if (legalPanelIds.includes(initialHash)) {
    activateLegalTab(initialHash);
    setTimeout(() => {
      const legalSection = document.getElementById('legal');
      if (legalSection) {
        const offset = header.offsetHeight + 20;
        const top = legalSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 500);
  }
  
  // Touch swipe
  if (phonesTrack) {
    phonesTrack.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      phonesTrack.classList.add('dragging');
    });
    
    phonesTrack.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      offsetX = e.touches[0].clientX - startX;
    });
    
    phonesTrack.addEventListener('touchend', () => {
      isDragging = false;
      phonesTrack.classList.remove('dragging');
      
      const threshold = 50; // Min swipe distance
      if (Math.abs(offsetX) > threshold) {
        if (offsetX > 0 && currentSlide > 0) {
          currentSlide--;
        } else if (offsetX < 0 && currentSlide < 2) {
          currentSlide++;
        }
      }
      updatePhoneSlide(currentSlide);
    });
  }
  
  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 0) {
      updatePhoneSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < 2) {
      updatePhoneSlide(currentSlide + 1);
    }
  });

  // ══════════════════════════════════════════════════
  //  COOKIE CONSENT (DSGVO)
  // ══════════════════════════════════════════════════
  const cookieBanner = document.getElementById('cookieConsent');
  if (cookieBanner && !localStorage.getItem('cookieConsent')) {
    setTimeout(() => { cookieBanner.style.display = 'block'; }, 1000);
  }

  window.acceptCookies = function () {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    if (cookieBanner) cookieBanner.style.display = 'none';
  };

  window.declineCookies = function () {
    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    if (cookieBanner) cookieBanner.style.display = 'none';
  };

})();

