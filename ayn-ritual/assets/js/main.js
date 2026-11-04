/* AYN · A Modern Ritual
   Scroll-driven dallah pour, generated ornament, drink illustrations and site interactions. */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const REDUCED = root.classList.contains('reduced');
  const FINE = matchMedia('(pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const damp = (cur, target, lambda, dt) => lerp(cur, target, 1 - Math.exp(-lambda * dt));
  const r1 = n => Math.round(n * 10) / 10;
  const ease = {
    in: t => t * t * t,
    out: t => 1 - Math.pow(1 - t, 3),
    inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  };

  function svgEl(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Seeded random so generated ornament is identical on every load
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  /* ------------------------------------------------------------------
     Islamic star rosette: star polygons {n/k} layered on rings
     ------------------------------------------------------------------ */
  function starPath(n, k, r, rot = 0) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a1 = rot + (i * 2 * Math.PI) / n;
      const a2 = rot + (((i + k) % n) * 2 * Math.PI) / n;
      d += `M${r1(Math.cos(a1) * r)} ${r1(Math.sin(a1) * r)}L${r1(Math.cos(a2) * r)} ${r1(Math.sin(a2) * r)}`;
    }
    return d;
  }

  function buildRosette(g, s = 1) {
    if (!g) return;
    const layer = (d, o, w = 1, dash) => svgEl('path', { d, 'stroke-opacity': o, 'stroke-width': w, ...(dash ? { 'stroke-dasharray': dash } : {}) }, g);
    const ring = (r, o, w = 1, dash) => svgEl('circle', { r: r * s, 'stroke-opacity': o, 'stroke-width': w, ...(dash ? { 'stroke-dasharray': dash } : {}) }, g);
    ring(340, .2);
    ring(328, .12, 1, '2 7');
    layer(starPath(16, 6, 316 * s), .16);
    layer(starPath(16, 5, 316 * s, Math.PI / 16), .07);
    ring(232, .14);
    layer(starPath(8, 3, 226 * s, Math.PI / 8), .2);
    layer(starPath(12, 5, 150 * s), .1);
    ring(96, .12, 1, '1 5');
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      svgEl('circle', { cx: r1(Math.cos(a) * 352 * s), cy: r1(Math.sin(a) * 352 * s), r: i % 3 ? 1.1 : 2.2, fill: '#d4af37', 'fill-opacity': .35, stroke: 'none' }, g);
    }
  }

  // Tile used by CSS backgrounds (8-point khatam star lattice)
  root.style.setProperty('--pattern', `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='#d4af37' stroke-width='1'><rect x='17' y='17' width='26' height='26'/><rect x='17' y='17' width='26' height='26' transform='rotate(45 30 30)'/><path d='M0 30h11.6M48.4 30H60M30 0v11.6M30 48.4V60M0 0l17 17M60 0L43 17M0 60l17-17M60 60L43 43'/></g></svg>"
  )}")`);

  /* ------------------------------------------------------------------
     Finjan profile helper: half-width of the cup at a given depth
     ------------------------------------------------------------------ */
  const RIM = 24 / 80;
  const cupHW = (() => {
    const P = [[80, 0], [79, 52], [64, 100], [36, 112]];
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80, u = 1 - t;
      const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      pts.push([b.reduce((s, w, j) => s + w * P[j][0], 0), b.reduce((s, w, j) => s + w * P[j][1], 0)]);
    }
    return y => {
      if (y <= 0) return 80;
      for (let i = 1; i < pts.length; i++) {
        if (pts[i][1] >= y) {
          const a = pts[i - 1], b = pts[i];
          return a[0] + (b[0] - a[0]) * ((y - a[1]) / (b[1] - a[1] || 1));
        }
      }
      return 36;
    };
  })();

  function ringArc(y0, inset = 0, steps = 28) {
    const hw = cupHW(y0) - inset;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI;
      d += `${i ? 'L' : 'M'}${r1(-Math.cos(th) * hw)} ${r1(y0 + Math.sin(th) * hw * RIM)}`;
    }
    return d;
  }

  function buildCupOrnament() {
    const g = $('#cupOrnament');
    if (!g) return;
    svgEl('path', { d: ringArc(14, .5), 'stroke-width': 2.4 }, g);
    svgEl('path', { d: ringArc(20, .5), 'stroke-width': .8 }, g);
    svgEl('path', { d: ringArc(60, .5), 'stroke-width': .8 }, g);
    svgEl('path', { d: ringArc(66, .5), 'stroke-width': 1.8 }, g);
    const yMid = 40, hw = cupHW(yMid);
    const n = 11;
    for (let j = 0; j < n; j++) {
      const th = ((j + .5) / n) * Math.PI;
      const x = -Math.cos(th) * hw, y = yMid + Math.sin(th) * hw * RIM;
      const fx = Math.max(.12, Math.sin(th));
      svgEl('path', {
        d: 'M -6 10 L -6 0 Q -6 -8 0 -13 Q 6 -8 6 0 L 6 10 M -2.5 10 L -2.5 2 Q -2.5 -3 0 -6 Q 2.5 -3 2.5 2 L 2.5 10',
        transform: `translate(${r1(x)} ${r1(y)}) scale(${fx.toFixed(3)} 1)`,
        'stroke-width': 1.1,
      }, g);
      if (j < n - 1) {
        const th2 = ((j + 1) / n) * Math.PI;
        const x2 = -Math.cos(th2) * hw, y2 = yMid + Math.sin(th2) * hw * RIM;
        svgEl('path', { d: 'M 0 -4 L 3 0 L 0 4 L -3 0 Z', transform: `translate(${r1(x2)} ${r1(y2 + 4)}) scale(${Math.sin(th2).toFixed(3)} 1)`, fill: '#c9a23c', stroke: 'none' }, g);
      }
    }
    const yDots = 84, hwD = cupHW(yDots);
    for (let j = 0; j <= 18; j++) {
      const th = (j / 18) * Math.PI;
      svgEl('circle', { cx: r1(-Math.cos(th) * hwD), cy: r1(yDots + Math.sin(th) * hwD * RIM), r: 1.3, fill: '#c9a23c', stroke: 'none' }, g);
    }
    const s = $('#saucerMotifs');
    if (s) {
      for (let j = 0; j < 36; j++) {
        const a = (j / 36) * Math.PI * 2;
        svgEl('circle', { cx: r1(Math.cos(a) * 120), cy: r1(128 + Math.sin(a) * 24.5), r: 1.4, fill: '#c9a23c', stroke: 'none' }, s);
      }
    }
  }

  function buildPotEngraving() {
    const g = $('#potEngrave');
    if (!g) return;
    const line = (d, w = 1.3, o) => svgEl('path', { d, 'stroke-width': w, ...(o ? { 'stroke-opacity': o } : {}) }, g);
    line('M -114 -114 Q 0 -98 114 -114', 1.6);
    line('M -112 -108 Q 0 -92 112 -108', .7);
    line('M -106 -62 Q 0 -46 106 -62', 1.6);
    line('M -108 -68 Q 0 -52 108 -68', .7);
    line('M -60 -206 Q 0 -196 60 -206');
    line('M -70 -19 Q 0 -10 70 -19', 1.2);
    line('M -72 -340 Q 0 -332 72 -340');
    line('M -58 -392 Q 0 -384 58 -392');
    line('M -40 -405 Q 0 -398 40 -405', .8);
    for (let x = -96; x <= 96; x += 16) {
      if (Math.abs(x) < 26) continue;
      const k = Math.sqrt(Math.max(.05, 1 - (x / 116) ** 2));
      const base = -64 + 14 * (1 - (x / 110) ** 2);
      svgEl('path', { d: `M ${r1(x - 6 * k)} ${r1(base)} L ${r1(x - 6 * k)} ${r1(base - 12)} Q ${r1(x - 6 * k)} ${r1(base - 20)} ${x} ${r1(base - 26)} Q ${r1(x + 6 * k)} ${r1(base - 20)} ${r1(x + 6 * k)} ${r1(base - 12)} L ${r1(x + 6 * k)} ${r1(base)}`, 'stroke-width': 1 }, g);
    }
    for (const x0 of [-24, -12, 0, 12, 24]) {
      line(`M ${x0 * .9} -266 Q ${r1(x0 * 1.2)} -302 ${r1(x0 * 1.9)} -338`, .9, .45);
    }
    for (let i = 0; i < 9; i++) {
      const x = -48 + i * 12;
      svgEl('circle', { cx: x, cy: r1(-205.5 + 5 * (1 - (x / 60) ** 2)), r: 1.2, fill: '#3a2504', 'fill-opacity': .6, stroke: 'none' }, g);
    }
    const m = $('#potMedallion');
    if (m) {
      svgEl('circle', { r: 22 }, m);
      svgEl('circle', { r: 26, 'stroke-dasharray': '1.5 3.5' }, m);
      svgEl('rect', { x: -12, y: -12, width: 24, height: 24 }, m);
      svgEl('rect', { x: -12, y: -12, width: 24, height: 24, transform: 'rotate(45)' }, m);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        svgEl('path', { d: `M ${r1(Math.cos(a) * 17)} ${r1(Math.sin(a) * 17)} L ${r1(Math.cos(a) * 22)} ${r1(Math.sin(a) * 22)}` }, m);
      }
    }
  }

  buildRosette($('#rosette'));
  buildRosette($('#rosette2'), .62);
  buildCupOrnament();
  buildPotEngraving();

  /* ------------------------------------------------------------------
     Scroll state shared by modules
     ------------------------------------------------------------------ */
  const scroll = { y: scrollY, last: scrollY, vel: 0 };
  addEventListener('scroll', () => { scroll.y = scrollY; }, { passive: true });

  /* ------------------------------------------------------------------
     THE POUR
     ------------------------------------------------------------------ */
  const Pour = (() => {
    const section = $('#ritual');
    if (!section) return null;
    const pot = $('#pot');
    const stream = $('#stream'), streamHi = $('#streamHi'), streamGlow = $('#streamGlow');
    const surf = $('#qSurface'), sheen = $('#qSheen'), surfClip = $('#surfaceClipEl');
    const ripplesG = $('#ripples'), splashG = $('#splash');
    const steam = $('#steam'), wisps = $$('.steam-wisp', steam);
    const intro = $('#pourIntro');
    const captions = $$('.caption', section);
    const rail = $$('.rail li', section), railFill = $('#railFill');
    const rosette = $('#rosette'), haloText = $('.halo-text');

    const CUP = { x: 360, y: 742 };
    const POT = { x: 650, y: 470, s: .82 };
    const PIVOT = { x: 0, y: -230 };
    const TIP = { x: -249, y: -405 };
    const SPOUT_DIR = (() => { const dx = -99, dy = -125, l = Math.hypot(dx, dy); return { x: dx / l, y: dy / l }; })();

    let p = 0, target = 0, inView = true, readyAt = null;

    const drops = Array.from({ length: 44 }, () => ({ n: svgEl('circle', { r: 0 }, splashG), life: 0 }));
    const rings = Array.from({ length: 5 }, () => ({ n: svgEl('ellipse', { rx: 0, ry: 0, 'stroke-width': 1.2, opacity: 0 }, ripplesG), age: 9 }));
    let dropAcc = 0, ringAcc = 0, dropIdx = 0, ringIdx = 0;

    function pose(pp, t, entrance) {
      const tin = ease.inOut(range(pp, .06, .3));
      const tout = ease.inOut(range(pp, .8, .95));
      const hold = range(pp, .31, .8);
      const k = tin * (1 - tout);
      const angle = -(60 * tin + 8 * hold) * (1 - tout);
      const bob = Math.sin(t * 1.25) * 6 * (1 - k);
      return { angle, x: POT.x - 36 * k, y: POT.y + 24 * k + bob - (1 - entrance) * 70, k };
    }

    function rot(v, deg) {
      const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
      return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
    }

    function tipOf(ps) {
      const v = rot({ x: (TIP.x - PIVOT.x) * POT.s, y: (TIP.y - PIVOT.y) * POT.s }, ps.angle);
      return { x: ps.x + v.x, y: ps.y + v.y };
    }

    const TAIL_TIP = tipOf(pose(.8, 0, 1));
    const TAIL_DIR = rot(SPOUT_DIR, pose(.8, 0, 1).angle);

    function streamShape(T, C, L, a, b, w0, w1, t) {
      if (b - a < .004) return ['', ''];
      const N = 28, left = [], right = [], hi = [];
      for (let i = 0; i <= N; i++) {
        const s = a + ((b - a) * i) / N, u = 1 - s;
        const x = u * u * T.x + 2 * u * s * C.x + s * s * L.x;
        const y = u * u * T.y + 2 * u * s * C.y + s * s * L.y;
        let tx = 2 * u * (C.x - T.x) + 2 * s * (L.x - C.x);
        let ty = 2 * u * (C.y - T.y) + 2 * s * (L.y - C.y);
        const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
        const w = (lerp(w0, w1, s) * (1 + .12 * Math.sin(t * 12 + s * 19))) / 2;
        const wob = Math.sin(t * 7.5 + s * 13) * 1.3 * s;
        left.push([x - ty * w + wob, y + tx * w]);
        right.push([x + ty * w + wob, y - tx * w]);
        hi.push([x - ty * w * .35 + wob, y + tx * w * .35]);
      }
      let d = `M${r1(left[0][0])} ${r1(left[0][1])}`;
      for (let i = 1; i <= N; i++) d += `L${r1(left[i][0])} ${r1(left[i][1])}`;
      for (let i = N; i >= 0; i--) d += `L${r1(right[i][0])} ${r1(right[i][1])}`;
      let h = `M${r1(hi[2][0])} ${r1(hi[2][1])}`;
      for (let i = 3; i < N - 2; i++) h += `L${r1(hi[i][0])} ${r1(hi[i][1])}`;
      return [d + 'Z', h];
    }

    function controlPoint(T, L, dir) {
      const dx = L.x - T.x;
      let cy;
      if (dir.x < -.08 && dx < -2) cy = T.y + (dir.y / dir.x) * (dx / 2);
      else cy = T.y + (L.y - T.y) * .2;
      cy = clamp(cy, T.y - 24, T.y + (L.y - T.y) * .55);
      return { x: T.x + dx / 2, y: cy };
    }

    function steamPath(baseX, baseY, t, phase, height) {
      let d = '';
      const n = 12;
      for (let j = 0; j <= n; j++) {
        const f = j / n;
        const y = baseY - f * height;
        const x = baseX + Math.sin(t * .9 + f * 5.2 + phase) * (3 + f * 18) + Math.sin(t * .37 + phase * 2) * f * 10;
        d += `${j ? 'L' : 'M'}${r1(x)} ${r1(y)}`;
      }
      return d;
    }

    function setVis(elm, v, dy) {
      elm.style.opacity = v.toFixed(3);
      elm.style.visibility = v > .005 ? 'visible' : 'hidden';
      elm.style.setProperty('--cy', `${dy.toFixed(1)}px`);
      elm.style.setProperty('--blur', `${((1 - v) * 7).toFixed(2)}px`);
    }

    function render(t, dt, live) {
      const entrance = readyAt === null ? (REDUCED ? 1 : 0) : ease.out(clamp((performance.now() - readyAt) / 1700));
      const ps = pose(p, t, entrance);
      pot.setAttribute('transform', `translate(${r1(ps.x)} ${r1(ps.y)}) rotate(${ps.angle.toFixed(2)}) scale(${POT.s}) translate(${-PIVOT.x} ${-PIVOT.y})`);
      pot.setAttribute('opacity', entrance.toFixed(3));

      // Liquid level inside the finjan (local cup coordinates)
      const fill = .9 * ease.sine(range(p, .31, .88));
      const sY = 106 - fill * 94;
      const srx = Math.max(0, cupHW(sY) - 2.5), sry = srx * RIM;
      surf.setAttribute('cy', r1(sY)); surf.setAttribute('rx', r1(srx)); surf.setAttribute('ry', r1(sry));
      surfClip.setAttribute('cy', r1(sY)); surfClip.setAttribute('rx', r1(srx)); surfClip.setAttribute('ry', r1(sry));

      // Stream
      const head = ease.in(range(p, .235, .31));
      const tail = ease.in(range(p, .8, .87));
      const flow = ease.out(range(p, .23, .27)) * (1 - range(p, .77, .8) * .55);
      const T = tail > 0 ? TAIL_TIP : tipOf(ps);
      const dir = tail > 0 ? TAIL_DIR : rot(SPOUT_DIR, ps.angle);
      const wob = Math.sin(t * 2.3) * 1.5;
      const L = { x: CUP.x - 6 + wob, y: CUP.y + sY - sry * .3 };
      const C = controlPoint(T, L, dir);
      const active = head > 0 && tail < 1;
      if (active) {
        const [d, h] = streamShape(T, C, L, tail, head, 13 * flow, 6.5 * flow, t);
        stream.setAttribute('d', d); streamHi.setAttribute('d', h); streamGlow.setAttribute('d', d);
      } else {
        stream.setAttribute('d', ''); streamHi.setAttribute('d', ''); streamGlow.setAttribute('d', '');
      }

      const landing = head >= 1 && tail < 1;
      sheen.setAttribute('cy', r1(sY - sry * .25));
      sheen.setAttribute('rx', r1(srx * .32)); sheen.setAttribute('ry', r1(sry * .25));
      sheen.setAttribute('opacity', (fill > .02 ? .22 + (landing ? .2 : 0) : 0).toFixed(2));

      // Splash droplets and surface ripples
      if (live && landing) {
        dropAcc += dt * 46 * flow;
        while (dropAcc > 1) {
          dropAcc -= 1;
          const d = drops[dropIdx++ % drops.length];
          d.x = L.x + (Math.random() - .5) * 6; d.y = L.y - 2;
          d.vx = (Math.random() - .5) * 120; d.vy = -60 - Math.random() * 120;
          d.life = d.max = .35 + Math.random() * .3; d.r = 1 + Math.random() * 1.8;
        }
        ringAcc += dt;
        if (ringAcc > .2) {
          ringAcc = 0;
          const rg = rings[ringIdx++ % rings.length];
          rg.age = 0; rg.cx = L.x - CUP.x; rg.cy = L.y - CUP.y;
        }
      }
      for (const d of drops) {
        if (d.life > 0 && live) {
          d.life -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
          const k = clamp(d.life / d.max);
          d.n.setAttribute('cx', r1(d.x)); d.n.setAttribute('cy', r1(d.y));
          d.n.setAttribute('r', (d.r * (.4 + .6 * k)).toFixed(2)); d.n.setAttribute('opacity', k.toFixed(2));
        } else if (d.n.getAttribute('r') !== '0') {
          d.n.setAttribute('r', 0);
        }
      }
      for (const rg of rings) {
        if (rg.age < .9 && live) {
          rg.age += dt;
          const rx = 3 + rg.age * 70;
          rg.n.setAttribute('cx', r1(rg.cx)); rg.n.setAttribute('cy', r1(rg.cy));
          rg.n.setAttribute('rx', r1(rx)); rg.n.setAttribute('ry', r1(rx * RIM));
          rg.n.setAttribute('opacity', ((1 - rg.age / .9) * .55).toFixed(2));
        } else if (rg.n.getAttribute('opacity') !== '0') {
          rg.n.setAttribute('opacity', 0);
        }
      }

      // Steam rises once the cup holds coffee
      const steamAmt = range(p, .5, .92);
      steam.setAttribute('opacity', (steamAmt * .6).toFixed(3));
      if (steamAmt > 0) {
        const baseY = Math.min(sY, 24) - 6;
        wisps.forEach((w, i) => {
          w.setAttribute('d', steamPath(-26 + i * 24, baseY, t, i * 2.1, 150 + i * 26));
          w.setAttribute('stroke-width', (7 - i).toString());
          w.setAttribute('stroke-opacity', (.75 - i * .15).toFixed(2));
        });
      }

      rosette.setAttribute('transform', `rotate(${(p * 70 + t * 1.6).toFixed(2)})`);
      haloText.setAttribute('transform', `rotate(${(-p * 110 - t * 2.4).toFixed(2)})`);

      // Words (static and fully visible when motion is reduced)
      if (REDUCED) return;
      const vi = 1 - ease.in(range(p, .015, .07));
      setVis(intro, vi, -(1 - vi) * 50);
      captions.forEach((c, i) => {
        const a = +c.dataset.in, b = +c.dataset.out;
        const vin = ease.out(range(p, a, a + .05));
        const vout = 1 - ease.in(range(p, b - .05, b));
        setVis(c, vin * vout, (1 - vin) * 36 - (1 - vout) * 36);
        if (rail[i]) rail[i].classList.toggle('is-on', p >= a);
      });
      railFill.style.setProperty('--p', p.toFixed(4));
    }

    function measure() {
      const r = section.getBoundingClientRect();
      const total = r.height - innerHeight;
      target = total > 0 ? clamp(-r.top / total) : 0;
      inView = r.bottom > -50 && r.top < innerHeight + 50;
    }

    if (REDUCED) {
      p = .62;
      render(0, 0, false);
    }

    return {
      ready() { readyAt = performance.now(); },
      update(t, dt) {
        if (REDUCED) return;
        measure();
        p = damp(p, target, 5.5, dt);
        if (Math.abs(p - target) < .00005) p = target;
        if (inView) render(t, dt, true);
      },
    };
  })();

  /* ------------------------------------------------------------------
     SIGNATURE DRINKS: arched niches with generated glasses
     ------------------------------------------------------------------ */
  const GLASS = { cx: 150, top: 120, bottom: 352, innerTop: 122, innerBottom: 338, full: 190 };
  const innerHW = y => lerp(45, 57, (GLASS.innerBottom - y) / (GLASS.innerBottom - GLASS.innerTop));

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = s => clamp(Math.round(((n >> s) & 255) + (amt > 0 ? (255 - ((n >> s) & 255)) * amt : ((n >> s) & 255) * amt)), 0, 255);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  }

  function buildGlass(card, i) {
    const svg = $('.sig-card__svg', card);
    const spec = JSON.parse(card.dataset.drink);
    const rand = rng(97 + i * 131);
    const id = `g${i}`;
    const defs = svgEl('defs', {}, svg);

    const lg = svgEl('linearGradient', { id: `${id}l`, gradientUnits: 'userSpaceOnUse', x1: 0, y1: GLASS.innerBottom, x2: 0, y2: GLASS.innerBottom - GLASS.full }, defs);
    let acc = 0;
    const bounds = [];
    spec.layers.forEach(([col, f], j) => {
      const s = acc, e = j === spec.layers.length - 1 ? 1 : acc + f;
      const bl = .03;
      svgEl('stop', { offset: j === 0 ? 0 : (s + bl).toFixed(3), 'stop-color': col }, lg);
      svgEl('stop', { offset: (j === spec.layers.length - 1 ? 1 : e - bl).toFixed(3), 'stop-color': col }, lg);
      bounds.push([s, acc + f, col]);
      acc += f;
    });
    const total = acc;

    const gg = svgEl('linearGradient', { id: `${id}g`, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [[0, .2], [.12, .06], [.5, .02], [.82, .08], [1, .22]].forEach(([o, a]) => svgEl('stop', { offset: o, 'stop-color': '#fff', 'stop-opacity': a }, gg));
    const sg = svgEl('linearGradient', { id: `${id}s`, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [['#7a5514', 0], ['#f6e3a1', .45], ['#b88a2c', .75], ['#5c410f', 1]].forEach(([c, o]) => svgEl('stop', { offset: o, 'stop-color': c }, sg));
    const glow = svgEl('radialGradient', { id: `${id}r`, cx: .5, cy: .45, r: .55 }, defs);
    svgEl('stop', { offset: 0, 'stop-color': spec.layers[spec.layers.length - 1][0], 'stop-opacity': .28 }, glow);
    svgEl('stop', { offset: 1, 'stop-color': spec.layers[spec.layers.length - 1][0], 'stop-opacity': 0 }, glow);
    const cp = svgEl('clipPath', { id: `${id}c` }, defs);
    svgEl('path', { d: 'M 93 122 L 207 122 L 195 335 Q 194 338 191 338 L 109 338 Q 106 338 105 335 Z' }, cp);

    // Niche
    svgEl('path', { class: 'arch-fill', d: 'M 6 398 L 6 150 C 6 82, 72 34, 150 4 C 228 34, 294 82, 294 150 L 294 398 Z' }, svg);
    svgEl('path', { class: 'arch-line', d: 'M 6 398 L 6 150 C 6 82, 72 34, 150 4 C 228 34, 294 82, 294 150 L 294 398 Z' }, svg);
    svgEl('path', { class: 'arch-line arch-line--inner', d: 'M 20 384 L 20 154 C 20 94, 80 50, 150 22 C 220 50, 280 94, 280 154 L 280 384 Z' }, svg);
    const ros = svgEl('g', { transform: 'translate(150 214)', fill: 'none', stroke: '#d4af37', class: 'sig-card__rosette' }, svg);
    svgEl('path', { d: starPath(16, 6, 118), 'stroke-opacity': .09 }, ros);
    svgEl('path', { d: starPath(8, 3, 84, Math.PI / 8), 'stroke-opacity': .12 }, ros);
    svgEl('circle', { r: 122, 'stroke-opacity': .08 }, ros);
    svgEl('path', { d: 'M150 -8 L154 2 L164 4 L154 8 L150 18 L146 8 L136 4 L146 2 Z', fill: '#d4af37', transform: 'translate(0 -2)' }, svg);
    svgEl('ellipse', { cx: 150, cy: 236, rx: 120, ry: 150, fill: `url(#${id}r)` }, svg);

    // Shadow and back rim
    svgEl('ellipse', { cx: 150, cy: 356, rx: 74, ry: 9, fill: '#000', opacity: .55, filter: 'url(#fSoft)' }, svg);
    svgEl('ellipse', { cx: 150, cy: 120, rx: 62, ry: 9, fill: 'rgba(255,255,255,.03)', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 1 }, svg);

    // Contents
    const inside = svgEl('g', { 'clip-path': `url(#${id}c)` }, svg);
    const liquid = svgEl('rect', { x: 80, width: 140, y: GLASS.innerBottom, height: 0, fill: `url(#${id}l)` }, inside);
    if (spec.top === 'drizzle') {
      // Caramel ribbons clinging to the inner wall, seen through the drink
      for (let k = 0; k < 5; k++) {
        const x0 = 100 + k * 25 + rand() * 8;
        let d = `M ${r1(x0)} ${GLASS.innerBottom - total * GLASS.full + 6}`;
        for (let y = 196; y <= 330; y += 16) d += ` Q ${r1(x0 + (rand() - .5) * 22)} ${y - 8} ${r1(x0 + (rand() - .5) * 10)} ${y}`;
        svgEl('path', { d, fill: 'none', stroke: '#8f5420', 'stroke-width': 2.4 + rand() * 1.6, 'stroke-opacity': .6, 'stroke-linecap': 'round' }, inside);
      }
    }
    if (spec.top === 'cloud') {
      const cloudG = svgEl('g', { class: 'cloud', fill: '#eef0f6', opacity: .92 }, inside);
      const yb = GLASS.innerBottom - bounds[0][1] * GLASS.full;
      for (let x = 96; x <= 204; x += 13) svgEl('circle', { cx: x + rand() * 6, cy: r1(yb + 6 + rand() * 8), r: 8 + rand() * 7 }, cloudG);
    }
    const surface = svgEl('ellipse', { cx: 150, cy: GLASS.innerBottom, rx: 0, ry: 0, opacity: 0 }, inside);
    const ice = [];
    if (spec.ice) {
      [[124, 178, -14, 30], [170, 192, 20, 28], [146, 222, 8, 26], [112, 246, 30, 22]].forEach(([x, y, rt, s], k) => {
        const g = svgEl('g', { class: 'ice', style: `--d:${(.25 + k * .14).toFixed(2)}s` }, inside);
        const inner = svgEl('g', { transform: `translate(${x} ${y}) rotate(${rt})` }, g);
        svgEl('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: 5, fill: 'rgba(255,255,255,.16)', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1 }, inner);
        svgEl('path', { d: `M ${-s / 2 + 5} ${-s / 2 + 8} L ${-s / 2 + 5} ${s / 2 - 10} M ${-s / 2 + 8} ${-s / 2 + 5} L ${s / 2 - 10} ${-s / 2 + 5}`, stroke: 'rgba(255,255,255,.7)', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, inner);
        ice.push(g);
      });
    }
    let crunch;
    if (spec.top === 'crunch') {
      crunch = svgEl('g', { class: 'crunch' }, inside);
      const cols = ['#9fb05a', '#cdbb7c', '#6f7f39', '#e2d3a0'];
      for (let k = 0; k < 34; k++) {
        const x = 98 + rand() * 104, y = rand() * 10 - 4, s = 2 + rand() * 4;
        svgEl('path', { d: `M ${r1(x)} ${r1(y)} l ${r1(s)} ${r1(-s * .4)} l ${r1(-s * .3)} ${r1(s)} z`, fill: cols[k % cols.length] }, crunch);
      }
    }
    if (spec.straw) {
      svgEl('path', { d: 'M 178 334 L 204 64', stroke: `url(#${id}s)`, 'stroke-width': 9, 'stroke-linecap': 'round' }, svg);
      svgEl('path', { d: 'M 176 300 L 199 70', stroke: '#fff7d8', 'stroke-opacity': .55, 'stroke-width': 1.4, 'stroke-linecap': 'round' }, svg);
    }

    // Glass body
    svgEl('path', { d: 'M 88 120 L 212 120 L 200 346 Q 199 352 192 352 L 108 352 Q 101 352 100 346 Z', fill: `url(#${id}g)`, stroke: 'rgba(255,255,255,.42)', 'stroke-width': 1.2 }, svg);
    svgEl('path', { d: 'M 104 340 Q 150 348 196 340', fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1 }, svg);
    svgEl('path', { d: 'M 99 138 L 93 330', stroke: 'rgba(255,255,255,.32)', 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    svgEl('path', { d: 'M 108 140 L 104 300', stroke: 'rgba(255,255,255,.16)', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, svg);
    svgEl('path', { d: 'M 201 150 L 196 320', stroke: 'rgba(255,255,255,.14)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, svg);
    svgEl('path', { d: 'M 88 120 A 62 9 0 0 0 212 120', fill: 'none', stroke: 'rgba(255,255,255,.6)', 'stroke-width': 1.3 }, svg);
    if (spec.ice) {
      for (let k = 0; k < 26; k++) {
        const y = 150 + rand() * 190, x = lerp(92, 98, rand()) + (rand() > .5 ? 0 : 1) * (lerp(208, 196, (y - 120) / 232) - 92) * (.92 + rand() * .08);
        svgEl('circle', { cx: r1(x), cy: r1(y), r: r1(.7 + rand() * 1.6), fill: '#fff', opacity: r1(.18 + rand() * .3) }, svg);
      }
    }
    if (spec.top === 'peach') {
      const pg = svgEl('g', { transform: 'translate(204 118) rotate(28)' }, svg);
      svgEl('path', { d: 'M -26 0 A 26 26 0 0 0 26 0 Z', fill: '#f0a266' }, pg);
      svgEl('path', { d: 'M -21 2 A 21 21 0 0 0 21 2 Z', fill: '#f7c890' }, pg);
      svgEl('path', { d: 'M -26 0 A 26 26 0 0 0 26 0', fill: 'none', stroke: '#c9542a', 'stroke-width': 2.4 }, pg);
    }

    const H = total * GLASS.full;
    const colorAt = frac => { for (const [s, e, c] of bounds) if (frac <= e + .001) return c; return bounds[bounds.length - 1][2]; };

    function setLevel(k) {
      const h = H * k, y = GLASS.innerBottom - h;
      liquid.setAttribute('y', r1(y)); liquid.setAttribute('height', r1(h));
      const rx = innerHW(y) + 1, ry = rx * .14;
      surface.setAttribute('cy', r1(y)); surface.setAttribute('rx', r1(rx)); surface.setAttribute('ry', r1(ry));
      surface.setAttribute('fill', shade(colorAt((h / GLASS.full) - .01), .16));
      surface.setAttribute('opacity', k > .02 ? 1 : 0);
      if (crunch) {
        crunch.setAttribute('transform', `translate(0 ${r1(y)})`);
        crunch.setAttribute('opacity', clamp((k - .9) * 10).toFixed(2));
      }
    }
    setLevel(0);

    let poured = false;
    function pour() {
      if (poured) return;
      poured = true;
      svg.classList.add('is-poured');
      if (REDUCED) { setLevel(1); return; }
      const t0 = performance.now(), dur = 2000;
      const step = now => {
        const k = clamp((now - t0) / dur);
        setLevel(ease.inOut(k));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    return { pour };
  }

  const Sigs = (() => {
    const sec = $('#signatures');
    if (!sec) return null;
    const viewport = $('.sig__viewport', sec), track = $('#sigTrack');
    const cards = $$('.sig-card', sec);
    const now = $('#sigNow'), bar = $('#sigBar');
    const glasses = cards.map((c, i) => buildGlass(c, i));
    let pinned = false, max = 0, p = 0;

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          glasses[cards.indexOf(en.target)].pour();
          io.unobserve(en.target);
        }
      });
    }, { threshold: .35 });
    cards.forEach(c => io.observe(c));

    if (FINE && !REDUCED) {
      cards.forEach(card => {
        const arch = $('.sig-card__arch', card);
        card.addEventListener('pointermove', e => {
          const r = arch.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          arch.style.transform = `translateY(-8px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`;
        });
        card.addEventListener('pointerleave', () => { arch.style.transform = ''; });
      });
    }

    function layout() {
      pinned = innerWidth >= 900 && !REDUCED;
      sec.classList.toggle('is-pinned', pinned);
      track.style.transform = '';
      if (pinned) {
        max = Math.max(0, track.scrollWidth - viewport.clientWidth);
        sec.style.height = `${Math.round(max + innerHeight)}px`;
      } else {
        sec.style.height = '';
      }
    }

    function update(dt) {
      if (pinned) {
        const r = sec.getBoundingClientRect();
        const total = r.height - innerHeight;
        const target = total > 0 ? clamp(-r.top / total) : 0;
        p = REDUCED ? target : damp(p, target, 7, dt);
        if (r.bottom < -50 || r.top > innerHeight + 50) return;
        track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
      } else {
        const m = viewport.scrollWidth - viewport.clientWidth;
        p = m > 0 ? viewport.scrollLeft / m : 0;
      }
      bar.style.setProperty('--p', p.toFixed(4));
      now.textContent = String(Math.min(cards.length, 1 + Math.floor(p * cards.length * .999))).padStart(2, '0');
    }

    return { layout, update };
  })();

  /* ------------------------------------------------------------------
     Marquee: drifts constantly, quickens with scroll velocity
     ------------------------------------------------------------------ */
  const Marquee = (() => {
    const track = $('#marquee');
    if (!track) return null;
    const set = $('.marquee__set', track);
    let w = 0, x = 0, skew = 0;
    function layout() {
      $$('.marquee__set', track).slice(1).forEach(n => n.remove());
      w = set.getBoundingClientRect().width || 1;
      const copies = Math.ceil(innerWidth / w) + 1;
      for (let i = 0; i < copies; i++) {
        const c = set.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      }
    }
    function update(dt) {
      if (REDUCED) return;
      const v = scroll.vel;
      x -= (46 + Math.min(900, Math.abs(v)) * .35) * dt * (v < -2 ? -1 : 1);
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      skew = damp(skew, clamp(v * -.012, -6, 6), 6, dt);
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }
    return { layout, update };
  })();

  /* ------------------------------------------------------------------
     Gold motes drifting through the page
     ------------------------------------------------------------------ */
  const Motes = (() => {
    const cv = $('#motes');
    if (!cv || REDUCED) return null;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, parts = [];
    function layout() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 700 ? 34 : 72;
      const rand = rng(7);
      parts = Array.from({ length: n }, () => ({
        x: rand() * W, y: rand() * H, z: .25 + rand() * .75,
        r: .4 + rand() * 1.6, ph: rand() * 6.28, sp: 6 + rand() * 16,
      }));
    }
    function update(t, dt) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const dy = scroll.vel * dt;
      for (const m of parts) {
        m.y -= (m.sp * m.z) * dt + dy * m.z * .25;
        m.x += Math.sin(t * .4 + m.ph) * .18 * m.z;
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        if (m.y > H + 10) { m.y = -10; m.x = Math.random() * W; }
        const a = (.25 + .55 * (.5 + .5 * Math.sin(t * 1.3 + m.ph))) * m.z;
        ctx.fillStyle = `rgba(232,196,104,${(a * .55).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * m.z * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,240,200,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * m.z, 0, Math.PI * 2); ctx.fill();
      }
    }
    return { layout, update };
  })();

  /* ------------------------------------------------------------------
     Cursor
     ------------------------------------------------------------------ */
  const Cursor = (() => {
    if (!FINE || REDUCED) return null;
    root.classList.add('has-cursor');
    const c = $('.cursor'), ring = $('.cursor__ring'), dot = $('.cursor__dot');
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, r = { ...m };
    addEventListener('pointermove', e => { m.x = e.clientX; m.y = e.clientY; c.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.add('is-hidden'));
    document.addEventListener('pointerover', e => {
      c.classList.toggle('is-hover', !!e.target.closest('a, button, .page__btn, .sig-card, input, textarea'));
    });
    return {
      update(dt) {
        r.x = damp(r.x, m.x, 14, dt); r.y = damp(r.y, m.y, 14, dt);
        dot.style.transform = `translate3d(${m.x}px,${m.y}px,0)`;
        ring.style.transform = `translate3d(${r.x.toFixed(1)}px,${r.y.toFixed(1)}px,0)`;
      },
    };
  })();

  /* ------------------------------------------------------------------
     Text reveals
     ------------------------------------------------------------------ */
  $$('[data-split]').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span class="wi" style="--i:${i}">${w}</span></span>`).join(' ');
  });
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-split]').forEach((n, i) => {
    if (n.matches('.panel')) n.style.setProperty('--d', `${(i % 2) * .12}s`);
    revealIO.observe(n);
  });

  /* ------------------------------------------------------------------
     Navigation, drawer, active states
     ------------------------------------------------------------------ */
  const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer');
  function setDrawer(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false); });

  const navLinks = $$('[data-nav]');
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['ritual', 'signatures', 'menu', 'book', 'visit'].forEach(id => { const s = document.getElementById(id); if (s) sectionIO.observe(s); });

  const chips = $$('.chip');
  const panelIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      chips.forEach(c => c.classList.toggle('is-active', c.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  $$('.panel').forEach(p => panelIO.observe(p));

  /* ------------------------------------------------------------------
     Menu book and lightbox
     ------------------------------------------------------------------ */
  const bookRail = $('#bookRail');
  const pageBtns = $$('.page__btn');
  pageBtns.forEach(btn => {
    const img = $('img', btn);
    const fail = () => { btn.classList.add('is-broken'); btn.dataset.label = img.alt.replace(/^Menu page \d+: /, ''); };
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener('error', fail);
  });
  const stepBook = dir => bookRail.scrollBy({ left: dir * bookRail.clientWidth * .8, behavior: REDUCED ? 'auto' : 'smooth' });
  $('#bookPrev').addEventListener('click', () => stepBook(-1));
  $('#bookNext').addEventListener('click', () => stepBook(1));

  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbIndex = 0;
  function showPage(i) {
    lbIndex = (i + pageBtns.length) % pageBtns.length;
    const img = $('img', pageBtns[lbIndex]);
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${pageBtns.length} · ${img.alt.replace(/^Menu page \d+: /, '')}`;
  }
  pageBtns.forEach((btn, i) => btn.addEventListener('click', () => {
    showPage(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else window.open($('img', btn).src, '_blank', 'noopener');
  }));
  $('#lbClose').addEventListener('click', () => lb.close());
  $('#lbPrev').addEventListener('click', () => showPage(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showPage(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') showPage(lbIndex - 1);
    if (e.key === 'ArrowRight') showPage(lbIndex + 1);
  });

  /* ------------------------------------------------------------------
     Contact form: composes an email to the café
     ------------------------------------------------------------------ */
  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    let ok = true;
    ['name', 'email', 'message'].forEach(k => {
      const input = form.elements[k];
      const bad = !String(data.get(k) || '').trim() || (k === 'email' && !input.checkValidity());
      input.closest('.field').classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { status.textContent = 'Please add your name, a valid email and a message.'; return; }
    const subject = String(data.get('subject') || '').trim() || 'Enquiry from the Ayn website';
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nContact Number: ${data.get('phone') || '-'}\n\n${data.get('message')}`;
    location.href = `mailto:admin@aynritual.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app with your message ready to send.';
  });

  /* ------------------------------------------------------------------
     Layout, loader and the frame loop
     ------------------------------------------------------------------ */
  function layout() {
    Sigs && Sigs.layout();
    Marquee && Marquee.layout();
    Motes && Motes.layout();
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { Marquee && Marquee.layout(); Sigs && Sigs.layout(); });

  const loader = $('#loader'), loaderBar = $('#loaderBar');
  const t0 = performance.now();
  function finishLoading() {
    const wait = REDUCED ? 0 : Math.max(0, 2100 - (performance.now() - t0));
    loaderBar && (loaderBar.style.transform = 'scaleX(1)');
    setTimeout(() => {
      loader && loader.classList.add('is-done');
      root.classList.add('is-ready');
      Pour && Pour.ready();
    }, wait);
  }
  if (loaderBar) requestAnimationFrame(() => { loaderBar.style.transform = 'scaleX(.55)'; });
  Promise.race([
    Promise.all([new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }))), document.fonts ? document.fonts.ready : Promise.resolve()]),
    new Promise(r => setTimeout(r, 3500)),
  ]).then(finishLoading);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const dy = scroll.y - scroll.last;
    scroll.last = scroll.y;
    scroll.vel = damp(scroll.vel, dt > 0 ? dy / dt : 0, 10, dt);

    nav.classList.toggle('is-scrolled', scroll.y > 30);
    Pour && Pour.update(t, dt);
    Sigs && Sigs.update(dt);
    Marquee && Marquee.update(dt);
    Motes && !document.hidden && Motes.update(t, dt);
    Cursor && Cursor.update(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
