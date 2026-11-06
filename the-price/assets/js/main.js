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
    var el = document.querySelector('[data-status]');
    var txt = document.querySelector('[data-status-text]');
    var today = HOURS[now.day];
    var label, open = false;

    if (now.mins >= today[0] && now.mins < today[1]) {
      open = true;
      label = 'Open now · until ' + fmt(today[1]);
    } else if (now.mins < today[0]) {
      label = 'Closed · opens ' + fmt(today[0]) + ' today';
    } else {
      var next = (now.day + 1) % 7;
      label = 'Closed · opens ' + fmt(HOURS[next][0]) + ' tomorrow';
    }
    if (el && txt) {
      txt.textContent = label;
      el.classList.add(open ? 'is-open' : 'is-closed');
    }
    var row = document.querySelector('[data-hours] tr[data-day="' + now.day + '"]');
    if (row) row.classList.add('today');
  })();

  /* ---------- Header state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header && header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
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

  /* ---------- Quote form: compose an SMS ---------- */
  var form = document.querySelector('[data-quote]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
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
      // "?&body=" is understood by both iOS and Android messaging apps.
      window.location.href = 'sms:' + PHONE + '?&body=' + body;
      if (note) note.textContent = 'Your messages app should open now. On a computer? Call us on 07999 910101 instead.';
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
