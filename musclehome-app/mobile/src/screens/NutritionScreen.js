import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '../context/UserContext';

export default function NutritionScreen() {
  const { nutrition } = useUser();

  if (!nutrition) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.paragraph}>Pas encore de plan nutrition généré.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.title}>Ton plan nutrition</Text>

      <View style={styles.macroRow}>
        <Macro label="Calories" value={`${nutrition.calories} kcal`} />
        <Macro label="Protéines" value={`${nutrition.protein_g} g`} />
        <Macro label="Glucides" value={`${nutrition.carbs_g} g`} />
        <Macro label="Lipides" value={`${nutrition.fat_g} g`} />
      </View>

      <Text style={styles.sectionTitle}>Conseils</Text>
      <Text style={styles.paragraph}>{nutrition.advice}</Text>

      {nutrition.meal_ideas?.map((meal, i) => (
        <View key={i} style={styles.mealCard}>
          <Text style={styles.mealTitle}>{meal.moment}</Text>
          <Text style={styles.paragraph}>{meal.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Macro({ label, value }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { color: '#F3E7D6', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  macro: { backgroundColor: '#201409', borderRadius: 12, padding: 14, minWidth: '45%' },
  macroValue: { color: '#F3E7D6', fontSize: 18, fontWeight: '700' },
  macroLabel: { color: '#B39D85', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#CE6A2E', fontSize: 14, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  paragraph: { color: '#D8C9B8', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  mealCard: { backgroundColor: '#201409', borderRadius: 12, padding: 14, marginBottom: 10 },
  mealTitle: { color: '#F3E7D6', fontSize: 15, fontWeight: '700', marginBottom: 4 },
});
