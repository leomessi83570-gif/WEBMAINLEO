import { createAudioPlayer } from 'expo-audio';

const FILES = {
  setDone: require('../../assets/sounds/set-done.wav'),
  success: require('../../assets/sounds/success.wav'),
  badge: require('../../assets/sounds/badge.wav'),
};

// Un player par son, réutilisé à chaque lecture (évite de recharger le fichier
// à chaque fois). `enabled` est vérifié par l'appelant (voir useUser().soundEnabled).
const players = {};

function getPlayer(key) {
  if (!players[key]) {
    players[key] = createAudioPlayer(FILES[key]);
  }
  return players[key];
}

export function playSound(key) {
  try {
    const player = getPlayer(key);
    player.seekTo(0);
    player.play();
  } catch (e) {
    // Le son n'est qu'un agrément : on n'interrompt jamais un flux pour ça.
    console.warn('Lecture son impossible', e);
  }
}
