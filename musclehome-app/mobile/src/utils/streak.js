// Système de streak hebdomadaire : on ne vise pas 7/7 (irréaliste en muscu, le repos
// fait partie du programme), mais un objectif de séances par semaine. La série se compte
// en semaines consécutives où l'objectif a été atteint, avec un "bouclier" qui absorbe
// une semaine ratée par mois pour ne pas punir un imprévu ponctuel.

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function weekKey(date) {
  return startOfWeek(date).toISOString().slice(0, 10);
}

export function getSessionLogs(logs) {
  return (logs || []).filter((l) => l.type === 'session');
}

export function getCurrentWeekCount(logs, now = new Date()) {
  const key = weekKey(now);
  return getSessionLogs(logs).filter((l) => weekKey(new Date(l.date)) === key).length;
}

// Regroupe les séances par semaine, retourne un tableau trié du plus ancien au plus récent
// de { key, count }.
function groupByWeek(logs) {
  const map = new Map();
  for (const l of getSessionLogs(logs)) {
    const key = weekKey(new Date(l.date));
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => (a.key < b.key ? -1 : 1));
}

/**
 * Calcule la série en cours et l'état du bouclier.
 * weeklyGoal: nombre de séances visées par semaine (ex: 4)
 * shieldUsedAt: clé de semaine (ou null) où le bouclier a déjà été consommé ce mois-ci
 */
export function computeStreak(logs, weeklyGoal = 4, now = new Date()) {
  const weeks = groupByWeek(logs);
  const currentKey = weekKey(now);
  const byKey = new Map(weeks.map((w) => [w.key, w.count]));

  // On remonte semaine par semaine depuis la semaine courante (exclue du calcul de série
  // tant qu'elle n'est pas terminée) jusqu'à trouver une semaine qui casse la série.
  let cursor = startOfWeek(now);
  cursor.setDate(cursor.getDate() - 7); // on part de la semaine précédente, complète

  let streakWeeks = 0;
  let shieldAvailable = true; // un bouclier "gratuit" par mois glissant, simplifié ici à 1 par série

  for (let i = 0; i < 104; i++) {
    // limite de sécurité (2 ans) pour éviter une boucle infinie
    const key = weekKey(cursor);
    const count = byKey.get(key) || 0;

    if (count >= weeklyGoal) {
      streakWeeks += 1;
    } else if (shieldAvailable) {
      // la semaine est ratée mais le bouclier l'absorbe : la série continue,
      // on ne compte pas la semaine comme réussie mais on ne casse pas non plus
      shieldAvailable = false;
    } else {
      break;
    }
    cursor = new Date(cursor.getTime() - 7 * DAY_MS);
  }

  const currentWeekCount = byKey.get(currentKey) || 0;
  const currentWeekDone = currentWeekCount >= weeklyGoal;

  return {
    streakWeeks,
    currentWeekCount,
    weeklyGoal,
    currentWeekDone,
    shieldAvailable,
    remainingForGoal: Math.max(0, weeklyGoal - currentWeekCount),
  };
}

export function getWeekDayStatus(logs, now = new Date()) {
  // Retourne 7 entrées (lundi -> dimanche) avec un booléen "séance ce jour-là"
  const start = startOfWeek(now);
  const sessions = getSessionLogs(logs);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(start.getTime() + i * DAY_MS);
    const dayKey = day.toISOString().slice(0, 10);
    const done = sessions.some((l) => new Date(l.date).toISOString().slice(0, 10) === dayKey);
    return {
      date: day,
      done,
      isToday: day.getTime() === today.getTime(),
      isFuture: day.getTime() > today.getTime(),
    };
  });
}
