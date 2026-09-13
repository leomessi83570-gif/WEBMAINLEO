import axios from 'axios';

// ⚠️ En dev : mets l'IP locale de ton ordinateur (pas "localhost", car le
// téléphone est un appareil à part). Ex: "http://192.168.1.23:3000"
// En prod : l'URL de ton backend déployé (Railway, Render, etc.)
export const API_BASE_URL = 'http://localhost:3000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Envoie le questionnaire + une ou deux photos (base64) pour analyse morpho/posture
export async function analyzeBody({ profile, photos }) {
  const res = await client.post('/api/analyze-photo', { profile, photos });
  return res.data; // { morphotype, posture, imbalances, notes }
}

// Génère le programme muscu + nutrition à partir du profil et de l'analyse
export async function generateProgram({ profile, analysis }) {
  const res = await client.post('/api/generate-program', { profile, analysis });
  return res.data; // { program, nutrition }
}

// Ajuste le programme en cours (feedback utilisateur : douleur, temps manquant, etc.)
export async function adjustProgram({ profile, currentProgram, feedback }) {
  const res = await client.post('/api/adjust-program', { profile, currentProgram, feedback });
  return res.data;
}
