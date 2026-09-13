import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '../context/UserContext';

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
      <Text style={styles.title}>MuscleHome Premium</Text>
      <Text style={styles.subtitle}>Débloque tout le potentiel de ton coach personnel.</Text>

      {FEATURES.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.featureText}>{f}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleFakeSubscribe}>
        <Text style={styles.buttonText}>S'abonner — 9,99 €/mois</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.later}>Plus tard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#999', fontSize: 14, marginTop: 6, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  checkmark: { color: '#FF3B30', fontSize: 16, fontWeight: '700', marginRight: 10 },
  featureText: { color: '#ddd', fontSize: 15, flex: 1 },
  button: {
    backgroundColor: '#FF3B30', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  later: { color: '#888', textAlign: 'center', marginTop: 16 },
});
