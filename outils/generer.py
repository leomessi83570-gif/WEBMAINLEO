# -*- coding: utf-8 -*-
"""Génère les pages du site d'Entrecasteaux dans site/.

    python3 outils/generer.py

Le contenu éditorial dynamique (actualités, agenda, démarches, menus) vit
dans site/assets/js/donnees.js. Ce fichier ne décrit que la structure des
pages et les textes de charpente.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gabarit as G

RACINE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")

# ───────────────────────────────────────────────────────────── blocs réutilisés

AVIS = '''<section class="avis" aria-label="Avis importants">
  <article class="avis-carte">
    <span class="marqueur" style="color:var(--danger)"><i></i><span data-i18n="avis.1.cat">Sécurité</span></span>
    <h3 data-i18n="avis.1.titre">Débroussaillement suspendu jusqu’en septembre</h3>
    <p data-i18n="avis.1.texte">De juin à septembre, l’usage d’outils motorisés ou métalliques est interdit :
      une étincelle suffit à déclencher un départ de feu. Les travaux lourds se font à l’automne et en hiver.</p>
    <a class="lien-fleche" href="http://www.entrecasteaux.fr/articles.php?pg=art55" target="_blank" rel="noopener">
      <span data-i18n="lire">Lire la suite</span><span class="fl" aria-hidden="true">→</span></a>
  </article>
  <article class="avis-carte">
    <span class="marqueur" style="color:var(--second)"><i></i><span data-i18n="avis.2.cat">Solidarité</span></span>
    <h3 data-i18n="avis.2.titre">Canicule : registre des personnes vulnérables</h3>
    <p data-i18n="avis.2.texte">Les personnes fragiles peuvent s’inscrire auprès de la mairie au 04 94 37 22 88
      pour bénéficier d’un suivi régulier par un agent communal pendant les épisodes de forte chaleur.</p>
    <a class="lien-fleche" href="tel:+33494372288">
      <span data-i18n="avis.2.action">Appeler la mairie</span><span class="fl" aria-hidden="true">→</span></a>
  </article>
  <article class="avis-carte">
    <span class="marqueur" style="color:var(--accent)"><i></i><span data-i18n="avis.3.cat">Vie pratique</span></span>
    <h3 data-i18n="avis.3.titre">Déchèteries : horaires d’été</h3>
    <p data-i18n="avis.3.texte">Du 1<sup>er</sup> juillet au 31 août, les déchèteries de la Provence Verte
      ouvrent de 6 h 00 à 14 h 00 en continu. Les jours d’ouverture restent inchangés.</p>
    <a class="lien-fleche" href="https://www.caprovenceverte.fr" target="_blank" rel="noopener">
      <span data-i18n="avis.3.action">Provence Verte</span><span class="fl" aria-hidden="true">→</span></a>
  </article>
</section>'''

REVUE = '''<div class="revue">
  <div class="revue-tete">
    <span data-i18n="revue.titre">L’Écho d’Entrecasteaux</span>
    <span aria-hidden="true">→</span>
  </div>
  <div class="revue-couv">
    <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="1"
         style="width:100%;opacity:.5" aria-hidden="true">
      <path d="M4 34h52M10 34V18l6-5 6 5v16M22 34V22l7-6 7 6v12M36 34V24l6-5 6 5v10"/>
      <path d="M16 24h1M29 27h1M42 28h1"/>
    </svg>
    <div class="t" data-i18n="revue.couv">Le village,<br>ses projets,<br>ses fêtes</div>
  </div>
  <div class="revue-legende">
    <span data-i18n="revue.legende">Nouvelle formule</span>
    <em data-i18n="revue.date">à paraître · 2026</em>
  </div>
</div>'''

DECOUVRIR_CARTES = '''<div class="decouvrir">
  <article class="dec-carte">
    <span class="dec-num">01</span>
    <h3 data-i18n="dec.1.titre">Le château</h3>
    <p data-i18n="dec.1.texte">Forteresse du XI<sup>e</sup> siècle remaniée aux XV<sup>e</sup>, XVI<sup>e</sup>
      et XVIII<sup>e</sup> siècles, posée sur le rocher vingt mètres au-dessus du village. Propriété privée,
      habitée et meublée, ouverte aux visites guidées.</p>
    <span class="ep" data-i18n="dec.1.ep">Monument historique · 1988</span>
  </article>
  <article class="dec-carte">
    <span class="dec-num">02</span>
    <h3 data-i18n="dec.2.titre">Le jardin à la française</h3>
    <p data-i18n="dec.2.texte">Dessiné d’après les plans d’André Le Nôtre, jardinier de Louis XIV, à l’image
      de Versailles. La tradition veut qu’il les ait remis à la marquise de Sévigné, dont le gendre,
      le comte de Grignan, hérita du château.</p>
    <span class="ep" data-i18n="dec.2.ep">XVIII<sup>e</sup> siècle · accès libre</span>
  </article>
  <article class="dec-carte">
    <span class="dec-num">03</span>
    <h3 data-i18n="dec.3.titre">Église Saint-Sauveur</h3>
    <p data-i18n="dec.3.texte">Église fortifiée du XIII<sup>e</sup> siècle, au bout des ruelles en calade.
      Deux chapelles complètent l’ensemble : Notre-Dame-de-l’Aube, du XII<sup>e</sup>, et Sainte-Anne,
      du XVIII<sup>e</sup>.</p>
    <span class="ep" data-i18n="dec.3.ep">XIII<sup>e</sup> siècle</span>
  </article>
  <article class="dec-carte">
    <span class="dec-num">04</span>
    <h3 data-i18n="dec.4.titre">L’eau et les calades</h3>
    <p data-i18n="dec.4.texte">Ponts, fontaines, lavoir, glacière et aqueduc de Pimaquet. La commune restaure
      ces techniques ancestrales avec la Fondation du patrimoine — la calade de la chapelle porte chaque année
      la procession de la sainte patronne.</p>
    <span class="ep" data-i18n="dec.4.ep">Restauration en cours</span>
  </article>
</div>'''

HORAIRES_TABLE = '''<table class="horaires">
  <caption class="sr">Horaires d’ouverture de l’accueil de la mairie</caption>
  <tbody>
    <tr data-jour="1"><td data-i18n="jour.lun">Lundi</td><td>8 h 30 – 12 h 00 · 13 h 30 – 16 h 30</td></tr>
    <tr data-jour="2"><td data-i18n="jour.mar">Mardi</td><td>8 h 30 – 12 h 00 · 14 h 30 – 16 h 30</td></tr>
    <tr data-jour="3" class="ferme"><td data-i18n="jour.mer">Mercredi</td>
      <td>8 h 30 – 12 h 00 · <span data-i18n="mairie.apremferme">après-midi fermé</span></td></tr>
    <tr data-jour="4"><td data-i18n="jour.jeu">Jeudi</td><td>8 h 30 – 12 h 00 · 14 h 30 – 16 h 30</td></tr>
    <tr data-jour="5"><td data-i18n="jour.ven">Vendredi</td><td>8 h 30 – 12 h 00 · 13 h 30 – 16 h 30</td></tr>
    <tr data-jour="6"><td data-i18n="jour.sam">Samedi</td>
      <td data-i18n="mairie.permanence">Permanence 1×/mois, 8 h 30 – 12 h 00</td></tr>
  </tbody>
</table>'''

CONTACT_BLOC = f'''<div class="sp-bloc">
  <h3 data-i18n="mairie.adresse">Mairie d’Entrecasteaux</h3>
  <p class="sp-adresse">
    Place du Général Estève<br>
    83570 Entrecasteaux<br>
    <a href="tel:+33494372288" class="chiffres">04 94 37 22 88</a><br>
    <a href="mailto:mairie@entrecasteaux.fr">mairie@entrecasteaux.fr</a>
  </p>
</div>
<div class="sp-bloc">
  <h3 data-i18n="mairie.horaires">Horaires d’ouverture</h3>
  <div class="etat-ouverture" id="etatOuverture" data-ouvert="0" role="status"></div>
  {HORAIRES_TABLE}
</div>'''

URGENCES_BLOC = '''<div class="sp-bloc">
  <h3 data-i18n="mairie.urgences">Numéros utiles</h3>
  <table class="horaires">
    <tbody>
      <tr><td data-i18n="urg.secours">Secours (Europe)</td><td class="chiffres">112</td></tr>
      <tr><td data-i18n="urg.pompiers">Pompiers</td><td class="chiffres">18</td></tr>
      <tr><td data-i18n="urg.samu">SAMU</td><td class="chiffres">15</td></tr>
      <tr><td data-i18n="urg.gendarmerie">Gendarmerie</td><td class="chiffres">17</td></tr>
    </tbody>
  </table>
</div>'''

CARTE_BLOC = '''<div>
  <iframe class="sp-carte" loading="lazy" title="Plan d’accès — Mairie d’Entrecasteaux"
    src="https://www.openstreetmap.org/export/embed.html?bbox=6.2295%2C43.5095%2C6.2555%2C43.5245&amp;layer=mapnik&amp;marker=43.517%2C6.2425"></iframe>
  <div style="margin-top:var(--esp-6)">
    <h3 class="surtitre" data-i18n="mairie.acces">Y venir</h3>
    <p style="margin-top:var(--esp-3);color:var(--texte-doux)" data-i18n="mairie.acces.texte">
      Depuis la gare TGV des Arcs–Draguignan : D10 vers Taradeau et Lorgues, puis D562 vers Carcès,
      et D31 à droite avant Carcès. Depuis l’A8, sortie « Brignoles / Le Val » ou sortie « Le Muy »
      selon votre provenance.</p>
  </div>
</div>'''


# ─────────────────────────────────────────────────────────────────── accueil

ACCUEIL = f'''
{AVIS}

<section class="section" id="actualite">
  <div class="wrap">
    <div class="actu-grille">
      <div>
        <h2 class="section-titre" data-i18n="sec.actualite">Actualité</h2>
        <div style="margin-top:var(--esp-8)">{REVUE}</div>
      </div>
      <div>
        <div class="actus" id="listeActus"></div>
        <p style="margin-top:var(--esp-10)">
          <a class="btn btn--fantome" href="actualites.html">
            <span data-i18n="page.actualites.titre">Actualités</span>
            <span aria-hidden="true">→</span></a>
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section section--inverse" id="agenda">
  <div class="wrap">
    <div class="section-tete">
      <h2 class="section-titre" data-i18n="sec.agenda">Agenda</h2>
      <a class="lien-fleche auto-gauche" style="color:rgba(255,255,255,.75)"
         href="https://www.facebook.com/ville.entrecasteaux" target="_blank" rel="noopener">
        <span data-i18n="agenda.fb">Toutes les festivités sur Facebook</span>
        <span class="fl" aria-hidden="true">→</span></a>
    </div>
    <div class="agenda-liste" id="listeAgenda"></div>
    <p style="margin-top:var(--esp-8)">
      <a class="lien-fleche" style="color:rgba(255,255,255,.75)" href="agenda.html">
        <span data-i18n="page.agenda.titre">Agenda</span><span class="fl" aria-hidden="true">→</span></a>
    </p>
  </div>
</section>

<section class="section" id="decouvrir">
  <div class="wrap">
    <div class="section-tete">
      <div>
        <span class="surtitre" data-i18n="decouvrir.eyebrow">Site inscrit à l’inventaire des sites
          pittoresques depuis 1967</span>
        <h2 class="section-titre" style="margin-top:var(--esp-3)" data-i18n="sec.decouvrir">Découvrir<br>le village</h2>
      </div>
      <p class="chapo auto-gauche" style="max-width:44ch" data-i18n="decouvrir.lede">Entre châteaux —
        <em>intercastellos</em> — apparaît dès 1012 dans le cartulaire de l’abbaye Saint-Victor de Marseille.
        Mille ans plus tard, les calades, les fontaines et l’aqueduc racontent toujours la même histoire
        d’eau et de pierre.</p>
    </div>
    {DECOUVRIR_CARTES}
  </div>
</section>

<section class="section section--doux" id="demarches">
  <div class="wrap">
    <div class="section-tete">
      <h2 class="section-titre" data-i18n="sec.demarches">Démarches</h2>
      <p class="chapo auto-gauche" style="max-width:38ch;font-size:var(--ts-md)" data-i18n="demarches.lede">
        Une grande partie des démarches se fait désormais en ligne. Pour le reste, l’accueil de la mairie
        vous reçoit du lundi au vendredi.</p>
    </div>
    <div class="demarches" id="listeDemarches"></div>
  </div>
</section>

<section class="section" id="mairie">
  <div class="wrap">
    <div class="section-tete">
      <h2 class="section-titre" data-i18n="sec.mairie">Service public</h2>
    </div>
    <div class="sp">
      <div>
        {CONTACT_BLOC}
        {URGENCES_BLOC}
      </div>
      {CARTE_BLOC}
    </div>
  </div>
</section>
'''


# ───────────────────────────────────────────────────────────────── actualités

ACTUALITES = f'''
<section class="section">
  <div class="wrap">
    <div class="section-tete">
      <p class="chapo" data-i18n="page.actualites.chapo">Les informations publiées par la mairie :
        sécurité, travaux, vie associative, patrimoine. Les alertes urgentes sont également relayées
        sur Facebook et l’application City All.</p>
    </div>
    <div class="actu-grille">
      <div>{REVUE}</div>
      <div class="actus" id="listeActus"></div>
    </div>
  </div>
</section>

{AVIS}

<section class="section">
  <div class="wrap" style="display:flex;gap:var(--esp-4);flex-wrap:wrap">
    <a class="btn btn--primaire" href="agenda.html">
      <span data-i18n="page.agenda.titre">Agenda</span><span aria-hidden="true">→</span></a>
    <a class="btn btn--fantome" href="https://www.facebook.com/ville.entrecasteaux"
       target="_blank" rel="noopener">
      <span data-i18n="agenda.fb">Toutes les festivités sur Facebook</span></a>
  </div>
</section>
'''


# ───────────────────────────────────────────────────────────────────── agenda

AGENDA = '''
<section class="section section--inverse">
  <div class="wrap">
    <div class="section-tete">
      <p class="chapo" style="color:rgba(255,255,255,.78)" data-i18n="page.agenda.chapo">Les rendez-vous
        du village : festival, fêtes votives, forum des associations, séances du conseil municipal.</p>
      <a class="lien-fleche auto-gauche" style="color:rgba(255,255,255,.75)"
         href="https://www.facebook.com/ville.entrecasteaux" target="_blank" rel="noopener">
        <span data-i18n="agenda.fb">Toutes les festivités sur Facebook</span>
        <span class="fl" aria-hidden="true">→</span></a>
    </div>
    <p class="surtitre" style="color:rgba(255,255,255,.5);margin-bottom:var(--esp-4)"
       data-i18n="agenda.avenir">À venir</p>
    <div class="agenda-liste" id="listeAgenda"></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-tete">
      <h2 class="section-titre" data-i18n="conseil.titre">Le conseil municipal</h2>
    </div>
    <div class="prose">
      <p data-i18n="conseil.texte">Entrecasteaux comptant entre 1 000 et 1 499 habitants, son conseil
        municipal est composé de 15 sièges (article L2121-2 du code général des collectivités territoriales).
        La composition nominative, les délégations et le calendrier des séances sont publiés avec les
        comptes rendus.</p>
    </div>
    <div class="demarches" style="margin-top:var(--esp-8)">
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art24" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="14" height="14"/>
          <path d="M3 8h14M7 2v4M13 2v4"/></svg>
        <span><b data-i18n="conseil.seances">Prochaines séances</b><span>entrecasteaux.fr</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art34" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><path d="M5 2h7l4 4v12H5z"/>
          <path d="M12 2v4h4M8 11h5M8 14h5"/></svg>
        <span><b data-i18n="conseil.comptes">Comptes rendus</b><span>entrecasteaux.fr</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art62" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><path d="M4 3h12v14H4z"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>
        <span><b data-i18n="conseil.arretes">Arrêtés municipaux</b><span>entrecasteaux.fr</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
    </div>
  </div>
</section>
'''


# ──────────────────────────────────────────────────────────────────  découvrir

DECOUVRIR = f'''
<section class="section">
  <div class="wrap">
    <div class="section-tete">
      <div>
        <span class="surtitre" data-i18n="decouvrir.eyebrow">Site inscrit à l’inventaire des sites
          pittoresques depuis 1967</span>
        <h2 class="section-titre" style="margin-top:var(--esp-3)">Mille ans<br>entre deux châteaux</h2>
      </div>
      <p class="chapo auto-gauche" style="max-width:44ch" data-i18n="decouvrir.lede">Entre châteaux —
        <em>intercastellos</em> — apparaît dès 1012 dans le cartulaire de l’abbaye Saint-Victor de Marseille.
        Mille ans plus tard, les calades, les fontaines et l’aqueduc racontent toujours la même histoire
        d’eau et de pierre.</p>
    </div>
    {DECOUVRIR_CARTES}
  </div>
</section>

<section class="section section--doux">
  <div class="wrap">
    <div class="actu-grille">
      <div>
        <h2 class="section-titre" style="font-size:clamp(1.75rem,4vw,3rem)">Le village,<br>mode d’emploi</h2>
      </div>
      <div class="prose">
        <h3>Se garer et monter au village</h3>
        <p>Le cœur ancien se parcourt à pied : les calades, ruelles pavées de galets de la Bresque,
          ne se prêtent ni à la voiture ni aux talons. Le stationnement se fait en contrebas, puis
          l’on monte par les escaliers vers l’église et le château.</p>

        <h3>Ce qui se visite</h3>
        <ul>
          <li>Le <strong>jardin à la française</strong>, en accès libre au pied du château.</li>
          <li>Le <strong>château</strong>, propriété privée habitée, sur visite guidée.</li>
          <li>L’<strong>église Saint-Sauveur</strong> et les chapelles Notre-Dame-de-l’Aube et Sainte-Anne.</li>
          <li>Le circuit de l’eau : ponts, fontaines, lavoir, glacière et aqueduc de Pimaquet.</li>
        </ul>

        <h3>Soutenir la restauration</h3>
        <p>La commune restaure ses calades et ses ouvrages hydrauliques avec la Fondation du patrimoine.
          La collecte de dons est ouverte : chaque contribution finance un mètre carré de galets reposés
          à la main, selon la technique d’origine.</p>
        <p style="margin-top:var(--esp-6)">
          <a class="btn btn--primaire" href="http://www.entrecasteaux.fr/downloads/fiche_patrimone.pdf"
             target="_blank" rel="noopener">Fiche patrimoine (PDF)<span aria-hidden="true">→</span></a>
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-tete"><h2 class="section-titre" data-i18n="sec.agenda">Agenda</h2>
      <a class="lien-fleche auto-gauche" href="agenda.html">
        <span data-i18n="page.agenda.titre">Agenda</span><span class="fl" aria-hidden="true">→</span></a>
    </div>
    <div class="agenda-liste" id="listeAgenda"
         style="border-color:var(--ligne)"></div>
  </div>
</section>
'''


# ─────────────────────────────────────────────────────────────────── démarches

DEMARCHES = f'''
<section class="section">
  <div class="wrap">
    <div class="section-tete">
      <p class="chapo" data-i18n="demarches.lede">Une grande partie des démarches se fait désormais
        en ligne. Pour le reste, l’accueil de la mairie vous reçoit du lundi au vendredi.</p>
    </div>
    <div class="demarches" id="listeDemarches"></div>
  </div>
</section>

<section class="section section--doux">
  <div class="wrap">
    <div class="sp">
      <div>
        <h2 class="section-titre" style="font-size:clamp(1.75rem,4vw,3rem);margin-bottom:var(--esp-8)">
          Se présenter<br>à l’accueil</h2>
        {CONTACT_BLOC}
      </div>
      <div class="prose">
        <h3 data-i18n="contact.titre">Écrire à la mairie</h3>
        <p data-i18n="contact.intro">Pour une demande simple, le courriel suffit. Pour un acte d’état civil
          ou un dossier d’urbanisme, passez par le service concerné.</p>

        <h3>Ce qu’il faut apporter</h3>
        <ul>
          <li><strong>Acte d’état civil</strong> — pièce d’identité et, selon le cas, livret de famille.</li>
          <li><strong>Recensement citoyen</strong> — à seize ans : pièce d’identité, livret de famille,
            justificatif de domicile.</li>
          <li><strong>Inscription sur les listes électorales</strong> — pièce d’identité en cours de validité
            et justificatif de domicile de moins de trois mois.</li>
          <li><strong>Urbanisme</strong> — le dépôt se fait en ligne sur le portail de la Provence Verte ;
            l’accueil peut vous accompagner dans la saisie.</li>
        </ul>

        <h3>Les démarches qui ne passent plus par la mairie</h3>
        <p>Carte nationale d’identité et passeport se déposent dans une commune équipée d’un dispositif
          de recueil ; carte grise et permis de conduire se traitent en ligne sur le site de l’ANTS.
          En cas de doute, l’accueil vous oriente.</p>
        <p style="margin-top:var(--esp-6)">
          <a class="btn btn--fantome" href="https://www.service-public.fr" target="_blank" rel="noopener">
            service-public.fr<span aria-hidden="true">↗</span></a>
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-tete"><h2 class="section-titre" data-i18n="mairie.urgences">Numéros utiles</h2></div>
    <div class="sp">
      <div>{URGENCES_BLOC}</div>
      {CARTE_BLOC}
    </div>
  </div>
</section>
'''


# ─────────────────────────────────────────────────────────────────────  mairie

MAIRIE = f'''
<section class="section">
  <div class="wrap">
    <div class="sp">
      <div>
        {CONTACT_BLOC}
        {URGENCES_BLOC}
      </div>
      {CARTE_BLOC}
    </div>
  </div>
</section>

<section class="section section--doux">
  <div class="wrap">
    <div class="section-tete">
      <h2 class="section-titre" data-i18n="conseil.titre">Le conseil municipal</h2>
      <p class="chapo auto-gauche" style="max-width:40ch" data-i18n="conseil.texte">Entrecasteaux comptant
        entre 1 000 et 1 499 habitants, son conseil municipal est composé de 15 sièges (article L2121-2
        du code général des collectivités territoriales). La composition nominative, les délégations et le
        calendrier des séances sont publiés avec les comptes rendus.</p>
    </div>
    <div class="demarches">
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art24" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="14" height="14"/>
          <path d="M3 8h14M7 2v4M13 2v4"/></svg>
        <span><b data-i18n="conseil.seances">Prochaines séances</b><span>entrecasteaux.fr</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art34" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><path d="M5 2h7l4 4v12H5z"/>
          <path d="M12 2v4h4M8 11h5M8 14h5"/></svg>
        <span><b data-i18n="conseil.comptes">Comptes rendus</b><span>entrecasteaux.fr</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art11" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="7" r="3.2"/>
          <path d="M3.8 17c.6-3.3 3.1-5 6.2-5s5.6 1.7 6.2 5"/></svg>
        <span><b>Les services</b><span>organisation communale</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
      <a class="demarche" href="http://www.entrecasteaux.fr/articles.php?pg=art62" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" aria-hidden="true"><path d="M4 3h12v14H4z"/>
          <path d="M7 7h6M7 10h6M7 13h4"/></svg>
        <span><b data-i18n="conseil.arretes">Arrêtés municipaux</b><span>entrecasteaux.fr</span></span>
        <span class="fl" aria-hidden="true">→</span></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-tete">
      <h2 class="section-titre" data-i18n="sec.demarches">Démarches</h2>
      <a class="lien-fleche auto-gauche" href="demarches.html">
        <span data-i18n="page.demarches.titre">Démarches</span><span class="fl" aria-hidden="true">→</span></a>
    </div>
    <div class="demarches" id="listeDemarches"></div>
  </div>
</section>
'''


# ─────────────────────────────────────────────────────────────── construction

ALT_VILLAGE = ("Le village d’Entrecasteaux au crépuscule : les toits de tuiles, le clocher de "
               "l’église Saint-Sauveur et le château dominant la vallée de la Bresque")

PAGES = [
    dict(
        fichier="index.html", page_id="accueil",
        titre="Entrecasteaux — Site officiel de la commune | Var, Provence Verte",
        description=("Site officiel de la commune d’Entrecasteaux (83570, Var). Actualités, démarches, "
                     "agenda, alertes et informations pratiques de la mairie."),
        og_titre="Entrecasteaux — Site officiel de la commune",
        heros_html=G.heros(
            '<h1 class="heros-titre" id="herosTitre">Entrecasteaux</h1>',
            G.meta_commune(),
            bas_html='''<div class="heros-bas">
      <p class="heros-baseline" data-i18n="heros.baseline">Village de caractère au cœur de la Provence Verte,
        bâti sur un piton rocheux au-dessus de la Bresque, dominé par son château des XI<sup>e</sup> et
        XVII<sup>e</sup> siècles et son jardin à la française.</p>
      <div class="raccourcis">
        <a class="raccourci" href="demarches.html">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
               aria-hidden="true"><path d="M5 2h7l4 4v12H5z"/><path d="M12 2v4h4M8 11h5M8 14h5"/></svg>
          <span data-i18n="rc.demarches">Démarches en ligne</span></a>
        <a class="raccourci" href="agenda.html">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
               aria-hidden="true"><rect x="3" y="4" width="14" height="14"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>
          <span data-i18n="rc.agenda">Agenda</span></a>
        <a class="raccourci" href="mairie.html">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
               aria-hidden="true"><path d="M2 8 10 3l8 5M4 8v9h12V8M8 17v-5h4v5"/></svg>
          <span data-i18n="rc.mairie">Contacter la mairie</span></a>
      </div>
    </div>''',
            alt=ALT_VILLAGE),
        corps=ACCUEIL,
        body_attrs='data-actus-limite="4" data-agenda-limite="3"',
    ),
    dict(
        fichier="actualites.html", page_id="actualites",
        titre="Actualités — Commune d’Entrecasteaux",
        description=("Les actualités de la commune d’Entrecasteaux : sécurité, travaux, vie associative, "
                     "patrimoine et informations pratiques."),
        heros_html=G.heros('<h1 class="heros-titre" data-i18n="page.actualites.titre">Actualités</h1>',
                           G.meta_page("Actualités"), page=True, position="center 30%", alt=""),
        corps=ACTUALITES,
    ),
    dict(
        fichier="agenda.html", page_id="agenda",
        titre="Agenda — Commune d’Entrecasteaux",
        description=("Les rendez-vous d’Entrecasteaux : festival, fêtes votives, forum des associations "
                     "et séances du conseil municipal."),
        heros_html=G.heros('<h1 class="heros-titre" data-i18n="page.agenda.titre">Agenda</h1>',
                           G.meta_page("Agenda"), page=True, position="center 55%", alt=""),
        corps=AGENDA,
        body_attrs="data-agenda-passes",
    ),
    dict(
        fichier="decouvrir.html", page_id="decouvrir",
        titre="Découvrir le village — Commune d’Entrecasteaux",
        description=("Le château, le jardin à la française attribué à Le Nôtre, l’église Saint-Sauveur, "
                     "les calades et l’aqueduc de Pimaquet."),
        heros_html=G.heros('<h1 class="heros-titre" data-i18n="page.decouvrir.titre">Découvrir</h1>',
                           G.meta_page("Découvrir"), page=True, position="center 38%", alt=""),
        corps=DECOUVRIR,
        body_attrs='data-agenda-limite="3"',
    ),
    dict(
        fichier="demarches.html", page_id="demarches",
        titre="Démarches — Commune d’Entrecasteaux",
        description=("Urbanisme, état civil, cantine et garderie, taxe de séjour, déchets, "
                     "débroussaillement : toutes les démarches de la commune."),
        heros_html=G.heros('<h1 class="heros-titre" data-i18n="page.demarches.titre">Démarches</h1>',
                           G.meta_page("Démarches"), page=True, position="center 60%", alt=""),
        corps=DEMARCHES,
    ),
    dict(
        fichier="mairie.html", page_id="mairie",
        titre="La mairie — Commune d’Entrecasteaux",
        description=("Adresse, horaires d’ouverture, numéros utiles, plan d’accès et conseil municipal "
                     "de la commune d’Entrecasteaux."),
        heros_html=G.heros('<h1 class="heros-titre" data-i18n="page.mairie.titre">La mairie</h1>',
                           G.meta_page("La mairie"), page=True, position="center 48%", alt=""),
        corps=MAIRIE,
    ),
]


def main():
    for p in PAGES:
        html = G.page(**p)
        chemin = os.path.join(RACINE, p["fichier"])
        with open(chemin, "w", encoding="utf-8") as f:
            f.write(html)
        print("écrit :", p["fichier"], "—", len(html), "octets")


if __name__ == "__main__":
    main()
