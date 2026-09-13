// Parse une durée de repos écrite en langage naturel par l'IA ("90s", "1 min 30",
// "2min") en secondes. Retourne null si rien d'exploitable n'est trouvé.
export function parseRestSeconds(rest) {
  if (!rest) return null;
  const text = String(rest).toLowerCase();
  const minMatch = text.match(/(\d+)\s*min/);
  const secMatch = text.match(/(\d+)\s*s(ec)?/);
  let total = 0;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);
  if (!minMatch && !secMatch) {
    const bare = text.match(/(\d+)/);
    if (bare) total = parseInt(bare[1], 10);
  }
  return total > 0 ? total : null;
}

export function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}`}`;
}
