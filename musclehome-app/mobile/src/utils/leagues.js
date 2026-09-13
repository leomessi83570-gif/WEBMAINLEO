// Système de ligues façon Duolingo, mais sans backend social : le palier se compare
// à des seuils fixes (nombre total de séances) plutôt qu'à d'autres utilisateurs.
const TIERS = [
  { key: 'bronze', label: 'Bronze', icon: '🥉', min: 0 },
  { key: 'argent', label: 'Argent', icon: '🥈', min: 5 },
  { key: 'or', label: 'Or', icon: '🥇', min: 15 },
  { key: 'platine', label: 'Platine', icon: '💠', min: 30 },
  { key: 'diamant', label: 'Diamant', icon: '💎', min: 60 },
  { key: 'legende', label: 'Légende', icon: '👑', min: 100 },
];

export function getLeagueInfo(sessionsDone) {
  let current = TIERS[0];
  let next = TIERS[1];
  for (let i = 0; i < TIERS.length; i++) {
    if (sessionsDone >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] || null;
    }
  }
  const progress = next ? (sessionsDone - current.min) / (next.min - current.min) : 1;
  return {
    current,
    next,
    progress: Math.max(0, Math.min(1, progress)),
    remaining: next ? next.min - sessionsDone : 0,
  };
}
