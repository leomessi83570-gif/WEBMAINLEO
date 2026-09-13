import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import Tap from '../components/Tap';

const FEATURES = [
  'Analyse photo morphologique & posturale avancée',
  'Programme adaptatif (ajusté selon tes séances)',
  'Plan nutrition détaillé avec idées de repas',
  'Coach IA en chat, disponible à tout moment',
  'Suivi de progression avec comparaison photo',
  "Zéro publicité",
];

export default function PaywallScreen({ navigation }) {
  const { update } = useUser();

  // ⚠️ V1 : simulateur d'achat. À remplacer par une vraie intégration
  // RevenueCat / react-native-iap connectée à App Store Connect & Google Play Console
  // une fois les comptes développeur créés.
  const handleFakeSubscribe = async () => {
    await update({ isPremium: true });
    Alert.alert('Bienvenue dans Premium 🎉', '(Simulation — à brancher sur un vrai système de paiement)');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <Text style={styles.title}>Buffalo Premium</Text>
        <Text style={styles.subtitle}>Débloque tout le potentiel de ton coach personnel.</Text>
      </Animated.View>

      {FEATURES.map((f, i) => (
        <Animated.View key={i} entering={FadeInDown.duration(350).delay(60 * i)} style={styles.featureRow}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.featureText}>{f}</Text>
        </Animated.View>
      ))}

      <Tap style={styles.button} onPress={handleFakeSubscribe}>
        <Text style={styles.buttonText}>S'abonner — 9,99 €/mois</Text>
      </Tap>
      <Tap haptic={false} onPress={() => navigation.goBack()}>
        <Text style={styles.later}>Plus tard</Text>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09', padding: 20, paddingTop: 60 },
  title: { color: '#F3E7D6', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#A6927E', fontSize: 14, marginTop: 6, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  checkmark: { color: '#CE6A2E', fontSize: 16, fontWeight: '700', marginRight: 10 },
  featureText: { color: '#D8C9B8', fontSize: 15, flex: 1 },
  button: {
    backgroundColor: '#CE6A2E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontWeight: '700' },
  later: { color: '#B39D85', textAlign: 'center', marginTop: 16 },
});
