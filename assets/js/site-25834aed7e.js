/* site.js - Take N' Toke redesign. No dependencies.
   header state + mega menus + drawer, 21+ gate, reveal-on-scroll, parallax, tilt, hero video, clock, footer shine. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var main = $('#main');
  function focusMain() {
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.addEventListener('blur', function () { main.removeAttribute('tabindex'); }, { once: true });
  }

  /* ---------- header: scrolled state + progress ---------- */
  var hdr = $('[data-hdr]');
  var bar = $('[data-progress]');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (hdr) hdr.classList.toggle('is-scrolled', y > 24);
      if (bar) {
        var h = root.scrollHeight - window.innerHeight;
        bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
      }
      parallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- mega menus (hover with open/close delays, click, keyboard, Esc) ---------- */
  var items = $$('[data-mega]');
  var openTimer = null, closeTimer = null;
  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('is-open');
      var b = $('.nav__link', it); if (b) b.setAttribute('aria-expanded', 'false');
    });
    if (hdr) hdr.classList.toggle('is-open', !!except);
  }
  function open(it) {
    closeAll(it);
    it.classList.add('is-open');
    var b = $('.nav__link', it); if (b) b.setAttribute('aria-expanded', 'true');
    if (hdr) hdr.classList.add('is-open');
  }
  items.forEach(function (it) {
    var btn = $('.nav__link', it);
    it.addEventListener('mouseenter', function () {
      if (!finePointer) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      var anyOpen = items.some(function (x) { return x.classList.contains('is-open'); });
      openTimer = setTimeout(function () { open(it); }, anyOpen ? 0 : 90);
    });
    it.addEventListener('mouseleave', function () {
      if (!finePointer) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () { it.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); if (hdr && !items.some(function (x) { return x.classList.contains('is-open'); })) hdr.classList.remove('is-open'); }, 260);
    });
    btn.addEventListener('click', function () {
      if (it.classList.contains('is-open')) closeAll(null); else open(it);
    });
    it.addEventListener('focusout', function (e) {
      if (!it.contains(e.relatedTarget)) { it.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openItem = items.filter(function (x) { return x.classList.contains('is-open'); })[0];
    if (openItem) { closeAll(null); var b = $('.nav__link', openItem); if (b) b.focus(); }
    if (drawer && !drawer.hidden) closeDrawer();
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('[data-mega]')) closeAll(null);
  });

  /* ---------- drawer ---------- */
  var drawer = $('[data-drawer]');
  var opener = $('[data-drawer-open]');
  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    root.classList.add('drawer-open');
    requestAnimationFrame(function () { drawer.classList.add('is-open'); });
    if (opener) opener.setAttribute('aria-expanded', 'true');
    var c = $('.drawer__close', drawer); if (c) c.focus();
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    root.classList.remove('drawer-open');
    if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus(); }
    setTimeout(function () { drawer.hidden = true; }, 420);
  }
  if (opener) opener.addEventListener('click', openDrawer);
  $$('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeDrawer(); });

  /* ---------- 21+ gate ---------- */
  var gate = $('[data-gate]');
  var KEY = 'tnt-age-ok';
  var ok = false;
  try { ok = localStorage.getItem(KEY) === '1'; } catch (e) { ok = false; }
  if (/[?&]nogate\b/.test(location.search)) ok = true; /* review screenshots */
  if (gate && !ok) {
    gate.hidden = false;
    root.classList.add('gate-open');
    var yes = $('[data-gate-yes]', gate);
    setTimeout(function () { if (yes) yes.focus(); }, 60);
    yes.addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      gate.hidden = true;
      root.classList.remove('gate-open');
      focusMain();
    });
    $('[data-gate-no]', gate).addEventListener('click', function () { $('[data-gate-msg]', gate).hidden = false; });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('[data-reveal], [data-scan]');
  $$('[data-stagger]').forEach(function (g) {
    $$('[data-reveal]', g).forEach(function (el, i) { el.style.setProperty('--d', i); });
  });
  function show(el) {
    el.classList.add('is-in');
    setTimeout(function () { el.classList.add('is-done'); }, 1400 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 80);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // failsafe: anything already in view after load is shown even if the observer never fires
    window.addEventListener('load', function () {
      setTimeout(function () {
        revealEls.forEach(function (el) {
          if (el.classList.contains('is-in')) return;
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) show(el);
        });
      }, 1600);
    });
  }

  /* ---------- parallax: [data-parallax="0.12"] moves against scroll; sun rises ---------- */
  var pEls = reduce ? [] : $$('[data-parallax]');
  var sun = reduce ? [] : $$('[data-sun]');
  function parallax() {
    var vh = window.innerHeight;
    for (var i = 0; i < pEls.length; i++) {
      var el = pEls[i], host = el.parentElement || el;
      var r = host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var f = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (c * -f).toFixed(1) + 'px,0)';
    }
    for (var j = 0; j < sun.length; j++) {
      var s = sun[j], sr = s.parentElement.getBoundingClientRect();
      if (sr.bottom < 0 || sr.top > vh) continue;
      var t = Math.max(0, Math.min(1, (vh - sr.top) / (vh + sr.height)));
      s.style.setProperty('--sun-shift', ((0.5 - t) * 90).toFixed(1) + 'px');
    }
  }

  /* ---------- tilt cards (fine pointers only) ---------- */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
        el.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- neon gauge hover layer (gauge.css): decorative, aria-hidden, added once per card or tile ---------- */
  var HOV_SEL = '[data-tilt], .mega-tile, .mega-feature, .menu-tile, .contact-card, .cta-panel, .hood-link';
  var DIAL_SEL = '.cat, .card--lift, .proto, .mega-tile, .menu-tile, .mega-feature';
  var DIAL = '<span class="gauge"><span class="gauge__fx"><i class="gauge__ticks"></i><i class="gauge__arc"></i></span><i class="gauge__needle"></i></span>';
  $$(HOV_SEL).forEach(function (el) {
    if (el.classList.contains('has-hov')) return;
    el.insertAdjacentHTML('beforeend', '<span class="hov" aria-hidden="true"><span class="hov__meter"></span>' + (el.matches(DIAL_SEL) ? DIAL : '') + '</span>');
    el.classList.add('has-hov');
    el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') el.classList.add('is-hov'); });
    el.addEventListener('pointerleave', function () { el.classList.remove('is-hov'); });
    if (finePointer && !el.hasAttribute('data-tilt')) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
  });

  /* ---------- hero video: source chosen after load (phone or desktop), never under reduced motion ---------- */
  $$('video[data-hero-video]').forEach(function (v) {
    if (reduce) return;
    function start() {
      var phone = window.matchMedia('(max-width: 639px)').matches;
      var src = phone ? v.getAttribute('data-src-phone') : v.getAttribute('data-src');
      if (!src) return;
      v.src = src;
      v.muted = true;
      v.play().then(function () { v.classList.add('is-playing'); }).catch(function () {});
    }
    if (doc.readyState === 'complete') start(); else window.addEventListener('load', start);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (!v.src) return; if (x.isIntersecting) v.play().catch(function () {}); else v.pause(); });
      }).observe(v);
    }
  });

  /* ---------- live New York clock + launch-window dial (the store's own hours; open state from them) ---------- */
  var clocks = $$('[data-clock]'), clocksHm = $$('[data-clock-hm]'), dials = $$('[data-hours]');
  if (clocks.length || clocksHm.length || dials.length) {
    var fmt;
    try { fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'America/New_York' }); } catch (e) { fmt = null; }
    var prevS = null, turns = 0;
    var tick = function () {
      if (!fmt) return;
      var p = {};
      fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var h = (+p.hour) % 24, m = +p.minute, s = +p.second;
      var hh = (h < 10 ? '0' : '') + h, mm = p.minute;
      clocks.forEach(function (c) { c.textContent = hh + ':' + mm + ':' + p.second; });
      clocksHm.forEach(function (c) { c.textContent = hh + ':' + mm; });
      if (prevS !== null && s < prevS) turns++;
      prevS = s;
      var now = h + m / 60 + s / 3600;
      dials.forEach(function (d) {
        var o = parseFloat(d.getAttribute('data-open')), cl = parseFloat(d.getAttribute('data-close'));
        var open = now >= o && now < cl;
        d.style.setProperty('--now', (now * 15).toFixed(2) + 'deg');
        d.style.setProperty('--sec', (turns * 360 + s * 6) + 'deg');
        d.classList.toggle('is-open', open);
        d.classList.toggle('is-closed', !open);
        var st = $('[data-hours-state]', d), nx = $('[data-hours-next]', d);
        if (st) st.textContent = open ? 'Open now' : 'Closed now';
        if (nx) nx.textContent = open ? 'Closes ' + d.getAttribute('data-close-l') : 'Opens ' + d.getAttribute('data-open-l');
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- pause looping decoration off screen ---------- */
  if ('IntersectionObserver' in window) {
    var pauseIO = new IntersectionObserver(function (en) { en.forEach(function (x) { x.target.classList.toggle('is-paused', !x.isIntersecting); }); });
    $$('[data-shine], [data-loop]').forEach(function (el) { pauseIO.observe(el); });
  }

  onScroll();
})();
