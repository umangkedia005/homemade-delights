/* ──────────────────────────────────────
   Homemade Delights Bakery – JavaScript
────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Navbar scroll behaviour ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ── Hamburger menu ── */
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('open');
    navbar.classList.add('menu-open');
    navOverlay.classList.add('active');      // show the dark overlay
    document.body.classList.add('nav-open'); // hide stubborn iframes via CSS
    document.body.style.overflow = 'hidden'; // lock page scroll
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    navbar.classList.remove('menu-open');
    navOverlay.classList.remove('active');      // hide the overlay
    document.body.classList.remove('nav-open'); // restore iframes
    document.body.style.overflow = '';          // unlock scroll
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when clicking a nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  // ✅ Click on dark overlay → close menu (works for images & iframes too)
  navOverlay.addEventListener('click', () => closeMenu());

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  /* ── Menu filter tabs ── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  const categoryMap = {
    all:       () => true,
    chocolate: card => card.dataset.category === 'chocolate',
    fruit:     card => card.dataset.category === 'fruit',
    special:   card => card.dataset.category === 'special',
    bites:     card => card.dataset.category === 'bites',
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const predicate = categoryMap[filter] || categoryMap.all;

      menuCards.forEach(card => {
        const show = predicate(card);
        card.classList.toggle('hidden', !show);
        if (show) {
          card.classList.remove('visible');
          // re-trigger reveal for newly shown cards
          setTimeout(() => card.classList.add('visible'), 50);
        }
      });
    });
  });

  /* ── Animated stats counter ── */
  const statNums = document.querySelectorAll('.stat-num');

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const duration = 1800;
          const step     = Math.ceil(target / (duration / 16));
          let current    = 0;
          const timer    = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current >= target) clearInterval(timer);
          }, 16);
          statsObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(el => statsObserver.observe(el));

  /* ── Testimonial carousel ── */
  const track  = document.getElementById('testimonialTrack');
  const dots   = document.querySelectorAll('.dot');
  const cards  = document.querySelectorAll('.testimonial-card');
  let current  = 0;
  let autoPlay;

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      resetAutoPlay();
    });
  });

  function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(() => goTo(current + 1), 5000);
  }

  // Touch / drag support for carousel
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAutoPlay();
    }
  });

  resetAutoPlay();

  /* ── Smooth active nav link highlighting ── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAs.forEach(a => {
            a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ── Add active-link style dynamically ── */
  const style = document.createElement('style');
  style.textContent = `
    .navbar.scrolled .nav-links a.active-link {
      color: var(--rose-400) !important;
    }
    .navbar.scrolled .nav-links a.active-link::after {
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  /* ── Card hover sparkle micro-animation ── */
  menuCards.forEach(card => {
    card.addEventListener('mouseenter', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const spark = document.createElement('div');
      spark.style.cssText = `
        position: absolute;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: radial-gradient(circle, #f0a0ae, #e87a8a);
        pointer-events: none;
        left: ${x}px; top: ${y}px;
        transform: translate(-50%, -50%) scale(0);
        animation: sparkle .5s ease forwards;
        z-index: 10;
      `;
      card.appendChild(spark);
      setTimeout(() => spark.remove(), 500);
    });
  });

  // Sparkle keyframe
  const sparkStyle = document.createElement('style');
  sparkStyle.textContent = `
    @keyframes sparkle {
      0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
    }
  `;
  document.head.appendChild(sparkStyle);

  /* ── Parallax for hero image ── */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
    }, { passive: true });
  }

})();
