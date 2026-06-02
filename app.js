'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER = matchMedia('(hover:hover)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- Reveal on scroll ---- */
const obs = new IntersectionObserver(es => es.forEach(x => {
  if (x.isIntersecting) { x.target.classList.add('visible'); obs.unobserve(x.target); }
}), { threshold: .08, rootMargin: '0px 0px -36px 0px' });
$$('.ch-grid .reveal').forEach((el, i) => el.style.transitionDelay = (i % 3) * 65 + 'ms');
$$('.social-grid .reveal').forEach((el, i) => el.style.transitionDelay = i * 55 + 'ms');
$$('.gallery-grid .reveal').forEach((el, i) => el.style.transitionDelay = (i % 4) * 60 + 'ms');
$$('.reveal').forEach(el => obs.observe(el));

/* ---- Mobile hamburger ---- */
const navToggle = $('#navToggle'), navLinks = $('#navLinks');
function setMenu(open) {
  if (!navLinks) return;
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
if (navToggle) {
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
}

/* ---- Scroll: progress bar, nav state, back-to-top, parallax ---- */
const nav = $('#nav'), cnav = $('#cnav'), progress = $('#progress'), toTop = $('#toTop'), ghost = $('.hero-ghost');
function onScroll() {
  const h = document.documentElement, max = h.scrollHeight - h.clientHeight, pct = max > 0 ? h.scrollTop / max * 100 : 0;
  if (progress) progress.style.width = pct + '%';
  if (nav) nav.classList.toggle('compact', scrollY > 60);
  if (cnav) cnav.classList.toggle('compact', scrollY > 40);
  if (toTop) toTop.classList.toggle('show', scrollY > 600);
  if (ghost && !RM) ghost.style.transform = 'translateY(' + scrollY * 0.12 + 'px)';
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }));

/* ---- Count-up numbers (skips times with colons) ---- */
function countUp(el) {
  const raw = el.textContent;
  if (raw.includes(':')) return;
  const m = raw.match(/[\d,.]+/);
  if (!m) return;
  if (RM) return;
  const hasSpan = !!el.querySelector('span');
  const dec = (m[0].split('.')[1] || '').length;
  const target = parseFloat(m[0].replace(/,/g, ''));
  const prefix = raw.slice(0, m.index), suffix = raw.slice(m.index + m[0].length);
  let start = null; const dur = 1500;
  function step(t) {
    if (!start) start = t;
    const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3), v = target * e;
    const txt = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-GB');
    el.childNodes[0].nodeValue = prefix + txt + (hasSpan ? '' : suffix);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
$$('.stat-n, .cstat-n').forEach(el => {
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (x.isIntersecting) { countUp(el); io.disconnect(); }
  }), { threshold: .4 });
  io.observe(el);
});

/* ---- 3D tilt on challenge cards ---- */
if (!RM && HOVER) {
  $$('.ch-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -6;
      const ry = ((e.clientX - r.left) / r.width - .5) * 6;
      card.style.transform = `translateY(-3px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

/* ---- Magnetic buttons ---- */
if (!RM && HOVER) {
  $$('.btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
}

/* ---- Lightbox (global, keyboard accessible) ---- */
let lbRet = null;
window.openLB = function (src) {
  const lb = $('#lb'); if (!lb) return;
  lbRet = document.activeElement;
  $('#lb-img').src = src;
  lb.classList.add('open');
  $('#lb-close').focus();
};
window.closeLB = function () {
  const lb = $('#lb'); if (!lb) return;
  lb.classList.remove('open');
  if (lbRet) lbRet.focus();
};
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLB(); if (navLinks && navLinks.classList.contains('open')) setMenu(false); }
});
const lbClose = $('#lb-close');
if (lbClose) lbClose.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeLB(); }
});
$$('.cg').forEach(el => el.addEventListener('click', () => {
  const img = el.querySelector('img'); if (img) openLB(img.src);
}));

/* ---- Working forms (open mail client, pre-filled) ---- */
const EMAIL = 'dmtuition2026@gmail.com';
function markErrors(form) {
  let bad = null;
  form.querySelectorAll('[required]').forEach(f => {
    const e = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim()));
    f.classList.toggle('error', e);
    if (e && !bad) bad = f;
  });
  if (bad) bad.focus();
  return !bad;
}
function showSuccess(id) {
  const el = $('#' + id); if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 6000);
}
const sf = $('#suggestForm');
if (sf) sf.addEventListener('submit', e => {
  e.preventDefault();
  if (!markErrors(sf)) return;
  const v = id => $('#' + id).value.trim();
  const subject = 'Challenge Suggestion: ' + v('st');
  const body = `Name: ${v('sn') || '(not given)'}\nDifficulty: ${v('sd') || '(not given)'}\nChallenge: ${v('st')}\n\nDescription:\n${v('sb')}\n\nSuggested charity: ${v('sc') || '(none)'}`;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showSuccess('suc-s'); sf.reset();
});
const cf = $('#contactForm');
if (cf) cf.addEventListener('submit', e => {
  e.preventDefault();
  if (!markErrors(cf)) return;
  const v = id => $('#' + id).value.trim();
  const subject = `[ADS Contact] ${v('cs') || 'General Message'} — ${v('cn')}`;
  const body = `Name: ${v('cn')}\nEmail: ${v('ce')}\nSubject: ${v('cs') || 'General Message'}\n\nMessage:\n${v('cm')}`;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showSuccess('suc-c'); cf.reset();
});
$$('.field input,.field textarea,.field select').forEach(f => f.addEventListener('input', () => f.classList.remove('error')));

/* ---- Accessibility: alt text + lazy-load on content images ---- */
$$('.g-item img').forEach(img => {
  const l = img.closest('.g-item').querySelector('.g-label');
  if (l && !img.alt) img.alt = l.textContent.trim();
  img.loading = 'lazy'; img.decoding = 'async';
});
$$('.ch-card .ch-img').forEach(img => {
  const n = img.closest('.ch-card').querySelector('.ch-name');
  if (n && !img.alt) img.alt = n.textContent.trim();
  img.loading = 'lazy'; img.decoding = 'async';
});
$$('.strip-img').forEach((img, i) => {
  if (!img.alt) img.alt = 'AyaanDanShenanigins challenge photo ' + (i + 1);
  img.decoding = 'async'; img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLB(img.src));
});

/* ---- Seamless marquee (duplicate the track) ---- */
$$('.marquee-track').forEach(t => { t.innerHTML += t.innerHTML; });

/* ---- Rising gold dust ---- */
if (!RM && innerWidth > 720) {
  const c = document.createElement('canvas'); c.id = 'dust';
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  let W, H, parts;
  const size = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  const init = () => { parts = Array.from({ length: 55 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.7 + .4, s: Math.random() * .4 + .08, o: Math.random() * .45 + .08 })); };
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.s; p.x += Math.sin(p.y * .01) * .15;
      if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = 'rgba(212,160,23,' + p.o + ')'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  size(); init(); draw();
  addEventListener('resize', () => { size(); init(); });
}
