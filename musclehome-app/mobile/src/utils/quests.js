// Quête du jour : une petite tâche simple en plus du programme normal, différente
// chaque jour (choisie de façon déterministe pour rester stable toute la journée).

const QUESTS = [
  {
    id: 'session_before_18h',
    label: 'Termine une séance avant 18h',
    check: (logs, now) =>
      logs.some(
        (l) =>
          l.type === 'session' &&
          isToday(l.date, now) &&
          new Date(l.date).getHours() < 18
      ),
  },
  {
    id: 'any_session',
    label: "Valide au moins une séance aujourd'hui",
    check: (logs, now) => logs.some((l) => l.type === 'session' && isToday(l.date, now)),
  },
  {
    id: 'log_weight',
    label: 'Note ton poids du jour dans ton profil',
    check: (logs, now) => logs.some((l) => l.type === 'weight' && isToday(l.date, now)),
  },
  {
    id: 'session_morning',
    label: 'Fais ta séance avant midi',
    check: (logs, now) =>
      logs.some(
        (l) => l.type === 'session' && isToday(l.date, now) && new Date(l.date).getHours() < 12
      ),
  },
];

function isToday(dateStr, now) {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDailyQuest(logs, now = new Date()) {
  const quest = QUESTS[dayOfYear(now) % QUESTS.length];
  return { ...quest, done: quest.check(logs, now) };
}
