import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Tap from './Tap';

const MASCOT = require('../../assets/mascot-celebrate.png');
const ICON = require('../../assets/icon.png');

/**
 * Capital social (principe "Contagious", Jonah Berger) : transformer une série en
 * quelque chose qu'on a envie de montrer. Rend une carte hors-écran, la capture en
 * image, puis ouvre le partage natif — jamais de faux totaux, toujours les vrais
 * chiffres de l'utilisateur.
 */
export default function ShareStreakCard({ streakWeeks, weeklyGoal }) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Ma série Buffalo' });
      }
    } catch (e) {
      console.warn('Partage impossible', e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Tap style={styles.shareButton} onPress={handleShare} disabled={sharing || streakWeeks === 0}>
        <Text style={styles.shareButtonText}>
          {sharing ? 'Préparation...' : '📤 Partager ma série'}
        </Text>
      </Tap>

      {/* Rendue hors-écran (pas display:none, view-shot a besoin d'un layout réel) */}
      <View style={styles.offscreen} pointerEvents="none">
        <View ref={cardRef} collapsable={false} style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={ICON} style={styles.cardIcon} />
            <Text style={styles.cardBrand}>BUFFALO</Text>
          </View>

          <Image source={MASCOT} style={styles.cardMascot} resizeMode="contain" />

          <Text style={styles.cardFlame}>🔥</Text>
          <Text style={styles.cardStreakNum}>{streakWeeks}</Text>
          <Text style={styles.cardStreakLabel}>
            semaine{streakWeeks > 1 ? 's' : ''} d'affilée à {weeklyGoal} séances
          </Text>
        </View>
      </View>
    </>
  );
}

const CARD_SIZE = 400;

const styles = StyleSheet.create({
  shareButton: {
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#CE6A2E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  shareButtonText: { color: '#F0954B', fontSize: 14, fontWeight: '700' },

  offscreen: { position: 'absolute', top: -9999, left: -9999 },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#130D09',
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  cardIcon: { width: 28, height: 28, borderRadius: 8 },
  cardBrand: { color: '#B39D85', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  cardMascot: { width: 190, height: 190, marginTop: 4 },
  cardFlame: { fontSize: 34, marginTop: 4 },
  cardStreakNum: { color: '#F3E7D6', fontSize: 64, fontWeight: '800', marginTop: -6 },
  cardStreakLabel: { color: '#D8C9B8', fontSize: 15, fontWeight: '600', marginTop: 4, textAlign: 'center' },
});
