(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Accueil : une vidéo plein écran par projet ----------
  const reels = [...document.querySelectorAll('.reel')];
  const items = [...document.querySelectorAll('.item')];
  if (reels.length) {
    const counter = document.querySelector('[data-current]');
    const CYCLE = 7000;
    let current = 0;
    let timer = null;

    const load = (v) => {
      if (v.dataset.src) {
        v.src = v.dataset.src;
        v.removeAttribute('data-src');
        v.preload = 'auto';
      }
    };

    const setActive = (i) => {
      if (i === current) return;
      const prev = reels[current];
      current = i;
      const v = reels[i];
      load(v);
      if (!reduced) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      reels.forEach((r) => r.classList.toggle('is-active', r === v));
      items.forEach((a, j) => a.classList.toggle('is-active', j === i));
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
      setTimeout(() => current !== reels.indexOf(prev) && prev.pause(), 900);
      load(reels[(i + 1) % reels.length]); // la suivante est prête avant son tour
    };

    const start = () => {
      if (reduced) return;
      clearInterval(timer);
      timer = setInterval(() => setActive((current + 1) % reels.length), CYCLE);
    };
    const stop = () => clearInterval(timer);

    if (reduced) reels[0].pause();
    items.forEach((a, i) => {
      a.addEventListener('mouseenter', () => { stop(); setActive(i); });
      a.addEventListener('focus', () => { stop(); setActive(i); });
    });
    document.querySelector('.list').addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { stop(); reels[current].pause(); }
      else { if (!reduced) reels[current].play().catch(() => {}); start(); }
    });
    addEventListener('load', () => load(reels[1 % reels.length]));
    start();
  }

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
})();
