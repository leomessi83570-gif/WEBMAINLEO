import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useUser } from '../context/UserContext';

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

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { update } = useUser();
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

  const canContinue = age && height && weight && goal && level && equipment.length > 0;

  const handleContinue = async () => {
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ton profil</Text>
        <Text style={styles.subtitle}>
          Ces infos servent à construire un programme et un plan alimentaire adaptés à toi.
        </Text>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Âge</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              placeholder="25"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Taille (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              placeholder="178"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="75"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <Text style={styles.label}>Objectif principal</Text>
        <View style={styles.chipRow}>
          {GOALS.map((g) => (
            <Chip key={g.key} label={g.label} selected={goal === g.key} onPress={() => setGoal(g.key)} />
          ))}
        </View>

        <Text style={styles.label}>Niveau</Text>
        <View style={styles.chipRow}>
          {LEVELS.map((l) => (
            <Chip key={l.key} label={l.label} selected={level === l.key} onPress={() => setLevel(l.key)} />
          ))}
        </View>

        <Text style={styles.label}>Matériel disponible (plusieurs choix possibles)</Text>
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

        <Text style={styles.label}>Séances par semaine visées</Text>
        <View style={styles.chipRow}>
          {['2', '3', '4', '5', '6'].map((n) => (
            <Chip
              key={n}
              label={n}
              selected={sessionsPerWeek === n}
              onPress={() => setSessionsPerWeek(n)}
            />
          ))}
        </View>

        <Text style={styles.label}>Douleurs / blessures / limitations (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={limitations}
          onChangeText={setLimitations}
          placeholder="Ex : gêne à l'épaule droite, lombalgie occasionnelle..."
          placeholderTextColor="#666"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          disabled={!canContinue}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continuer vers l'analyse photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F0F0F' },
  flex1: { flex: 1, marginHorizontal: 4 },
  container: { padding: 20, paddingBottom: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#999', fontSize: 14, marginBottom: 24 },
  label: { color: '#ccc', fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  row: { flexDirection: 'row', marginHorizontal: -4 },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  chipText: { color: '#ccc', fontSize: 13 },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  button: {
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: { backgroundColor: '#3A2320' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
