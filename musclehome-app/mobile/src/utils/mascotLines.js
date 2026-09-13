// Répliques de la mascotte, façon Duolingo : courtes, orientées action, jamais culpabilisantes
// à l'excès. On pioche une ligne au hasard dans la catégorie qui correspond à l'état de l'utilisateur.

function pick(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

const LINES = {
  // Premier lancement / dashboard vide
  welcome: [
    "Prêt à commencer ? Ta première séance t'attend.",
    "On y va doucement, une séance à la fois.",
    "Bienvenue dans la meute. On commence quand tu veux.",
  ],

  // Aucune séance faite depuis longtemps, streak à 0
  cold_start: [
    "Ça fait un moment. On repart, une séance suffit pour relancer la machine.",
    "Pas de streak, pas de souci. Aujourd'hui c'est le jour 1.",
  ],

  // Objectif de la semaine pas encore atteint, mais pas urgent
  week_in_progress: [
    "Encore {remaining} séance{s} cette semaine pour tenir ton objectif.",
    "Tu es sur la bonne voie. {remaining} séance{s} et la semaine est validée.",
    "On garde le rythme : {remaining} restante{s} avant la fin de semaine.",
  ],

  // Objectif de la semaine atteint
  week_done: [
    "Objectif de la semaine atteint. Repose-toi, tu l'as mérité.",
    "Semaine validée 💪 La suite reprend lundi.",
    "C'est fait. Cette semaine, personne ne t'a arrêté.",
  ],

  // Streak en danger (dernier jour de la semaine, objectif pas atteint)
  streak_risk: [
    "Dernier jour pour valider ta semaine. Une séance et c'est réglé.",
    "Ta série de {streak} semaine{s} tient à un fil. On la sauve aujourd'hui ?",
    "Encore un effort avant minuit, ne laisse pas filer ta série.",
  ],

  // Le bouclier vient d'être utilisé (semaine ratée mais absorbée)
  shield_used: [
    "Semaine ratée, mais ton bouclier a encaissé le coup. Ta série continue.",
    "Ça arrive. Le bouclier t'a couvert cette fois, la série n'est pas cassée.",
  ],

  // Plusieurs jours sans la moindre activité (pas juste la streak hebdo)
  neglected: [
    "Ça fait {days} jours sans nouvelles. Tout va bien ?",
    "{days} jours d'absence. Pas de jugement, juste content de te revoir.",
    "On dirait que la vie s'est mise en travers. Une petite séance pour repartir ?",
  ],

  // Streak cassée (bouclier déjà utilisé, deuxième semaine ratée)
  streak_broken: [
    "La série est retombée à zéro. Ce n'est qu'un chiffre, on en relance une nouvelle.",
    "Streak cassée, mais pas toi. On repart sur une nouvelle série dès cette semaine.",
  ],

  // Début de séance
  workout_start: [
    "Allez, on attaque. Chaque série compte.",
    "C'est parti. Concentre-toi sur l'exécution, pas la vitesse.",
    'Échauffe-toi bien, puis on donne tout.',
  ],

  // Séance terminée à l'instant
  session_done: [
    "Séance dans la poche. À la suivante.",
    "Encore une de faite. Ton corps te remerciera plus tard.",
    "Voilà le travail. On note ça et on passe à la suite.",
  ],

  // Jalon (paliers de streak : 4, 8, 12, 26, 52 semaines...)
  milestone: [
    "{streak} semaines d'affilée. Sérieusement, respect.",
    "{streak} semaines. Tu n'es plus un débutant, tu es un habitué.",
  ],

  // Pendant la capture photo (coaching léger)
  photo_tip_face: [
    "Recule un peu pour être cadré en entier, bras le long du corps.",
    "Fond neutre si possible, et une lumière de face plutôt que derrière toi.",
  ],
  photo_tip_profil: [
    "Tourne-toi bien de profil, dos droit, sans forcer la posture.",
    "Reste naturel, ne rentre pas le ventre, on veut la vraie posture.",
  ],
};

// Anecdotes/conseils piochés quand on tape sur la mascotte, façon hibou Duolingo.
// Volontairement variés (pas que du fitness) pour donner envie de retaper dessus.
export const TIPS = [
  "Le muscle ne se construit pas pendant la séance, mais pendant le repos qui suit.",
  "3 séances par semaine tenues sur la durée battent 6 séances abandonnées au bout d'un mois.",
  "La protéine, c'est bien, mais le sommeil répare plus que n'importe quel shaker.",
  "Une série presque ratée en fin d'exercice compte souvent plus qu'une série facile.",
  "Le cœur humain bat environ 100 000 fois par jour. Le tien vient d'en gagner quelques-unes.",
  "Progresser de 2,5 kg par mois sur un exercice, c'est déjà énorme sur un an.",
  "S'échauffer 5 minutes réduit vraiment le risque de blessure, ce n'est pas une légende.",
  "La motivation démarre l'action, mais c'est l'habitude qui la fait durer.",
  "Respire à fond avant l'effort, bloque pendant, souffle en le terminant.",
  "Un buffle adulte peut peser jusqu'à 900 kg. Toi t'as encore de la marge.",
];

// Répliques spéciales après plusieurs taps rapides d'affilée sur la mascotte.
export const EASTER_EGGS = [
  "Ok ok, j'ai compris, tu m'aimes bien.",
  "Arrête de me chatouiller et va t'entraîner.",
  "Chaque tap est enregistré. Je plaisante. Ou pas.",
  "Bon d'accord, un badge secret pour toi : 'Fan de Buffalo'.",
];

// Pose de la mascotte associée à chaque catégorie de réplique (voir components/Mascot.js).
const MOOD_BY_KEY = {
  welcome: 'idle',
  cold_start: 'idle',
  week_in_progress: 'idle',
  week_done: 'celebrate',
  streak_risk: 'worried',
  shield_used: 'worried',
  streak_broken: 'worried',
  neglected: 'worried',
  session_done: 'celebrate',
  milestone: 'celebrate',
  photo_tip_face: 'idle',
  photo_tip_profil: 'idle',
  workout_start: 'dumbbells',
};

export function getRandomTip() {
  return pick(TIPS);
}

export function getRandomEasterEgg() {
  return pick(EASTER_EGGS);
}

export function getMascotMood(key) {
  return MOOD_BY_KEY[key] || 'idle';
}

export function getMascotLine(key, vars = {}) {
  const pool = LINES[key] || LINES.welcome;
  let line = pick(pool);
  for (const [k, v] of Object.entries(vars)) {
    const s = Number(v) > 1 ? 's' : '';
    line = line.replaceAll(`{${k}}`, String(v)).replaceAll('{s}', s);
  }
  return line;
}

/**
 * Détermine quelle réplique afficher sur le dashboard selon l'état de streak actuel.
 * streakInfo vient de computeStreak() (src/utils/streak.js).
 */
const ONBOARDING_LINES = {
  age: ["Pour commencer, tu as quel âge ?"],
  height_cm: ['Ta taille, en cm ?'],
  weight_kg: ['Ton poids actuel, en kg. Ça reste entre nous, promis.'],
  goal: ["C'est quoi l'objectif principal ?"],
  level: ['Tu te situes où en muscu ?'],
  equipment: ["Qu'est-ce que t'as sous la main pour t'entraîner ? Tu peux cocher plusieurs cases."],
  sessions_per_week: ['Combien de séances par semaine tu vises ? Sois honnête, pas ambitieux.'],
  limitations: ['Une douleur ou une blessure à surveiller ? Optionnel, mais ça m\'aide à adapter le programme.'],
  intro: ["Salut, moi c'est Buffalo. Je vais te poser quelques questions pour te construire un programme sur mesure."],
  outro: ["Parfait, j'ai ce qu'il me faut. On passe à l'analyse photo ?"],
};

export function getOnboardingLine(stepKey) {
  const pool = ONBOARDING_LINES[stepKey];
  return pool ? pick(pool) : '';
}

export function getDashboardState(streakInfo, now = new Date(), daysSinceLastActivity = null) {
  const { streakWeeks, currentWeekCount, weeklyGoal, currentWeekDone, remainingForGoal } = streakInfo;

  let key;
  let vars = {};
  if (daysSinceLastActivity !== null && daysSinceLastActivity >= 3) {
    key = 'neglected';
    vars = { days: daysSinceLastActivity };
  } else if (streakWeeks === 0 && currentWeekCount === 0) {
    key = 'cold_start';
  } else if (currentWeekDone) {
    key = 'week_done';
  } else {
    const isWeekend = [0, 6].includes(now.getDay()); // dimanche=0, samedi=6
    if (isWeekend && remainingForGoal > 0) {
      key = 'streak_risk';
      vars = { streak: streakWeeks };
    } else {
      key = 'week_in_progress';
      vars = { remaining: remainingForGoal };
    }
  }

  return { key, line: getMascotLine(key, vars), mood: getMascotMood(key) };
}

// Conservé pour compatibilité : ne renvoie que le texte.
export function getDashboardLine(streakInfo, now = new Date()) {
  return getDashboardState(streakInfo, now).line;
}
