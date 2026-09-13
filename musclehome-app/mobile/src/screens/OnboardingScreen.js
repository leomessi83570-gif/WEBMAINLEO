import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import Mascot from '../components/Mascot';
import Tap from '../components/Tap';
import { getOnboardingLine } from '../utils/mascotLines';

const GOALS = [
  { key: 'perte_de_gras', label: 'Perte de gras' },
  { key: 'prise_de_masse', label: 'Prise de masse' },
  { key: 'recomposition', label: 'Recomposition (les deux)' },
  { key: 'performance', label: 'Performance / force' },
];

const LEVELS = [
  { key: 'debutant', label: 'Débutant' },
  { key: 'intermediaire', label: 'Intermédiaire' },
  { key: 'avance', label: 'Avancé' },
];

const EQUIPMENT = [
  { key: 'aucun', label: 'Rien (poids du corps)' },
  { key: 'halteres', label: 'Haltères' },
  { key: 'elastiques', label: 'Élastiques' },
  { key: 'barre_traction', label: 'Barre de traction' },
  { key: 'banc', label: 'Banc' },
  { key: 'complet', label: 'Salle complète' },
];

const SESSIONS_OPTIONS = ['2', '3', '4', '5', '6'];

function Chip({ label, selected, onPress }) {
  return (
    <Tap onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Tap>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { update } = useUser();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [sessionsPerWeek, setSessionsPerWeek] = useState('3');
  const [limitations, setLimitations] = useState('');

  const toggleEquipment = (key) => {
    setEquipment((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  // Une étape par question : c'est ce qui permet à la mascotte de commenter chacune
  // individuellement, plutôt qu'un long formulaire d'un bloc.
  const steps = useMemo(
    () => [
      { key: 'age', valid: !!age },
      { key: 'height_cm', valid: !!height },
      { key: 'weight_kg', valid: !!weight },
      { key: 'goal', valid: !!goal },
      { key: 'level', valid: !!level },
      { key: 'equipment', valid: equipment.length > 0 },
      { key: 'sessions_per_week', valid: !!sessionsPerWeek },
      { key: 'limitations', valid: true }, // optionnel
    ],
    [age, height, weight, goal, level, equipment, sessionsPerWeek]
  );

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const mascotLine = getOnboardingLine(current.key);

  const goNext = async () => {
    if (!current.valid) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    const profile = {
      age: Number(age),
      height_cm: Number(height),
      weight_kg: Number(weight),
      goal,
      level,
      equipment,
      sessions_per_week: Number(sessionsPerWeek),
      limitations: limitations.trim(),
    };
    await update({ profile });
    navigation.navigate('PhotoCapture');
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progressRow}>
          {steps.map((s, i) => (
            <View key={s.key} style={[styles.progressDot, i <= step && styles.progressDotDone]} />
          ))}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Mascot line={mascotLine} tag="Buffalo demande" variant="hero" size={260} />
        </View>

        <Animated.View key={current.key} entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(150)}>
          {current.key === 'age' && (
            <View style={styles.numberWrap}>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor="#4A3A28"
                autoFocus
              />
              <Text style={styles.numberUnit}>ans</Text>
            </View>
          )}

          {current.key === 'height_cm' && (
            <View style={styles.numberWrap}>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="178"
                placeholderTextColor="#4A3A28"
                autoFocus
              />
              <Text style={styles.numberUnit}>cm</Text>
            </View>
          )}

          {current.key === 'weight_kg' && (
            <View style={styles.numberWrap}>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="75"
                placeholderTextColor="#4A3A28"
                autoFocus
              />
              <Text style={styles.numberUnit}>kg</Text>
            </View>
          )}

          {current.key === 'goal' && (
            <View style={styles.chipCol}>
              {GOALS.map((g) => (
                <Chip key={g.key} label={g.label} selected={goal === g.key} onPress={() => setGoal(g.key)} />
              ))}
            </View>
          )}

          {current.key === 'level' && (
            <View style={styles.chipCol}>
              {LEVELS.map((l) => (
                <Chip key={l.key} label={l.label} selected={level === l.key} onPress={() => setLevel(l.key)} />
              ))}
            </View>
          )}

          {current.key === 'equipment' && (
            <View style={styles.chipRow}>
              {EQUIPMENT.map((e) => (
                <Chip
                  key={e.key}
                  label={e.label}
                  selected={equipment.includes(e.key)}
                  onPress={() => toggleEquipment(e.key)}
                />
              ))}
            </View>
          )}

          {current.key === 'sessions_per_week' && (
            <View style={styles.chipRow}>
              {SESSIONS_OPTIONS.map((n) => (
                <Chip key={n} label={n} selected={sessionsPerWeek === n} onPress={() => setSessionsPerWeek(n)} />
              ))}
            </View>
          )}

          {current.key === 'limitations' && (
            <TextInput
              style={[styles.bigInput, styles.textArea]}
              value={limitations}
              onChangeText={setLimitations}
              placeholder="Ex : gêne à l'épaule droite, lombalgie occasionnelle..."
              placeholderTextColor="#7C6A57"
              multiline
              autoFocus
            />
          )}
        </Animated.View>

        <View style={styles.footer}>
          {step > 0 && (
            <Tap haptic={false} style={styles.backButton} onPress={goBack}>
              <Text style={styles.backButtonText}>←</Text>
            </Tap>
          )}
          <Tap
            style={[styles.button, !current.valid && styles.buttonDisabled]}
            disabled={!current.valid}
            onPress={goNext}
          >
            <Text style={styles.buttonText}>
              {isLast ? "Continuer vers l'analyse photo" : current.key === 'limitations' ? 'Passer' : 'Suivant'}
            </Text>
          </Tap>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#130D09' },
  container: { padding: 20, paddingTop: 50, paddingBottom: 40, flexGrow: 1 },

  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#2E2019' },
  progressDotDone: { backgroundColor: '#E8623F' },

  bigInput: {
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    color: '#F3E7D6',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 22,
    fontWeight: '700',
  },
  textArea: { height: 120, textAlignVertical: 'top', fontSize: 15, fontWeight: '400' },

  numberWrap: { alignItems: 'center', paddingVertical: 20 },
  numberInput: {
    fontSize: 64,
    fontFamily: 'ArchivoBlack_400Regular',
    color: '#F3E7D6',
    textAlign: 'center',
    minWidth: 160,
  },
  numberUnit: { color: '#B39D85', fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: -6 },

  chipCol: { gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#3A2A1A',
    backgroundColor: '#201409',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chipSelected: { backgroundColor: '#E8623F', borderColor: '#E8623F' },
  chipText: { color: '#D8C9B8', fontSize: 14 },
  chipTextSelected: { color: '#F3E7D6', fontWeight: '700' },

  footer: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backButton: {
    width: 56, height: 56, borderRadius: 14, borderWidth: 1, borderColor: '#3A2A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  backButtonText: { color: '#D8C9B8', fontSize: 20 },
  button: {
    flex: 1,
    backgroundColor: '#E8623F',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#3A2320' },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontWeight: '700' },
});
