(() => {
  const hero = document.getElementById('hero'), btn = document.getElementById('char'), bubble = document.getElementById('bubble');
  const greetings = ["Salut, moi c'est Doha !", "Faisons quelque chose d'audacieux.", "Psst — je cherche une alternance.", "Ok, tu peux arrêter de me chatouiller :)"];

  /* Lettres du titre : chaque lettre réagit au survol */
  document.querySelectorAll('.sp').forEach(el => {
    el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  });

  /* La pièce en perspective */
  const x0 = 95, x1 = 905, y0 = 85, y1 = 865, vx = 500, vy = 475, cols = 14, rows = 11;
  const seg = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  const out = (x, y) => {
    const dx = x - vx, dy = y - vy;
    const t = Math.min(dx > 0 ? (1000 - x) / dx : dx < 0 ? -x / dx : 1e9, dy > 0 ? (1000 - y) / dy : dy < 0 ? -y / dy : 1e9);
    return seg(x, y, x + dx * t, y + dy * t);
  };
  let g = '';
  for (let i = 0; i <= cols; i++) { const x = x0 + (x1 - x0) * i / cols; g += seg(x, y0, x, y1) + out(x, y0) + out(x, y1); }
  for (let j = 0; j <= rows; j++) { const y = y0 + (y1 - y0) * j / rows; g += seg(x0, y, x1, y) + out(x0, y) + out(x1, y); }
  [1.07, 1.16, 1.28, 1.45, 1.7].forEach(s => {
    const l = vx + (x0 - vx) * s, r = vx + (x1 - vx) * s, t = vy + (y0 - vy) * s, b = vy + (y1 - vy) * s;
    g += `<path d="M${l} ${t}H${r}V${b}H${l}Z"/>`;
  });
  document.getElementById('room').innerHTML = `<g stroke="currentColor" stroke-width=".8" fill="none" opacity=".12">${g}</g>`;

  /* La fleur */
  let d = '';
  for (let i = 0; i <= 180; i++) {
    const a = i / 180 * Math.PI * 2, k = Math.floor((a + Math.PI / 5) / (Math.PI * 2) * 5) % 5;
    const r = 50 * (0.3 + 0.7 * Math.pow(Math.abs(Math.cos(a * 2.5)), 0.9) * [1, .84, .95, .78, .9][k]);
    d += (i ? 'L' : 'M') + (60 + Math.cos(a - Math.PI / 2) * r).toFixed(1) + ' ' + (60 + Math.sin(a - Math.PI / 2) * r).toFixed(1);
  }
  document.getElementById('flower').setAttribute('d', d + 'Z');

  /* Le personnage : un clic = un petit mot */
  let said = -1, timer;
  btn.addEventListener('click', () => {
    said = (said + 1) % greetings.length;
    bubble.textContent = greetings[said];
    btn.classList.add('happy');
    clearTimeout(timer);
    timer = setTimeout(() => btn.classList.remove('happy'), 2200);
  });

  /* Le regard : parallaxe entre couches, écrit directement dans le SVG */
  const L = {};
  btn.querySelectorAll('[data-l]').forEach(el => L[el.dataset.l] = el);
  const sat = v => v / Math.sqrt(1 + v * v);
  const approach = (c, t, dt, r) => t + (c - t) * Math.exp(-r * dt);
  const tr = (x, y) => `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let px = 0, py = 0, lastMove = -1e9, gx = 0, gy = 0, near = 0, prev = performance.now(), nextBlink = prev + 1800, blinkAt = -1e9, visible = true;

  addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; lastMove = performance.now(); }, { passive: true });
  addEventListener('blur', () => lastMove = -1e9);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; prev = performance.now(); }).observe(hero);

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    const r = btn.getBoundingClientRect(), cx = r.left + r.width * .5, cy = r.top + r.height * .5;
    let tx = 0, ty = 0, tn = 0;
    if (now - lastMove < 3500) {
      const reach = Math.max(innerWidth, innerHeight);
      tx = sat((px - cx) / (reach * .3)); ty = sat((py - cy) / (reach * .26));
      tn = Math.max(0, 1 - Math.hypot(px - cx, py - cy) / (r.width * .45));
    } else if (!mq.matches) {
      const t = now / 1000;
      tx = Math.sin(t * .45) * .55 + Math.sin(t * 1.1) * .1; ty = Math.sin(t * .31 + 1) * .25;
    }
    const rate = mq.matches ? 30 : 7;
    gx = approach(gx, tx, dt, rate); gy = approach(gy, ty, dt, rate); near = approach(near, tn, dt, 8);
    const breathe = mq.matches ? 0 : Math.sin(now / 620) * 1.6;

    if (!mq.matches && now > nextBlink) { blinkAt = now; nextBlink = now + (Math.random() < .2 ? 260 : 2200 + Math.random() * 3200); }
    const s = (now - blinkAt) / 1000, open = mq.matches || s < 0 || s > .15 ? 1 : 1 - Math.sin(Math.PI * s / .15) * .92;
    const es = 1 + near * .14;

    L.body.setAttribute('transform', tr(gx * 4, breathe * .4));
    L.head.setAttribute('transform', tr(gx * 10, gy * 7 + breathe) + ` rotate(${(gx * 4).toFixed(2)} 300 600)`);
    L.hij.setAttribute('transform', tr(-gx * 4, -gy * 2));
    L.face.setAttribute('transform', tr(gx * 16, gy * (gy < 0 ? 8 : 14)));
    L.nose.setAttribute('transform', tr(gx * 7, gy * 5));
    L.brows.setAttribute('transform', tr(gx * 3, gy * 2 + Math.min(0, gy) * 3 - near * 7));
    L.eyes.setAttribute('transform', tr(gx * 4, gy * 4) + ` translate(300 366) scale(${es.toFixed(3)} ${(es * open).toFixed(3)}) translate(-300 -366)`);
  };
  requestAnimationFrame(frame);
})();
