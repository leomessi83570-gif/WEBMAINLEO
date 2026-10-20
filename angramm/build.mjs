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

const header = (current = '') => `<header class="top">
  <a class="wordmark" href="/" aria-label="${esc(site.name)}, accueil">${esc(site.name)}<sup>®</sup></a>
  <nav class="nav" aria-label="Navigation principale">
    <a href="/#projets"${current === 'work' ? ' aria-current="page"' : ''}>Projets</a>
    <a href="/#studio">Studio</a>
    <a href="/#contact">Contact</a>
  </nav>
</header>`;

const footer = () => `<footer class="foot" id="contact">
  <div class="foot-col">
    <p class="label">Contact</p>
    ${site.email ? `<p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>` : ''}
    <p><a href="${esc(site.instagram)}" rel="me noopener" target="_blank">Instagram ↗</a></p>
  </div>
  <p class="foot-legal">© ${new Date().getFullYear()} ${esc(site.name)}®${site.city ? ` · ${esc(site.city)}` : ''}</p>
</footer>`;

// ---------- Accueil ----------
function home() {
  const first = projects[0];
  const videos = projects
    .map(
      (p, i) => `<video class="reel${i === 0 ? ' is-active' : ''}" data-i="${i}" muted loop playsinline preload="${i === 0 ? 'auto' : 'none'}" poster="/media/${p.slug}/poster.jpg"${
        i === 0 ? ` src="/media/${p.slug}/loop.mp4" autoplay` : ` data-src="/media/${p.slug}/loop.mp4"`
      } aria-hidden="true"></video>`
    )
    .join('\n    ');
  const items = projects
    .map(
      (p, i) => `<li><a class="item${i === 0 ? ' is-active' : ''}" data-i="${i}" href="/work/${p.slug}/"><span class="client">${esc(p.short || p.client)}</span> <span class="title">${esc(p.title)}</span></a></li>`
    )
    .join('\n      ');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      { '@type': 'WebSite', '@id': `${base}/#site`, url: `${base}/`, name: site.name, inLanguage: site.lang, publisher: { '@id': `${base}/#org` } },
      {
        '@type': 'ItemList',
        name: `Projets ${site.name}`,
        itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/work/${p.slug}/`, name: `${p.client} · ${p.title}` })),
      },
    ],
  };

  write(
    'index.html',
    `${head({
      title: `${site.name}® · ${site.tagline}`,
      description: site.description,
      path: '/',
      image: `/media/${first.slug}/poster.jpg`,
      extra: `<link rel="preload" href="/media/${first.slug}/poster.jpg" as="image" fetchpriority="high">\n${jsonLd(ld)}\n`,
    })}
<body class="home">
${header()}
<main>
  <section class="stage" aria-label="Bande démo">
    ${videos}
    <div class="veil" aria-hidden="true"></div>
  </section>

  <section class="index" id="projets" aria-labelledby="h-projets">
    <h1 class="sr-only">${esc(site.name)}® · ${esc(site.tagline)}</h1>
    <h2 id="h-projets" class="label">Projets <span class="count"><span data-current>01</span> / ${String(projects.length).padStart(2, '0')}</span></h2>
    <ol class="list">
      ${items}
    </ol>
  </section>
</main>

<section class="studio" id="studio" aria-labelledby="h-studio">
  <h2 id="h-studio" class="label">Studio</h2>
  <div class="studio-text">
    ${site.about.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  <p class="clients"><span class="label">Clients</span> ${[...new Set(projects.flatMap((p) => p.client.split(' × ')))].map(esc).join(', ')}</p>
</section>
${footer()}
<script src="/assets/main.js" defer></script>
</body>
</html>
`
  );
}

// ---------- Pages projet ----------
function project(p, i) {
  const next = projects[(i + 1) % projects.length];
  const path = `/work/${p.slug}/`;
  const title = `${p.client} · ${p.title} | ${site.name}®`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      {
        '@type': 'VideoObject',
        name: `${p.client} · ${p.title}`,
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
          { '@type': 'ListItem', position: 2, name: 'Projets', item: `${base}/#projets` },
          { '@type': 'ListItem', position: 3, name: `${p.client} · ${p.title}`, item: `${base}${path}` },
        ],
      },
    ],
  };
  const portrait = p.height > p.width;

  write(
    `work/${p.slug}/index.html`,
    `${head({
      title,
      description: p.summary,
      path,
      image: `/media/${p.slug}/poster.jpg`,
      video: `/media/${p.slug}/full.mp4`,
      extra: `${jsonLd(ld)}\n`,
    })}
<body class="work">
${header('work')}
<main>
  <section class="player${portrait ? ' is-portrait' : ''}" aria-label="Film">
    <video class="film" src="/media/${p.slug}/full.mp4" poster="/media/${p.slug}/poster.jpg" playsinline autoplay muted loop preload="metadata" width="${p.width}" height="${p.height}"></video>
    <button class="sound" type="button" aria-pressed="false">Son <span>off</span></button>
  </section>

  <article class="sheet">
    <h1 class="sheet-title"><span class="client">${esc(p.client)}</span> <span class="title">${esc(p.title)}</span></h1>
    <p class="sheet-summary">${esc(p.summary)}</p>
    <dl class="meta">
      <div><dt>Client</dt><dd>${esc(p.client)}</dd></div>
      ${p.location ? `<div><dt>Lieu</dt><dd>${esc(p.location)}</dd></div>` : ''}
      <div><dt>Durée</dt><dd>${Math.floor(p.duration / 60)}′${String(Math.round(p.duration % 60)).padStart(2, '0')}″</dd></div>
      ${(p.credits || []).map((c) => `<div><dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd></div>`).join('')}
    </dl>
    <a class="next" href="/work/${next.slug}/"><span class="label">Projet suivant</span> <span class="client">${esc(next.client)}</span> <span class="title">${esc(next.title)}</span></a>
  </article>
</main>
${footer()}
<script src="/assets/main.js" defer></script>
</body>
</html>
`
  );
}

// ---------- SEO : sitemap, robots, llms.txt ----------
function seoFiles() {
  const urls = [
    `  <url><loc>${base}/</loc><lastmod>${today}</lastmod></url>`,
    ...projects.map(
      (p) => `  <url>
    <loc>${base}/work/${p.slug}/</loc>
    <lastmod>${today}</lastmod>
    <video:video>
      <video:thumbnail_loc>${base}/media/${p.slug}/poster.jpg</video:thumbnail_loc>
      <video:title>${esc(`${p.client} · ${p.title}`)}</video:title>
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
      .map((p) => `- [${p.client} · ${p.title}](${base}/work/${p.slug}/): ${p.summary}`)
      .join('\n')}\n\n## Contact\n\n- Instagram : ${site.instagram}\n${site.email ? `- E-mail : ${site.email}\n` : ''}`
  );
}

home();
projects.forEach(project);
seoFiles();
console.log(`OK : ${projects.length + 1} pages générées dans site/`);
