(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const load = (v) => {
    if (v.dataset.src) {
      v.src = v.dataset.src;
      v.removeAttribute('data-src');
      v.preload = 'auto';
    }
  };
  const play = (v) => !reduced && v.play().catch(() => {});

  // ---------- Accueil : chaque film se lance quand il arrive à l'écran ----------
  const reels = [...document.querySelectorAll('.reel')];
  if (reels.length) {
    // Charge le film visible et le suivant, pas les autres.
    const near = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && load(e.target.querySelector('video'))),
      { rootMargin: '100% 0px' }
    );
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target.querySelector('video');
          e.target.classList.toggle('in-view', e.isIntersecting);
          if (e.isIntersecting) { load(v); play(v); } else v.pause();
        }),
      { threshold: 0.6 }
    );
    reels.forEach((r) => { near.observe(r); seen.observe(r); });
    document.addEventListener('visibilitychange', () => {
      const v = document.querySelector('.reel.in-view video');
      if (v) document.hidden ? v.pause() : play(v);
    });
  }

  // ---------- Projets : l'aperçu s'anime au survol ----------
  document.querySelectorAll('.thumb').forEach((a) => {
    const v = a.querySelector('video');
    a.addEventListener('mouseenter', () => {
      if (reduced) return;
      load(v);
      v.currentTime = 0;
      v.play().then(() => a.classList.add('is-playing')).catch(() => {});
    });
    a.addEventListener('mouseleave', () => { a.classList.remove('is-playing'); v.pause(); });
  });

  // ---------- Page projet : son + lecture ----------
  const film = document.querySelector('.film');
  if (film) {
    const btn = document.querySelector('.sound');
    const label = btn.querySelector('span');
    let started = false;
    if (reduced) film.pause();

    btn.addEventListener('click', () => {
      film.muted = !film.muted;
      if (!film.muted && !started) {
        started = true;
        film.currentTime = 0; // le premier passage avec le son repart du début
        film.loop = false;
      }
      film.play().catch(() => {});
      btn.setAttribute('aria-pressed', String(!film.muted));
      label.textContent = film.muted ? 'off' : 'on';
    });
    film.addEventListener('click', () => (film.paused ? film.play() : film.pause()));
  }

  // ---------- Curseur ----------
  const cursor = document.querySelector('.cursor');
  if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, raf = 0;
    const move = () => {
      raf = 0;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    addEventListener('pointermove', (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.remove('is-off');
      cursor.classList.toggle('is-link', !!e.target.closest('a, button'));
      if (!raf) raf = requestAnimationFrame(move);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-off'));
  }
})();
