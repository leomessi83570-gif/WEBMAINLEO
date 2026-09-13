import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import { generateProgram } from '../services/api';

export default function AnalysisResultScreen({ navigation, route }) {
  const skipped = route.params?.skipped;
  const { profile, analysis, update } = useUser();
  const [generating, setGenerating] = useState(false);

  const handleGenerateProgram = async () => {
    setGenerating(true);
    try {
      const result = await generateProgram({ profile, analysis: skipped ? null : analysis });
      await update({
        program: result.program,
        nutrition: result.nutrition,
        onboarded: true,
      });
    } catch (e) {
      console.warn(e);
      Alert.alert('Erreur', "Impossible de générer le programme pour l'instant.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.title}>
        {skipped ? 'Analyse passée' : 'Ton analyse'}
      </Text>

      {skipped ? (
        <Text style={styles.paragraph}>
          Pas de souci, on te génère un programme basé sur ton questionnaire. Tu pourras faire
          l'analyse photo plus tard depuis ton profil (fonctionnalité premium).
        </Text>
      ) : (
        <>
          <Section title="Morphotype" content={analysis?.morphotype} />
          <Section title="Posture" content={analysis?.posture} />
          <Section title="Déséquilibres observés" content={analysis?.imbalances} />
          <Section title="Notes" content={analysis?.notes} />
        </>
      )}

      {generating ? (
        <ActivityIndicator size="large" color="#E8623F" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleGenerateProgram}>
          <Text style={styles.buttonText}>Générer mon programme</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Section({ title, content }) {
  if (!content) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.paragraph}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  title: { color: '#F3E7D6', fontSize: 26, fontWeight: '700', marginBottom: 20 },
  section: { marginBottom: 18 },
  sectionTitle: { color: '#E8623F', fontSize: 14, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  paragraph: { color: '#D8C9B8', fontSize: 15, lineHeight: 22 },
  button: {
    backgroundColor: '#E8623F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontWeight: '700' },
});
