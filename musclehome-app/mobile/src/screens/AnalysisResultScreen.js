import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { generateProgram } from '../services/api';
import Mascot from '../components/Mascot';
import Tap from '../components/Tap';
import SoftPaywallModal from '../components/SoftPaywallModal';

export default function AnalysisResultScreen({ navigation, route }) {
  const skipped = route.params?.skipped;
  const { profile, analysis, update } = useUser();
  const [generating, setGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const finishOnboarding = async () => {
    setShowPaywall(false);
    await update({ onboarded: true });
  };

  const finishOnboardingAndUpgrade = async () => {
    setShowPaywall(false);
    // Le stack passe en mode "onboarded" au prochain rendu : on demande au dashboard
    // d'ouvrir directement la page Premium dès qu'il apparaît.
    await update({ onboarded: true, pendingPaywallOpen: true });
  };

  const handleGenerateProgram = async () => {
    setGenerating(true);
    try {
      const result = await generateProgram({ profile, analysis: skipped ? null : analysis });
      await update({ program: result.program, nutrition: result.nutrition });
      setGenerating(false);
      setShowPaywall(true);
    } catch (e) {
      console.warn(e);
      setGenerating(false);
      Alert.alert('Erreur', "Impossible de générer le programme pour l'instant.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 50, paddingBottom: 40 }}>
      <Animated.View entering={FadeInDown.duration(400).springify()} style={{ marginBottom: 12 }}>
        <Mascot
          line={
            skipped
              ? "Pas de souci, je te construis un programme solide à partir de ton questionnaire."
              : "Voilà ce que j'ai observé sur tes photos."
          }
          tag="Buffalo a analysé"
          variant="hero"
          size={220}
        />
      </Animated.View>

      <Text style={styles.title}>{skipped ? 'Analyse passée' : 'Ton analyse'}</Text>

      {skipped ? (
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.card}>
          <Text style={styles.paragraph}>
            Pas de souci, on te génère un programme basé sur ton questionnaire. Tu pourras faire
            l'analyse photo plus tard depuis ton profil (fonctionnalité premium).
          </Text>
        </Animated.View>
      ) : (
        <>
          <Section title="Morphotype" content={analysis?.morphotype} delay={80} />
          <Section title="Posture" content={analysis?.posture} delay={140} />
          <Section title="Déséquilibres observés" content={analysis?.imbalances} delay={200} />
          <Section title="Notes" content={analysis?.notes} delay={260} />
        </>
      )}

      {generating ? (
        <ActivityIndicator size="large" color="#E8623F" style={{ marginTop: 30 }} />
      ) : (
        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <Tap style={styles.button} onPress={handleGenerateProgram}>
            <Text style={styles.buttonText}>Générer mon programme</Text>
          </Tap>
        </Animated.View>
      )}

      <SoftPaywallModal
        visible={showPaywall}
        onClose={finishOnboarding}
        onUpgrade={finishOnboardingAndUpgrade}
      />
    </ScrollView>
  );
}

function Section({ title, content, delay }) {
  if (!content) return null;
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.paragraph}>{content}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  title: { color: '#F3E7D6', fontSize: 24, fontFamily: 'ArchivoBlack_400Regular', marginBottom: 16 },
  card: {
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { color: '#E8623F', fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  paragraph: { color: '#D8C9B8', fontSize: 14.5, lineHeight: 21 },
  button: {
    backgroundColor: '#E8623F',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontWeight: '700' },
});
