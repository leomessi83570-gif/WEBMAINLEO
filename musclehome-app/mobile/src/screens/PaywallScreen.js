import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import Tap from '../components/Tap';

const MASCOT = require('../../assets/mascot-celebrate.png');

const ROWS = [
  { label: 'Programme de musculation', free: true, premium: true },
  { label: 'Plan nutrition (macros + idées repas)', free: true, premium: true },
  { label: 'Analyse photo morphologique', free: '1 fois', premium: 'Illimitée' },
  { label: 'Programme adaptatif selon tes retours', free: false, premium: true },
  { label: 'Recettes complètes (ingrédients + étapes)', free: false, premium: true },
  { label: 'Coach IA en chat', free: false, premium: true },
  { label: 'Publicités', free: 'Oui', premium: 'Aucune' },
];

function Cell({ value }) {
  if (value === true) return <Text style={styles.cellCheck}>✓</Text>;
  if (value === false) return <Text style={styles.cellDash}>—</Text>;
  return <Text style={styles.cellText}>{value}</Text>;
}

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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 50, paddingBottom: 40 }}>
      <Animated.View entering={ZoomIn.duration(400).springify().damping(14)} style={styles.hero}>
        <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
        <Text style={styles.title}>Buffalo Premium</Text>
        <Text style={styles.subtitle}>Débloque tout le potentiel de ton coach personnel.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderLabel} />
          <Text style={styles.tableHeaderCol}>Gratuit</Text>
          <Text style={[styles.tableHeaderCol, styles.tableHeaderColPremium]}>Premium</Text>
        </View>
        {ROWS.map((row, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
            <Text style={styles.tableLabel}>{row.label}</Text>
            <View style={styles.tableCol}><Cell value={row.free} /></View>
            <View style={styles.tableCol}><Cell value={row.premium} /></View>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <Tap style={styles.button} onPress={handleFakeSubscribe}>
          <Text style={styles.buttonText}>S'abonner — 9,99 €/mois</Text>
        </Tap>
        <Tap haptic={false} onPress={() => navigation.goBack()}>
          <Text style={styles.later}>Plus tard</Text>
        </Tap>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  hero: { alignItems: 'center', marginBottom: 24 },
  mascot: { width: 150, height: 180, marginBottom: 4 },
  title: { color: '#F3E7D6', fontSize: 26, fontFamily: 'ArchivoBlack_400Regular' },
  subtitle: { color: '#A6927E', fontSize: 14, marginTop: 6, textAlign: 'center' },

  table: {
    backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A',
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
  },
  tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#3A2A1A' },
  tableHeaderLabel: { flex: 1.6 },
  tableHeaderCol: { flex: 1, color: '#B39D85', fontSize: 11, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase' },
  tableHeaderColPremium: { color: '#F5885E' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tableLabel: { flex: 1.6, color: '#D8C9B8', fontSize: 12.5, paddingRight: 6 },
  tableCol: { flex: 1, alignItems: 'center' },
  cellCheck: { color: '#E8623F', fontSize: 15, fontWeight: '800' },
  cellDash: { color: '#5A4A38', fontSize: 15 },
  cellText: { color: '#B39D85', fontSize: 11, fontWeight: '700', textAlign: 'center' },

  button: {
    backgroundColor: '#E8623F', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontFamily: 'ArchivoBlack_400Regular' },
  later: { color: '#B39D85', textAlign: 'center', marginTop: 16 },
});
