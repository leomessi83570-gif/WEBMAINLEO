import React from 'react';
import { View, Text, Image, StyleSheet, Modal } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Tap from './Tap';

const MASCOT = require('../../assets/mascot-celebrate.png');

/**
 * Popup premium contextuel (pas la page Paywall complète) : surgit à un moment où
 * l'utilisateur vient de montrer de l'engagement (ex: 3e séance), pour capitaliser
 * sur la motivation du moment plutôt que d'attendre qu'il aille chercher Premium
 * lui-même.
 */
export default function SoftPaywallModal({ visible, onClose, onUpgrade }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(350).springify().damping(14)} style={styles.card}>
          <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
          <Text style={styles.title}>Tu tiens le rythme 🔥</Text>
          <Text style={styles.subtitle}>
            3 séances déjà faites. C'est le bon moment pour débloquer tout ce que Buffalo peut faire pour toi.
          </Text>

          <View style={styles.perks}>
            <Perk icon="📸" text="Analyse photo avancée à chaque cycle" />
            <Perk icon="🔄" text="Programme qui s'adapte à tes retours" />
            <Perk icon="🍽️" text="Recettes complètes pour chaque repas" />
          </View>

          <Tap style={styles.button} onPress={onUpgrade}>
            <Text style={styles.buttonText}>Débloquer Premium</Text>
          </Tap>
          <Tap haptic={false} onPress={onClose}>
            <Text style={styles.later}>Plus tard</Text>
          </Tap>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Perk({ icon, text }) {
  return (
    <View style={styles.perkRow}>
      <Text style={styles.perkIcon}>{icon}</Text>
      <Text style={styles.perkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(19,13,9,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%', backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A',
    borderRadius: 24, padding: 24, alignItems: 'center',
  },
  mascot: { width: 140, height: 170 },
  title: { color: '#F3E7D6', fontSize: 20, fontFamily: 'ArchivoBlack_400Regular', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#B39D85', fontSize: 13.5, textAlign: 'center', lineHeight: 19, marginBottom: 18 },
  perks: { width: '100%', gap: 10, marginBottom: 20 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: { fontSize: 16 },
  perkText: { color: '#D8C9B8', fontSize: 13.5, flex: 1 },
  button: { backgroundColor: '#E8623F', borderRadius: 14, paddingVertical: 16, alignItems: 'center', width: '100%' },
  buttonText: { color: '#F3E7D6', fontSize: 15, fontFamily: 'ArchivoBlack_400Regular' },
  later: { color: '#7C6A57', fontSize: 12.5, marginTop: 14, textDecorationLine: 'underline' },
});
