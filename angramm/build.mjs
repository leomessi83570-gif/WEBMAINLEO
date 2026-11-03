// Génère les pages HTML statiques du site ANGRAMM dans site/.
// Usage : node build.mjs   (aucune dépendance)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'site');
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
const projects = JSON.parse(readFileSync(join(root, 'content/projects.json'), 'utf8'));
const base = site.url.replace(/\/$/, '');
const lastUpdate = projects.map((p) => p.date || site.fallbackDate).sort().at(-1);

const isVertical = (p) => p.height > p.width;
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const iso = (sec) => `PT${Math.floor(sec / 60)}M${Math.round(sec % 60)}S`;
const name = (p) => p.name || `${p.client} · ${p.title}`;
// Légende sur deux temps, façon division.global : « MIZUNO x VRUNK » + « KYAN, São Paulo »
const lines = (p) => {
  const n = name(p);
  const paren = n.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (paren) return [paren[1], paren[2]];
  const season = n.match(/^(.*?)\s+((?:FW|SS)\d{2}|\d{2}\/\d{2})$/);
  if (season) return [season[1], season[2]];
  return [n, p.title];
};
// Logo officiel ANGRAMM (vectoriel, couleur = currentColor)
const logoSvg = readFileSync(join(out, 'assets/angramm-logo.svg'), 'utf8').replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
const year = (p) => (p.date || '').slice(0, 4);
const media = (p, file) => `/media/${p.slug}/${file}`;
const write = (path, html) => {
  mkdirSync(dirname(join(out, path)), { recursive: true });
  writeFileSync(join(out, path), html);
};

const org = {
  '@type': 'Organization',
  '@id': `${base}/#org`,
  name: site.name,
  alternateName: `${site.name}®`,
  url: `${base}/`,
  logo: { '@type': 'ImageObject', url: `${base}/assets/angramm-logo.png`, width: 512, height: 512 },
  image: `${base}/assets/og.jpg`,
  description: site.intro[0],
  slogan: site.tagline,
  email: site.email,
  sameAs: [site.instagram],
  knowsAbout: ['Film production', 'Advertising', 'Creative direction', 'CGI', 'Vertical video', 'Fashion film', 'Sports marketing'],
  areaServed: ['FR', 'Worldwide'],
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: site.country },
};

function head({ title, description, path, image = '/assets/og.jpg', video, noindex = false, serif = true, extra = '' }) {
  const url = `${base}${path}`;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${url}">
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
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
${serif ? '<link rel="preload" href="/fonts/ebgaramond-latin.woff2" as="font" type="font/woff2" crossorigin>\n' : ''}<link rel="stylesheet" href="/assets/style.css">
<script>if (!('PageRevealEvent' in window)) document.documentElement.classList.add('no-vt');</script>
${extra}</head>`;
}

// En-tête façon 530° : liens fins répartis, logo au centre.
const header = (current = '') => {
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="top">
  <nav class="nav" aria-label="Main">
    <a class="wordmark" href="/" aria-label="${esc(site.name)}®, home">${logoSvg}</a>
    ${link('/projects/', 'Projects', 'projects')}
    ${link('/team/', 'Team', 'team')}
    ${link('/contact/', 'Contact', 'contact')}
    <a href="${esc(site.instagram)}" rel="me noopener" target="_blank">Instagram</a>
  </nav>
</header>`;
};

const tail = `<div class="cursor is-off" aria-hidden="true"><span>A</span></div>
<script src="/assets/main.js" defer></script>
</body>
</html>
`;

// Films plein écran qui défilent au scroll ; un clic sur le film met le son.
const reelsMarkup = (eager) =>
  projects
    .map(
      (p, i) => `<div class="reel${isVertical(p) ? ' is-portrait' : ''}">
    <canvas class="ambient" width="64" height="36" aria-hidden="true"></canvas>
    <video muted loop playsinline preload="${eager && i === 0 ? 'auto' : 'none'}" ${eager && i === 0 ? 'poster' : 'data-poster'}="${media(p, 'poster.webp')}" data-src="${media(p, 'full.mp4')}#t=${p.start || 0}"></video>
    <a class="cap" href="/work/${p.slug}/"><span class="l1">${esc(lines(p)[0])}</span> <span class="l2">${esc(lines(p)[1])}</span></a>
    <button class="snd" type="button" aria-pressed="false">Sound <span>off</span></button>
  </div>`
    )
    .join('\n  ');

const clients = [...new Set(projects.flatMap((p) => p.client.split(' × ')))];

// ---------- Accueil : chargement ANGRAMM puis les films au scroll ----------
function home() {
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
      serif: false,
      extra: `<link rel="preload" href="${media(projects[0], 'poster.webp')}" as="image" fetchpriority="high">
<script>try { if (sessionStorage.getItem('angramm-intro') || matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('skip-intro'); } catch (e) {}</script>
${jsonLd(ld)}\n`,
    })}
<body class="home has-loader">
<div class="loader" aria-hidden="true">
  <span class="loader-mark">${logoSvg}</span>
  <span class="loader-bar"><i></i></span>
</div>
${header()}
<main class="reels">
  <h1 class="sr-only">${esc(site.name)}® · ${esc(site.tagline)}</h1>
  ${reelsMarkup(true)}
  <section class="endcard" aria-label="${esc(site.name)}">
    <p class="lede">${esc(site.intro[0])}</p>
    <p class="endcard-links"><a href="/projects/">All projects →</a><a href="/team/">Team →</a><a href="/contact/">${esc(site.cta)} →</a></p>
  </section>
</main>
${tail}`
  );
}

// ---------- Projets : mosaïque 2 par ligne, les aperçus tournent au scroll ----------
function projectsPage() {
  const tiles = projects
    .map(
      (p, i) => `<li>
      <a class="tile" href="/work/${p.slug}/">
        <span class="frame">
          <img src="${media(p, 'thumb.webp')}" alt="${esc(`${name(p)} — film by ${site.name}`)}" width="${isVertical(p) ? 720 : Math.round((720 * p.width) / p.height)}" height="${isVertical(p) ? Math.round((720 * p.height) / p.width) : 720}" ${i < 2 ? `loading="eager"${i === 0 ? ' fetchpriority="high"' : ''}` : 'loading="lazy"'} decoding="async">
          <video muted loop playsinline preload="none" data-src="${media(p, 'preview.mp4')}" aria-hidden="true"></video>
        </span>
        <span class="meta">${esc(name(p))}</span>
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
        name: `Projects · ${site.name}`,
        url: `${base}/projects/`,
        inLanguage: site.lang,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/work/${p.slug}/`, name: name(p) })),
        },
      },
    ],
  };
  write(
    'projects/index.html',
    `${head({
      title: `Projects: films for OM, Lacoste, Mizuno & adidas | ${site.name}®`,
      description: `Films and campaigns by ${site.name}: ${clients.slice(0, 8).join(', ')}. Vertical and horizontal formats.`,
      path: '/projects/',
      serif: false,
      extra: `${jsonLd(ld)}\n`,
    })}
<body class="page-projects">
${header('projects')}
<main class="mosaic-wrap">
  <h1 class="page-title">Projects</h1>
  <p class="lede intro">Films and campaigns for sport, fashion and culture brands, in vertical and horizontal formats.</p>
  <ul class="mosaic">
    ${tiles}
  </ul>
</main>
${tail}`
  );
}

// ---------- Team : qui on est, nos valeurs, coulisses par projet ----------
function bts(p) {
  // photos de tournage déposées dans site/media/<slug>/bts/ ; sinon, images extraites du film
  const dir = join(out, 'media', p.slug, 'bts');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f)).sort() : [];
  return files.length ? files.map((f) => media(p, `bts/${f}`)) : [1, 2, 3, 4].map((n) => media(p, `still-${n}.webp`));
}

function teamPage() {
  const T = site.team;
  const film = site.studioFilm;
  const tabs = projects
    .map((p, i) => `<button class="tab" type="button" role="tab" id="tab-${p.slug}" aria-controls="panel-${p.slug}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${esc(name(p))}</button>`)
    .join('\n      ');
  const panels = projects
    .map(
      (p, i) => `<div class="panel${isVertical(p) ? ' is-portrait' : ''}" role="tabpanel" id="panel-${p.slug}" aria-labelledby="tab-${p.slug}"${i ? ' hidden' : ''}>
      ${bts(p)
        .map((src) => `<img src="${src}" alt="${esc(`${name(p)}, ${src.includes('/bts/') ? 'behind the scenes' : 'still from the film'}`)}" loading="lazy" decoding="async">`)
        .join('\n      ')}
    </div>`
    )
    .join('\n    ');
  const members = (T.members || [])
    .map((m) => `<li><span class="role">${esc(m.role)}</span><span class="who">${esc(m.name)}</span></li>`)
    .join('\n      ');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      { '@type': 'AboutPage', url: `${base}/team/`, inLanguage: site.lang, about: { '@id': `${base}/#org` } },
    ],
  };
  write(
    'team/index.html',
    `${head({
      title: `Team: creative agency & production in Marseille | ${site.name}®`,
      description: `Who we are: ${site.name}, a creative agency and audiovisual production company from Marseille, France. Our crew, our values and behind the scenes.`,
      path: '/team/',
      image: film ? film.poster.replace('.webp', '.jpg') : '/assets/og.jpg',
      extra: `${jsonLd(ld)}\n`,
    })}
<body class="page-team">
${header('team')}
<main class="team">
  <section class="team-hero">
    <div class="team-text">
      <h1 class="page-title">Team</h1>
      ${T.intro.map((t) => `<p class="lede">${esc(t)}</p>`).join('\n      ')}
    </div>
    ${
      film
        ? `<figure class="team-film">
      <video src="${film.src}" poster="${film.poster}" muted loop playsinline autoplay preload="metadata" width="${film.width}" height="${film.height}"></video>
      <figcaption><button class="snd" type="button" aria-pressed="false">Sound <span>off</span></button></figcaption>
    </figure>`
        : ''
    }
  </section>

  <section class="values" aria-labelledby="h-values">
    <h2 id="h-values" class="label">Values</h2>
    <ol>
      ${T.values.map((v) => `<li><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join('\n      ')}
    </ol>
  </section>

  ${members ? `<section class="members" aria-labelledby="h-members">
    <h2 id="h-members" class="label">The crew</h2>
    <ul>
      ${members}
    </ul>
  </section>` : ''}

  <section class="bts" aria-labelledby="h-bts">
    <h2 id="h-bts" class="label">Behind the scenes</h2>
    <div class="tabs" role="tablist" aria-label="Projects">
      ${tabs}
    </div>
    ${panels}
  </section>

  <section class="clients" aria-labelledby="h-clients">
    <h2 id="h-clients" class="label">Selected clients</h2>
    <p>${clients.map(esc).join(' · ')}</p>
  </section>
</main>
${tail}`
  );
}

// ---------- Contact, façon division.global ----------
const mailIcon = '<svg viewBox="0 0 20 14" width="16" height="11" aria-hidden="true"><path d="M1 1h18v12H1zM1 1l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
function contactPage() {
  const handle = '@' + site.instagram.replace(/\/$/, '').split('/').pop();
  write(
    'contact/index.html',
    `${head({
      title: `Contact: start your film project | ${site.name}®`,
      description: `Contact ${site.name}®, creative agency and audiovisual production company in Marseille. ${site.cta}`,
      path: '/contact/',
      extra: `${jsonLd({ '@context': 'https://schema.org', '@graph': [org, { '@type': 'ContactPage', url: `${base}/contact/`, inLanguage: site.lang, about: { '@id': `${base}/#org` } }] })}\n`,
    })}
<body class="page-contact">
${header('contact')}
<main class="contact">
  <h1 class="sr-only">Contact</h1>
  <div class="contact-text">
    ${site.intro.map((t) => `<p class="lede">${esc(t)}</p>`).join('\n    ')}
    <p class="lede cta">${esc(site.cta)}</p>
  </div>
  <ul class="inquiries">
    <li><a href="mailto:${esc(site.email)}">${mailIcon}<span class="label-k">New projects</span><span class="v">${esc(site.email)}</span></a></li>
    <li><a href="mailto:${esc(site.email)}?subject=Press">${mailIcon}<span class="label-k">Press &amp; partnerships</span><span class="v">${esc(site.email)}</span></a></li>
    <li><a href="${esc(site.instagram)}" rel="me noopener" target="_blank"><span class="ico">↗</span><span class="label-k">Instagram</span><span class="v">${esc(handle)}</span></a></li>
    <li><span class="ico">◎</span><span class="label-k">Based in</span><span class="v">${esc(site.city)}, France</span></li>
  </ul>
</main>
${tail}`
  );
}

// ---------- 404 ----------
function notFound() {
  write(
    '404.html',
    `${head({ title: `Page not found | ${site.name}®`, description: site.description, path: '/404.html', noindex: true })}
<body class="page-contact">
${header()}
<main class="contact">
  <div class="contact-text">
    <h1 class="page-title">Page not found</h1>
    <p class="lede">This page doesn't exist, or it has moved. The films are still here.</p>
  </div>
  <ul class="inquiries">
    <li><a href="/"><span class="ico">→</span><span class="label-k">Home</span><span class="v">${esc(site.name)}®</span></a></li>
    <li><a href="/projects/"><span class="ico">→</span><span class="label-k">Projects</span><span class="v">All films</span></a></li>
  </ul>
</main>
${tail}`
  );
}

// ---------- Pages projet ----------
function project(p, i) {
  const next = projects[(i + 1) % projects.length];
  const path = `/work/${p.slug}/`;
  const date = p.date || site.fallbackDate;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      {
        '@type': 'VideoObject',
        '@id': `${base}${path}#video`,
        name: name(p),
        description: p.summary,
        thumbnailUrl: [`${base}${media(p, 'poster.jpg')}`, `${base}${media(p, 'poster.webp')}`],
        contentUrl: `${base}${media(p, 'full.mp4')}`,
        embedUrl: `${base}${path}`,
        uploadDate: date,
        duration: iso(p.duration),
        width: p.width,
        height: p.height,
        inLanguage: site.lang,
        creator: { '@id': `${base}/#org` },
        productionCompany: { '@id': `${base}/#org` },
        ...(p.location && { contentLocation: { '@type': 'Place', name: p.location } }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.name, item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${base}/projects/` },
          { '@type': 'ListItem', position: 3, name: name(p), item: `${base}${path}` },
        ],
      },
    ],
  };
  const dur = `${Math.floor(p.duration / 60)}′${String(Math.round(p.duration % 60)).padStart(2, '0')}″`;
  const desc = `${p.summary} A film by ${site.name}.`.slice(0, 300);

  write(
    `work/${p.slug}/index.html`,
    `${head({
      title: `${name(p)} | ${site.name}®`,
      description: desc.length > 158 ? `${p.summary.slice(0, 155).replace(/\s+\S*$/, '')}…` : desc,
      path,
      image: media(p, 'poster.jpg'),
      video: media(p, 'full.mp4'),
      extra: `<link rel="preload" href="${media(p, 'poster.webp')}" as="image" fetchpriority="high">\n${jsonLd(ld)}\n`,
    })}
<body class="work">
${header('projects')}
<main>
  <section class="player${isVertical(p) ? ' is-portrait' : ''}" aria-label="Film">
    <canvas class="ambient" width="64" height="36" aria-hidden="true"></canvas>
    <video class="film" src="${media(p, 'full.mp4')}" poster="${media(p, 'poster.webp')}" playsinline autoplay muted preload="auto" width="${p.width}" height="${p.height}"></video>
    <h1 class="cap">${esc(name(p))}</h1>
    <button class="snd" type="button" aria-pressed="false">Sound <span>off</span></button>
  </section>

  <article class="sheet">
    <p class="lede">${esc(p.summary)}</p>
    <dl class="facts">
      <div><dt>Client</dt><dd>${esc(p.client)}</dd></div>
      ${p.location ? `<div><dt>Location</dt><dd>${esc(p.location)}</dd></div>` : ''}
      ${p.date ? `<div><dt>Year</dt><dd>${year(p)}</dd></div>` : ''}
      <div><dt>Format</dt><dd>${isVertical(p) ? 'Vertical 9:16' : 'Horizontal'}</dd></div>
      <div><dt>Duration</dt><dd>${dur}</dd></div>
      <div><dt>Production</dt><dd>${esc(site.name)}®</dd></div>
      ${(p.credits || []).map((c) => `<div><dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd></div>`).join('')}
    </dl>
    <nav class="pager" aria-label="Projects">
      <a href="/projects/">All projects</a>
      <a href="/work/${next.slug}/">Next: ${esc(name(next))} →</a>
    </nav>
  </article>
</main>
${tail}`
  );
}

// ---------- SEO + hébergement : sitemap, robots, llms.txt, _headers, _redirects ----------
function seoFiles() {
  const page = (path, lastmod = lastUpdate) => `  <url><loc>${base}${path}</loc><lastmod>${lastmod}</lastmod></url>`;
  const urls = [
    page('/'),
    page('/projects/'),
    page('/team/'),
    page('/contact/'),
    ...projects.map(
      (p) => `  <url>
    <loc>${base}/work/${p.slug}/</loc>
    <lastmod>${p.date || site.fallbackDate}</lastmod>
    <video:video>
      <video:thumbnail_loc>${base}${media(p, 'poster.jpg')}</video:thumbnail_loc>
      <video:title>${esc(name(p))}</video:title>
      <video:description>${esc(p.summary)}</video:description>
      <video:content_loc>${base}${media(p, 'full.mp4')}</video:content_loc>
      <video:duration>${Math.round(p.duration)}</video:duration>
      <video:publication_date>${p.date || site.fallbackDate}</video:publication_date>
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
    `# ${site.name}®\n\n> ${site.intro[0]}\n\n${site.team.intro.join(' ')}\n\nBased in ${site.city}, France. Contact: ${site.email}\n\n## Films\n\n${projects
      .map((p) => `- [${name(p)}](${base}/work/${p.slug}/)${p.date ? ` (${year(p)})` : ''}: ${p.summary}`)
      .join('\n')}\n\n## Pages\n\n- [Projects](${base}/projects/)\n- [Team](${base}/team/)\n- [Contact](${base}/contact/)\n- Instagram: ${site.instagram}\n`
  );
  // Lus par Netlify même en glisser-déposer (netlify.toml ne l'est qu'en déploiement Git)
  write(
    '_headers',
    `/media/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*\n  Cache-Control: public, max-age=3600, must-revalidate\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`
  );
  write(
    '_redirects',
    ['/projets/ /projects/ 301', '/studio/ /team/ 301', '/horizontal/projets/ /projects/ 301', '/vertical/projets/ /projects/ 301', '/horizontal/ / 301', '/vertical/ / 301', '/work/volcan/ /work/om/ 301', ''].join('\n')
  );
}

home();
projectsPage();
teamPage();
contactPage();
notFound();
projects.forEach(project);
seoFiles();
console.log(`OK : ${projects.length + 5} pages générées dans site/`);
