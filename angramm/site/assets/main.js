(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: (k, s = sessionStorage) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (k, v, s = sessionStorage) => { try { s.setItem(k, v); } catch (e) {} },
  };

  // ---------- Transition de page sans View Transitions (Firefox…) ----------
  if (!('PageRevealEvent' in window)) {
    document.documentElement.classList.add('no-vt');
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || reduced || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(a.href, location);
      if (a.target || url.origin !== location.origin || url.protocol === 'mailto:' || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => (location.href = url.href), 280);
    });
    addEventListener('pageshow', (e) => e.persisted && document.body.classList.remove('is-leaving'));
  }

  // full = true : le film va être lu, on le télécharge. Sinon on ne lit que l'en-tête
  // (le film suivant est prêt à démarrer sans disputer la connexion au film en cours).
  const load = (v, full = true) => {
    if (v.dataset.poster) {
      v.poster = v.dataset.poster;
      v.removeAttribute('data-poster');
    }
    if (v.dataset.src) {
      v.src = v.dataset.src;
      v.removeAttribute('data-src');
    }
    v.preload = full ? 'auto' : 'metadata';
  };
  // Les films sont le contenu du site : ils démarrent même avec « Réduire les animations ».
  // Si le téléphone bloque la lecture automatique (mode économie d'énergie sur iPhone),
  // on relance au premier geste (toucher, scroll, clavier).
  const blocked = new Set();
  const play = (v) => v.play().then(() => blocked.delete(v)).catch(() => blocked.add(v));
  const retry = () => blocked.forEach((v) => {
    const box = v.closest('.reel, .tile');
    if (!box || box.classList.contains('in-view') || box.classList.contains('tile')) play(v);
  });
  ['touchstart', 'pointerdown', 'keydown', 'wheel'].forEach((t) => addEventListener(t, retry, { passive: true }));

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
    if (!v) return;
    if (btn) {
      buttons.set(v, btn);
      btn.addEventListener('click', () => toggleSound(v));
    }
    v.addEventListener('click', () => toggleSound(v));
  };

  // ---------- Fond flou : l'espace autour d'un film non plein écran reprend ses couleurs ----------
  // Le film est recopié ~10 fois/s dans un canvas minuscule (64 px) ; le flou est calculé à cette
  // petite taille puis l'image est agrandie par la carte graphique : quasi gratuit, même en scrollant.
  const stopAmbient = (box) => {
    if (box.ambient) cancelAnimationFrame(box.ambient);
    box.ambient = 0;
  };
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

  // ---------- Écran de chargement ANGRAMM (une fois par visite) ----------
  if (document.body.classList.contains('has-loader')) {
    const ready = () => {
      document.body.classList.add('is-ready');
      store.set('angramm-intro', '1');
    };
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
      const v = r.querySelector('video');
      bindSound(v, r.querySelector('.snd'));
      near.observe(r);
      seen.observe(r);
      // dès que ce film tourne, le suivant se télécharge en entier : il démarre instantanément au scroll
      v.addEventListener('playing', () => {
        const nextReel = reels.slice(reels.indexOf(r) + 1).find((x) => x.offsetParent);
        if (nextReel) setTimeout(() => load(nextReel.querySelector('video')), 800);
      });
    });
    // le premier film visible (16:9 sur ordinateur, vertical sur téléphone) se charge tout de suite
    const first = reels.find((x) => x.offsetParent);
    if (first) load(first.querySelector('video'));
    addEventListener('resize', () => { const r = document.querySelector('.reel.in-view'); if (r) startAmbient(r); });
    document.addEventListener('visibilitychange', () => {
      const v = document.querySelector('.reel.in-view video');
      if (v) document.hidden ? v.pause() : play(v);
    });
  }

  // ---------- Mosaïque : les aperçus tournent tout seuls quand ils sont à l'écran ----------
  const tiles = [...document.querySelectorAll('.tile')];
  if (tiles.length) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target.querySelector('video');
          if (e.isIntersecting) {
            load(v);
            play(v);
            v.addEventListener('playing', () => e.target.classList.add('is-playing'), { once: true });
          } else v.pause();
        }),
      { threshold: 0.5 }
    );
    tiles.forEach((t) => io.observe(t));
  }

  // ---------- Page projet : le film démarre avec le son quand le navigateur l'autorise ----------
  const film = document.querySelector('.film');
  if (film) {
    const player = document.querySelector('.player');
    bindSound(film, document.querySelector('.player .snd'));
    startAmbient(player);
    addEventListener('resize', () => startAmbient(player));
    {
      film.muted = false;
      film.play()
        .then(() => { audible = film; sync(film); })
        .catch(() => { film.muted = true; sync(film); film.play().catch(() => {}); });
    }
  }

  // ---------- Page film : flèches du clavier ← → pour passer au film précédent / suivant ----------
  document.querySelectorAll('.arrow[data-key]').forEach((a) => {
    addEventListener('keydown', (e) => {
      if (e.key === a.dataset.key && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea/i.test(e.target.tagName)) location.href = a.href;
    });
  });

  // ---------- Team : le film ANGRAMM (son au clic) et les onglets « Behind the scenes » ----------
  const teamFilm = document.querySelector('.contact-film video');
  if (teamFilm) {
    bindSound(teamFilm, document.querySelector('.contact-film .snd'));
  }
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

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
