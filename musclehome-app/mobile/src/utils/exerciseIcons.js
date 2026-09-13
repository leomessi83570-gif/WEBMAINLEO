// Devine un émoji représentatif à partir du nom de l'exercice (pas de bibliothèque
// vidéo/GIF disponible, mais ça donne un repère visuel immédiat par groupe musculaire).
export function guessExerciseIcon(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('squat') || n.includes('fente') || n.includes('jambe') || n.includes('mollet')) return '🦵';
  if (n.includes('développé') || n.includes('pompe') || n.includes('pec') || n.includes('dips')) return '💪';
  if (n.includes('tirage') || n.includes('rowing') || n.includes('dos') || n.includes('traction')) return '🦾';
  if (n.includes('épaule') || n.includes('militaire') || n.includes('élévation')) return '🏋️';
  if (n.includes('abdo') || n.includes('gainage') || n.includes('crunch') || n.includes('planche')) return '🔥';
  if (n.includes('curl') || n.includes('biceps') || n.includes('triceps')) return '💪';
  return '⚡';
}
