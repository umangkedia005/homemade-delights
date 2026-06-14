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

  /* ── Menu filter tabs & Google Sheet dynamic database ── */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuGrid = document.getElementById('menuGrid');

  // Replace this with your published Google Sheet CSV URL
  // Format: https://docs.google.com/spreadsheets/d/e/[ID]/pub?output=csv
  const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3WW3YziyH9tMOkrImXeGi7X_kVbSgn4_4rg0Rw09PUemyEN2d-ca7Y-LzR6LlDqHDlwJWxbaT5zKJ/pub?output=csv';

  const categoryMap = {
    all:       () => true,
    chocolate: card => card.dataset.category === 'chocolate',
    fruit:     card => card.dataset.category === 'fruit',
    special:   card => card.dataset.category === 'special',
    bites:     card => card.dataset.category === 'bites',
  };

  const fallbackMenu = [
    ["Vanilla Cake", "classic", "300", "Classic soft vanilla sponge, timeless and delicious", "🍰", ""],
    ["Vanilla Choco Chip", "chocolate", "350", "Vanilla sponge studded with rich chocolate chips", "🍫", ""],
    ["Tutty Frutty", "fruit", "350", "Colourful candied fruit baked into every slice", "🌈", ""],
    ["Coconut Cake", "classic", "350", "Tropical coconut flavour, light and fragrant", "🥥", ""],
    ["Orange Cake", "fruit", "400", "Zesty fresh orange zest throughout the sponge", "🍊", ""],
    ["Roasted Almond", "special", "400", "Rich cake loaded with toasted, crunchy almonds", "🌰", ""],
    ["Carrot Cake", "classic", "350", "Moist spiced carrot cake, a timeless classic", "🥕", ""],
    ["Marble Cake", "classic", "400", "Beautiful swirl of vanilla and chocolate", "🌀", ""],
    ["Dry Fruit Cake", "fruit", "400", "Loaded with premium mixed dry fruits, a festive favourite", "🍇", "⭐ Bestseller"],
    ["Red Velvet Marble", "fruit", "400", "Stunning red velvet swirled with classic white", "❤️", ""],
    ["Pineapple Upside Down", "fruit", "475", "Caramelised pineapple rings on a golden sponge", "🍍", ""],
    ["Double Chocolate", "chocolate", "450", "Doubly decadent – chocolate sponge and chips", "🍫", ""],
    ["Triple Chocolate", "chocolate", "475", "Dark, milk and white chocolate — pure indulgence", "🍫", "🌟 Chef's Pick"],
    ["Lime Cake", "fruit", "380", "Refreshingly tangy lime-infused soft sponge", "🍋", ""],
    ["Coffee Chocolate Cake", "chocolate", "350", "Bold espresso meets rich chocolate in every bite", "☕", ""],
    ["Chocolate Cake", "classic", "400", "Classic moist chocolate sponge, deeply satisfying", "🎂", ""],
    ["Muffins (6 pcs)", "bites", "180", "Fluffy, golden muffins – perfect for gifting or snacking", "🧁", ""],
    ["Brownies (per pc)", "bites", "25", "Fudgy, gooey dark chocolate brownies, irresistible", "🍫", "❤️ Favourite"],
    ["Banana Choco", "chocolate", "450", "Ripe banana paired beautifully with chocolate", "🍌", ""],
    ["Walnut Cake", "special", "450", "Moist cake generously packed with walnuts", "🌰", ""],
    ["Choco Walnut", "chocolate", "470", "The perfect marriage of chocolate and crunchy walnuts", "🍫", ""],
    ["Paan Cake", "special", "370", "Unique paan-flavoured cake, a desi twist on dessert", "🌿", ""],
    ["Lemon Blueberry", "fruit", "450", "Bright lemony sponge bursting with blueberries", "🫐", ""],
    ["Rasmalai Cake", "special", "450", "Fusion of classic rasmalai flavour in a premium cake", "🍮", "🌟 Chef's Pick"],
    ["Mawa Cake", "special", "350", "Traditional mawa (khoya) based rich cake", "🥛", ""],
    ["Coconut Rawa Mawa", "special", "375", "Semolina, coconut & mawa—a rich regional specialty", "🥥", ""],
    ["Aata Jaggery Cake", "special", "350", "Wholesome whole wheat and jaggery — guilt-free goodness", "🌾", ""],
    ["Cranberry Cake", "fruit", "450", "Tart cranberries baked into a moist, tender crumb", "🍒", ""],
    ["Walnut Brownie (per pc)", "bites", "30", "Fudgy brownie with crunchy walnut pieces inside", "🌰", ""],
    ["Butter Cake", "classic", "450", "Classic buttery pound cake, rich and golden", "🧈", ""]
  ];

  // CSV Parser
  function parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  }

  // Render cards to menuGrid
  function renderMenu(rows) {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    rows.forEach(row => {
      // row: [Name, Category, Price, Description, Emoji, Badge]
      const name = row[0] ? row[0].trim() : '';
      const category = row[1] ? row[1].trim().toLowerCase() : 'classic';
      const price = row[2] ? row[2].trim() : '';
      const description = row[3] ? row[3].trim() : '';
      const emoji = row[4] ? row[4].trim() : '🍰';
      const badge = row[5] ? row[5].trim() : '';

      if (!name || name.toLowerCase() === 'name') return; // Skip headers or empty rows

      const card = document.createElement('div');
      card.className = `menu-card reveal ${badge ? 'featured' : ''}`;
      card.dataset.category = category;
      card.id = `card-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      let badgeHtml = '';
      if (badge) {
        badgeHtml = `<div class="card-badge">${badge}</div>`;
      }

      card.innerHTML = `
        ${badgeHtml}
        <div class="card-emoji">${emoji}</div>
        <div class="card-body">
          <h3 class="card-name">${name}</h3>
          <p class="card-desc">${description}</p>
        </div>
        <div class="card-price">₹${price}</div>
      `;

      menuGrid.appendChild(card);
    });

    // Re-initialize intersection observer for new reveal cards
    const reveals = menuGrid.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));

    // Re-bind hover sparkle effect
    initializeDynamicSparkles(menuGrid.querySelectorAll('.menu-card'));
  }

  // Bind sparkles to dynamic cards
  function initializeDynamicSparkles(cards) {
    cards.forEach(card => {
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
  }

  // Load Menu from Google Sheet
  async function loadMenu() {
    try {
      // Add cache-buster to prevent showing stale items
      const urlWithCacheBuster = `${SPREADSHEET_URL}&t=${Date.now()}`;
      const response = await fetch(urlWithCacheBuster);
      if (!response.ok) throw new Error('Network response not ok');
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      
      const items = rows.filter(r => r[0] && r[0].toLowerCase() !== 'name');
      if (items.length > 0) {
        renderMenu(items);
        return;
      }
      throw new Error('Empty sheet data');
    } catch (err) {
      console.log('Failed to fetch from Google Sheets, using fallback local menu:', err);
      renderMenu(fallbackMenu);
    }
  }

  // Initialize load
  loadMenu();

  // Setup tab filters (queries cards dynamically when clicked)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const predicate = categoryMap[filter] || categoryMap.all;
      const currentCards = document.querySelectorAll('.menu-card');

      currentCards.forEach(card => {
        const show = predicate(card);
        card.classList.toggle('hidden', !show);
        if (show) {
          card.classList.remove('visible');
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



  // Sparkle keyframe
  const sparkStyle = document.createElement('style');
  sparkStyle.textContent = `
    @keyframes sparkle {
      0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
    }
  `;
  document.head.appendChild(sparkStyle);

  /* ── Menu download & share logic ── */
  const downloadPage1Btn = document.getElementById('downloadPage1Btn');
  const downloadPage2Btn = document.getElementById('downloadPage2Btn');
  const shareMenuBtn     = document.getElementById('shareMenuBtn');
  const menuToast        = document.getElementById('menuToast');

  if (downloadPage1Btn) {
    downloadPage1Btn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = 'menu_page1.jpg';
      a.download = 'Homemade-Delights-Dry-Cake-Menu-Page1.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  if (downloadPage2Btn) {
    downloadPage2Btn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = 'menu_page2.jpg';
      a.download = 'Homemade-Delights-Dry-Cake-Menu-Page2.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  if (shareMenuBtn) {
    shareMenuBtn.addEventListener('click', async () => {
      const shareTitle = 'Homemade Delights Bakery';
      const shareText = 'Check out the dry cake menu of Homemade Delights! Delicious cakes, freshly baked to order. 🍰🎂';
      // Clean URL without hashes (#menu)
      const shareUrl = window.location.origin + window.location.pathname;

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
        } catch (err) {
          console.log('Error sharing:', err);
        }
      } else {
        // Fallback: Copy clean link to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('✅ Link copied to clipboard!');
        } catch (err) {
          showToast('❌ Copy failed. Use browser sharing.');
        }
      }
    });
  }

  function showToast(msg) {
    if (menuToast) {
      menuToast.textContent = msg;
      menuToast.classList.add('show');
      setTimeout(() => {
        menuToast.classList.remove('show');
      }, 3000);
    }
  }

  /* ── Parallax for hero image ── */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
    }, { passive: true });
  }

})();
