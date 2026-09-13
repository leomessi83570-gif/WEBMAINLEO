const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Modèle utilisé pour le texte (génération de programme) et la vision (analyse photo).
// Ajuste selon les modèles disponibles sur ton compte.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// Extrait le premier bloc JSON valide d'une réponse texte de Claude
// (au cas où le modèle ajoute du texte autour, même si on le lui interdit dans le prompt).
function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Réponse IA sans JSON exploitable : ' + text.slice(0, 200));
  return JSON.parse(match[0]);
}

async function analyzePhotos({ profile, photos }) {
  const imageBlocks = photos.map((p) => ({
    type: 'image',
    source: { type: 'base64', media_type: 'image/jpeg', data: p.base64 },
  }));

  const prompt = `Tu es coach sportif et kinésithérapeute. On te fournit des photos d'une personne
(vue de face et de profil) ainsi que son profil. Analyse UNIQUEMENT ce qui est visuellement
observable. Ne donne jamais de pourcentage précis de masse grasse (donne une fourchette large
si pertinent). Reste bienveillant, factuel, sans jugement.

Profil : ${JSON.stringify(profile)}

Réponds STRICTEMENT en JSON, sans texte autour, avec ce format exact :
{
  "morphotype": "description du morphotype probable (ecto/méso/endomorphe ou mixte) en 2-3 phrases",
  "posture": "observations posturales (dos, épaules, bassin...) en 2-4 phrases, bienveillant",
  "imbalances": "déséquilibres musculaires visibles entre groupes, ou 'Rien de notable détecté'",
  "notes": "1-2 conseils généraux prioritaires à garder en tête pour le programme"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: prompt }, ...imageBlocks],
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '';
  return extractJson(text);
}

async function generateProgramAndNutrition({ profile, analysis }) {
  const prompt = `Tu es coach sportif spécialisé en musculation à domicile et en nutrition.
Construis un programme de musculation ET un plan nutritionnel pour la personne suivante.

Profil : ${JSON.stringify(profile)}
Analyse morphologique/posturale (peut être null si non fournie) : ${JSON.stringify(analysis)}

Contraintes :
- Le programme doit être réalisable avec UNIQUEMENT le matériel listé dans "equipment".
- Nombre de séances = "sessions_per_week" du profil.
- Si des limitations/blessures sont mentionnées, adapte ou évite les exercices à risque.
- Si l'analyse indique des déséquilibres ou une posture problématique, ajoute du travail correctif.
- Les calories/macros doivent être cohérentes avec l'objectif, le poids et le niveau d'activité.

Réponds STRICTEMENT en JSON, sans texte autour, avec ce format exact :
{
  "program": {
    "goal_label": "libellé court de l'objectif",
    "sessions": [
      {
        "name": "nom de la séance (ex: Haut du corps - Poussée)",
        "exercises": [
          { "name": "nom de l'exercice", "sets": 4, "reps": "8-12", "rest": "90s", "notes": "conseil d'exécution optionnel" }
        ]
      }
    ]
  },
  "nutrition": {
    "calories": 2400,
    "protein_g": 160,
    "carbs_g": 250,
    "fat_g": 70,
    "advice": "conseils nutritionnels généraux en 2-4 phrases",
    "meal_ideas": [
      {
        "moment": "Petit-déjeuner",
        "description": "idée de repas adaptée",
        "recipe": {
          "ingredients": ["liste concrète d'ingrédients avec quantités approximatives"],
          "steps": ["étapes de préparation, courtes et dans l'ordre"]
        }
      }
    ]
  }
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '';
  return extractJson(text);
}

async function adjustProgram({ profile, currentProgram, feedback }) {
  const prompt = `Tu es coach sportif. Voici le programme actuel d'une personne, son profil, et un
retour qu'elle vient de donner (douleur, manque de temps, trop facile/difficile, etc.).
Ajuste le programme en conséquence, de façon minimale et ciblée (ne recommence pas tout de zéro
sauf si le retour l'exige clairement).

Profil : ${JSON.stringify(profile)}
Programme actuel : ${JSON.stringify(currentProgram)}
Retour utilisateur : ${feedback}

Réponds STRICTEMENT en JSON avec le même format que "program" ci-dessus (clé "program" uniquement) :
{ "program": { "goal_label": "...", "sessions": [ ... ] } }`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '';
  return extractJson(text);
}

module.exports = { analyzePhotos, generateProgramAndNutrition, adjustProgram };
