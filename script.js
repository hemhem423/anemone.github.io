/* ============================================================
   あねもね — main.js
   ============================================================ */
'use strict';

/* ── 1. Blob morphing keyframes ─────────────────────────── */
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

const blobs  = document.querySelectorAll('.blob');
const mKeys  = ['ma', 'mb', 'mc', 'mb', 'ma', 'mc'];
const mDurs  = [26, 22, 30, 28, 24, 20];
blobs.forEach((b, i) => {
  b.style.animation = `${mKeys[i % mKeys.length]} ${mDurs[i]}s ease-in-out infinite`;
});

/* ── 2. Blob parallax (rAF) ─────────────────────────────── */
let blobTick = false;
const moveBlobs = () => {
  const sy = window.scrollY;
  blobs.forEach(b => {
    const sp = parseFloat(b.dataset.speed) || 0.05;
    b.style.transform = `translateY(${-sy * sp}px)`;
  });
  blobTick = false;
};
window.addEventListener('scroll', () => {
  if (!blobTick) { requestAnimationFrame(moveBlobs); blobTick = true; }
}, { passive: true });
moveBlobs();

/* ── 3. Scroll-reveal (data-anim) ───────────────────────── */
const animObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      animObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-anim]').forEach(el => animObs.observe(el));

/* ── 4. Stagger children of .stagger parent ─────────────── */
document.querySelectorAll('.stagger').forEach(parent => {
  const children = parent.children;
  Array.from(children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.08}s`;
  });
  animObs.observe(parent);
});

/* ── 5. Counter animation ────────────────────────────────── */
const counters = document.querySelectorAll('[data-count]');

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const end = parseInt(el.dataset.count, 10);
    const dur = 1600;
    const start = performance.now();
    const tick = now => {
      const elapsed = now - start;
      const prog = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - prog, 3); // ease-out cubic
      el.textContent = Math.round(eased * end);
      if (prog < 1) requestAnimationFrame(tick);
      else el.textContent = end;
    };
    requestAnimationFrame(tick);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(c => countObs.observe(c));

/* ── 6. Header scroll class ─────────────────────────────── */
const hdr = document.querySelector('.hdr');
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── 7. Active nav highlight ────────────────────────────── */
const navAs = document.querySelectorAll('.gnav-a');
const sections = document.querySelectorAll('section[id], nav[id]');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => a.classList.remove('active'));
      const match = document.querySelector(`.gnav-a[href="#${e.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => navObs.observe(s));

/* ── 8. Hamburger / mobile menu ─────────────────────────── */
const hbgBtn  = document.getElementById('hbg');
const mmenu   = document.getElementById('mmenu');
const mclose  = document.getElementById('mmenu-close');

const openMenu = () => {
  hbgBtn.setAttribute('aria-expanded', 'true');
  hbgBtn.setAttribute('aria-label', 'メニューを閉じる');
  mmenu.setAttribute('aria-hidden', 'false');
  mmenu.classList.add('open');
  document.body.style.overflow = 'hidden';
};
const closeMenu = () => {
  hbgBtn.setAttribute('aria-expanded', 'false');
  hbgBtn.setAttribute('aria-label', 'メニューを開く');
  mmenu.setAttribute('aria-hidden', 'true');
  mmenu.classList.remove('open');
  document.body.style.overflow = '';
};

hbgBtn.addEventListener('click', () =>
  hbgBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu()
);
mclose.addEventListener('click', closeMenu);
document.querySelectorAll('.ml').forEach(l => l.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

/* ── 9. Facility horizontal drag-scroll ─────────────────── */
const track = document.querySelector('.fac-scroll-track');
const bar   = document.querySelector('.fac-progress-bar');
const prevBtn = document.getElementById('fac-prev');
const nextBtn = document.getElementById('fac-next');

if (track) {
  let isDragging = false, startX = 0, scrollLeft = 0;

  const updateBar = () => {
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 75 + 25 : 100;
    if (bar) bar.style.width = pct + '%';
  };

  track.addEventListener('mousedown', e => {
    isDragging = true;
    track.classList.add('dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    track.classList.remove('dragging');
  });
  track.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.4;
    updateBar();
  });
  track.addEventListener('scroll', updateBar, { passive: true });

  // Touch support
  let touchStartX = 0, touchScrollLeft = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].pageX;
    track.scrollLeft = touchScrollLeft + dx;
    updateBar();
  }, { passive: true });

  const cardW = () => (track.querySelector('.fac-card')?.offsetWidth || 320) + 20;

  if (prevBtn) prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -cardW(), behavior: 'smooth' });
    setTimeout(updateBar, 400);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: cardW(), behavior: 'smooth' });
    setTimeout(updateBar, 400);
  });

  updateBar();
}

/* ── 10. Back to top ─────────────────────────────────────── */
const totop = document.getElementById('totop');
window.addEventListener('scroll', () => {
  totop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── 11. Hero image subtle float ────────────────────────── */
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    heroImg.style.transform = `translateY(${sy * 0.12}px)`;
  }, { passive: true });
}