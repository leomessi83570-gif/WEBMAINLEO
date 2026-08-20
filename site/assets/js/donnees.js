/* ============================================================================
   ENTRECASTEAUX — CONTENU
   Source unique de vérité éditoriale du site. Chaque objet correspond
   un pour un à une collection de CMS (Decap / Netlify Identity), pour que
   le passage du fichier statique au back-office se fasse sans réécriture.

   MENUS         → arborescence de navigation (3 langues)
   LIENS_LEGAUX  → pied de page, mentions
   I18N          → dictionnaire d'interface
   CONTENU.actus → actualités
   CONTENU.agenda→ événements datés
   CONTENU.demarches → services en ligne
   ========================================================================= */
window.EC = (function () {
  'use strict';

  var LANGUES = ['fr', 'en', 'it'];

  var BASE = 'http://www.entrecasteaux.fr/articles.php?pg=';
  /* Navigation principale — six entrées, une par intention d'usage.
     Chaque entrée porte une page du site (h) et, quand c'est utile, un volet
     de liens profonds. Le doublon « Découvrir » de l'ancienne arborescence a
     disparu : une rubrique = un seul point d'entrée. */
  var MENUS = [
    { id: 'actualites', page: 'actualites', h: 'actualites.html',
      t: ['Actualités', 'News', 'Attualità'] },

    { id: 'agenda', page: 'agenda', h: 'agenda.html',
      t: ['Agenda', 'What’s on', 'Eventi'] },

    { id: 'decouvrir', page: 'decouvrir', h: 'decouvrir.html',
      t: ['Découvrir', 'Visit', 'Scoprire'], items: [
      { t: ['Le château et son jardin', 'The château and its garden', 'Il castello e il giardino'], h: 'decouvrir.html#patrimoine' },
      { t: ['Église Saint-Sauveur et chapelles', 'Saint-Sauveur church & chapels', 'Chiesa e cappelle'], h: 'decouvrir.html#patrimoine' },
      { t: ['Histoire du village', 'Village history', 'Storia del paese'], h: BASE + 'art2' },
      { t: ['Guide du village', 'Village guide', 'Guida del paese'], h: BASE + 'art30' },
      { t: ['Vues du village', 'Photo gallery', 'Galleria fotografica'], h: 'http://www.entrecasteaux.fr/photos.php' },
      { t: ['Associations, sports et loisirs', 'Clubs, sport & leisure', 'Associazioni e tempo libero'], h: BASE + 'art10' },
      { t: ['Films et reportages', 'Films & reports', 'Film e reportage'], h: 'http://www.entrecasteaux.fr/liens.php' }
    ]},

    { id: 'demarches', page: 'demarches', h: 'demarches.html',
      t: ['Démarches', 'Services', 'Servizi'], items: [
      { t: ['Toutes les démarches', 'All services', 'Tutte le pratiche'], h: 'demarches.html' },
      { titre: ['Urbanisme', 'Planning', 'Urbanistica'] },
      { t: ['Dépôt dématérialisé des autorisations', 'Online planning applications', 'Domande urbanistiche online'], h: 'https://portail-urbanisme.caprovenceverte.fr' },
      { t: ['Rapport de présentation du PLU', 'Local plan — report', 'Relazione del piano urbanistico'], h: BASE + 'art42' },
      { t: ['Pièces du PLU', 'Local plan — documents', 'Documenti del piano'], h: BASE + 'art43' },
      { t: ['Pièces annexes du PLU', 'Local plan — annexes', 'Allegati del piano'], h: BASE + 'art44' },
      { t: ['Modifications simplifiées', 'Simplified amendments', 'Modifiche semplificate'], h: BASE + 'art53' },
      { t: ['D.I.A. et C.U. par les notaires', 'Notary filings (D.I.A. / C.U.)', 'Pratiche notarili'], h: BASE + 'art37' }
    ]},

    { id: 'viepratique',
      t: ['Vie pratique', 'Everyday life', 'Vita pratica'], items: [
      { t: ['Commerces et artisans', 'Shops & craftspeople', 'Negozi e artigiani'], h: BASE + 'art13' },
      { t: ['Débroussaillement et feux', 'Brush clearing & fire rules', 'Sfrascatura e incendi'], h: BASE + 'art55' },
      { t: ['Cartographie des risques', 'Risk map', 'Mappa dei rischi'], h: BASE + 'art36' },
      { t: ['Habitat et voisinage', 'Housing & neighbours', 'Abitazione e vicinato'], h: BASE + 'art54' },
      { t: ['Jardins partagés', 'Community gardens', 'Orti condivisi'], h: BASE + 'art57' },
      { t: ['Marché local', 'Local market', 'Mercato locale'], h: BASE + 'art49' },
      { t: ['Location saisonnière et taxe de séjour', 'Holiday rentals & tourist tax', 'Affitti turistici e tassa di soggiorno'], h: BASE + 'art14' },
      { t: ['Parking sécurisé', 'Secure car park', 'Parcheggio sicuro'], h: BASE + 'art58' },
      { t: ['Santé et bien-être', 'Health & wellbeing', 'Salute e benessere'], h: BASE + 'art46' },
      { t: ['Transports', 'Transport', 'Trasporti'], h: BASE + 'art4' },
      { titre: ['Enfance et école', 'Children & school', 'Infanzia e scuola'] },
      { t: ['École communale d’Entrecasteaux', 'Village primary school', 'Scuola comunale'], h: BASE + 'art25' },
      { t: ['Inscriptions cantine et garderie', 'Canteen & after-school sign-up', 'Iscrizioni mensa e doposcuola'], h: BASE + 'art8' },
      { t: ['Centre de loisirs de Cotignac', 'Cotignac activity centre', 'Centro ricreativo di Cotignac'], h: BASE + 'art6' }
    ]},

    { id: 'mairie', page: 'mairie', h: 'mairie.html',
      t: ['Mairie', 'Town hall', 'Municipio'], items: [
      { t: ['Horaires, contact et plan', 'Hours, contact and map', 'Orari, contatti e mappa'], h: 'mairie.html' },
      { t: ['Bienvenue à Entrecasteaux', 'Welcome', 'Benvenuti'], h: BASE + 'art5' },
      { titre: ['Conseil municipal', 'Town council', 'Consiglio comunale'] },
      { t: ['Prochaines séances du conseil', 'Upcoming council meetings', 'Prossime sedute del consiglio'], h: BASE + 'art24' },
      { t: ['Comptes rendus des conseils', 'Council minutes', 'Verbali del consiglio'], h: BASE + 'art34' },
      { t: ['Projets municipaux et financements', 'Municipal projects & funding', 'Progetti e finanziamenti'], h: BASE + 'art60' },
      { t: ['Arrêtés municipaux', 'Municipal orders', 'Ordinanze comunali'], h: BASE + 'art62' },
      { t: ['Arrêtés préfectoraux', 'Prefectoral orders', 'Ordinanze prefettizie'], h: BASE + 'art61' },
      { titre: ['Services', 'Departments', 'Servizi'] },
      { t: ['Les services de la mairie', 'Town hall departments', 'I servizi comunali'], h: BASE + 'art11' },
      { t: ['Police municipale', 'Municipal police', 'Polizia municipale'], h: BASE + 'art56' },
      { t: ['Médiathèque', 'Media library', 'Mediateca'], h: BASE + 'art32' },
      { t: ['Les numéros utiles', 'Useful numbers', 'Numeri utili'], h: BASE + 'art26' }
    ]}
  ];

  var LIENS_LEGAUX = [
    { t: ['Données personnelles', 'Personal data', 'Dati personali'], h: BASE + 'art59' },
    { t: ['Objets trouvés', 'Lost property', 'Oggetti smarriti'], h: BASE + 'art50' },
    { t: ['Informations légales', 'Legal notice', 'Note legali'], h: BASE + 'art16' },
    { t: ['Accessibilité', 'Accessibility', 'Accessibilità'], h: '#' }
  ];

  /* ---------- 2. Dictionnaire ----------------------------- */

  var I18N = {
    fr: {
      'marque.sous': 'Var · Provence Verte',
      'alerte.titre': 'Risque incendie rouge',
      'alerte.texte': 'travaux et débroussaillement interdits sur la commune.',
      'alerte.lien': 'Consulter le bulletin',
      'direct.dep': 'Département', 'direct.coord': 'Coordonnées', 'direct.alt': 'Altitude', 'direct.hab': 'Habitants',
      'meteo.chargement': 'Relevé en cours…',
      'meteo.indispo': 'Météo indisponible',
      'heros.baseline': "Village de caractère au cœur de la Provence Verte, bâti sur un piton rocheux au-dessus de la Bresque, dominé par son château des XI<sup>e</sup> et XVII<sup>e</sup> siècles et son jardin à la française.",
      'rc.demarches': 'Démarches en ligne', 'rc.agenda': 'Agenda', 'rc.mairie': 'Contacter la mairie',
      'lire': 'Lire la suite',
      'avis.1.cat': 'Sécurité',
      'avis.1.titre': "Débroussaillement suspendu jusqu'en septembre",
      'avis.1.texte': "De juin à septembre, l'usage d'outils motorisés ou métalliques est interdit : une étincelle suffit à déclencher un départ de feu. Les travaux lourds se font à l'automne et en hiver.",
      'avis.2.cat': 'Solidarité',
      'avis.2.titre': 'Canicule : registre des personnes vulnérables',
      'avis.2.texte': "Les personnes fragiles peuvent s'inscrire auprès de la mairie au 04 94 37 22 88 pour bénéficier d'un suivi régulier par un agent communal pendant les épisodes de forte chaleur.",
      'avis.2.action': 'Appeler la mairie',
      'avis.3.cat': 'Vie pratique',
      'avis.3.titre': "Déchèteries : horaires d'été",
      'avis.3.texte': "Du 1<sup>er</sup> juillet au 31 août, les déchèteries de la Provence Verte ouvrent de 6 h 00 à 14 h 00 en continu. Les jours d'ouverture restent inchangés.",
      'avis.3.action': 'Provence Verte',
      'sec.actualite': 'Actualité',
      'revue.titre': "L'Écho d'Entrecasteaux",
      'revue.couv': 'Le village,<br>ses projets,<br>ses fêtes',
      'revue.legende': 'Nouvelle formule', 'revue.date': 'à paraître · 2026',
      'sec.agenda': 'Agenda', 'agenda.fb': 'Toutes les festivités sur Facebook',
      'agenda.termine': 'Terminé', 'agenda.gratuit': 'Entrée libre',
      'decouvrir.eyebrow': "Site inscrit à l'inventaire des sites pittoresques depuis 1967",
      'sec.decouvrir': 'Découvrir<br>le village',
      'decouvrir.lede': "Entre châteaux — <em>intercastellos</em> — apparaît dès 1012 dans le cartulaire de l'abbaye Saint-Victor de Marseille. Mille ans plus tard, les calades, les fontaines et l'aqueduc racontent toujours la même histoire d'eau et de pierre.",
      'dec.1.titre': 'Le château',
      'dec.1.texte': "Forteresse du XI<sup>e</sup> siècle remaniée aux XV<sup>e</sup>, XVI<sup>e</sup> et XVIII<sup>e</sup> siècles, posée sur le rocher vingt mètres au-dessus du village. Propriété privée, habitée et meublée, ouverte aux visites guidées.",
      'dec.1.ep': 'Monument historique · 1988',
      'dec.2.titre': 'Le jardin à la française',
      'dec.2.texte': "Dessiné d'après les plans d'André Le Nôtre, jardinier de Louis XIV, à l'image de Versailles. La tradition veut qu'il les ait remis à la marquise de Sévigné, dont le gendre, le comte de Grignan, hérita du château.",
      'dec.2.ep': 'XVIII<sup>e</sup> siècle · accès libre',
      'dec.3.titre': 'Église Saint-Sauveur',
      'dec.3.texte': "Église fortifiée du XIII<sup>e</sup> siècle, au bout des ruelles en calade. Deux chapelles complètent l'ensemble : Notre-Dame-de-l'Aube, du XII<sup>e</sup>, et Sainte-Anne, du XVIII<sup>e</sup>.",
      'dec.3.ep': 'XIII<sup>e</sup> siècle',
      'dec.4.titre': "L'eau et les calades",
      'dec.4.texte': "Ponts, fontaines, lavoir, glacière et aqueduc de Pimaquet. La commune restaure ces techniques ancestrales avec la Fondation du patrimoine — la calade de la chapelle porte chaque année la procession de la sainte patronne.",
      'dec.4.ep': 'Restauration en cours',
      'sec.demarches': 'Démarches',
      'demarches.lede': "Une grande partie des démarches se fait désormais en ligne. Pour le reste, l'accueil de la mairie vous reçoit du lundi au vendredi.",
      'sec.mairie': 'Service public',
      'mairie.adresse': "Mairie d'Entrecasteaux", 'mairie.horaires': "Horaires d'ouverture",
      'mairie.apremferme': 'après-midi fermé',
      'mairie.permanence': 'Permanence 1×/mois, 8 h 30 – 12 h 00',
      'mairie.urgences': 'Numéros utiles', 'mairie.acces': 'Y venir',
      'mairie.acces.texte': "Depuis la gare TGV des Arcs–Draguignan : D10 vers Taradeau et Lorgues, puis D562 vers Carcès, et D31 à droite avant Carcès. Depuis l'A8, sortie « Brignoles / Le Val » ou sortie « Le Muy » selon votre provenance.",
      'jour.lun': 'Lundi', 'jour.mar': 'Mardi', 'jour.mer': 'Mercredi', 'jour.jeu': 'Jeudi', 'jour.ven': 'Vendredi', 'jour.sam': 'Samedi',
      'urg.secours': 'Secours (Europe)', 'urg.pompiers': 'Pompiers', 'urg.samu': 'SAMU', 'urg.gendarmerie': 'Gendarmerie',
      'pied.baseline': "Site officiel de la commune. Toutes les infos et alertes au quotidien également sur Facebook et l'application City All.",
      'pied.legal': 'Informations légales', 'pied.haut': 'Haut de page ↑',
      'nav.municipalite': 'Municipalité', 'nav.viepratique': 'Vie pratique',
      'recherche.placeholder': 'Rechercher une page, une démarche…',
      'recherche.vide': 'Aucun résultat pour cette recherche.',
      'edit.activer': 'Mode édition', 'edit.barre': 'Mode édition',
      'edit.aide': "Cliquez sur un texte encadré pour le modifier. Les modifications portent sur la langue affichée.",
      'edit.importer': 'Importer', 'edit.exporter': 'Exporter le contenu', 'edit.quitter': 'Terminer',
      'edit.ajouterActu': '+ Ajouter une actualité', 'edit.ajouterEv': '+ Ajouter un événement',
      'edit.suppr': 'Supprimer',
      'edit.nouvelleActu.cat': 'Catégorie', 'edit.nouvelleActu.titre': "Titre de l'actualité",
      'edit.nouvelleActu.texte': 'Rédigez ici le contenu de cette actualité.',
      'edit.nouvelEv.titre': "Nom de l'événement", 'edit.nouvelEv.texte': 'Lieu, horaire, tarif…', 'edit.nouvelEv.meta': 'Informations'
    },
    en: {
      'marque.sous': 'Var · Provence Verte',
      'alerte.titre': 'Red wildfire alert',
      'alerte.texte': 'clearing work and power tools are banned across the commune.',
      'alerte.lien': 'Read the bulletin',
      'direct.dep': 'Department', 'direct.coord': 'Coordinates', 'direct.alt': 'Elevation', 'direct.hab': 'Inhabitants',
      'meteo.chargement': 'Loading…', 'meteo.indispo': 'Weather unavailable',
      'heros.baseline': "A listed village at the heart of the Provence Verte, built on a rocky spur above the Bresque and crowned by its 11th- and 17th-century château and formal French garden.",
      'rc.demarches': 'Online services', 'rc.agenda': 'What\u2019s on', 'rc.mairie': 'Contact the town hall',
      'lire': 'Read more',
      'avis.1.cat': 'Safety',
      'avis.1.titre': 'Brush clearing suspended until September',
      'avis.1.texte': 'From June to September, motorised and metal tools are banned: a single spark can start a fire. Heavy clearing work belongs to autumn and winter.',
      'avis.2.cat': 'Support',
      'avis.2.titre': 'Heatwave: register for vulnerable residents',
      'avis.2.texte': 'Vulnerable residents can register at the town hall on +33 4 94 37 22 88 to be checked on regularly by a council officer during heat episodes.',
      'avis.2.action': 'Call the town hall',
      'avis.3.cat': 'Everyday life',
      'avis.3.titre': 'Recycling centres: summer hours',
      'avis.3.texte': 'From 1 July to 31 August, Provence Verte recycling centres open from 6 am to 2 pm without a break. Opening days are unchanged.',
      'avis.3.action': 'Provence Verte',
      'sec.actualite': 'News',
      'revue.titre': "L'Écho d'Entrecasteaux",
      'revue.couv': 'The village,<br>its projects,<br>its festivals',
      'revue.legende': 'New format', 'revue.date': 'forthcoming · 2026',
      'sec.agenda': "What's on", 'agenda.fb': 'All events on Facebook',
      'agenda.termine': 'Past', 'agenda.gratuit': 'Free entry',
      'decouvrir.eyebrow': 'Listed among the picturesque sites of the Var since 1967',
      'sec.decouvrir': 'Discover<br>the village',
      'decouvrir.lede': "Entre châteaux — <em>intercastellos</em> — first appears in 1012 in the records of Saint-Victor abbey in Marseille. A thousand years on, the cobbled calades, fountains and aqueduct still tell the same story of water and stone.",
      'dec.1.titre': 'The château',
      'dec.1.texte': 'An 11th-century fortress reworked in the 15th, 16th and 18th centuries, set on the rock twenty metres above the village. Privately owned, lived in and furnished, open for guided tours.',
      'dec.1.ep': 'Listed monument · 1988',
      'dec.2.titre': 'The formal garden',
      'dec.2.texte': 'Laid out from plans by André Le Nôtre, gardener to Louis XIV, in the image of Versailles. Tradition holds that he gave them to Madame de Sévigné, whose son-in-law the Count of Grignan inherited the château.',
      'dec.2.ep': '18th century · free access',
      'dec.3.titre': 'Saint-Sauveur church',
      'dec.3.texte': 'A fortified 13th-century church at the end of the cobbled lanes. Two chapels complete the set: Notre-Dame-de-l\u2019Aube, 12th century, and Sainte-Anne, 18th century.',
      'dec.3.ep': '13th century',
      'dec.4.titre': 'Water and calades',
      'dec.4.texte': 'Bridges, fountains, a washhouse, an ice house and the Pimaquet aqueduct. The commune is restoring these ancestral techniques with the Fondation du patrimoine — the chapel calade still carries the patron saint\u2019s procession each year.',
      'dec.4.ep': 'Restoration under way',
      'sec.demarches': 'Services',
      'demarches.lede': 'Most administrative steps are now handled online. For everything else, the town hall reception is open Monday to Friday.',
      'sec.mairie': 'Town hall',
      'mairie.adresse': 'Mairie d\u2019Entrecasteaux', 'mairie.horaires': 'Opening hours',
      'mairie.apremferme': 'closed in the afternoon',
      'mairie.permanence': 'One Saturday a month, 8.30 am – 12 pm',
      'mairie.urgences': 'Useful numbers', 'mairie.acces': 'Getting here',
      'mairie.acces.texte': 'From Les Arcs–Draguignan TGV station: D10 towards Taradeau and Lorgues, then D562 towards Carcès and the D31 on the right before Carcès. From the A8, take the “Brignoles / Le Val” or “Le Muy” exit depending on where you come from.',
      'jour.lun': 'Monday', 'jour.mar': 'Tuesday', 'jour.mer': 'Wednesday', 'jour.jeu': 'Thursday', 'jour.ven': 'Friday', 'jour.sam': 'Saturday',
      'urg.secours': 'Emergency (Europe)', 'urg.pompiers': 'Fire brigade', 'urg.samu': 'Ambulance', 'urg.gendarmerie': 'Police',
      'pied.baseline': 'Official website of the commune. Daily news and alerts are also published on Facebook and the City All app.',
      'pied.legal': 'Legal', 'pied.haut': 'Back to top ↑',
      'nav.municipalite': 'Town council', 'nav.viepratique': 'Everyday life',
      'recherche.placeholder': 'Search a page or a service…',
      'recherche.vide': 'Nothing found for this search.',
      'edit.activer': 'Edit mode', 'edit.barre': 'Edit mode',
      'edit.aide': 'Click any outlined text to change it. Edits apply to the language currently displayed.',
      'edit.importer': 'Import', 'edit.exporter': 'Export content', 'edit.quitter': 'Done',
      'edit.ajouterActu': '+ Add a news item', 'edit.ajouterEv': '+ Add an event',
      'edit.suppr': 'Delete',
      'edit.nouvelleActu.cat': 'Category', 'edit.nouvelleActu.titre': 'News headline',
      'edit.nouvelleActu.texte': 'Write the content of this news item here.',
      'edit.nouvelEv.titre': 'Event name', 'edit.nouvelEv.texte': 'Venue, time, price…', 'edit.nouvelEv.meta': 'Details'
    },
    it: {
      'marque.sous': 'Var · Provence Verte',
      'alerte.titre': 'Allerta incendi rossa',
      'alerte.texte': 'lavori e sfrascatura vietati su tutto il comune.',
      'alerte.lien': 'Leggi il bollettino',
      'direct.dep': 'Dipartimento', 'direct.coord': 'Coordinate', 'direct.alt': 'Altitudine', 'direct.hab': 'Abitanti',
      'meteo.chargement': 'Caricamento…', 'meteo.indispo': 'Meteo non disponibile',
      'heros.baseline': "Borgo di carattere nel cuore della Provence Verte, costruito su uno sperone roccioso sopra la Bresque e dominato dal castello dell'XI e XVII secolo con il suo giardino alla francese.",
      'rc.demarches': 'Servizi online', 'rc.agenda': 'Eventi', 'rc.mairie': 'Contattare il municipio',
      'lire': 'Continua',
      'avis.1.cat': 'Sicurezza',
      'avis.1.titre': 'Sfrascatura sospesa fino a settembre',
      'avis.1.texte': "Da giugno a settembre è vietato l'uso di attrezzi a motore o metallici: una scintilla basta a innescare un incendio. I lavori pesanti si svolgono in autunno e in inverno.",
      'avis.2.cat': 'Solidarietà',
      'avis.2.titre': 'Ondata di calore: registro delle persone fragili',
      'avis.2.texte': 'Le persone fragili possono iscriversi in municipio al +33 4 94 37 22 88 per essere seguite regolarmente da un agente comunale durante le ondate di calore.',
      'avis.2.action': 'Chiamare il municipio',
      'avis.3.cat': 'Vita pratica',
      'avis.3.titre': 'Centri di raccolta: orario estivo',
      'avis.3.texte': "Dal 1° luglio al 31 agosto i centri di raccolta della Provence Verte sono aperti dalle 6.00 alle 14.00 senza interruzione. I giorni di apertura restano invariati.",
      'avis.3.action': 'Provence Verte',
      'sec.actualite': 'Attualità',
      'revue.titre': "L'Écho d'Entrecasteaux",
      'revue.couv': 'Il paese,<br>i progetti,<br>le feste',
      'revue.legende': 'Nuova formula', 'revue.date': 'in uscita · 2026',
      'sec.agenda': 'Eventi', 'agenda.fb': 'Tutte le feste su Facebook',
      'agenda.termine': 'Concluso', 'agenda.gratuit': 'Ingresso libero',
      'decouvrir.eyebrow': "Sito iscritto all'inventario dei luoghi pittoreschi dal 1967",
      'sec.decouvrir': 'Scoprire<br>il paese',
      'decouvrir.lede': "Entre châteaux — <em>intercastellos</em> — compare già nel 1012 nel cartulario dell'abbazia di Saint-Victor a Marsiglia. Mille anni dopo, le calades, le fontane e l'acquedotto raccontano ancora la stessa storia di acqua e pietra.",
      'dec.1.titre': 'Il castello',
      'dec.1.texte': "Fortezza dell'XI secolo rimaneggiata nel XV, XVI e XVIII secolo, posata sulla roccia venti metri sopra il paese. Proprietà privata, abitata e arredata, aperta a visite guidate.",
      'dec.1.ep': 'Monumento storico · 1988',
      'dec.2.titre': 'Il giardino alla francese',
      'dec.2.texte': "Disegnato sui piani di André Le Nôtre, giardiniere di Luigi XIV, a immagine di Versailles. La tradizione vuole che li abbia consegnati alla marchesa di Sévigné, il cui genero, conte di Grignan, ereditò il castello.",
      'dec.2.ep': 'XVIII secolo · accesso libero',
      'dec.3.titre': 'Chiesa di Saint-Sauveur',
      'dec.3.texte': "Chiesa fortificata del XIII secolo, in fondo ai vicoli in calade. Due cappelle completano l'insieme: Notre-Dame-de-l'Aube, del XII secolo, e Sainte-Anne, del XVIII.",
      'dec.3.ep': 'XIII secolo',
      'dec.4.titre': "L'acqua e le calades",
      'dec.4.texte': "Ponti, fontane, lavatoio, ghiacciaia e acquedotto di Pimaquet. Il comune restaura queste tecniche ancestrali con la Fondation du patrimoine — la calade della cappella accompagna ogni anno la processione della santa patrona.",
      'dec.4.ep': 'Restauro in corso',
      'sec.demarches': 'Pratiche',
      'demarches.lede': 'Gran parte delle pratiche si svolge ormai online. Per il resto, lo sportello del municipio vi accoglie dal lunedì al venerdì.',
      'sec.mairie': 'Servizio pubblico',
      'mairie.adresse': 'Municipio di Entrecasteaux', 'mairie.horaires': 'Orari di apertura',
      'mairie.apremferme': 'pomeriggio chiuso',
      'mairie.permanence': 'Un sabato al mese, 8.30 – 12.00',
      'mairie.urgences': 'Numeri utili', 'mairie.acces': 'Come arrivare',
      'mairie.acces.texte': "Dalla stazione TGV Les Arcs–Draguignan: D10 verso Taradeau e Lorgues, poi D562 verso Carcès e la D31 a destra prima di Carcès. Dall'A8, uscita « Brignoles / Le Val » o « Le Muy » a seconda della provenienza.",
      'jour.lun': 'Lunedì', 'jour.mar': 'Martedì', 'jour.mer': 'Mercoledì', 'jour.jeu': 'Giovedì', 'jour.ven': 'Venerdì', 'jour.sam': 'Sabato',
      'urg.secours': 'Emergenze (Europa)', 'urg.pompiers': 'Vigili del fuoco', 'urg.samu': 'Emergenza sanitaria', 'urg.gendarmerie': 'Gendarmeria',
      'pied.baseline': "Sito ufficiale del comune. Tutte le informazioni e gli avvisi quotidiani anche su Facebook e sull'app City All.",
      'pied.legal': 'Note legali', 'pied.haut': 'Torna su ↑',
      'nav.municipalite': 'Municipalità', 'nav.viepratique': 'Vita pratica',
      'recherche.placeholder': 'Cerca una pagina o un servizio…',
      'recherche.vide': 'Nessun risultato per questa ricerca.',
      'edit.activer': 'Modalità modifica', 'edit.barre': 'Modalità modifica',
      'edit.aide': 'Clicca su un testo evidenziato per modificarlo. Le modifiche valgono per la lingua visualizzata.',
      'edit.importer': 'Importa', 'edit.exporter': 'Esporta i contenuti', 'edit.quitter': 'Fine',
      'edit.ajouterActu': '+ Aggiungi una notizia', 'edit.ajouterEv': '+ Aggiungi un evento',
      'edit.suppr': 'Elimina',
      'edit.nouvelleActu.cat': 'Categoria', 'edit.nouvelleActu.titre': 'Titolo della notizia',
      'edit.nouvelleActu.texte': 'Scrivi qui il contenuto della notizia.',
      'edit.nouvelEv.titre': "Nome dell'evento", 'edit.nouvelEv.texte': 'Luogo, orario, prezzo…', 'edit.nouvelEv.meta': 'Informazioni'
    }
  };


  var CONTENU = {
    actus: [
      { id: 'a1', lien: 'https://www.facebook.com/ville.entrecasteaux',
        fr: { cat: 'Culture', titre: "Festival d'Entrecasteaux : le cinéma en plein air au Grand Pré", texte: "Trois soirs de projections gratuites au Grand Pré : La Flûte enchantée, Cendrillon par le Ballet de l'Opéra de Paris et Les Demoiselles de Rochefort. Pique-nique dès 19 h 30, film à 21 h, transats à disposition." },
        en: { cat: 'Culture', titre: 'Entrecasteaux Festival: open-air cinema at the Grand Pré', texte: 'Three evenings of free screenings at the Grand Pré: The Magic Flute, Cinderella by the Paris Opera Ballet and The Young Girls of Rochefort. Picnic from 7.30 pm, film at 9 pm, deckchairs provided.' },
        it: { cat: 'Cultura', titre: 'Festival di Entrecasteaux: cinema all\u2019aperto al Grand Pré', texte: 'Tre serate di proiezioni gratuite al Grand Pré: Il flauto magico, Cenerentola del Balletto dell\u2019Opéra di Parigi e Le signorine di Rochefort. Picnic dalle 19.30, film alle 21, sdraio a disposizione.' } },
      { id: 'a2', lien: 'https://www.facebook.com/ville.entrecasteaux',
        fr: { cat: 'Festivités', titre: 'La soirée Sainte-Anne reportée au 15 août', texte: "Reportée en raison des nombreux feux, la soirée se tient place Bruny : paëlla, glace et vin compris, DJ Fred. 20 € par adulte, 13 € par enfant. Réservation au Tabac-Presse, ouverture dès 19 h 30." },
        en: { cat: 'Events', titre: 'Sainte-Anne evening moved to 15 August', texte: 'Postponed because of the wildfires, the evening takes place on Place Bruny: paella, ice cream and wine included, with DJ Fred. €20 per adult, €13 per child. Book at the Tabac-Presse; doors from 7.30 pm.' },
        it: { cat: 'Feste', titre: 'La serata di Sant\u2019Anna rinviata al 15 agosto', texte: 'Rinviata a causa degli incendi, la serata si tiene in Place Bruny: paella, gelato e vino inclusi, con DJ Fred. 20 € adulti, 13 € bambini. Prenotazioni al Tabacchi, apertura dalle 19.30.' } },
      { id: 'a3', lien: BASE + 'art36',
        fr: { cat: 'Prévention', titre: 'Cartographie des risques sur la commune', texte: "Feux de forêt, inondations de la Bresque, mouvements de terrain : la commune met à disposition la cartographie des risques et les consignes à connaître avant l'été." },
        en: { cat: 'Prevention', titre: 'Risk map for the commune', texte: 'Wildfires, flooding of the Bresque, ground movement: the commune publishes the risk map and the instructions to know before summer.' },
        it: { cat: 'Prevenzione', titre: 'Mappa dei rischi del comune', texte: 'Incendi boschivi, piene della Bresque, movimenti franosi: il comune mette a disposizione la mappa dei rischi e le istruzioni da conoscere prima dell\u2019estate.' } },
      { id: 'a4', lien: 'https://www.caprovenceverte.fr/vie-pratique/transport-mobilite/aide-a-lacquisition-dun-velo-en-provence-verte/',
        fr: { cat: 'Mobilité', titre: "Aide à l'achat d'un vélo en 2026", texte: "Vélo classique neuf : 80 % du prix TTC remboursés, dans la limite de 100 €. Vélo à assistance électrique neuf : 30 % du prix TTC, dans la limite de 250 €. Dossier à déposer auprès de la Provence Verte." },
        en: { cat: 'Mobility', titre: 'Bicycle purchase grant for 2026', texte: 'New standard bicycle: 80% of the price refunded, up to €100. New electric bicycle: 30% of the price, up to €250. Applications are handled by the Provence Verte authority.' },
        it: { cat: 'Mobilità', titre: 'Contributo per l\u2019acquisto di una bicicletta 2026', texte: 'Bicicletta nuova: rimborso dell\u201980 % del prezzo, fino a 100 €. Bicicletta elettrica nuova: 30 % del prezzo, fino a 250 €. Domanda da presentare alla Provence Verte.' } },
      { id: 'a5', lien: 'http://www.entrecasteaux.fr/downloads/fiche_patrimone.pdf',
        fr: { cat: 'Patrimoine', titre: "Fondation du patrimoine : l'eau et les calades provençales", texte: "La commune souhaite restaurer calades, fontaines, lavoir et aqueduc — des techniques connues sur tout le pourtour méditerranéen depuis la préhistoire. La collecte de dons est ouverte." },
        en: { cat: 'Heritage', titre: 'Heritage fund: Provençal water works and calades', texte: 'The commune plans to restore its cobbled calades, fountains, washhouse and aqueduct — techniques known around the Mediterranean since prehistory. The donation drive is open.' },
        it: { cat: 'Patrimonio', titre: 'Fondazione del patrimonio: l\u2019acqua e le calades provenzali', texte: 'Il comune intende restaurare calades, fontane, lavatoio e acquedotto — tecniche note in tutto il Mediterraneo dalla preistoria. La raccolta fondi è aperta.' } },
      { id: 'a6', lien: 'http://www.entrecasteaux.fr/downloads/information_borne_recharge_electrique.pdf',
        fr: { cat: 'Mobilité', titre: "Bornes de recharge Mouv'ElecVar", texte: "Le réseau varois de bornes de rechargement pour véhicules électriques est déployé sur la commune. Fonctionnement, tarifs et badges : toutes les informations dans la notice." },
        en: { cat: 'Mobility', titre: "Mouv'ElecVar charging points", texte: 'The Var network of electric-vehicle charging points now covers the commune. How it works, prices and access badges are set out in the leaflet.' },
        it: { cat: 'Mobilità', titre: "Colonnine di ricarica Mouv'ElecVar", texte: 'La rete varese di colonnine di ricarica per veicoli elettrici è attiva nel comune. Funzionamento, tariffe e tessere: tutte le informazioni nel documento.' } }
    ],
    agenda: [
      { id: 'e1', date: '2026-08-12', gratuit: true,
        fr: { titre: 'La Flûte enchantée', texte: 'Film de Kenneth Branagh, d\u2019après Mozart — Grand Pré', meta: 'Pique-nique 19 h 30 · Film 21 h' },
        en: { titre: 'The Magic Flute', texte: 'Film by Kenneth Branagh, after Mozart — Grand Pré', meta: 'Picnic 7.30 pm · Film 9 pm' },
        it: { titre: 'Il flauto magico', texte: 'Film di Kenneth Branagh, da Mozart — Grand Pré', meta: 'Picnic 19.30 · Film 21.00' } },
      { id: 'e2', date: '2026-08-13', gratuit: true,
        fr: { titre: 'Cendrillon', texte: 'Ballet de Rudolf Noureev, Ballet de l\u2019Opéra de Paris — Grand Pré', meta: 'Pique-nique 19 h 30 · Film 21 h' },
        en: { titre: 'Cinderella', texte: 'Ballet by Rudolf Nureyev, Paris Opera Ballet — Grand Pré', meta: 'Picnic 7.30 pm · Film 9 pm' },
        it: { titre: 'Cenerentola', texte: 'Balletto di Rudolf Nureyev, Balletto dell\u2019Opéra di Parigi — Grand Pré', meta: 'Picnic 19.30 · Film 21.00' } },
      { id: 'e3', date: '2026-08-14', gratuit: true,
        fr: { titre: 'Les Demoiselles de Rochefort', texte: 'Film de Jacques Demy — Grand Pré', meta: 'Pique-nique 19 h 30 · Film 21 h' },
        en: { titre: 'The Young Girls of Rochefort', texte: 'Film by Jacques Demy — Grand Pré', meta: 'Picnic 7.30 pm · Film 9 pm' },
        it: { titre: 'Le signorine di Rochefort', texte: 'Film di Jacques Demy — Grand Pré', meta: 'Picnic 19.30 · Film 21.00' } },
      { id: 'e4', date: '2026-08-15', gratuit: false,
        fr: { titre: 'Soirée Sainte-Anne', texte: 'Paëlla, glace et vin compris · DJ Fred — Place Bruny', meta: '20 € · Enfant 13 € · dès 19 h 30' },
        en: { titre: 'Sainte-Anne evening', texte: 'Paella, ice cream and wine included · DJ Fred — Place Bruny', meta: '€20 · Child €13 · from 7.30 pm' },
        it: { titre: 'Serata di Sant\u2019Anna', texte: 'Paella, gelato e vino inclusi · DJ Fred — Place Bruny', meta: '20 € · Bambini 13 € · dalle 19.30' } },
      { id: 'e5', date: '2026-09-05', gratuit: true,
        fr: { titre: 'Forum des associations', texte: 'Sports, culture et loisirs du village — Place Bruny', meta: '10 h – 17 h' },
        en: { titre: 'Clubs and societies fair', texte: 'Village sport, culture and leisure clubs — Place Bruny', meta: '10 am – 5 pm' },
        it: { titre: 'Forum delle associazioni', texte: 'Sport, cultura e tempo libero del paese — Place Bruny', meta: '10.00 – 17.00' } }
    ],
    demarches: [
      { icone: 'doc', h: 'https://portail-urbanisme.caprovenceverte.fr',
        t: ['Autorisations d\u2019urbanisme', 'Planning applications', 'Autorizzazioni urbanistiche'],
        s: ['Dépôt en ligne · CU, DP, PC, PA, PD', 'Online filing · all permit types', 'Deposito online · tutti i permessi'] },
      { icone: 'user', h: 'https://www.service-public.fr',
        t: ['État civil', 'Civil registry', 'Stato civile'],
        s: ['Actes, mariage, recensement', 'Certificates, marriage, census', 'Atti, matrimonio, censimento'] },
      { icone: 'school', h: BASE + 'art8',
        t: ['Cantine et garderie', 'Canteen & after-school', 'Mensa e doposcuola'],
        s: ['Inscriptions année scolaire', 'School-year sign-up', 'Iscrizioni anno scolastico'] },
      { icone: 'home', h: BASE + 'art14',
        t: ['Taxe de séjour', 'Tourist tax', 'Tassa di soggiorno'],
        s: ['Location saisonnière · déclaration', 'Holiday rentals · declaration', 'Affitti turistici · dichiarazione'] },
      { icone: 'trash', h: 'https://www.caprovenceverte.fr',
        t: ['Déchets et déchèteries', 'Waste & recycling centres', 'Rifiuti e centri di raccolta'],
        s: ['Horaires, encombrants, tri', 'Hours, bulky waste, sorting', 'Orari, ingombranti, raccolta'] },
      { icone: 'flame', h: BASE + 'art55',
        t: ['Débroussaillement', 'Brush clearing', 'Sfrascatura'],
        s: ['Obligations légales et périodes', 'Legal duties and periods', 'Obblighi di legge e periodi'] }
    ]
  };


  /* ---------- Compléments propres au site multi-pages ------- */

  /* Pages réelles du site (la nav déroulante reste l'arborescence longue) */
  var PAGES = [
    { id: 'accueil',    h: 'index.html',      t: ['Accueil', 'Home', 'Home'] },
    { id: 'actualites', h: 'actualites.html', t: ['Actualités', 'News', 'Attualità'] },
    { id: 'agenda',     h: 'agenda.html',     t: ['Agenda', 'What\u2019s on', 'Eventi'] },
    { id: 'decouvrir',  h: 'decouvrir.html',  t: ['Découvrir', 'Visit', 'Scoprire'] },
    { id: 'demarches',  h: 'demarches.html',  t: ['Démarches', 'Services', 'Servizi'] },
    { id: 'mairie',     h: 'mairie.html',     t: ['Mairie', 'Town hall', 'Municipio'] }
  ];

  /* Repères de la commune — affichés dans le bloc d'identité du héros */
  var COMMUNE = {
    nom: 'Entrecasteaux',
    cp: '83570',
    insee: '83052',
    territoire: ['Var · Provence Verte', 'Var · Provence Verte', 'Var · Provence Verte'],
    coord: '43°31′N 6°14′E',
    lat: 43.5167,
    lon: 6.2425,
    altitude: '97–354 m',
    habitants: '1 118',
    tel: '+33494372288',
    telAffiche: '04 94 37 22 88',
    courriel: 'mairie@entrecasteaux.fr',
    adresse: ['Place du Général Estève', '83570 Entrecasteaux']
  };

  /* Horaires d'accueil — sert aussi au calcul « ouvert / fermé maintenant ».
     Chaque créneau est exprimé en minutes depuis minuit. */
  var HORAIRES = [
    { jour: 1, cle: 'jour.lun', creneaux: [[510, 720], [810, 990]] },
    { jour: 2, cle: 'jour.mar', creneaux: [[510, 720], [870, 990]] },
    { jour: 3, cle: 'jour.mer', creneaux: [[510, 720]] },
    { jour: 4, cle: 'jour.jeu', creneaux: [[510, 720], [870, 990]] },
    { jour: 5, cle: 'jour.ven', creneaux: [[510, 720], [810, 990]] },
    { jour: 6, cle: 'jour.sam', creneaux: [] }
  ];

  /* Clés d'interface ajoutées par le nouveau site */
  var SUPPLEMENT = {
    fr: {
      'nav.menu': 'Menu', 'nav.fermer': 'Fermer le menu', 'nav.deplier': 'Déplier',
      'nav.principale': 'Navigation principale',
      'theme.basculer': 'Basculer le thème clair ou sombre',
      'evitement': 'Aller au contenu principal',
      'sec.pages': 'Le site',
      'ouvert.oui': 'Accueil ouvert', 'ouvert.non': 'Accueil fermé',
      'ouvert.reouverture': 'Réouverture', 'ouvert.jusqua': "jusqu'à",
      'page.actualites.titre': 'Actualités',
      'page.actualites.chapo': "Les informations publiées par la mairie : sécurité, travaux, vie associative, patrimoine. Les alertes urgentes sont également relayées sur Facebook et l'application City All.",
      'page.agenda.titre': 'Agenda',
      'page.agenda.chapo': 'Les rendez-vous du village : festival, fêtes votives, forum des associations, séances du conseil municipal.',
      'page.decouvrir.titre': 'Découvrir',
      'page.demarches.titre': 'Démarches',
      'page.mairie.titre': 'La mairie',
      'agenda.avenir': 'À venir', 'agenda.passes': 'Déjà passés',
      'agenda.aucun': 'Aucun événement programmé pour le moment.',
      'conseil.titre': 'Le conseil municipal',
      'conseil.texte': "Entrecasteaux comptant entre 1 000 et 1 499 habitants, son conseil municipal est composé de 15 sièges (article L2121-2 du code général des collectivités territoriales). La composition nominative, les délégations et le calendrier des séances sont publiés avec les comptes rendus.",
      'conseil.seances': 'Prochaines séances', 'conseil.comptes': 'Comptes rendus',
      'conseil.arretes': 'Arrêtés municipaux',
      'plan.titre': 'Plan du site',
      'contact.titre': 'Écrire à la mairie',
      'contact.intro': "Pour une demande simple, le courriel suffit. Pour un acte d'état civil ou un dossier d'urbanisme, passez par le service concerné.",
      'retour.accueil': "Retour à l'accueil"
    },
    en: {
      'nav.menu': 'Menu', 'nav.fermer': 'Close menu', 'nav.deplier': 'Expand',
      'nav.principale': 'Main navigation',
      'theme.basculer': 'Switch light or dark theme',
      'evitement': 'Skip to main content',
      'sec.pages': 'This site',
      'ouvert.oui': 'Reception open', 'ouvert.non': 'Reception closed',
      'ouvert.reouverture': 'Reopens', 'ouvert.jusqua': 'until',
      'page.actualites.titre': 'News',
      'page.actualites.chapo': 'Information published by the town hall: safety, works, community life, heritage. Urgent alerts are also relayed on Facebook and the City All app.',
      'page.agenda.titre': "What\u2019s on",
      'page.agenda.chapo': 'Village events: the festival, patron-saint celebrations, the clubs fair and council meetings.',
      'page.decouvrir.titre': 'Discover',
      'page.demarches.titre': 'Services',
      'page.mairie.titre': 'Town hall',
      'agenda.avenir': 'Upcoming', 'agenda.passes': 'Past',
      'agenda.aucun': 'No event scheduled at the moment.',
      'conseil.titre': 'The municipal council',
      'conseil.texte': 'With between 1,000 and 1,499 inhabitants, Entrecasteaux has a municipal council of 15 seats (article L2121-2 of the French local government code). Names, delegated responsibilities and the meeting calendar are published together with the minutes.',
      'conseil.seances': 'Upcoming meetings', 'conseil.comptes': 'Minutes',
      'conseil.arretes': 'Municipal orders',
      'plan.titre': 'Site map',
      'contact.titre': 'Write to the town hall',
      'contact.intro': 'For a simple request, email is enough. For civil-registry certificates or planning files, go through the relevant service.',
      'retour.accueil': 'Back to home'
    },
    it: {
      'nav.menu': 'Menu', 'nav.fermer': 'Chiudi il menu', 'nav.deplier': 'Espandi',
      'nav.principale': 'Navigazione principale',
      'theme.basculer': 'Cambia tema chiaro o scuro',
      'evitement': 'Vai al contenuto principale',
      'sec.pages': 'Il sito',
      'ouvert.oui': 'Sportello aperto', 'ouvert.non': 'Sportello chiuso',
      'ouvert.reouverture': 'Riapre', 'ouvert.jusqua': 'fino alle',
      'page.actualites.titre': 'Attualità',
      'page.actualites.chapo': 'Le informazioni pubblicate dal municipio: sicurezza, lavori, vita associativa, patrimonio. Le allerte urgenti sono diffuse anche su Facebook e sull\u2019app City All.',
      'page.agenda.titre': 'Eventi',
      'page.agenda.chapo': 'Gli appuntamenti del paese: festival, feste patronali, forum delle associazioni, sedute del consiglio comunale.',
      'page.decouvrir.titre': 'Scoprire',
      'page.demarches.titre': 'Servizi',
      'page.mairie.titre': 'Il municipio',
      'agenda.avenir': 'In arrivo', 'agenda.passes': 'Conclusi',
      'agenda.aucun': 'Nessun evento in programma al momento.',
      'conseil.titre': 'Il consiglio comunale',
      'conseil.texte': 'Con una popolazione tra 1 000 e 1 499 abitanti, Entrecasteaux ha un consiglio comunale di 15 seggi (articolo L2121-2 del codice degli enti locali francese). La composizione nominativa, le deleghe e il calendario delle sedute sono pubblicati insieme ai verbali.',
      'conseil.seances': 'Prossime sedute', 'conseil.comptes': 'Verbali',
      'conseil.arretes': 'Ordinanze comunali',
      'plan.titre': 'Mappa del sito',
      'contact.titre': 'Scrivere al municipio',
      'contact.intro': 'Per una richiesta semplice basta l\u2019email. Per atti di stato civile o pratiche urbanistiche rivolgersi al servizio competente.',
      'retour.accueil': 'Torna alla home'
    }
  };

  LANGUES.forEach(function (l) {
    var s = SUPPLEMENT[l];
    for (var cle in s) { if (Object.prototype.hasOwnProperty.call(s, cle)) { I18N[l][cle] = s[cle]; } }
  });

  return {
    LANGUES: LANGUES,
    PAGES: PAGES,
    COMMUNE: COMMUNE,
    HORAIRES: HORAIRES,
    BASE: BASE,
    MENUS: MENUS,
    LIENS_LEGAUX: LIENS_LEGAUX,
    I18N: I18N,
    CONTENU: CONTENU
  };
})();
