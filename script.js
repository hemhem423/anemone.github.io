/* ============================================
   特別養護老人ホーム あねもね — main.js
   ============================================ */
'use strict';

/* ── Blob morphing keyframes ────────────────── */
const mCSS = document.createElement('style');
mCSS.textContent = `
  @keyframes ma {
    0%   { border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%; }
    33%  { border-radius: 45% 55% 38% 62% / 62% 44% 56% 38%; }
    66%  { border-radius: 55% 45% 62% 38% / 40% 58% 42% 60%; }
    100% { border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%; }
  }
  @keyframes mb {
    0%   { border-radius: 42% 58% 35% 65% / 60% 44% 56% 40%; }
    50%  { border-radius: 62% 38% 55% 45% / 42% 60% 40% 58%; }
    100% { border-radius: 42% 58% 35% 65% / 60% 44% 56% 40%; }
  }
  @keyframes mc {
    0%   { border-radius: 52% 48% 42% 58% / 45% 62% 38% 55%; }
    50%  { border-radius: 38% 62% 58% 42% / 60% 38% 62% 40%; }
    100% { border-radius: 52% 48% 42% 58% / 45% 62% 38% 55%; }
  }
`;
document.head.appendChild(mCSS);

const blobs = document.querySelectorAll('.b');
const mKeys = ['ma', 'mb', 'mc', 'mb', 'ma', 'mc'];
const mDurs = [26, 22, 28, 30, 24, 20];
blobs.forEach((b, i) => {
  b.style.animation = `${mKeys[i]} ${mDurs[i]}s ease-in-out infinite`;
});

/* ── Blob parallax (rAF-throttled) ─────────── */
let tick = false;
const moveBlobs = () => {
  const sy = window.scrollY;
  blobs.forEach(b => {
    const speed = parseFloat(b.dataset.speed) || 0.05;
    b.style.transform = `translateY(${-sy * speed}px)`;
  });
  tick = false;
};
window.addEventListener('scroll', () => {
  if (!tick) { requestAnimationFrame(moveBlobs); tick = true; }
}, { passive: true });
moveBlobs();

/* ── Hamburger menu ─────────────────────────── */
const hbg    = document.getElementById('hbg');
const mm     = document.getElementById('mmenu');
const mclose = document.getElementById('mmenu-close');

const openM = () => {
  hbg.setAttribute('aria-expanded', 'true');
  hbg.setAttribute('aria-label', 'メニューを閉じる');
  mm.setAttribute('aria-hidden', 'false');
  mm.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeM = () => {
  hbg.setAttribute('aria-expanded', 'false');
  hbg.setAttribute('aria-label', 'メニューを開く');
  mm.setAttribute('aria-hidden', 'true');
  mm.classList.remove('open');
  document.body.style.overflow = '';
};

hbg.addEventListener('click', () => {
  hbg.getAttribute('aria-expanded') === 'true' ? closeM() : openM();
});
mclose.addEventListener('click', closeM);
document.querySelectorAll('.ml').forEach(l => l.addEventListener('click', closeM));
document.addEventListener('keydown', e => e.key === 'Escape' && closeM());

/* ── Fade-in on scroll ──────────────────────── */
const fiObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      fiObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });

document.querySelectorAll('.fi').forEach(el => fiObs.observe(el));

/* ── Active nav highlight on scroll ────────── */
const navAs = document.querySelectorAll('.gnav-a');
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(l => l.classList.remove('on'));
        const a = document.querySelector(`.gnav-a[href="#${e.target.id}"]`);
        if (a) a.classList.add('on');
      }
    });
  }, { threshold: 0.35 }).observe(sec);
});

/* ── Back to top ────────────────────────────── */
const totop = document.getElementById('totop');
window.addEventListener('scroll', () => {
  totop.classList.toggle('on', window.scrollY > 400);
}, { passive: true });
totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));