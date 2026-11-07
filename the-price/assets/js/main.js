/* The Price: small progressive enhancements. The page works fully without JS. */
(function () {
  'use strict';

  var PHONE = '+447999910101';
  // Opening hours in London time. 0 = Sunday. Minutes from midnight.
  var HOURS = {
    0: [12 * 60, 17 * 60],
    1: [10 * 60 + 30, 20 * 60 + 30],
    2: [10 * 60 + 30, 20 * 60 + 30],
    3: [10 * 60 + 30, 20 * 60 + 30],
    4: [10 * 60 + 30, 20 * 60 + 30],
    5: [10 * 60 + 30, 20 * 60 + 30],
    6: [10 * 60 + 30, 20 * 60 + 30]
  };

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ':' + (m < 10 ? '0' : '') + m : '') + suffix;
  }

  function londonNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(map.weekday);
      return { day: day, mins: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  /* ---------- Open / closed status + today's hours ---------- */
  (function status() {
    var now = londonNow();
    var today = HOURS[now.day];
    var label, open = false;

    if (now.mins >= today[0] && now.mins < today[1]) {
      open = true;
      label = 'Open now · until ' + fmt(today[1]);
    } else {
      // The shop is shut, but WhatsApp support runs 24/7, so say so.
      label = 'Shop closed · WhatsApp us 24/7';
    }
    document.querySelectorAll('[data-status]').forEach(function (el) {
      var txt = el.querySelector('[data-status-text]');
      if (txt) txt.textContent = label;
      el.classList.add(open ? 'is-open' : 'is-closed');
    });
    var row = document.querySelector('[data-hours] tr[data-day="' + now.day + '"]');
    if (row) row.classList.add('today');
  })();

  /* ---------- Header state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header && header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Full-screen menu (header and bottom-bar Menu buttons) ---------- */
  var panel = document.getElementById('menu');
  var openers = document.querySelectorAll('[data-menu-open]');
  var lastOpener = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setExpanded(v) { openers.forEach(function (b) { b.setAttribute('aria-expanded', String(v)); }); }

  function openMenu(opener) {
    if (!panel || !panel.hidden) return;
    lastOpener = opener || null;
    panel.hidden = false;
    document.body.classList.add('menu-open');
    setExpanded(true);
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    var current = panel.querySelector('.menu-list a[aria-current="true"]') || panel.querySelector('.menu-list a');
    if (current) current.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus) {
    if (!panel || panel.hidden) return;
    panel.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    setExpanded(false);
    var hide = function () { panel.hidden = true; };
    if (reduceMotion) hide(); else setTimeout(hide, 260);
    if (restoreFocus !== false && lastOpener) lastOpener.focus({ preventScroll: true });
  }

  if (panel) {
    openers.forEach(function (b) { b.addEventListener('click', function () { openMenu(b); }); });
    panel.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { closeMenu(); }); });
    // Following a section link closes the menu; the browser then scrolls to the section.
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {   // keep keyboard focus inside the open menu
        var f = panel.querySelectorAll('a[href], button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 1181px)').addEventListener('change', function (m) { if (m.matches) closeMenu(false); });
  }

  /* ---------- Floating WhatsApp button appears once the hero buttons scroll out of view ---------- */
  var fab = document.querySelector('.wa-fab');
  var heroCtas = document.querySelector('.hero-ctas');
  if (fab && heroCtas && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      fab.classList.toggle('is-visible', !en[0].isIntersecting && en[0].boundingClientRect.top < 0);
    }).observe(heroCtas);
  } else if (fab) {
    fab.classList.add('is-visible');
  }

  /* ---------- Highlight the section you're reading, in the top links and the menu ---------- */
  var spyLinks = document.querySelectorAll('[data-spy]');
  if ('IntersectionObserver' in window && spyLinks.length) {
    var ids = [];
    spyLinks.forEach(function (a) { var id = a.getAttribute('href').slice(1); if (ids.indexOf(id) < 0) ids.push(id); });
    var setCurrent = function (id) {
      spyLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setCurrent(en.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
    var hero = document.querySelector('.hero');
    if (hero) new IntersectionObserver(function (en) { if (en[0].isIntersecting) setCurrent(''); }, { rootMargin: '-40% 0px -55% 0px' }).observe(hero);
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Buy / sell buttons preselect the quote topic ---------- */
  var issue = document.getElementById('q-issue');
  document.querySelectorAll('[data-topic]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!issue) return;
      var topic = btn.getAttribute('data-topic');
      for (var i = 0; i < issue.options.length; i++) {
        if (issue.options[i].text === topic) { issue.selectedIndex = i; break; }
      }
    });
  });

  /* ---------- Quote form: compose a WhatsApp message (or an SMS) ---------- */
  var form = document.querySelector('[data-quote]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var channel = (e.submitter && e.submitter.getAttribute('data-channel')) || 'whatsapp';
      var model = form.model.value.trim();
      var note = form.querySelector('[data-form-note]');
      if (!model) {
        form.model.focus();
        form.model.setAttribute('aria-invalid', 'true');
        if (note) note.textContent = 'Please add your phone make and model so we can quote accurately.';
        return;
      }
      form.model.removeAttribute('aria-invalid');
      var lines = ['Hi The Price, I\'d like a quote.', 'Phone: ' + model, 'Need: ' + form.issue.value];
      if (form.notes.value.trim()) lines.push('Details: ' + form.notes.value.trim());
      if (form.name.value.trim()) lines.push('Name: ' + form.name.value.trim());
      var body = encodeURIComponent(lines.join('\n'));
      if (channel === 'sms') {
        // "?&body=" is understood by both iOS and Android messaging apps.
        window.location.href = 'sms:' + PHONE + '?&body=' + body;
        if (note) note.textContent = 'Your messages app should open now. On a computer? Use WhatsApp or call 07999 910101.';
      } else {
        // wa.me opens the WhatsApp app on phones and WhatsApp Web on computers.
        window.open('https://wa.me/' + PHONE.replace('+', '') + '?text=' + body, '_blank', 'noopener');
        if (note) note.textContent = 'WhatsApp should open with your message ready to send. Support is available 24/7.';
      }
    });
  }

  /* ---------- Click-to-load map (no Google requests until asked) ---------- */
  var mapBtn = document.querySelector('[data-load-map]');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var wrap = document.querySelector('[data-map]');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://maps.google.com/maps?q=The%20Price%2C%208%20Sutherland%20Ave%2C%20London%20W9%202HQ&z=16&output=embed';
      iframe.title = 'Map showing The Price at 8 Sutherland Avenue, Maida Vale, London W9 2HQ';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      wrap.innerHTML = '';
      wrap.classList.add('is-loaded');
      wrap.appendChild(iframe);
    });
  }

  /* ---------- Footer year ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
