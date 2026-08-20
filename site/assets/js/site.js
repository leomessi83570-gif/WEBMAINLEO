/* ============================================================================
   ENTRECASTEAUX — RUNTIME
   Front statique, sans dépendance ni build. Chaque page charge donnees.js
   puis ce fichier ; le rendu s'adapte à ce que la page contient réellement.
   ========================================================================= */
(function () {
  'use strict';

  var EC = window.EC;
  if (!EC) { return; }

  var $  = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

  var langue = 'fr';
  var L = function () { return EC.LANGUES.indexOf(langue); };
  var T = function (cle) {
    var d = EC.I18N[langue];
    return (d && d[cle] !== undefined) ? d[cle] : (EC.I18N.fr[cle] || '');
  };

  /* Page courante : index.html, actualites.html… */
  var PAGE = (document.body.getAttribute('data-page') || 'accueil');

  /* ══════════════════════════════════════════════════════════════════════
     1. PRÉFÉRENCES PERSISTANTES (langue, thème)
     ══════════════════════════════════════════════════════════════════════ */
  var MEM = {
    lire: function (cle, defaut) {
      try { return localStorage.getItem('ec.' + cle) || defaut; } catch (e) { return defaut; }
    },
    ecrire: function (cle, valeur) {
      try { localStorage.setItem('ec.' + cle, valeur); } catch (e) { /* mode privé */ }
    }
  };

  function appliquerTheme(t) {
    if (t === 'auto') { document.documentElement.removeAttribute('data-theme'); }
    else { document.documentElement.setAttribute('data-theme', t); }
    MEM.ecrire('theme', t);
  }
  function themeCourant() { return document.documentElement.getAttribute('data-theme') || 'auto'; }

  /* ══════════════════════════════════════════════════════════════════════
     2. ICÔNES (SVG uniquement — jamais d'emoji comme icône)
     ══════════════════════════════════════════════════════════════════════ */
  var ICONES = {
    doc:   '<path d="M5 2h7l4 4v12H5z"/><path d="M12 2v4h4M8 11h5M8 14h5"/>',
    user:  '<circle cx="10" cy="7" r="3.2"/><path d="M3.8 17c.6-3.3 3.1-5 6.2-5s5.6 1.7 6.2 5"/>',
    school:'<path d="M10 3 2.5 7 10 11l7.5-4L10 3z"/><path d="M5.5 9v5c0 1.4 2 2.5 4.5 2.5s4.5-1.1 4.5-2.5V9"/>',
    home:  '<path d="M2 8 10 3l8 5M4 8v9h12V8M8 17v-5h4v5"/>',
    trash: '<path d="M3.5 5.5h13M8 5.5V3h4v2.5M5 5.5 5.8 17h8.4L15 5.5M8.5 9v5M11.5 9v5"/>',
    flame: '<path d="M10 2.5s4.5 3.6 4.5 8a4.5 4.5 0 0 1-9 0c0-2 1-3.4 1.8-4.3.3 1.2 1 1.9 1.7 1.9 1.4 0 1.6-3.2 1-5.6z"/>'
  };
  function icone(nom, taille) {
    return '<svg width="' + taille + '" height="' + taille + '" viewBox="0 0 20 20" fill="none" ' +
           'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
           'aria-hidden="true">' + (ICONES[nom] || '') + '</svg>';
  }

  /* Échappement — tout ce qui vient des données passe par là avant le DOM,
     sauf les champs éditoriaux qui acceptent volontairement du HTML léger. */
  function ech(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function attr(h) {
    /* n'accepte que http(s), mailto, tel et les liens internes */
    return /^(https?:|mailto:|tel:|#|[\w./-]+\.html)/.test(h) ? ech(h) : '#';
  }
  function externe(h) { return /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ''; }

  /* ══════════════════════════════════════════════════════════════════════
     3. NAVIGATION
     ══════════════════════════════════════════════════════════════════════ */
  function rendreNav() {
    var nav = $('#nav');
    if (!nav) { return; }

    var CHEVRON =
      '<svg class="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5"/></svg>';

    /* Une entrée = une rubrique. Quand elle porte une page du site, le libellé
       est un lien (on peut y aller d'un clic) et le chevron ouvre le volet ;
       sans page, le libellé est le bouton d'ouverture. */
    nav.innerHTML = EC.MENUS.map(function (m, rang) {
      var libelle = ech(m.t[L()]);
      var volet = m.items && m.items.length;
      var actif = m.page && m.page === PAGE ? ' aria-current="page"' : '';
      var idVolet = 'volet-' + rang;

      var tete;
      if (m.h) {
        tete = '<a class="nav-btn" href="' + attr(m.h) + '"' + actif + '>' + libelle + '</a>';
        if (volet) {
          tete += '<button class="nav-chev" type="button" aria-expanded="false" ' +
                  'aria-controls="' + idVolet + '" aria-label="' +
                  attr(T('nav.deplier')) + ' ' + libelle + '">' + CHEVRON + '</button>';
        }
      } else {
        tete = '<button class="nav-btn" type="button" aria-expanded="false" ' +
               'aria-controls="' + idVolet + '">' + libelle + CHEVRON + '</button>';
      }

      var corps = '';
      if (volet) {
        corps = '<div class="volet" id="' + idVolet + '">' + m.items.map(function (it) {
          if (it.titre) {
            return '<p class="volet-titre">' + ech(it.titre[L()]) + '</p>';
          }
          return '<a href="' + attr(it.h) + '"' + externe(it.h) + '>' + ech(it.t[L()]) + '</a>';
        }).join('') + '</div>';
      }

      return '<div class="nav-item"' + (volet ? ' data-ouvert="0"' : '') + '>' +
             tete + corps + '</div>';
    }).join('');

    $$('.nav-item', nav).forEach(function (item) {
      var btn = $('.nav-chev', item) || $('.nav-btn', item);
      if (!btn || btn.tagName !== 'BUTTON') { return; }
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var ouvert = item.getAttribute('data-ouvert') === '1';
        fermerMenus();
        item.setAttribute('data-ouvert', ouvert ? '0' : '1');
        btn.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      });
      item.addEventListener('mouseenter', function () {
        if (window.matchMedia('(min-width: 981px)').matches) {
          fermerMenus();
          item.setAttribute('data-ouvert', '1');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
      item.addEventListener('mouseleave', function () {
        if (window.matchMedia('(min-width: 981px)').matches) {
          item.setAttribute('data-ouvert', '0');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-ouvert');
        fermerMenus();
      });
    });
  }

  function fermerMenus() {
    $$('.nav-item[data-ouvert]').forEach(function (n) {
      n.setAttribute('data-ouvert', '0');
      var b = $('.nav-chev', n) || $('.nav-btn', n);
      if (b && b.tagName === 'BUTTON') { b.setAttribute('aria-expanded', 'false'); }
    });
  }
  document.addEventListener('click', fermerMenus);

  /* ══════════════════════════════════════════════════════════════════════
     4. LISTES ÉDITORIALES
     ══════════════════════════════════════════════════════════════════════ */
  function rendreActus(cible, limite) {
    var c = $(cible || '#listeActus');
    if (!c) { return; }
    var liste = EC.CONTENU.actus.slice(0, limite || EC.CONTENU.actus.length);
    c.innerHTML = liste.map(function (a) {
      var d = a[langue] || a.fr;
      return '<article class="actu">' +
        '<span class="actu-cat">' + ech(d.cat) + '</span>' +
        '<h3>' + d.titre + '</h3>' +
        '<p>' + d.texte + '</p>' +
        '<a class="lien-fleche" href="' + attr(a.lien) + '"' + externe(a.lien) + '>' +
          ech(T('lire')) + '<span class="fl" aria-hidden="true">→</span></a>' +
        '</article>';
    }).join('');
  }

  var MOIS = {
    fr: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    it: ['genn.', 'febbr.', 'marzo', 'apr.', 'magg.', 'giugno', 'luglio', 'ag.', 'sett.', 'ott.', 'nov.', 'dic.']
  };

  function carteEvenement(e, passe) {
    var d = e[langue] || e.fr;
    var dt = new Date(e.date + 'T00:00:00');
    return '<article class="evenement' + (passe ? ' passe' : '') + '">' +
      '<div class="ev-date"><span class="jour chiffres">' + dt.getDate() + '</span>' +
      '<span class="mois">' + MOIS[langue][dt.getMonth()] + '</span></div>' +
      '<div class="ev-corps"><h3>' + d.titre + '</h3><p>' + d.texte + '</p></div>' +
      '<div class="ev-meta"><span>' + d.meta + '</span>' +
        (passe ? '<span class="ev-etiquette">' + ech(T('agenda.termine')) + '</span>'
               : (e.gratuit ? '<span class="ev-etiquette">' + ech(T('agenda.gratuit')) + '</span>' : '')) +
      '</div></article>';
  }

  function rendreAgenda(cible, options) {
    var c = $(cible || '#listeAgenda');
    if (!c) { return; }
    var opt = options || {};
    var aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
    var liste = EC.CONTENU.agenda.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    var avenir = liste.filter(function (e) { return new Date(e.date + 'T00:00:00') >= aujourdhui; });
    var passes = liste.filter(function (e) { return new Date(e.date + 'T00:00:00') < aujourdhui; });

    if (opt.limite) { avenir = avenir.slice(0, opt.limite); }

    var html = '';
    if (!avenir.length && !opt.avecPasses) {
      html = '<p class="chapo" style="padding-block:var(--esp-8)">' + ech(T('agenda.aucun')) + '</p>';
    } else {
      html += avenir.map(function (e) { return carteEvenement(e, false); }).join('');
      if (opt.avecPasses && passes.length) {
        html += '<p class="surtitre" style="padding-block:var(--esp-8) var(--esp-4)">' +
                ech(T('agenda.passes')) + '</p>';
        html += passes.reverse().map(function (e) { return carteEvenement(e, true); }).join('');
      }
    }
    c.innerHTML = html;
  }

  function rendreDemarches(cible) {
    var c = $(cible || '#listeDemarches');
    if (!c) { return; }
    c.innerHTML = EC.CONTENU.demarches.map(function (d) {
      return '<a class="demarche" href="' + attr(d.h) + '"' + externe(d.h) + '>' +
        icone(d.icone, 22) +
        '<span><b>' + ech(d.t[L()]) + '</b><span>' + ech(d.s[L()]) + '</span></span>' +
        '<span class="fl" aria-hidden="true">→</span></a>';
    }).join('');
  }

  /* Une rubrique se retrouve par sa clé, jamais par sa position : indexer
     EC.MENUS[1] revenait à casser le pied de page dès qu'on réordonnait la
     navigation. */
  function rubrique(id) {
    var trouve = EC.MENUS.filter(function (m) { return m.id === id; })[0];
    return (trouve && trouve.items) || [];
  }

  function rendrePied() {
    function liste(items) {
      return items.filter(function (it) { return it.t && it.h; }).map(function (it) {
        return '<li><a href="' + attr(it.h) + '"' + externe(it.h) + '>' + ech(it.t[L()]) + '</a></li>';
      }).join('');
    }
    var blocs = [
      ['#piedPages',        EC.PAGES],
      ['#piedMunicipalite', rubrique('mairie').slice(0, 6)],
      ['#piedPratique',     rubrique('viepratique').slice(0, 6)],
      ['#piedLegal',        EC.LIENS_LEGAUX]
    ];
    blocs.forEach(function (b) {
      var el = $(b[0]);
      if (el) { el.innerHTML = liste(b[1]); }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     5. HORAIRES : ouvert / fermé maintenant
     ══════════════════════════════════════════════════════════════════════ */
  function etatOuverture() {
    var el = $('#etatOuverture');
    if (!el) { return; }
    var d = new Date();
    var jour = d.getDay();
    var minutes = d.getHours() * 60 + d.getMinutes();
    var ligne = EC.HORAIRES.filter(function (h) { return h.jour === jour; })[0];
    var ouvert = false, fin = 0;

    if (ligne) {
      ligne.creneaux.forEach(function (c) {
        if (minutes >= c[0] && minutes < c[1]) { ouvert = true; fin = c[1]; }
      });
    }
    function hhmm(m) {
      return (Math.floor(m / 60)) + ' h ' + (m % 60 ? ('0' + (m % 60)).slice(-2) : '00');
    }
    el.setAttribute('data-ouvert', ouvert ? '1' : '0');
    el.innerHTML = '<i aria-hidden="true"></i>' +
      (ouvert
        ? ech(T('ouvert.oui')) + ' · ' + ech(T('ouvert.jusqua')) + ' ' + hhmm(fin)
        : ech(T('ouvert.non')));

    /* Surlignage de la ligne du jour dans le tableau */
    $$('.horaires tr').forEach(function (tr) { tr.classList.remove('aujourdhui'); });
    var tr = $('.horaires tr[data-jour="' + jour + '"]');
    if (tr) { tr.classList.add('aujourdhui'); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     6. MÉTÉO (Open-Meteo, sans clé d'API)
     ══════════════════════════════════════════════════════════════════════ */
  var CODES = {
    0:  ['soleil',  ['Ciel dégagé', 'Clear sky', 'Sereno']],
    1:  ['soleil',  ['Peu nuageux', 'Mainly clear', 'Poco nuvoloso']],
    2:  ['partiel', ['Éclaircies', 'Partly cloudy', 'Parzialmente nuvoloso']],
    3:  ['nuage',   ['Couvert', 'Overcast', 'Coperto']],
    45: ['brume',   ['Brouillard', 'Fog', 'Nebbia']],
    48: ['brume',   ['Brouillard givrant', 'Rime fog', 'Nebbia gelata']],
    51: ['pluie',   ['Bruine', 'Light drizzle', 'Pioviggine']],
    53: ['pluie',   ['Bruine', 'Drizzle', 'Pioviggine']],
    55: ['pluie',   ['Bruine dense', 'Dense drizzle', 'Pioviggine intensa']],
    61: ['pluie',   ['Pluie faible', 'Light rain', 'Pioggia debole']],
    63: ['pluie',   ['Pluie', 'Rain', 'Pioggia']],
    65: ['pluie',   ['Forte pluie', 'Heavy rain', 'Pioggia forte']],
    71: ['neige',   ['Neige', 'Snow', 'Neve']],
    73: ['neige',   ['Neige', 'Snow', 'Neve']],
    75: ['neige',   ['Fortes chutes', 'Heavy snow', 'Forti nevicate']],
    80: ['averse',  ['Averses', 'Rain showers', 'Rovesci']],
    81: ['averse',  ['Averses', 'Rain showers', 'Rovesci']],
    82: ['averse',  ['Fortes averses', 'Violent showers', 'Rovesci intensi']],
    95: ['orage',   ['Orage', 'Thunderstorm', 'Temporale']],
    96: ['orage',   ['Orage grêleux', 'Storm with hail', 'Temporale con grandine']],
    99: ['orage',   ['Orage grêleux', 'Storm with hail', 'Temporale con grandine']]
  };
  var METEO_SVG = {
    soleil:  '<circle cx="12" cy="12" r="4.6"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/>',
    partiel: '<circle cx="9" cy="9" r="3.4"/><path d="M9 1.8v1.8M1.8 9h1.8M3.9 3.9l1.3 1.3M14.1 3.9l-1.3 1.3"/><path d="M8.5 20h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 8.5 20z"/>',
    nuage:   '<path d="M7 19h10.5a3.75 3.75 0 0 0 .3-7.5 5.4 5.4 0 0 0-10.4 1.3A3.2 3.2 0 0 0 7 19z"/>',
    brume:   '<path d="M4 9h16M2 13h20M5 17h14M7 21h10"/>',
    pluie:   '<path d="M7 15h10.5a3.75 3.75 0 0 0 .3-7.5 5.4 5.4 0 0 0-10.4 1.3A3.2 3.2 0 0 0 7 15z"/><path d="M8.5 18.5 7.5 21M12.5 18.5l-1 2.5M16.5 18.5l-1 2.5"/>',
    averse:  '<path d="M7 14h10.5a3.75 3.75 0 0 0 .3-7.5 5.4 5.4 0 0 0-10.4 1.3A3.2 3.2 0 0 0 7 14z"/><path d="M9 17.5 8 21M14 17.5 13 21"/>',
    neige:   '<path d="M7 14h10.5a3.75 3.75 0 0 0 .3-7.5 5.4 5.4 0 0 0-10.4 1.3A3.2 3.2 0 0 0 7 14z"/><path d="M9 18h.01M12 20h.01M15 18h.01"/>',
    orage:   '<path d="M7 14h10.5a3.75 3.75 0 0 0 .3-7.5 5.4 5.4 0 0 0-10.4 1.3A3.2 3.2 0 0 0 7 14z"/><path d="m12.5 16-2.5 4h3l-2 3.5"/>'
  };
  function svgMeteo(code, taille) {
    var e = CODES[code] || CODES[3];
    return '<svg width="' + taille + '" height="' + taille + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + METEO_SVG[e[0]] + '</svg>';
  }

  var meteoDonnees = null;
  function afficherMeteo(d) {
    var zone = $('#meteoReleve');
    if (!zone || !d) { return; }
    var code = d.current.weather_code;
    zone.innerHTML =
      '<span>' + svgMeteo(code, 14) + (CODES[code] || CODES[3])[1][L()] + '</span>' +
      '<span><i class="rond rond--plein" aria-hidden="true"></i><span class="chiffres">' +
        Math.round(d.current.wind_speed_10m) + ' km/h</span></span>' +
      '<span><i class="rond" aria-hidden="true"></i><span class="chiffres">' +
        Math.round(d.current.temperature_2m) + '°</span></span>';
  }
  function chargerMeteo() {
    if (!$('#meteoReleve')) { return; }
    var c = EC.COMMUNE;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon +
      '&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FParis';
    fetch(url)
      .then(function (r) { if (!r.ok) { throw new Error('http'); } return r.json(); })
      .then(function (d) { meteoDonnees = d; afficherMeteo(d); })
      .catch(function () {
        var z = $('#meteoReleve');
        if (z) { z.innerHTML = '<span>' + ech(T('meteo.indispo')) + '</span>'; }
      });
  }

  /* ══════════════════════════════════════════════════════════════════════
     7. RECHERCHE
     ══════════════════════════════════════════════════════════════════════ */
  var INDEX = [];
  function construireIndex() {
    INDEX = [];
    EC.PAGES.forEach(function (p) { INDEX.push({ t: p.t[L()], s: T('sec.pages'), h: p.h }); });
    EC.MENUS.forEach(function (m) {
      /* Actualités et Agenda n'ont pas de volet : `m.items` y est absent. */
      if (m.h) { INDEX.push({ t: m.t[L()], s: T('sec.pages'), h: m.h }); }
      (m.items || []).forEach(function (it) {
        if (!it.t || !it.h) { return; }   /* les intertitres n'en sont pas */
        INDEX.push({ t: it.t[L()], s: m.t[L()], h: it.h });
      });
    });
    EC.CONTENU.demarches.forEach(function (d) { INDEX.push({ t: d.t[L()], s: T('sec.demarches'), h: d.h }); });
    EC.CONTENU.actus.forEach(function (a) {
      var d = a[langue] || a.fr;
      INDEX.push({ t: d.titre.replace(/<[^>]+>/g, ''), s: T('sec.actualite'), h: 'actualites.html' });
    });
    EC.CONTENU.agenda.forEach(function (e) {
      var d = e[langue] || e.fr;
      INDEX.push({ t: d.titre, s: T('sec.agenda'), h: 'agenda.html' });
    });
    INDEX.push({ t: T('mairie.adresse'), s: T('sec.mairie'), h: 'mairie.html' });
  }
  function normaliser(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function chercher(q) {
    var res = $('#resultats');
    if (!res) { return; }
    if (!q.trim()) { res.innerHTML = ''; return; }
    var n = normaliser(q);
    var trouves = INDEX.filter(function (e) {
      return normaliser(e.t + ' ' + e.s).indexOf(n) > -1;
    }).slice(0, 8);
    res.innerHTML = trouves.length
      ? trouves.map(function (e) {
          return '<a href="' + attr(e.h) + '"' + externe(e.h) + '><em>' + ech(e.s) + '</em>' + ech(e.t) + '</a>';
        }).join('')
      : '<div class="vide">' + ech(T('recherche.vide')) + '</div>';
  }

  function brancherRecherche() {
    var ouvrir = $('#ouvrirRecherche'), boite = $('#recherche'), champ = $('#champRecherche');
    if (!ouvrir || !boite || !champ) { return; }
    ouvrir.addEventListener('click', function (e) {
      e.stopPropagation();
      boite.setAttribute('data-ouvert', '1');
      champ.focus();
    });
    boite.addEventListener('click', function (e) {
      if (e.target === boite) { boite.setAttribute('data-ouvert', '0'); }
    });
    champ.addEventListener('input', function (e) { chercher(e.target.value); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { boite.setAttribute('data-ouvert', '0'); fermerMenus(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ouvrir.click(); }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     8. LANGUE
     ══════════════════════════════════════════════════════════════════════ */
  function appliquerLangue(l) {
    if (EC.LANGUES.indexOf(l) === -1) { l = 'fr'; }
    langue = l;
    document.documentElement.lang = l;
    MEM.ecrire('langue', l);

    $$('[data-i18n]').forEach(function (el) {
      var v = T(el.getAttribute('data-i18n'));
      if (v) { el.innerHTML = v; }
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      var paire = el.getAttribute('data-i18n-attr').split(':');
      var v = T(paire[1]);
      if (v) { el.setAttribute(paire[0], v.replace(/<[^>]+>/g, '')); }
    });
    $$('.langue button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false');
    });

    rendreNav();
    rendreActus('#listeActus', document.body.getAttribute('data-actus-limite') | 0 || null);
    rendreAgenda('#listeAgenda', {
      limite: document.body.getAttribute('data-agenda-limite') | 0 || null,
      avecPasses: document.body.hasAttribute('data-agenda-passes')
    });
    rendreDemarches();
    rendrePied();
    etatOuverture();
    construireIndex();
    if (meteoDonnees) { afficherMeteo(meteoDonnees); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     9. DIVERS : titre animé, menu mobile, bandeau, thème
     ══════════════════════════════════════════════════════════════════════ */
  function animerTitre() {
    var h = $('#herosTitre');
    if (!h) { return; }
    var mot = h.textContent.trim();
    h.setAttribute('aria-label', mot);
    h.innerHTML = mot.split('').map(function (c, i) {
      return '<span aria-hidden="true" style="animation-delay:' + (40 + i * 22) + 'ms">' + ech(c) + '</span>';
    }).join('');
  }

  function brancherDivers() {
    var burger = $('#burger');
    if (burger) {
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        var ouvert = document.body.classList.toggle('menu-ouvert');
        burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      });
    }
    var nav = $('#nav');
    if (nav) { nav.addEventListener('click', function (e) { e.stopPropagation(); }); }

    var fermerAlerte = $('#fermerAlerte');
    if (fermerAlerte) {
      fermerAlerte.addEventListener('click', function () {
        var b = $('#bandeauAlerte');
        if (b) { b.hidden = true; }
        MEM.ecrire('alerte-fermee', '1');
      });
    }
    if (MEM.lire('alerte-fermee', '0') === '1') {
      var b = $('#bandeauAlerte');
      if (b) { b.hidden = true; }
    }

    var bTheme = $('#basculerTheme');
    if (bTheme) {
      bTheme.addEventListener('click', function () {
        var suivant = themeCourant() === 'sombre' ? 'clair' : 'sombre';
        appliquerTheme(suivant);
        bTheme.setAttribute('aria-pressed', suivant === 'sombre' ? 'true' : 'false');
      });
    }

    $$('.langue button').forEach(function (b) {
      b.addEventListener('click', function () { appliquerLangue(b.getAttribute('data-lang')); });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     10. DÉMARRAGE
     ══════════════════════════════════════════════════════════════════════ */
  var themeMem = MEM.lire('theme', 'auto');
  if (themeMem !== 'auto') { appliquerTheme(themeMem); }

  animerTitre();
  brancherDivers();
  brancherRecherche();
  appliquerLangue(MEM.lire('langue', 'fr'));
  chargerMeteo();
  setInterval(etatOuverture, 60000);
})();
