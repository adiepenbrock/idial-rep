/* ============================================================
   IDiAL Jahresbericht – Interactive JavaScript
   ============================================================ */

(function() {
  'use strict';

  const docLang = (document.documentElement.lang || 'de').toLowerCase();
  const numberLocale = docLang.startsWith('en') ? 'en-US' : 'de-DE';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     2b. Report Side Nav Visibility + Header Hand-off
     ---------------------------------------------------------- */
  const isReportPage = document.body.classList.contains('page-reports');
  const reportSideNav = document.querySelector('.report-side-nav-left');
  if (isReportPage && reportSideNav) {
    const sideNavMedia = window.matchMedia('(min-width: 1321px)');
    const firstReportSection = document.getElementById('vorwort') || document.getElementById('highlights');

    function updateReportSideNavVisibility() {
      if (!sideNavMedia.matches) {
        document.body.classList.remove('report-side-nav-visible');
        if (header) {
          header.removeAttribute('inert');
          header.removeAttribute('aria-hidden');
        }
        return;
      }

      const navHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 72;

      const threshold = firstReportSection
        ? Math.max(firstReportSection.offsetTop - navHeight - 40, 140)
        : Math.max(window.innerHeight * 0.45, 140);

      const isSideNavVisible = window.scrollY >= threshold;
      document.body.classList.toggle('report-side-nav-visible', isSideNavVisible);

      if (header) {
        if (isSideNavVisible) {
          header.setAttribute('inert', '');
          header.setAttribute('aria-hidden', 'true');
        } else {
          header.removeAttribute('inert');
          header.removeAttribute('aria-hidden');
        }
      }
    }

    window.addEventListener('scroll', updateReportSideNavVisibility, { passive: true });
    window.addEventListener('resize', updateReportSideNavVisibility);
    if (sideNavMedia.addEventListener) {
      sideNavMedia.addEventListener('change', updateReportSideNavVisibility);
    }
    updateReportSideNavVisibility();
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
        window.scrollTo({ top: targetTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     5. Active Section Highlighting in Nav
     ---------------------------------------------------------- */
  const sectionLinks = document.querySelectorAll('.nav-section-link, .report-float-link');
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
      el.textContent = value.toLocaleString(numberLocale) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString(numberLocale) + suffix;
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
     9. Random Hero Media Slider
     ---------------------------------------------------------- */
  const randomSliders = document.querySelectorAll('[data-random-slider]');
  randomSliders.forEach(function(slider) {
    const slides = slider.querySelectorAll('.hero-media-slide');
    const dots = slider.querySelectorAll('.hero-media-dot');
    const controls = slider.querySelectorAll('.hero-media-control');
    if (slides.length === 0) {
      return;
    }

    let currentIndex = Math.floor(Math.random() * slides.length);
    let intervalId = null;

    function setActiveSlide(index) {
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
        dot.setAttribute('aria-pressed', dotIndex === index ? 'true' : 'false');
      });
    }

    function goToSlide(nextIndex) {
      currentIndex = (nextIndex + slides.length) % slides.length;
      setActiveSlide(currentIndex);
    }

    function stopAutoPlay() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    function startAutoPlay() {
      if (slides.length <= 1 || prefersReducedMotion) {
        return;
      }

      stopAutoPlay();
      intervalId = window.setInterval(function() {
        goToSlide(currentIndex + 1);
      }, 5000);
    }

    setActiveSlide(currentIndex);
    startAutoPlay();

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    slider.addEventListener('focusin', stopAutoPlay);
    slider.addEventListener('focusout', function(e) {
      if (!slider.contains(e.relatedTarget)) {
        startAutoPlay();
      }
    });

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        goToSlide(dotIndex);
        startAutoPlay();
      });
    });

    controls.forEach(function(control) {
      control.addEventListener('click', function() {
        const direction = this.dataset.slideDir === 'prev' ? -1 : 1;
        goToSlide(currentIndex + direction);
        startAutoPlay();
      });
    });
  });

  /* ----------------------------------------------------------
     10. Project Spotlight Switcher
     ---------------------------------------------------------- */
  const spotlightCards = document.querySelectorAll('[data-project-spotlight]');
  spotlightCards.forEach(function(card) {
    const items = card.querySelectorAll('.hero-spotlight-item');
    const randomControl = card.querySelector('[data-spotlight-random]');
    if (items.length === 0) {
      return;
    }

    let currentIndex = Math.floor(Math.random() * items.length);

    function setActiveSpotlight(index) {
      items.forEach(function(item, itemIndex) {
        const isActive = itemIndex === index;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
    }

    function goToSpotlight(nextIndex) {
      currentIndex = (nextIndex + items.length) % items.length;
      setActiveSpotlight(currentIndex);
    }

    setActiveSpotlight(currentIndex);

    if (randomControl) {
      randomControl.addEventListener('click', function() {
        if (items.length <= 1) {
          return;
        }

        let nextIndex = currentIndex;
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * items.length);
        }

        goToSpotlight(nextIndex);
      });
    }
  });

  /* ----------------------------------------------------------
     11. Project Tag Filtering + Search
     ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const projectSearchInput = document.getElementById('project-search');
  const projectResults = document.getElementById('project-results');
  const projectViewBtns = document.querySelectorAll('.projects-view-btn');
  const projectsGrid = document.getElementById('projects-grid');
  const projectResultsWords = docLang.startsWith('en')
    ? { of: 'of', label: 'projects' }
    : { of: 'von', label: 'Projekten' };

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  if (projectCards.length > 0) {
    let activeFilter = 'all';

    function updateProjectResults() {
      const query = normalizeText(projectSearchInput ? projectSearchInput.value : '');
      let visibleCount = 0;

      projectCards.forEach(function(card) {
        const tags = (card.dataset.tags || '').trim().split(/\s+/).filter(Boolean);
        const title = normalizeText(card.dataset.title);
        const description = normalizeText(card.dataset.description);
        const category = normalizeText(card.dataset.category);
        const funding = normalizeText(card.dataset.funding);

        const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
        const matchesSearch = !query
          || title.includes(query)
          || description.includes(query)
          || category.includes(query)
          || funding.includes(query);

        const isVisible = matchesFilter && matchesSearch;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (projectResults) {
        projectResults.textContent = visibleCount + ' ' + projectResultsWords.of + ' ' + projectCards.length + ' ' + projectResultsWords.label;
      }
    }

    if (filterBtns.length > 0) {
      filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          filterBtns.forEach(function(button) {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
          });
          this.classList.add('active');
          this.setAttribute('aria-pressed', 'true');
          activeFilter = this.dataset.filter || 'all';
          updateProjectResults();
        });
      });
    }

    if (projectSearchInput) {
      projectSearchInput.addEventListener('input', updateProjectResults);
    }

    if (projectViewBtns.length > 0 && projectsGrid) {
      projectViewBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const view = this.dataset.view || 'grid';

          projectViewBtns.forEach(function(button) {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
          });

          this.classList.add('active');
          this.setAttribute('aria-pressed', 'true');
          projectsGrid.classList.toggle('projects-list-view', view === 'list');
        });
      });
    }

    updateProjectResults();
  }

  /* ----------------------------------------------------------
     12. Highlight Category Filtering
     ---------------------------------------------------------- */
  const timelineFilterBtns = document.querySelectorAll('.timeline-filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item[data-category]');

  if (timelineFilterBtns.length > 0 && timelineItems.length > 0) {
    timelineFilterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const targetCategory = this.dataset.category || 'all';

        timelineFilterBtns.forEach(function(button) {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');

        timelineItems.forEach(function(item) {
          const itemCategory = item.dataset.category || 'all';
          const shouldShow = targetCategory === 'all' || itemCategory === targetCategory;
          item.classList.toggle('is-hidden', !shouldShow);
        });
      });
    });
  }

  /* ----------------------------------------------------------
     13. Keyboard accessibility for year selector
     ---------------------------------------------------------- */
  const yearSelectors = document.querySelectorAll('.year-selector');
  yearSelectors.forEach(function(selector) {
    const current = selector.querySelector('.year-current');
    const dropdown = selector.querySelector('.year-dropdown');
    if (current && dropdown) {
      function setSelectorOpen(isOpen) {
        selector.classList.toggle('open', isOpen);
        current.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      function toggleSelector() {
        setSelectorOpen(!selector.classList.contains('open'));
      }

      current.addEventListener('click', function() {
        toggleSelector();
      });

      current.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSelector();
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectorOpen(true);
          const firstItem = dropdown.querySelector('a');
          if (firstItem) {
            firstItem.focus();
          }
        }

        if (e.key === 'Escape') {
          setSelectorOpen(false);
        }
      });

      dropdown.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          setSelectorOpen(false);
        });
      });

      document.addEventListener('click', function(e) {
        if (!selector.contains(e.target)) {
          setSelectorOpen(false);
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          setSelectorOpen(false);
        }
      });
    }
  });

  /* ----------------------------------------------------------
     14. Back-to-top Button
     ---------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    function toggleBackToTop() {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     15. Hero Pointer Motion
     ---------------------------------------------------------- */
  const heroShapes = document.querySelector('.hero-bg-shapes');
  const prefersCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (heroShapes && !prefersReducedMotion && !prefersCoarsePointer) {
    let pointerX = 0;
    let pointerY = 0;
    let rafPending = false;

    function updateHeroMotion() {
      const x = (pointerX / window.innerWidth - 0.5) * 14;
      const y = (pointerY / window.innerHeight - 0.5) * 10;
      heroShapes.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      rafPending = false;
    }

    window.addEventListener('pointermove', function(e) {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(updateHeroMotion);
      }
    }, { passive: true });
  }

})();
