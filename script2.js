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
