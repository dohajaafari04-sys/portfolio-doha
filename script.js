/* ============================================================
   MES LIENS : colle ici l'URL complète (https://…) de ton LinkedIn et de ton portfolio.
   Tant qu'un champ reste vide, le lien n'apparaît nulle part.
   Une fois rempli, il s'affiche sur la page CV, la page Contact et dans le pied de page.
   ============================================================ */
const SOCIAL = { linkedin: '', portfolio: '' };
document.querySelectorAll('[data-social]').forEach(el => {
  const u = SOCIAL[el.dataset.social]; if (!u) return;
  const a = el.matches('a') ? el : el.querySelector('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer'; el.hidden = false;
});

(() => {
  const hero = document.getElementById('hero'), btn = document.getElementById('char'), bubble = document.getElementById('bubble');
  const greetings = ["Salut, moi c'est Doha !", "Faisons quelque chose d'audacieux.", "Psst — je cherche une alternance.", "Ok, tu peux arrêter de me chatouiller :)"];

  /* Lettres du titre : chaque lettre réagit au survol */
  document.querySelectorAll('.sp').forEach(el => {
    el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  });

  if (!hero || !btn || !bubble) return; /* pages secondaires : pas de hero */

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

/* Liquid Glass Navbar "Waterline" — vanilla port (original: Nimbus UI, guglielmogiannattasio.it)
   WebGL water shader + spring physics, CSS drop fallback, reduced-motion aware. */
(() => {
  const nav = document.getElementById('nav'); if (!nav) return;
  const PAD = 14, items = [...nav.querySelectorAll('.nimbus-item')];
  const mk = (t, c) => { const e = document.createElement(t); e.className = c; e.setAttribute('aria-hidden', 'true'); return e; };
  const glass = mk('span', 'nimbus-glass'), cv = mk('canvas', 'nimbus-water'), drop = mk('span', 'nimbus-drop');
  nav.prepend(glass, cv, drop);

  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr,uTime,uAmb;uniform vec4 uPill;uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 lime=vec3(.78,.95,.23);
 vec3 irid=mix(.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035)),lime,.65);
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*.18;
 vec3 c=vec3(0.)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=lime;
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*.65;vec3 dc=mix(tint,vec3(1.),body*.45);
 float la=rim*.3;vec3 lc=vec3(.6,.85,.1);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);}`;

  const initGL = () => {
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG); if (!vs || !fs) return null;
    const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const u = {}; for (const n of ['uRes', 'uDpr', 'uTime', 'uPill', 'uBlob', 'uSy', 'uRip', 'uMouse', 'uAmb']) u[n] = gl.getUniformLocation(p, n);
    return { gl, u };
  };

  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const s = { a: { x: 0, v: 0 }, b: { x: 0, v: 0 }, sy: { s: 1, v: 0 }, lead: 0, lagFrom: 0, sats: [], rips: [], t: { x: 0, cy: 0, q: 0, r: 21 }, q: 0,
    mouse: { x: 0, y: 0, s: 0, on: false }, moving: false, split: false, ready: false, w: 0, h: 0, visible: true, raf: 0, last: 0, time: 0 };
  let current = Math.max(0, items.findIndex(i => i.getAttribute('aria-current') === 'true'));
  const glc = initGL();
  nav.dataset.gl = glc ? 'on' : 'off';
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); glc.dead = true; nav.dataset.gl = 'off'; });

  const draw = () => {
    const T = s.t, sep = Math.abs(s.a.x - s.b.x), thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1), r = T.r * (1 - .3 * thin);
    if (glc && !glc.dead) {
      const { gl: g, u } = glc, dpr = Math.min(devicePixelRatio || 1, 2);
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2); g.uniform1f(u.uDpr, dpr); g.uniform1f(u.uTime, s.time); g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);
      const blobs = new Float32Array(24), sy = new Float32Array(6).fill(1);
      const head = s.lead ? s.b : s.a, tail = s.lead ? s.a : s.b;
      blobs.set([head.x, T.cy, s.q * (1 - .25 * thin), T.r * (1 - .12 * thin), tail.x, T.cy, s.q * (1 - .8 * thin), T.r * (1 - .5 * thin)], 0);
      sy[0] = sy[1] = s.sy.s;
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4));
      g.uniform4fv(u.uBlob, blobs); g.uniform1fv(u.uSy, sy);
      const rips = new Float32Array(24); s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
      g.uniform4fv(u.uRip, rips); g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s); g.uniform1f(u.uAmb, mq.matches ? 0 : 1);
      g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.drawArrays(g.TRIANGLES, 0, 3);
    } else {
      drop.style.width = `${sep + 2 * (s.q + r)}px`;
      drop.style.transform = `translateX(${Math.min(s.a.x, s.b.x) - s.q - r - PAD}px) scaleY(${s.sy.s})`;
    }
  };

  const step = (dt, now) => {
    const T = s.t; s.time += dt; s.q += (T.q - s.q) * Math.min(1, dt * 12);
    const bodies = [s.a, s.b]; let still = true;
    if (mq.matches) { s.a.x = s.b.x = T.x; s.a.v = s.b.v = 0; s.sy.s = 1; s.sats = []; }
    else {
      bodies.forEach((B, i) => {
        const lead = i === s.lead, k = lead ? 210 : 72, c = lead ? 25 : 13, f = !lead && now < s.lagFrom ? .08 : 1;
        B.v += (k * (T.x - B.x) - c * B.v) * dt * f; B.x += B.v * dt;
        const lo = PAD + 3 + s.q + T.r, hi = PAD + s.w - 3 - s.q - T.r;
        if (B.x < lo || B.x > hi) { s.sy.v -= Math.min(Math.abs(B.v), 900) * .0016; B.x = Math.max(lo, Math.min(hi, B.x)); B.v *= -.25; }
        if (Math.abs(T.x - B.x) > .3 || Math.abs(B.v) > 3) still = false;
      });
      const L = bodies[s.lead], syT = 1 - .2 * Math.min(Math.abs(L.v) / 1500, 1);
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt; s.sy.s += s.sy.v * dt;
      if (Math.abs(s.sy.s - 1) > .002 || Math.abs(s.sy.v) > .02) still = false;
      const sep = Math.abs(s.a.x - s.b.x), r = T.r * (1 - .3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1));
      if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
        s.split = true; const lo = bodies[1 - s.lead], hi = bodies[s.lead];
        [.3, .5, .72].forEach((t, j) => s.sats.push({ x: lo.x + (hi.x - lo.x) * t + (Math.random() - .5) * 6, y: T.cy + (Math.random() - .5) * 10,
          vx: (lo.v + hi.v) * .45, vy: (Math.random() - .5) * 60, r: 5 + Math.random() * 3 - j * .5, k: 70 + Math.random() * 90 }));
      }
      s.sats = s.sats.filter(d => {
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt; d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt; d.x += d.vx * dt; d.y += d.vy * dt;
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x)); d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y));
        if (Math.abs(T.x - d.x) < T.q + T.r * .5) d.r -= dt * 26; return d.r > .6;
      });
      if (s.sats.length) still = false;
    }
    if (s.moving && still) { s.moving = false; if (s.split || !mq.matches) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : .7 }); }
    s.rips.forEach(p => p.age += dt); s.rips = s.rips.filter(p => p.age < 2.4);
    s.mouse.s += ((s.mouse.on ? 1 : 0) - s.mouse.s) * Math.min(1, dt * 7);
  };

  const loop = () => {
    if (s.raf) return; s.last = performance.now();
    const tick = now => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30); s.last = now; step(dt, now); draw();
      const busy = s.moving || s.rips.length || s.sats.length || s.mouse.s > .01;
      s.raf = s.visible && (!mq.matches || busy) ? requestAnimationFrame(tick) : 0;
    };
    s.raf = requestAnimationFrame(tick);
  };

  const measure = () => {
    const el = items[current], T = s.t; if (!el) return;
    s.w = nav.offsetWidth; s.h = nav.offsetHeight;
    T.r = el.offsetHeight / 2; T.q = Math.max(0, el.offsetWidth / 2 - T.r); T.cy = PAD + el.offsetTop + el.offsetHeight / 2;
    const nx = PAD + el.offsetLeft + el.offsetWidth / 2;
    if (!s.ready) { s.a.x = s.b.x = nx; s.q = T.q; s.ready = true; }
    else if (Math.abs(nx - T.x) > .5) { s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1; s.lagFrom = performance.now() + 70; s.moving = true; s.split = false; }
    T.x = nx;
    const dpr = Math.min(devicePixelRatio || 1, 2), W = s.w + PAD * 2, Hh = s.h + PAD * 2;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; }
    loop();
  };

  const local = (x, y) => { const r = nav.getBoundingClientRect(); return { x: x - r.left + PAD, y: y - r.top + PAD }; };
  const ripple = (x, y, amp) => { if (mq.matches) return; s.rips.push({ x, y, age: 0, amp }); loop(); };

  const select = i => {
    const ico = items[i].querySelector('.nv-ico');
    if (ico) { const fx = ico.dataset.fx0 || (ico.dataset.fx0 = ico.dataset.fx); ico.removeAttribute('data-fx'); void ico.offsetWidth; ico.dataset.fx = fx; }
    if (i === current) return;
    items[current].removeAttribute('aria-current'); current = i; items[i].setAttribute('aria-current', 'true'); measure();
  };
  items.forEach((el, i) => el.addEventListener('click', () => select(i)));
  nav.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault();
    const n = (current + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length; select(n); items[n].focus();
  });
  nav.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const p = local(e.clientX, e.clientY); s.mouse.x = p.x; s.mouse.y = p.y; s.mouse.on = true; loop(); });
  nav.addEventListener('pointerleave', () => { s.mouse.on = false; loop(); });
  nav.addEventListener('pointerdown', e => { const p = local(e.clientX, e.clientY); ripple(p.x, p.y, .8); });

  let lastW = -1;
  new ResizeObserver(() => { if (nav.offsetWidth !== lastW) { lastW = nav.offsetWidth; s.ready = false; measure(); } }).observe(nav);
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) loop(); }).observe(nav);
  document.addEventListener('visibilitychange', () => { s.visible = document.visibilityState === 'visible'; if (s.visible) loop(); });
  document.fonts && document.fonts.ready.then(() => { s.ready = false; measure(); });
  measure();
  /* Accueil : l'item actif suit la section visible (Accueil / À propos) */
  const heroEl = document.getElementById('hero'), aboutEl = document.getElementById('about');
  const iHome = items.findIndex(a => a.getAttribute('href') === '#hero'), iAbout = items.findIndex(a => a.getAttribute('href') === '#about');
  if (heroEl && aboutEl && iHome > -1 && iAbout > -1) {
    let lock = 0, queued = false;
    items.forEach(a => a.addEventListener('click', () => { lock = performance.now() + 1200; }));
    const spy = () => {
      queued = false; if (performance.now() < lock) return;
      const i = aboutEl.getBoundingClientRect().top < innerHeight * .5 ? iAbout : iHome;
      if (i !== current) select(i);
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(spy); } }, { passive: true });
  }
})();

/* ===== About me : salutations + carte suspendue ===== */
(() => {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const g = document.getElementById('greet'), words = ['Hello', 'Bonjour', 'Salam'];
  let gi = 0;
  if (g && !mq.matches) setInterval(() => {
    if (document.hidden) return;
    g.className = 'out';
    setTimeout(() => { gi = (gi + 1) % words.length; g.textContent = words[gi]; g.className = 'in'; }, 220);
  }, 2400);

  const sw = document.getElementById('swing'), inn = document.getElementById('swingIn'), card = document.getElementById('card');
  if (!sw || !inn || !card) return;
  let ang = mq.matches ? 0 : 14, vel = 0, drag = false, last = performance.now(), vis = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pivot = () => { const r = sw.getBoundingClientRect(); return [r.left + r.width / 2, r.top]; };
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; last = performance.now(); }).observe(sw);

  card.addEventListener('pointerdown', e => { if (mq.matches) return; drag = true; card.setPointerCapture(e.pointerId); });
  const end = () => { drag = false; };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
  card.addEventListener('pointermove', e => {
    if (mq.matches) return;
    const [px, py] = pivot();
    if (drag) {
      const a = clamp(Math.atan2(px - e.clientX, e.clientY - py) * 180 / Math.PI, -40, 40);
      const dt = Math.max(.008, (performance.now() - last) / 1000);
      vel = (a - ang) / dt * .5; ang = a;
    } else if (e.pointerType === 'mouse') vel += clamp(e.movementX, -30, 30) * .8;
  });

  const frame = now => {
    requestAnimationFrame(frame);
    if (!vis) return;
    const dt = Math.min(.04, (now - last) / 1000); last = now;
    if (!drag && !mq.matches) { vel += (-34 * ang - 1.7 * vel) * dt; ang = clamp(ang + vel * dt, -40, 40); }
    inn.style.transform = `rotate(${ang.toFixed(2)}deg)`;
    card.style.transform = `rotateY(${clamp(vel * .1, -16, 16).toFixed(2)}deg)`;
  };
  requestAnimationFrame(frame);
})();


/* ===== About me : carrousel de logos (boucle continue) ===== */
(() => {
  const t = document.getElementById('aTrack'); if (!t) return;
  const set = t.firstElementChild;
  for (let i = 0; i < 3; i++) { const c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c); }
})();


/* ===== Pied de page « Starburst » : adapté du composant React en JS natif (commun à toutes les pages) ===== */
(() => {
  const root = document.getElementById('footer'); if (!root) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const CFG = {
    name: 'Doha Jaafari', thanks: ['Merci', 'Thank you', 'Shukran'], tagline: 'pour votre temps', signoff: 'et à très bientôt !',
    links: [
      { caption: 'Tout mon parcours', label: 'Mon CV en PDF', href: 'cv.pdf', dl: true },
      { caption: 'Faisons connaissance', label: 'À propos de moi', href: 'index.html#about' }
    ],
    email: 'dohajaafari04@gmail.com', phone: '+33 7 66 60 57 98', copied: 'Copié !', points: 10
  };

  if (SOCIAL.linkedin) CFG.links.push({ caption: 'Retrouvez-moi', label: 'LinkedIn', href: SOCIAL.linkedin });
  if (SOCIAL.portfolio) CFG.links.push({ caption: 'Mes projets', label: 'Portfolio', href: SOCIAL.portfolio });

  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const rd = v => Math.round(v * 100) / 100;
  const GLYPHS = {
    A: [6, "M0 10L3 0L6 10M1.2 6.2L4.8 6.2"],
    B: [5.6, "M0 10L0 0L3.2 0Q5.2 0 5.2 2.4Q5.2 4.8 3 4.8L0 4.8M3 4.8Q5.6 4.8 5.6 7.4Q5.6 10 3 10L0 10"],
    C: [5.5, "M5.5 1.2Q4.6 0 3 0Q0 0 0 5Q0 10 3 10Q4.6 10 5.5 8.8"],
    D: [5.6, "M0 0L0 10L2.6 10Q5.6 10 5.6 5Q5.6 0 2.6 0Z"],
    E: [5, "M5 0L0 0L0 10L5 10M0 5L3.8 5"],
    F: [5, "M5 0L0 0L0 10M0 5L3.8 5"],
    G: [6, "M5.6 1.4Q4.6 0 3 0Q0 0 0 5Q0 10 3 10Q6 10 6 6L3.4 6"],
    H: [5.6, "M0 0L0 10M5.6 0L5.6 10M0 5L5.6 5"],
    I: [1, "M0.5 0L0.5 10"],
    J: [4.6, "M4.6 0L4.6 7Q4.6 10 2.3 10Q0 10 0 7.6"],
    K: [5.4, "M0 0L0 10M5.4 0L0 6.2M1.8 4.6L5.4 10"],
    L: [4.6, "M0 0L0 10L4.6 10"],
    M: [7, "M0 10L0.6 0L3.5 7L6.4 0L7 10"],
    N: [5.6, "M0 10L0 0L5.6 10L5.6 0"],
    O: [6, "M3 0Q0 0 0 5Q0 10 3 10Q6 10 6 5Q6 0 3 0Z"],
    P: [5.2, "M0 10L0 0L3 0Q5.2 0 5.2 2.7Q5.2 5.4 3 5.4L0 5.4"],
    Q: [6.4, "M3 0Q0 0 0 5Q0 10 3 10Q6 10 6 5Q6 0 3 0ZM3.6 7L6.4 10.6"],
    R: [5.4, "M0 10L0 0L3 0Q5.2 0 5.2 2.7Q5.2 5.4 3 5.4L0 5.4M2.4 5.4L5.4 10"],
    S: [5.2, "M5 1.2Q4.2 0 2.6 0Q0.2 0 0.2 2.5Q0.2 4.6 2.6 5Q5.2 5.5 5.2 7.6Q5.2 10 2.6 10Q0.8 10 0 8.6"],
    T: [6, "M0 0L6 0M3 0L3 10"],
    U: [5.6, "M0 0L0 7Q0 10 2.8 10Q5.6 10 5.6 7L5.6 0"],
    V: [6, "M0 0L3 10L6 0"],
    W: [8, "M0 0L1.9 10L4 2.6L6.1 10L8 0"],
    X: [5.6, "M0 0L5.6 10M5.6 0L0 10"],
    Y: [5.6, "M0 0L2.8 5L5.6 0M2.8 5L2.8 10"],
    Z: [5.4, "M0 0L5.4 0L0 10L5.4 10"],
    "0": [5, "M2.5 0Q0 0 0 5Q0 10 2.5 10Q5 10 5 5Q5 0 2.5 0Z"],
    "1": [3, "M0 2L2 0L2 10"],
    "2": [5, "M0 2Q0.6 0 2.6 0Q5 0 5 2.6Q5 4.6 0 10L5 10"],
    "3": [5.2, "M0 1Q1 0 2.5 0Q5 0 5 2.4Q5 4.8 2.2 4.8Q5.2 4.8 5.2 7.4Q5.2 10 2.5 10Q0.8 10 0 8.8"],
    "4": [5.4, "M4 10L4 0L0 7L5.4 7"],
    "5": [5, "M5 0L0.6 0L0.2 4.6Q1.2 4 2.6 4Q5 4 5 7Q5 10 2.4 10Q0.8 10 0 8.8"],
    "6": [5, "M4.6 0.8Q3.8 0 2.6 0Q0 0 0 5.6Q0 10 2.5 10Q5 10 5 7.2Q5 4.6 2.6 4.6Q0.8 4.6 0 6"],
    "7": [5, "M0 0L5 0L1.6 10"],
    "8": [5, "M2.5 4.8Q0.2 4.8 0.2 2.4Q0.2 0 2.5 0Q4.8 0 4.8 2.4Q4.8 4.8 2.5 4.8Q0 4.8 0 7.4Q0 10 2.5 10Q5 10 5 7.4Q5 4.8 2.5 4.8Z"],
    "9": [5, "M5 4Q4.2 5.4 2.4 5.4Q0 5.4 0 2.7Q0 0 2.5 0Q5 0 5 4L5 6Q5 10 2.4 10Q1 10 0.2 9"],
    "!": [1, "M0.5 0L0.5 6.8M0.5 9.4L0.5 10"],
    "?": [4.6, "M0 1.6Q0.6 0 2.4 0Q4.6 0 4.6 2.4Q4.6 4 2.4 5.2L2.4 7M2.4 9.4L2.4 10"],
    ".": [1, "M0.5 9.4L0.5 10"],
    ",": [1.4, "M0.9 9.2L0.3 11"],
    "'": [1, "M0.5 0L0.5 2.6"],
    ":": [1, "M0.5 3L0.5 3.6M0.5 9.4L0.5 10"],
    "-": [3.6, "M0 5.4L3.6 5.4"],
    "/": [4, "M4 0L0 10"],
    "&": [6, "M6 10L1.4 3.4Q0.6 2 1.6 0.8Q2.6 0 3.6 0.8Q4.4 2 2.6 3.8L1 5.4Q0 6.6 0 8Q0 10 2.2 10Q4 10 5.6 6.6"]
  };
  const SPACE = 3.2, TRACK = 1.9;

  const layoutScript = (text, seed = 1, track = TRACK, jitter = 1) => {
    const clean = String(text || '').replace(/’/g, "'").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const glyphs = []; let x = 0;
    for (let i = 0; i < clean.length; i++) {
      const g = GLYPHS[clean[i]];
      if (!g) { x += SPACE; continue; }
      glyphs.push({ d: g[1], x: rd(x), w: g[0], dy: rd((hash(i * 7.31 + seed * 13.7) - .5) * 1.1 * jitter), rot: rd((hash(i * 3.17 + seed * 5.3) - .5) * 8 * jitter) });
      x += g[0] + track;
    }
    const last = glyphs[glyphs.length - 1];
    return { glyphs, width: last ? rd(last.x + last.w) : 0 };
  };
  const starPath = (points, outer, inner, wobble, seed) => {
    const n = Math.max(3, Math.floor(points) || 3), pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? inner : outer * (1 + (hash(i * 9.7 + seed) - .5) * wobble);
      pts.push(rd(Math.cos(a) * r) + ' ' + rd(Math.sin(a) * r));
    }
    return 'M' + pts.join('L') + 'Z';
  };
  const loopPath = (w = 100, h = 40, turns = 1.1, tilt = -5, steps = 140) => {
    const cx = w / 2, cy = h / 2, rx = w * .46, ry = h * .36, tr = tilt * Math.PI / 180, ct = Math.cos(tr), st = Math.sin(tr), pts = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps, a = Math.PI * .92 + u * turns * Math.PI * 2, k = 1 - .06 * u + .015 * Math.sin(a * 3);
      const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k * (1 + .04 * u);
      pts.push(rd(cx + x * ct - y * st) + ' ' + rd(cy + x * st + y * ct));
    }
    return 'M' + pts.join('L');
  };
  const initialsOf = n => String(n || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const scriptSVG = (text, seed, cap, cls, delay, step) => {
    const { glyphs, width } = layoutScript(text, seed), vbW = width + 6;
    const paths = glyphs.map((g, i) => `<path d="${g.d}" transform="translate(${g.x} ${g.dy}) rotate(${g.rot} ${rd(g.w / 2)} 5)" style="animation-delay:${rd(delay + i * step)}s"/>`).join('');
    return `<svg class="stf-script ${cls}" viewBox="-3 -2 ${vbW} 14" style="height:${rd(cap * 14 / 10)}em;width:${rd(cap * vbW / 10)}em" aria-hidden="true" focusable="false"><g transform="skewX(-12)">${paths}</g></svg>`;
  };
  /* Longueur réelle de chaque trait → animation « écriture » (pathLength est ignoré par Chrome pour les tirets CSS) */
  const stamp = (svg, screen) => svg.querySelectorAll('path').forEach(p => {
    let len; try { len = p.getTotalLength(); } catch (e) { return; }
    const m = screen ? p.getScreenCTM() : null;
    if (m) { const tot = len; len = 0; let prev = null; for (let i = 0; i <= 64; i++) { const q = p.getPointAtLength(i / 64 * tot).matrixTransform(m); if (prev) len += Math.hypot(q.x - prev.x, q.y - prev.y); prev = q; } len *= 1.6; }
    p.style.setProperty('--l', String(Math.ceil(len) + 1));
  });

  const mono = (() => {
    const { glyphs, width } = layoutScript(initialsOf(CFG.name), 0, 1.6, 0), words = CFG.name.trim().split(/\s+/), vbW = width + 16;
    return `<span class="stf-logo"><svg class="stf-mark" viewBox="-8 -2 ${vbW} 14" style="height:2.4em;width:${rd(2.4 * vbW / 14)}em" aria-hidden="true" focusable="false"><path class="stf-mark-l" d="M-6 0L-2 5L-6 10"/><path class="stf-mark-r" d="M${width + 6} 0L${width + 2} 5L${width + 6} 10"/><g class="stf-mark-i">${glyphs.map(g => `<path d="${g.d}" transform="translate(${g.x} 0)"/>`).join('')}</g></svg><span class="stf-name">${words.map(w => `<span>${esc(w)}</span>`).join('')}</span></span>`;
  })();
  const HAND = 'M8 13V3.5A2 2 0 0 1 12 3.5V10.5A2 2 0 0 1 16 10.5V11.5A2 2 0 0 1 20 11.5V12.5A1.8 1.8 0 0 1 23.6 12.5V19Q23.6 27 16 27H13Q9.5 27 7.6 24L3 17.4Q2 15.6 3.6 14.8Q5 14.2 6.2 15.6L8 18Z';
  const hand = `<span class="stf-hand" aria-hidden="true"><svg viewBox="0 -5 26 33" focusable="false"><path class="stf-click" d="M10 0.2V-3.4M5.6 1.4L3.3-0.9M14.4 1.4L16.7-0.9"/><path class="stf-palm" d="${HAND}"/><path class="stf-knuckle" d="M12 10.5V15M16 11.5V15.5M20 12.5V16"/></svg></span>`;
  const sep = `<svg class="stf-sep" viewBox="-6 -6 12 12" aria-hidden="true" focusable="false"><path d="${starPath(8, 5.6, 1.5, 0, 0)}"/></svg>`;
  const specks = Array.from({ length: 22 }, (_, i) => `<span class="stf-dust" style="left:${rd(hash(i * 1.7 + 3) * 100)}%;top:${rd(hash(i * 2.9 + 7) * 100)}%;width:${rd(1 + hash(i * 5.3 + 3) * 2.2)}px;height:${rd(1 + hash(i * 5.3 + 3) * 2.2)}px;opacity:${rd(.12 + hash(i * 8.1 + 3) * .4)}"></span>`).join('');
  const tel = CFG.phone.replace(/[^\d+]/g, '');

  root.innerHTML = `
<div class="stf-fx" aria-hidden="true">${specks}<span class="stf-scratch" style="left:81%;top:64%;height:9%;transform:rotate(14deg)"></span><span class="stf-scratch" style="left:13%;top:22%;height:6%;transform:rotate(-8deg)"></span></div>
<div class="stf-in">
  <div>${mono}</div>
  <div class="stf-mid">
    <div class="stf-stage">
      <svg class="stf-orbit" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${loopPath()}" vector-effect="non-scaling-stroke"/></svg>
      <span class="stf-star-wrap"><button type="button" class="stf-star"><span class="stf-star-pop"><svg class="stf-star-svg" viewBox="-52 -52 104 104" aria-hidden="true" focusable="false"><path d="${starPath(CFG.points, 46, 20, .22, 2)}" vector-effect="non-scaling-stroke"/></svg></span><span class="stf-sparks-slot"></span></button></span>
      <h2 class="stf-h"><span class="stf-sr"></span><span class="stf-word" aria-hidden="true"></span></h2>
      ${scriptSVG(CFG.tagline, 3, .5, 'stf-tag', .6, .06)}
    </div>
    <p class="stf-signoff">${esc(CFG.signoff)}</p>
  </div>
  <nav class="stf-links" aria-label="Liens utiles">
    ${CFG.links.map((l, i) => `${i ? sep : ''}<div class="stf-item has-hand"><span class="stf-cap">${scriptSVG(l.caption, i + 7, .78, '', 1.2 + i * .5, .035)}</span><span class="stf-pillwrap"><a class="stf-pill" href="${l.href}"${l.dl ? ' download' : ''}${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(l.label)}</a>${hand}</span></div>`).join('')}
    ${sep}<div class="stf-item"><span class="stf-cap stf-cap-copied"></span><span class="stf-pillwrap"><button type="button" class="stf-pill" title="Copier l’adresse e-mail">${esc(CFG.email)}</button></span><a class="stf-phone" href="tel:${tel}">${esc(CFG.phone)}</a><span class="stf-sr stf-status" role="status"></span></div>
  </nav>
</div>`;

  const q = s => root.querySelector(s);
  root.querySelectorAll('.stf-script').forEach(s => stamp(s, false));
  stamp(q('.stf-orbit'), true);

  /* Écriture + boucle à l'apparition */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { root.classList.add('is-in'); io.disconnect(); } }, { threshold: .2 });
    io.observe(root);
  } else root.classList.add('is-in');

  /* Clic sur l'étoile : pop, étincelles, « merci » dans la langue suivante */
  let idx = 0, burst = 0;
  const word = q('.stf-word'), sr = q('.stf-h .stf-sr'), star = q('.stf-star'), pop = q('.stf-star-pop'), slot = q('.stf-sparks-slot');
  const render = () => {
    const w = CFG.thanks[idx];
    word.innerHTML = [...w].map((c, i) => `<span class="stf-ch" style="animation-delay:${rd(i * .035)}s">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
    sr.textContent = w + ' ' + CFG.tagline;
    star.setAttribute('aria-label', `Dire merci autrement (actuellement : ${w})`);
  };
  render();
  star.addEventListener('click', () => {
    idx = (idx + 1) % CFG.thanks.length; render(); burst++;
    slot.innerHTML = `<span class="stf-sparks" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<span class="stf-spark" style="--a:${i * 30 + 15}deg;width:${62 * (i % 2 ? .7 : 1)}%"><i></i></span>`).join('')}</span>`;
    if (!mq.matches && pop.animate) pop.animate([{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.25) rotate(200deg)', offset: .45 }, { transform: 'scale(1) rotate(360deg)' }], { duration: 700, easing: 'cubic-bezier(.2,.9,.25,1.1)' });
  });

  /* Pastille e-mail : copie l'adresse */
  const cap = q('.stf-cap-copied'), status = q('.stf-status'); let ct;
  q('.stf-item:last-child .stf-pill').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CFG.email);
      cap.innerHTML = scriptSVG(CFG.copied, 11, .78, '', 0, .035); stamp(cap.firstElementChild, false); status.textContent = 'Adresse e-mail copiée';
      clearTimeout(ct); ct = setTimeout(() => { cap.innerHTML = ''; status.textContent = ''; }, 2400);
    } catch (e) { location.href = 'mailto:' + CFG.email; }
  });

  /* Étoile et boucle suivent le pointeur (souris uniquement) */
  root.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = root.getBoundingClientRect(); if (!r.width || !r.height) return;
    root.style.setProperty('--stf-px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
    root.style.setProperty('--stf-py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
  });
  root.addEventListener('pointerleave', () => { root.style.setProperty('--stf-px', '0'); root.style.setProperty('--stf-py', '0'); });
})();

/* ===== Pages secondaires : apparition douce au défilement ===== */
(() => {
  const els = document.querySelectorAll('[data-rv]'); if (!els.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => { el.classList.add('rv'); io.observe(el); });
})();

/* ===== Page Contact : globe filaire (canvas + d3-geo), repère sur Charleville-Mézières ===== */
(() => {
  const host = document.getElementById('globe'); if (!host) return;
  const cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const HOME = [4.72, 49.77]; /* Charleville-Mézières */
  let rot = [-HOME[0], -26], W = 0, H = 0, dpr = 1, mesh = null, france = null, visible = false, drag = false, last = [0, 0], raf = 0, prev = 0, t0 = 0;
  const has = !!(window.d3 && d3.geoOrthographic);
  const proj = has ? d3.geoOrthographic().precision(.1).clipAngle(90) : null;
  const path = has ? d3.geoPath(proj, ctx) : null;
  const grat = has ? d3.geoGraticule10() : null;

  const size = () => {
    const r = host.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.round(r.width); H = Math.round(r.height); if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (proj) { const R = W * .45; proj.scale(R).translate([W / 2, W * .03 + R]); }
    draw(performance.now());
  };
  const draw = now => {
    if (!has || !W) return;
    proj.rotate(rot);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineJoin = 'round';
    const sphere = { type: 'Sphere' };
    ctx.beginPath(); path(sphere); ctx.fillStyle = 'rgba(242,242,236,.03)'; ctx.fill();
    ctx.beginPath(); path(grat); ctx.strokeStyle = 'rgba(242,242,236,.08)'; ctx.lineWidth = 1; ctx.stroke();
    if (france) { ctx.beginPath(); path(france); ctx.fillStyle = 'rgba(200,242,58,.22)'; ctx.fill(); }
    if (mesh) { ctx.beginPath(); path(mesh); ctx.strokeStyle = 'rgba(242,242,236,.6)'; ctx.lineWidth = .8; ctx.stroke(); }
    ctx.beginPath(); path(sphere); ctx.strokeStyle = 'rgba(242,242,236,.75)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (d3.geoDistance(HOME, [-rot[0], -rot[1]]) < 1.4) {
      const [x, y] = proj(HOME), k = mq.matches ? 0 : ((now - t0) / 1600) % 1;
      if (k) { ctx.beginPath(); ctx.arc(x, y, 4 + k * 14, 0, 7); ctx.strokeStyle = `rgba(200,242,58,${(1 - k) * .8})`; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fillStyle = '#c8f23a'; ctx.fill();
      ctx.font = '600 12px Inter, system-ui, sans-serif'; ctx.fillStyle = '#f2f2ec'; ctx.textBaseline = 'middle'; const left = x > W * .55; ctx.textAlign = left ? 'right' : 'left'; ctx.fillText('Charleville-Mézières', left ? x - 11 : x + 11, y); ctx.textAlign = 'left';
    }
  };
  const loop = now => {
    raf = 0; if (!visible) return;
    const dt = Math.min(.05, (now - (prev || now)) / 1000); prev = now;
    if (!drag && !mq.matches) rot[0] = (rot[0] + dt * 12) % 360;
    draw(now); if (!mq.matches || drag) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) { prev = 0; raf = requestAnimationFrame(loop); } };

  cv.addEventListener('pointerdown', e => { drag = true; last = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); kick(); });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    rot = [rot[0] + (e.clientX - last[0]) * .4, Math.max(-60, Math.min(60, rot[1] - (e.clientY - last[1]) * .3))]; last = [e.clientX, e.clientY]; kick();
  });
  const end = () => { drag = false; kick(); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);

  if ('ResizeObserver' in window) new ResizeObserver(size).observe(host);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { t0 = performance.now(); kick(); } }).observe(host);
  else { visible = true; kick(); }
  size();

  /* Tracés des pays : données embarquées (vendor/world-110m.js), sans réseau */
  if (has && window.topojson && window.WORLD_110M) {
    const w = window.WORLD_110M;
    mesh = topojson.mesh(w, w.objects.countries);
    france = topojson.feature(w, w.objects.countries).features.find(f => f.properties && f.properties.name === 'France') || null;
    draw(performance.now());
  }
})();

/* ===== Page Contact : formulaire → message prêt à envoyer dans la messagerie ===== */
(() => {
  const f = document.getElementById('contactForm'); if (!f) return;
  const st = document.getElementById('ctStatus');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => (f.elements[n].value || '').trim();
    const body = `${v('message')}\n\n—\n${v('name')}${v('company') ? '\n' + v('company') : ''}\n${v('email')}`;
    st.textContent = 'Votre messagerie s’ouvre avec le message prêt à envoyer.';
    location.href = `mailto:dohajaafari04@gmail.com?subject=${encodeURIComponent('Contact portfolio — ' + v('name'))}&body=${encodeURIComponent(body)}`;
  });
})();
