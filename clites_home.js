
    (function () {
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) document.documentElement.classList.add('js');
    })();
  


    (function () {
      var toggle = document.getElementById('navToggle');
      var menu = document.getElementById('mobileMenu');
      if (!toggle || !menu) return;

      function closeMenu() {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
          closeMenu();
        }
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 940) closeMenu();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    })();
  


    /* Stack depth: as a new card slides over, the ones beneath shrink and darken slightly */

  /* Stack depth: as a new card slides over, the ones beneath shrink and darken slightly */
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.hww__card'));
    if (!cards.length) return;
    cards.forEach(function (c, i) { c.style.setProperty('--i', i); });
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;
    var visible = !('IntersectionObserver' in window);
    function update() {
      ticking = false;
      if (!visible) return;
      var p = cards.map(function (c, i) {
        var n = cards[i + 1];
        if (!n) return 0;
        var stuckTop = parseFloat(getComputedStyle(n).top) || 0;
        var dist = n.getBoundingClientRect().top - stuckTop;
        var prog = 1 - dist / c.offsetHeight;
        return Math.min(1, Math.max(0, prog));
      });
      cards.forEach(function (c, i) {
        var depth = 0;
        for (var j = i; j < p.length; j++) depth += p[j];
        c.style.setProperty('--depth', depth.toFixed(3));
      });
    }
    function req() {
      if (!visible || ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        req();
      }).observe(cards[0].closest('.hww'));
    }

    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    req();
  })();

  


    (() => {
      const stats = document.querySelector(".abt__stats");
      const counters = document.querySelectorAll(".abt__number[data-target]");

      if (!stats || !counters.length) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderNumber = (element, value) => {
        const padded = element.dataset.pad
          ? String(Math.round(value)).padStart(Number(element.dataset.pad), "0")
          : String(Math.round(value));

        element.textContent = `${padded}${element.dataset.suffix || ""}`;
      };

      const animateCounter = (counter) => {
        const target = Number(counter.dataset.target);
        const duration = 1400;
        const startTime = performance.now();

        const update = (currentTime) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          renderNumber(counter, target * easedProgress);

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        };

        requestAnimationFrame(update);
      };

      /* reduced motion / no observer support: just show the final numbers */
      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        counters.forEach((counter) => renderNumber(counter, Number(counter.dataset.target)));
        return;
      }

      /* start from zero so the numbers fade in already counting up */
      counters.forEach((counter) => renderNumber(counter, 0));

      const observer = new IntersectionObserver((entries, currentObserver) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        counters.forEach((counter) => animateCounter(counter));
        currentObserver.disconnect();
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

      observer.observe(stats);
    })();
  


  (function () {
    var section = document.getElementById('reviews');
    if (!section) return; // reviews section removed in the Clites rebrand
    var panel = section.querySelector('.panel');
    var box = document.getElementById('stack');
    var list = document.getElementById('list');
    var barFill = document.getElementById('bar-fill');
    var counterNow = document.getElementById('counter-now');
    var counterTotal = document.getElementById('counter-total');

    var SPEED = 32;
    var RESUME_AFTER = 1600;

    var originals = Array.prototype.slice.call(list.children);
    var n = originals.length;
    counterTotal.textContent = n;

    for (var c = 0; c < 2; c++) {
      originals.forEach(function (card) {
        var copy = card.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        list.appendChild(copy);
      });
    }

    var starSvg = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="url(#starGold)" d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z"/></svg>';
    Array.prototype.forEach.call(section.querySelectorAll('.stars'), function (el) {
      el.innerHTML = new Array(6).join(starSvg);
    });

    var L = 1000;
    var stepPx = 300;
    var pos = 0;
    var lastSet = 0;

    var hovering = false, focused = false, touching = false;
    var visible = !('IntersectionObserver' in window);
    var holdUntil = 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function measure() {
      var kids = list.children;
      var newL = kids[n].offsetTop - kids[0].offsetTop;
      stepPx = kids[1].offsetTop - kids[0].offsetTop;
      var phase = L > 0 ? (((pos % L) + L) % L) / L : 0;
      L = newL;
      pos = L + phase * L;
      apply();
    }

    function wrap() {
      if (pos > 2 * L) { pos -= L; return true; }
      if (pos < 0.2 * L) { pos += L; return true; }
      return false;
    }

    function apply() {
      box.scrollTop = pos;
      lastSet = box.scrollTop;
      updateMeta();
    }

    var lastIdx = -1;
    function updateMeta() {
      var x = (((pos % L) + L) % L);
      barFill.style.width = (x / L * 100).toFixed(2) + '%';
      var idx = Math.floor((x + stepPx * 0.5) / stepPx) % n;
      if (idx !== lastIdx) { lastIdx = idx; counterNow.textContent = idx + 1; }
    }

    var last = null;
    var frame = 0;
    function tick(ts) {
      frame = window.requestAnimationFrame(tick);
      if (last === null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (hovering || focused || touching || ts < holdUntil) return;
      pos += SPEED * dt;
      wrap();
      apply();
    }

    box.addEventListener('scroll', function () {
      if (Math.abs(box.scrollTop - lastSet) > 1.5) {
        pos = box.scrollTop;
        holdUntil = performance.now() + RESUME_AFTER;
        if (wrap()) { box.scrollTop = pos; }
        lastSet = box.scrollTop;
        updateMeta();
      }
    }, { passive: true });

    panel.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen') hovering = true; });
    panel.addEventListener('pointerleave', function () { hovering = false; holdUntil = performance.now() + 250; });
    panel.addEventListener('wheel', function () { holdUntil = performance.now() + RESUME_AFTER; }, { passive: true });
    panel.addEventListener('touchstart', function () { touching = true; }, { passive: true });
    panel.addEventListener('touchend', function () { touching = false; holdUntil = performance.now() + RESUME_AFTER; }, { passive: true });
    panel.addEventListener('touchcancel', function () { touching = false; }, { passive: true });
    box.addEventListener('focusin', function () { focused = true; });
    box.addEventListener('focusout', function () { focused = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        updateAutoplay();
      }).observe(section);
    }

    window.addEventListener('resize', measure);
    if (window.ResizeObserver) { new ResizeObserver(measure).observe(box); }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measure); }
    L = 0; pos = 0;
    measure();
    updateAutoplay();

    function updateAutoplay() {
      if (visible && !reduce) {
        if (!frame) frame = window.requestAnimationFrame(tick);
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        last = null;
      }
    }
  })();
  


    (function () {
      var items = document.querySelectorAll('#shFaqList .sh-faq__item');
      items.forEach(function (item) {
        var btn = item.querySelector('.sh-faq__q');
        btn.addEventListener('click', function () {
          var wasOpen = item.classList.contains('is-open');
          items.forEach(function (i) {
            i.classList.remove('is-open');
            i.querySelector('.sh-faq__q').setAttribute('aria-expanded', 'false');
          });
          if (!wasOpen) {
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });
    })();
  


    (function () {
      var root = document.documentElement;
      if (!root.classList.contains('js')) return;

      try {
        /* 1 — split headings into words (spaces inside a text node stay intact; &nbsp; keeps words glued) */
        function splitWords(el) {
          var clone = el.cloneNode(true);
          clone.querySelectorAll('br').forEach(function (b) { b.replaceWith(' '); });
          el.setAttribute('aria-label', clone.textContent.replace(/\s+/g, ' ').trim());

          var base = parseFloat(el.style.getPropertyValue('--d')) || 0;
          var idx = 0;

          (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
              if (child.nodeType === 3) {
                var frag = document.createDocumentFragment();
                child.nodeValue.split(/([ \t\r\n\f]+)/).forEach(function (part) {
                  if (!part) return;
                  if (/^[ \t\r\n\f]+$/.test(part)) {
                    frag.appendChild(document.createTextNode(' '));
                  } else {
                    var w = document.createElement('span');
                    w.className = 'rv-word';
                    w.setAttribute('aria-hidden', 'true');
                    w.style.setProperty('--d', (base + Math.min(idx, 14) * 0.06).toFixed(2) + 's');
                    w.textContent = part;
                    frag.appendChild(w);
                    idx++;
                  }
                });
                node.replaceChild(frag, child);
              } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                walk(child);
              }
            });
          })(el);

          el.classList.add('is-split');
        }
        document.querySelectorAll('.rv-split').forEach(splitWords);

        /* 2 — stagger children of list-like containers */
        document.querySelectorAll('.rv-stagger').forEach(function (list) {
          var base = parseFloat(list.style.getPropertyValue('--d')) || 0;
          Array.prototype.forEach.call(list.children, function (child, i) {
            child.classList.add('rv');
            child.style.setProperty('--d', (base + i * 0.07).toFixed(2) + 's');
          });
        });

        /* 3 — play the animation when each element enters the viewport */
        var targets = document.querySelectorAll('.rv, .rv-split');

        if (!('IntersectionObserver' in window)) {
          targets.forEach(function (t) { t.classList.add('in'); });
          return;
        }

        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            /* also reveal anything that is already above the viewport (e.g. page reloaded mid-scroll) */
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

        targets.forEach(function (t) { io.observe(t); });
      } catch (err) {
        root.classList.remove('js');   /* never leave content hidden if something goes wrong */
        if (window.console) console.error(err);
      }
    })();
  
