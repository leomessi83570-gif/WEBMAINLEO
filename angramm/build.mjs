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
${extra}</head>`;
}

// En-tête façon 530° : liens fins répartis sur la largeur, logo ANGRAMM au centre.
const header = (current = '') => {
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="top">
  <nav class="nav" aria-label="Navigation principale">
    ${link('/projets/', 'Projets', 'projets')}
    ${link('/studio/', 'Studio', 'studio')}
    <a class="wordmark" href="/" aria-label="${esc(site.name)}, accueil">${esc(site.name)}<sup>®</sup></a>
    ${link('/studio/#contact', 'Contact', 'contact')}
    <a href="${esc(site.instagram)}" rel="me noopener" target="_blank">Instagram</a>
  </nav>
</header>`;
};

const tail = `<div class="cursor is-off" aria-hidden="true"><span>A</span></div>
<script src="/assets/main.js" defer></script>
</body>
</html>
`;

// ---------- Accueil : les films défilent au scroll, plein écran ----------
function home() {
  const reels = projects
    .map(
      (p, i) => `<a class="reel${p.height > p.width ? ' is-portrait' : ''}" href="/work/${p.slug}/" aria-label="${esc(name(p))}">
    <video muted loop playsinline preload="${i === 0 ? 'auto' : 'none'}" poster="/media/${p.slug}/poster.jpg" data-src="/media/${p.slug}/full.mp4#t=${p.start || 0}"></video>
    <span class="cap">${esc(p.short || p.client)}</span>
    <span class="num">${num(i)} / ${num(projects.length - 1)}</span>
  </a>`
    )
    .join('\n  ');

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
      image: `/media/${projects[0].slug}/poster.jpg`,
      extra: `<link rel="preload" href="/media/${projects[0].slug}/poster.jpg" as="image" fetchpriority="high">\n${jsonLd(ld)}\n`,
    })}
<body class="home">
${header()}
<main class="reels">
  <h1 class="sr-only">${esc(site.name)}® · ${esc(site.tagline)}</h1>
  ${reels}
</main>
${tail}`
  );
}

// ---------- Projets : grille aérée, la vignette s'anime au survol ----------
function projectsPage() {
  const cells = projects
    .map(
      (p, i) => `<li class="cell">
      <a class="thumb" href="/work/${p.slug}/">
        <span class="frame">
          <img src="/media/${p.slug}/poster.jpg" alt="${esc(name(p))}" width="${p.width}" height="${p.height}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async">
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
        name: `Projets · ${site.name}`,
        url: `${base}/projets/`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/work/${p.slug}/`, name: name(p) })),
        },
      },
    ],
  };

  write(
    'projets/index.html',
    `${head({
      title: `Projets | ${site.name}®`,
      description: `Tous les films ${site.name} : ${projects.map((p) => p.short || p.client).join(', ')}.`,
      path: '/projets/',
      image: `/media/${projects[0].slug}/poster.jpg`,
      extra: `${jsonLd(ld)}\n`,
    })}
<body class="page-projets">
${header('projets')}
<main class="grid-wrap">
  <h1 class="sr-only">Projets</h1>
  <ol class="grid">
    ${cells}
  </ol>
</main>
${tail}`
  );
}

// ---------- Studio + contact ----------
function studioPage() {
  const clients = [...new Set(projects.flatMap((p) => p.client.split(' × ')))];
  write(
    'studio/index.html',
    `${head({
      title: `Studio | ${site.name}®`,
      description: site.description,
      path: '/studio/',
      image: `/media/${projects[0].slug}/poster.jpg`,
      extra: `${jsonLd({ '@context': 'https://schema.org', '@graph': [org, { '@type': 'AboutPage', url: `${base}/studio/`, about: { '@id': `${base}/#org` } }] })}\n`,
    })}
<body class="page-studio">
${header('studio')}
<main class="studio">
  <h1 class="sr-only">Studio</h1>
  <div class="studio-text">
    ${site.about.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  <dl class="facts">
    <div><dt>Clients</dt><dd>${clients.map(esc).join('<br>')}</dd></div>
    <div id="contact"><dt>Contact</dt><dd>${site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br>` : ''}<a href="${esc(site.instagram)}" rel="me noopener" target="_blank">Instagram</a></dd></div>
    ${site.city ? `<div><dt>Basé à</dt><dd>${esc(site.city)}</dd></div>` : ''}
  </dl>
</main>
${tail}`
  );
}

// ---------- Pages projet ----------
function project(p, i) {
  const next = projects[(i + 1) % projects.length];
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
          { '@type': 'ListItem', position: 2, name: 'Projets', item: `${base}/projets/` },
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
<body class="work">
${header('projets')}
<main>
  <section class="player" aria-label="Film">
    <video class="film" src="/media/${p.slug}/full.mp4" poster="/media/${p.slug}/poster.jpg" playsinline autoplay muted loop preload="auto" width="${p.width}" height="${p.height}"></video>
    <h1 class="cap">${esc(p.client)} <span>${esc(p.title)}</span></h1>
    <button class="sound" type="button" aria-pressed="false">Son <span>off</span></button>
  </section>

  <article class="sheet">
    <p class="summary">${esc(p.summary)}</p>
    <dl class="facts">
      <div><dt>Client</dt><dd>${esc(p.client)}</dd></div>
      ${p.location ? `<div><dt>Lieu</dt><dd>${esc(p.location)}</dd></div>` : ''}
      <div><dt>Durée</dt><dd>${dur}</dd></div>
      ${(p.credits || []).map((c) => `<div><dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd></div>`).join('')}
    </dl>
    <nav class="pager" aria-label="Projets">
      <a href="/projets/">Tous les projets</a>
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
    page('/projets/'),
    page('/studio/'),
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
  write(
    'llms.txt',
    `# ${site.name}®\n\n> ${site.description}\n\n${site.about.join(' ')}\n\n## Projets\n\n${projects
      .map((p) => `- [${name(p)}](${base}/work/${p.slug}/): ${p.summary}`)
      .join('\n')}\n\n## Contact\n\n- Instagram : ${site.instagram}\n${site.email ? `- E-mail : ${site.email}\n` : ''}`
  );
}

home();
projectsPage();
studioPage();
projects.forEach(project);
seoFiles();
console.log(`OK : ${projects.length + 3} pages générées dans site/`);
