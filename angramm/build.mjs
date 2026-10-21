// Génère les pages HTML statiques du site ANGRAMM dans site/.
// Usage : node build.mjs   (aucune dépendance)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'site');
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
const projects = JSON.parse(readFileSync(join(root, 'content/projects.json'), 'utf8'));
const base = site.url.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

// Deux sites en un : les films verticaux et les films horizontaux.
const fmtOf = (p) => (p.height > p.width ? 'vertical' : 'horizontal');
const FORMATS = {
  horizontal: { label: 'Horizontal', list: projects.filter((p) => fmtOf(p) === 'horizontal') },
  vertical: { label: 'Vertical', list: projects.filter((p) => fmtOf(p) === 'vertical') },
};

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const iso = (sec) => `PT${Math.floor(sec / 60)}M${Math.round(sec % 60)}S`;
const num = (i) => String(i + 1).padStart(2, '0');
const name = (p) => `${p.client} · ${p.title}`;
const write = (path, html) => {
  mkdirSync(dirname(join(out, path)), { recursive: true });
  writeFileSync(join(out, path), html);
};

const org = {
  '@type': 'Organization',
  '@id': `${base}/#org`,
  name: site.name,
  url: `${base}/`,
  logo: `${base}/favicon.svg`,
  description: site.description,
  sameAs: [site.instagram],
  ...(site.email && { email: site.email }),
  ...(site.city && { address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: site.country } }),
};

function head({ title, description, path, image, video, extra = '' }) {
  const url = `${base}${path}`;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#000000">
<meta property="og:type" content="${video ? 'video.other' : 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${base}${image}">
${video ? `<meta property="og:video" content="${base}${video}">\n<meta property="og:video:type" content="video/mp4">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/style.css">
<script>if (!('PageRevealEvent' in window)) document.documentElement.classList.add('no-vt');</script>
${extra}</head>`;
}

// En-tête façon 530° : liens fins répartis, logo au centre, bascule de format H / V.
// fmt = format de la page (null pour Studio / Contact : main.js reprend le dernier format choisi).
// kind = 'home' | 'projets' pour que la bascule mène à la page équivalente de l'autre format.
const header = ({ current = '', fmt = null, kind = 'home' } = {}) => {
  const link = (href, label, key, attrs = '') => `<a href="${href}"${attrs}${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const target = (f) => (kind === 'projets' ? `/${f}/projets/` : `/${f}/`);
  const toggle = Object.entries(FORMATS)
    .map(([f, F]) => `<a href="${target(f)}" data-fmt="${f}" ${fmt === f ? ' aria-current="true"' : ''}>${F.label}</a>`)
    .join('<span>/</span>');
  return `<header class="top">
  <nav class="nav" aria-label="Navigation principale">
    ${link(`/${fmt || 'horizontal'}/projets/`, 'Projets', 'projets', fmt ? '' : ' data-fmt-link="projets"')}
    ${link('/studio/', 'Studio', 'studio')}
    <a class="wordmark" href="/" aria-label="${esc(site.name)}, accueil">${esc(site.name)}<sup>®</sup></a>
    ${link('/contact/', 'Contact', 'contact')}
    <span class="fmt" aria-label="Format">${toggle}</span>
  </nav>
</header>`;
};

const tail = `<div class="cursor is-off" aria-hidden="true"><span>A</span></div>
<script src="/assets/main.js" defer></script>
</body>
</html>
`;

// Films plein écran qui défilent au scroll ; un clic sur le film met le son.
const reelsMarkup = (list, eager) =>
  list
    .map(
      (p, i) => `<div class="reel${p.height > p.width ? ' is-portrait' : ''}" style="--poster:url(/media/${p.slug}/poster.jpg)">
    <canvas class="ambient" width="64" height="36" aria-hidden="true"></canvas>
    <video muted loop playsinline preload="${eager && i === 0 ? 'auto' : 'none'}" poster="/media/${p.slug}/poster.jpg" data-src="/media/${p.slug}/full.mp4#t=${p.start || 0}"></video>
    <a class="cap" href="/work/${p.slug}/">${esc(p.short || p.client)} <span class="arr">→</span><span class="t">${esc(p.title)}</span></a>
    <button class="snd" type="button" aria-pressed="false">Son <span>off</span></button>
    <span class="num">${num(i)} / ${num(list.length - 1)}</span>
  </div>`
    )
    .join('\n  ');

// ---------- Accueil : écran de chargement puis choix du format ----------
function intro() {
  const opt = (f) => {
    const F = FORMATS[f];
    const p = F.list[0];
    return `<a class="opt opt-${f}" href="/${f}/" data-fmt="${f}">
    <video muted loop playsinline preload="none" poster="/media/${p.slug}/poster.jpg" data-src="/media/${p.slug}/preview.mp4" aria-hidden="true"></video>
    <span class="opt-in">
      <span class="shape" aria-hidden="true"></span>
      <span class="opt-name">${F.label}</span>
      <span class="opt-n">${String(F.list.length).padStart(2, '0')} films</span>
    </span>
  </a>`;
  };
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [org, { '@type': 'WebSite', '@id': `${base}/#site`, url: `${base}/`, name: site.name, inLanguage: site.lang, publisher: { '@id': `${base}/#org` } }],
  };
  write(
    'index.html',
    `${head({
      title: `${site.name}® · ${site.tagline}`,
      description: site.description,
      path: '/',
      image: `/media/${FORMATS.horizontal.list[0].slug}/poster.jpg`,
      extra: `<script>try { if (sessionStorage.getItem('angramm-intro') || matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('skip-intro'); } catch (e) {}</script>\n${jsonLd(ld)}\n`,
    })}
<body class="intro">
<div class="loader" aria-hidden="true">
  <span class="loader-mark">${esc(site.name)}<sup>®</sup></span>
  <span class="loader-bar"><i></i></span>
</div>
<header class="intro-top"><a class="wordmark" href="/">${esc(site.name)}<sup>®</sup></a></header>
<main class="choice">
  <h1 class="sr-only">${esc(site.name)}® · ${esc(site.tagline)}</h1>
  <p class="choice-label">Choisir un format</p>
  ${opt('vertical')}
  ${opt('horizontal')}
</main>
<nav class="intro-foot" aria-label="Pages"><a href="/studio/">Studio</a><a href="/contact/">Contact</a></nav>
${tail}`
  );
}

// ---------- /<format>/ : les films défilent au scroll ----------
function formatHome(f) {
  const F = FORMATS[f];
  write(
    `${f}/index.html`,
    `${head({
      title: `${F.label} · ${site.name}®`,
      description: `Les films ${F.label.toLowerCase()}s d'${site.name}® : ${F.list.map((p) => p.short || p.client).join(', ')}.`,
      path: `/${f}/`,
      image: `/media/${F.list[0].slug}/poster.jpg`,
      extra: `<link rel="preload" href="/media/${F.list[0].slug}/poster.jpg" as="image" fetchpriority="high">\n`,
    })}
<body class="home" data-fmt="${f}">
${header({ fmt: f, kind: 'home' })}
<main class="reels">
  <h1 class="sr-only">${esc(site.name)}® · films ${F.label.toLowerCase()}s</h1>
  ${reelsMarkup(F.list, true)}
</main>
${tail}`
  );
}

// ---------- /<format>/projets/ : grille alignée qui tient dans l'écran, puis les films au scroll ----------
function formatProjects(f) {
  const F = FORMATS[f];
  const n = F.list.length;
  const vertical = f === 'vertical';
  const cols = vertical ? Math.min(n, 4) : Math.ceil(Math.sqrt(n));
  const mcols = vertical ? (n > 4 ? 3 : 2) : 1;
  const vars = `--cols:${cols};--rows:${Math.ceil(n / cols)};--mcols:${mcols};--mrows:${Math.ceil(n / mcols)};--ar:${vertical ? '9 / 16' : '16 / 9'};--k:${vertical ? 9 / 16 : 16 / 9}`;
  const cells = F.list
    .map(
      (p, i) => `<li class="cell" style="--i:${i}">
      <a class="thumb" href="/work/${p.slug}/">
        <span class="frame">
          <img src="/media/${p.slug}/poster.jpg" alt="${esc(name(p))}" width="${p.width}" height="${p.height}" decoding="async">
          <video muted loop playsinline preload="none" data-src="/media/${p.slug}/preview.mp4" aria-hidden="true"></video>
        </span>
        <span class="meta"><span class="n">${num(i)}</span> <span class="c">${esc(p.short || p.client)}</span> <span class="t">${esc(p.title)}</span></span>
      </a>
    </li>`
    )
    .join('\n    ');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      {
        '@type': 'CollectionPage',
        name: `Projets ${F.label.toLowerCase()}s · ${site.name}`,
        url: `${base}/${f}/projets/`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: F.list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/work/${p.slug}/`, name: name(p) })),
        },
      },
    ],
  };
  write(
    `${f}/projets/index.html`,
    `${head({
      title: `Projets ${F.label.toLowerCase()}s | ${site.name}®`,
      description: `Tous les films ${F.label.toLowerCase()}s ${site.name} : ${F.list.map((p) => p.short || p.client).join(', ')}.`,
      path: `/${f}/projets/`,
      image: `/media/${F.list[0].slug}/poster.jpg`,
      extra: `${jsonLd(ld)}\n`,
    })}
<body class="page-projets" data-fmt="${f}">
${header({ current: 'projets', fmt: f, kind: 'projets' })}
<main class="grid-wrap">
  <h1 class="sr-only">Projets ${F.label.toLowerCase()}s</h1>
  <ol class="grid grid-${f}" style="${vars}">
    ${cells}
  </ol>
</main>
<section class="reels" aria-label="Films">
  ${reelsMarkup(F.list, false)}
</section>
${tail}`
  );
}

// ---------- Studio ----------
function studioPage() {
  const clients = [...new Set(projects.flatMap((p) => p.client.split(' × ')))];
  const film = site.studioFilm;
  write(
    'studio/index.html',
    `${head({
      title: `Studio | ${site.name}®`,
      description: site.description,
      path: '/studio/',
      image: film ? film.poster : `/media/${projects[0].slug}/poster.jpg`,
      extra: `${jsonLd({ '@context': 'https://schema.org', '@graph': [org, { '@type': 'AboutPage', url: `${base}/studio/`, about: { '@id': `${base}/#org` } }] })}\n`,
    })}
<body class="page-studio">
${header({ current: 'studio' })}
<main class="studio">
  <h1 class="sr-only">Studio</h1>
  <div class="studio-col">
    <div class="studio-text">
      ${site.about.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>
    <dl class="facts">
      <div><dt>Clients</dt><dd>${clients.map(esc).join(', ')}</dd></div>
      ${site.city ? `<div><dt>Basé à</dt><dd>${esc(site.city)}</dd></div>` : ''}
    </dl>
  </div>
  ${
    film
      ? `<figure class="studio-film">
    <video class="tap-sound" src="${film.src}" poster="${film.poster}" muted loop playsinline autoplay preload="auto" width="${film.width}" height="${film.height}"></video>
    <figcaption><button class="snd" type="button" aria-pressed="false">Son <span>off</span></button></figcaption>
  </figure>`
      : ''
  }
</main>
${tail}`
  );
}

// ---------- Contact ----------
function contactPage() {
  const handle = '@' + site.instagram.replace(/\/$/, '').split('/').pop();
  const lines = [
    site.email && `<li><span class="label-k">E-mail</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>`,
    `<li><span class="label-k">Instagram</span><a href="${esc(site.instagram)}" rel="me noopener" target="_blank">${esc(handle)} ↗</a></li>`,
    site.city && `<li><span class="label-k">Basé à</span><span>${esc(site.city)}</span></li>`,
  ].filter(Boolean);
  write(
    'contact/index.html',
    `${head({
      title: `Contact | ${site.name}®`,
      description: `Contacter ${site.name}® pour un film ou une campagne.`,
      path: '/contact/',
      image: `/media/${projects[0].slug}/poster.jpg`,
      extra: `${jsonLd({ '@context': 'https://schema.org', '@graph': [org, { '@type': 'ContactPage', url: `${base}/contact/`, about: { '@id': `${base}/#org` } }] })}\n`,
    })}
<body class="page-contact">
${header({ current: 'contact' })}
<main class="contact">
  <h1 class="contact-title">Un film,<br>une campagne&nbsp;?</h1>
  <ul class="contact-list">
    ${lines.join('\n    ')}
  </ul>
</main>
${tail}`
  );
}

// ---------- Pages projet ----------
function project(p) {
  const f = fmtOf(p);
  const list = FORMATS[f].list;
  const next = list[(list.indexOf(p) + 1) % list.length];
  const path = `/work/${p.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      {
        '@type': 'VideoObject',
        name: name(p),
        description: p.summary,
        thumbnailUrl: [`${base}/media/${p.slug}/poster.jpg`],
        contentUrl: `${base}/media/${p.slug}/full.mp4`,
        uploadDate: p.date || today,
        duration: iso(p.duration),
        width: p.width,
        height: p.height,
        inLanguage: site.lang,
        creator: { '@id': `${base}/#org` },
        ...(p.location && { contentLocation: { '@type': 'Place', name: p.location } }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.name, item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: `Projets ${FORMATS[f].label.toLowerCase()}s`, item: `${base}/${f}/projets/` },
          { '@type': 'ListItem', position: 3, name: name(p), item: `${base}${path}` },
        ],
      },
    ],
  };
  const dur = `${Math.floor(p.duration / 60)}′${String(Math.round(p.duration % 60)).padStart(2, '0')}″`;

  write(
    `work/${p.slug}/index.html`,
    `${head({
      title: `${name(p)} | ${site.name}®`,
      description: p.summary,
      path,
      image: `/media/${p.slug}/poster.jpg`,
      video: `/media/${p.slug}/full.mp4`,
      extra: `${jsonLd(ld)}\n`,
    })}
<body class="work" data-fmt="${f}">
${header({ current: 'projets', fmt: f, kind: 'projets' })}
<main>
  <section class="player${p.height > p.width ? ' is-portrait' : ''}" aria-label="Film" style="--poster:url(/media/${p.slug}/poster.jpg)">
    <canvas class="ambient" width="64" height="36" aria-hidden="true"></canvas>
    <video class="film tap-sound" src="/media/${p.slug}/full.mp4" poster="/media/${p.slug}/poster.jpg" playsinline autoplay muted preload="auto" width="${p.width}" height="${p.height}"></video>
    <h1 class="cap">${esc(p.client)} <span>${esc(p.title)}</span></h1>
    <button class="snd" type="button" aria-pressed="false">Son <span>off</span></button>
  </section>

  <article class="sheet">
    <p class="summary">${esc(p.summary)}</p>
    <dl class="facts">
      <div><dt>Client</dt><dd>${esc(p.client)}</dd></div>
      ${p.location ? `<div><dt>Lieu</dt><dd>${esc(p.location)}</dd></div>` : ''}
      <div><dt>Format</dt><dd>${FORMATS[f].label}</dd></div>
      <div><dt>Durée</dt><dd>${dur}</dd></div>
      ${(p.credits || []).map((c) => `<div><dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd></div>`).join('')}
    </dl>
    <nav class="pager" aria-label="Projets">
      <a href="/${f}/projets/">Tous les projets</a>
      <a href="/work/${next.slug}/">Suivant : ${esc(next.short || next.client)}</a>
    </nav>
  </article>
</main>
${tail}`
  );
}

// ---------- SEO : sitemap, robots, llms.txt ----------
function seoFiles() {
  const page = (path) => `  <url><loc>${base}${path}</loc><lastmod>${today}</lastmod></url>`;
  const urls = [
    page('/'),
    ...Object.keys(FORMATS).flatMap((f) => [page(`/${f}/`), page(`/${f}/projets/`)]),
    page('/studio/'),
    page('/contact/'),
    ...projects.map(
      (p) => `  <url>
    <loc>${base}/work/${p.slug}/</loc>
    <lastmod>${today}</lastmod>
    <video:video>
      <video:thumbnail_loc>${base}/media/${p.slug}/poster.jpg</video:thumbnail_loc>
      <video:title>${esc(name(p))}</video:title>
      <video:description>${esc(p.summary)}</video:description>
      <video:content_loc>${base}/media/${p.slug}/full.mp4</video:content_loc>
      <video:duration>${Math.round(p.duration)}</video:duration>
    </video:video>
  </url>`
    ),
  ];
  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('\n')}
</urlset>
`
  );
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  const section = (f) =>
    `## Films ${FORMATS[f].label.toLowerCase()}s\n\n${FORMATS[f].list.map((p) => `- [${name(p)}](${base}/work/${p.slug}/): ${p.summary}`).join('\n')}`;
  write(
    'llms.txt',
    `# ${site.name}®\n\n> ${site.description}\n\n${site.about.join(' ')}\n\n${section('horizontal')}\n\n${section('vertical')}\n\n## Contact\n\n${
      site.email ? `- E-mail : ${site.email}\n` : ''
    }- Instagram : ${site.instagram}\n`
  );
}

intro();
Object.keys(FORMATS).forEach((f) => { formatHome(f); formatProjects(f); });
studioPage();
contactPage();
projects.forEach(project);
seoFiles();
console.log(`OK : ${projects.length + 7} pages générées dans site/`);
