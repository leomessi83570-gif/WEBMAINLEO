// Récompense variable après séance (principe "Variable Reward" de Hooked, Nir Eyal) :
// le fait de ne pas savoir à l'avance ce qu'on va recevoir entretient l'envie de revenir,
// bien plus qu'une récompense fixe et prévisible à chaque fois.

const REWARDS = [
  // tier commun (~60%) — encouragement simple, pas de badge
  { tier: 'commun', weight: 60, icon: '💪', title: 'Séance validée', badge: null },
  { tier: 'commun', weight: 60, icon: '🔥', title: 'Toujours dans le rythme', badge: null },

  // tier rare (~28%) — petit bonus texte, pas de badge permanent
  {
    tier: 'rare',
    weight: 28,
    icon: '⚡',
    title: 'Bon tempo',
    detail: "Tu maintiens la cadence. Continue, l'intensité paie sur la durée.",
    badge: null,
  },
  {
    tier: 'rare',
    weight: 28,
    icon: '🎯',
    title: 'Régularité en hausse',
    detail: 'Tes séances récentes sont plus régulières que le mois dernier.',
    badge: null,
  },

  // tier épique (~10%) — débloque un badge permanent affiché dans le profil
  {
    tier: 'epique',
    weight: 10,
    icon: '🏅',
    title: 'Badge débloqué : Increvable',
    detail: 'Certaines séances comptent double. Celle-ci en fait partie.',
    badge: 'increvable',
  },

  // tier légendaire (~2%) — le jackpot, rare exprès
  {
    tier: 'legendaire',
    weight: 2,
    icon: '👑',
    title: 'Badge débloqué : Bête de Séance',
    detail: "1 séance sur 50 en moyenne. Tu viens de tomber sur celle-là.",
    badge: 'bete_de_seance',
  },
];

const TOTAL_WEIGHT = REWARDS.reduce((sum, r) => sum + r.weight, 0);

export function rollReward() {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const reward of REWARDS) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }
  return REWARDS[0];
}

export const BADGES = {
  increvable: { icon: '🏅', label: 'Increvable' },
  bete_de_seance: { icon: '👑', label: 'Bête de Séance' },
};
