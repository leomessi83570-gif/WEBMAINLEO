(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const store = {
    get: (k, s = localStorage) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (k, v, s = localStorage) => { try { s.setItem(k, v); } catch (e) {} },
  };

  // ---------- Transition de page sans View Transitions (Firefox…) ----------
  if (!('PageRevealEvent' in window)) {
    document.documentElement.classList.add('no-vt');
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || reduced || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(a.href, location);
      if (a.target || url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => (location.href = url.href), 280);
    });
    addEventListener('pageshow', (e) => e.persisted && document.body.classList.remove('is-leaving'));
  }

  // ---------- Format choisi (vertical / horizontal), retenu d'une page à l'autre ----------
  const pageFmt = document.body.dataset.fmt;
  if (pageFmt) store.set('angramm-fmt', pageFmt);
  const fmt = pageFmt || store.get('angramm-fmt');
  if (fmt) {
    document.querySelectorAll('[data-fmt-link="projets"]').forEach((a) => (a.href = `/${fmt}/projets/`));
    document.querySelectorAll('.fmt a').forEach((a) => {
      if (a.dataset.fmt === fmt) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('a[data-fmt]').forEach((a) => a.addEventListener('click', () => store.set('angramm-fmt', a.dataset.fmt)));

  // full = true : le film va être lu, on le télécharge. Sinon on ne lit que l'en-tête
  // (le film suivant est prêt à démarrer sans disputer la connexion au film en cours).
  const load = (v, full = true) => {
    if (v.dataset.src) {
      v.src = v.dataset.src;
      v.removeAttribute('data-src');
    }
    v.preload = full ? 'auto' : 'metadata';
  };
  const play = (v) => !reduced && v.play().catch(() => {});

  // ---------- Son : un clic sur un film met le son (un seul film audible à la fois) ----------
  const buttons = new Map();
  let audible = null;
  const sync = (v) => {
    const b = buttons.get(v);
    if (!b) return;
    b.setAttribute('aria-pressed', String(!v.muted));
    b.querySelector('span').textContent = v.muted ? 'off' : 'on';
  };
  const mute = (v) => { v.muted = true; sync(v); if (audible === v) audible = null; };
  const toggleSound = (v) => {
    if (v.muted) {
      if (audible && audible !== v) mute(audible);
      v.muted = false;
      audible = v;
      v.play().catch(() => {});
    } else mute(v);
    sync(v);
  };
  const bindSound = (v, btn) => {
    if (btn) {
      buttons.set(v, btn);
      btn.addEventListener('click', () => toggleSound(v));
    }
    v.addEventListener('click', () => toggleSound(v));
  };

  // ---------- Fond flou : l'espace autour d'un film non plein écran reprend ses couleurs ----------
  // Le film est recopié ~10 fois/s dans un canvas minuscule (64 px) ; le flou est calculé à cette
  // petite taille puis l'image est agrandie par la carte graphique : quasi gratuit, même en scrollant.
  const startAmbient = (box) => {
    const c = box.querySelector('.ambient');
    const v = box.querySelector('video');
    stopAmbient(box);
    if (!c || reduced || getComputedStyle(v).objectFit !== 'contain') return;
    const bw = box.clientWidth, bh = box.clientHeight;
    c.width = 64;
    c.height = Math.max(1, Math.round((64 * bh) / bw));
    const k = (bw / 64) * 1.15; // un peu plus grand que l'écran pour cacher les bords flous
    c.style.width = '64px';
    c.style.height = `${c.height}px`;
    c.style.transform = `translate(${(bw - 64 * k) / 2}px, ${(bh - c.height * k) / 2}px) scale(${k})`;
    const ctx = c.getContext('2d');
    const draw = (src, w, h) => {
      const r = c.width / c.height;
      let sw = w, sh = sw / r;
      if (sh > h) { sh = h; sw = sh * r; }
      ctx.drawImage(src, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, c.width, c.height);
      c.classList.add('is-live');
    };
    // en attendant le film : l'affiche
    if (v.poster && !c.classList.contains('is-live')) {
      const img = new Image();
      img.onload = () => draw(img, img.naturalWidth, img.naturalHeight);
      img.src = v.poster;
    }
    let last = 0;
    const tick = (t) => {
      box.ambient = requestAnimationFrame(tick);
      if (t - last < 100 || v.paused || v.readyState < 2 || !v.videoWidth) return;
      last = t;
      draw(v, v.videoWidth, v.videoHeight);
    };
    box.ambient = requestAnimationFrame(tick);
  };
  const stopAmbient = (box) => {
    if (box.ambient) cancelAnimationFrame(box.ambient);
    box.ambient = 0;
  };

  // ---------- Accueil : chargement ANGRAMM puis choix du format ----------
  if (document.body.classList.contains('intro')) {
    const ready = () => {
      document.body.classList.add('is-ready');
      store.set('angramm-intro', '1', sessionStorage);
      if (touch && !reduced) opts.forEach(start); // sur mobile, les deux aperçus tournent
    };
    const opts = [...document.querySelectorAll('.opt')];
    const start = (o) => {
      const v = o.querySelector('video');
      load(v);
      v.play().then(() => o.classList.add('is-playing')).catch(() => {});
    };
    opts.forEach((o) => {
      o.addEventListener('mouseenter', () => !reduced && start(o));
      o.addEventListener('mouseleave', () => { if (!touch) { o.classList.remove('is-playing'); o.querySelector('video').pause(); } });
    });
    if (document.documentElement.classList.contains('skip-intro')) ready();
    else setTimeout(ready, 1900);
  }

  // ---------- Films plein écran : chacun se lance quand il arrive à l'écran ----------
  const reels = [...document.querySelectorAll('.reel')];
  if (reels.length) {
    // Le film visible se télécharge ; le suivant ne charge que son en-tête.
    const near = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && load(e.target.querySelector('video'), false)),
      { rootMargin: '100% 0px' }
    );
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target.querySelector('video');
          e.target.classList.toggle('in-view', e.isIntersecting);
          if (e.isIntersecting) { load(v); play(v); startAmbient(e.target); } else { v.pause(); stopAmbient(e.target); if (!v.muted) mute(v); }
        }),
      { threshold: 0.6 }
    );
    reels.forEach((r) => {
      bindSound(r.querySelector('video'), r.querySelector('.snd'));
      near.observe(r);
      seen.observe(r);
    });
    addEventListener('resize', () => { const r = document.querySelector('.reel.in-view'); if (r) startAmbient(r); });
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

  // ---------- Page projet : le film démarre avec le son quand le navigateur l'autorise ----------
  const film = document.querySelector('.film');
  if (film) {
    bindSound(film, document.querySelector('.player .snd'));
    const player = document.querySelector('.player');
    startAmbient(player);
    addEventListener('resize', () => startAmbient(player));
    if (reduced) film.pause();
    else {
      film.muted = false;
      film.play()
        .then(() => { audible = film; sync(film); })
        .catch(() => { film.muted = true; sync(film); film.play().catch(() => {}); });
    }
  }

  // ---------- Studio : le film ANGRAMM, son au clic ----------
  const studioFilm = document.querySelector('.studio-film video');
  if (studioFilm) {
    bindSound(studioFilm, document.querySelector('.studio-film .snd'));
    if (reduced) studioFilm.pause();
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
      cursor.classList.toggle('is-link', !!e.target.closest('a, button, video'));
      if (!raf) raf = requestAnimationFrame(move);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-off'));
  }
})();
