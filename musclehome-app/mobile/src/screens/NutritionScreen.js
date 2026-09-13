import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '../context/UserContext';
import Tap from '../components/Tap';

export default function NutritionScreen({ navigation }) {
  const { nutrition, isPremium } = useUser();

  if (!nutrition) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.paragraph}>Pas encore de plan nutrition généré.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
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
        <MealCard key={i} meal={meal} isPremium={isPremium} navigation={navigation} />
      ))}
    </ScrollView>
  );
}

function MealCard({ meal, isPremium, navigation }) {
  const [open, setOpen] = useState(false);
  const hasRecipe = !!meal.recipe;

  return (
    <View style={styles.mealCard}>
      <Text style={styles.mealTitle}>{meal.moment}</Text>
      <Text style={styles.paragraph}>{meal.description}</Text>

      {hasRecipe && (
        isPremium ? (
          <>
            <Tap haptic={false} style={styles.recipeToggle} onPress={() => setOpen((o) => !o)}>
              <Text style={styles.recipeToggleText}>{open ? 'Masquer la recette' : '📖 Voir la recette'}</Text>
            </Tap>
            {open && (
              <View style={styles.recipeBox}>
                <Text style={styles.recipeLabel}>Ingrédients</Text>
                {meal.recipe.ingredients?.map((ing, j) => (
                  <Text key={j} style={styles.recipeItem}>• {ing}</Text>
                ))}
                <Text style={[styles.recipeLabel, { marginTop: 10 }]}>Préparation</Text>
                {meal.recipe.steps?.map((step, j) => (
                  <Text key={j} style={styles.recipeItem}>{j + 1}. {step}</Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <Tap style={styles.lockedRow} onPress={() => navigation.navigate('Paywall')}>
            <Text style={styles.lockedText}>🔒 Recette complète — Premium</Text>
          </Tap>
        )
      )}
    </View>
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
  title: { color: '#F3E7D6', fontSize: 26, fontFamily: 'ArchivoBlack_400Regular', marginBottom: 20 },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  macro: { backgroundColor: '#201409', borderRadius: 12, padding: 14, minWidth: '45%' },
  macroValue: { color: '#F3E7D6', fontSize: 18, fontWeight: '700' },
  macroLabel: { color: '#B39D85', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#E8623F', fontSize: 14, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  paragraph: { color: '#D8C9B8', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  mealCard: { backgroundColor: '#201409', borderRadius: 12, padding: 14, marginBottom: 10 },
  mealTitle: { color: '#F3E7D6', fontSize: 15, fontWeight: '700', marginBottom: 4 },

  recipeToggle: { marginTop: -8 },
  recipeToggleText: { color: '#F5885E', fontSize: 13, fontWeight: '700' },
  recipeBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#3A2A1A' },
  recipeLabel: { color: '#F5885E', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  recipeItem: { color: '#D8C9B8', fontSize: 13, lineHeight: 19 },

  lockedRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: -8,
    backgroundColor: '#2E2019', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start',
  },
  lockedText: { color: '#B39D85', fontSize: 12.5, fontWeight: '700' },
});
