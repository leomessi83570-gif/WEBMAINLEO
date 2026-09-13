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

  // Streak cassée (bouclier déjà utilisé, deuxième semaine ratée)
  streak_broken: [
    "La série est retombée à zéro. Ce n'est qu'un chiffre, on en relance une nouvelle.",
    "Streak cassée, mais pas toi. On repart sur une nouvelle série dès cette semaine.",
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

// Pose de la mascotte associée à chaque catégorie de réplique (voir components/Mascot.js).
const MOOD_BY_KEY = {
  welcome: 'idle',
  cold_start: 'idle',
  week_in_progress: 'idle',
  week_done: 'celebrate',
  streak_risk: 'worried',
  shield_used: 'worried',
  streak_broken: 'worried',
  session_done: 'celebrate',
  milestone: 'celebrate',
  photo_tip_face: 'idle',
  photo_tip_profil: 'idle',
};

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
export function getDashboardState(streakInfo, now = new Date()) {
  const { streakWeeks, currentWeekCount, weeklyGoal, currentWeekDone, remainingForGoal } = streakInfo;

  let key;
  let vars = {};
  if (streakWeeks === 0 && currentWeekCount === 0) {
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
