/* ============================================================
   IDiAL Jahresbericht – Interactive JavaScript
   ============================================================ */

(function() {
  'use strict';

  /* ----------------------------------------------------------
     1. Scroll Progress Indicator
     ---------------------------------------------------------- */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     2. Header Scroll Behavior
     ---------------------------------------------------------- */
  const header = document.getElementById('site-header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.scrollY;
      if (currentScroll > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     3. Mobile Navigation Toggle
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on nav link click
    navMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     4. Smooth Scroll for in-page anchor links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 72;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     5. Active Section Highlighting in Nav
     ---------------------------------------------------------- */
  const sectionLinks = document.querySelectorAll('.nav-section-link');
  if (sectionLinks.length > 0) {
    const sections = [];
    sectionLinks.forEach(function(link) {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (section) sections.push({ link, section });
    });

    const navHeight = 72;

    function updateActiveSection() {
      const scrollPos = window.scrollY + navHeight + 80;
      let current = null;

      sections.forEach(function(item) {
        const top = item.section.offsetTop;
        const bottom = top + item.section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          current = item;
        }
      });

      sectionLinks.forEach(function(link) { link.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();
  }

  /* ----------------------------------------------------------
     6. Scroll-Triggered Animations (Intersection Observer)
     ---------------------------------------------------------- */
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  if (animateElements.length > 0 && 'IntersectionObserver' in window) {
    const animObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    animateElements.forEach(function(el) {
      animObserver.observe(el);
    });
  } else {
    // Fallback: show all elements
    animateElements.forEach(function(el) {
      el.classList.add('visible');
    });
  }

  /* ----------------------------------------------------------
     7. Counter Animation
     ---------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    const easeOut = function(t) { return 1 - Math.pow(1 - t, 3); };

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString('de-DE') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('de-DE') + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      counterObserver.observe(counter);
    });
  }

  /* ----------------------------------------------------------
     8. Progress Bar Animation (for annual totals)
     ---------------------------------------------------------- */
  const progressFills = document.querySelectorAll('.annual-total-fill');
  if (progressFills.length > 0 && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width || '0';
          setTimeout(function() {
            entry.target.style.width = width + '%';
          }, 200);
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    progressFills.forEach(function(fill) { barObserver.observe(fill); });
  }

  /* ----------------------------------------------------------
     9. Project Tag Filtering
     ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        const filter = this.dataset.filter;

        projectCards.forEach(function(card) {
          if (filter === 'all') {
            card.style.display = '';
            setTimeout(function() { card.style.opacity = '1'; }, 10);
          } else {
            const tags = (card.dataset.tags || '').split(' ');
            if (tags.includes(filter)) {
              card.style.display = '';
              setTimeout(function() { card.style.opacity = '1'; }, 10);
            } else {
              card.style.opacity = '0';
              setTimeout(function() { card.style.display = 'none'; }, 300);
            }
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     10. Keyboard accessibility for year selector
     ---------------------------------------------------------- */
  const yearSelectors = document.querySelectorAll('.year-selector');
  yearSelectors.forEach(function(selector) {
    const current = selector.querySelector('.year-current');
    const dropdown = selector.querySelector('.year-dropdown');
    if (current && dropdown) {
      current.setAttribute('tabindex', '0');
      current.setAttribute('role', 'button');
      current.setAttribute('aria-haspopup', 'listbox');

      current.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dropdown.style.opacity === '1'
            ? (dropdown.style.opacity = '0', dropdown.style.visibility = 'hidden')
            : (dropdown.style.opacity = '1', dropdown.style.visibility = 'visible');
        }
      });
    }
  });

})();
