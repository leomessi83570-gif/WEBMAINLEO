import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useUser } from '../context/UserContext';

export default function WorkoutScreen({ route, navigation }) {
  const { session } = route.params;
  const { addLog } = useUser();
  const [doneSets, setDoneSets] = useState({}); // { exerciseIndex: setsCompleted }
  const [notes, setNotes] = useState('');

  const toggleSet = (exIndex, setIndex) => {
    setDoneSets((prev) => {
      const current = prev[exIndex] || [];
      const exists = current.includes(setIndex);
      const next = exists ? current.filter((s) => s !== setIndex) : [...current, setIndex];
      return { ...prev, [exIndex]: next };
    });
  };

  const finishSession = async () => {
    await addLog({ type: 'session', session_name: session.name, notes });
    Alert.alert('Bravo 💪', 'Séance enregistrée.', [
      { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.title}>{session.name}</Text>

      {session.exercises?.map((ex, exIndex) => (
        <View key={exIndex} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{ex.name}</Text>
          <Text style={styles.exerciseMeta}>
            {ex.sets} séries × {ex.reps} {ex.rest ? `· repos ${ex.rest}` : ''}
          </Text>
          {ex.notes ? <Text style={styles.exerciseNotes}>{ex.notes}</Text> : null}

          <View style={styles.setsRow}>
            {Array.from({ length: ex.sets }).map((_, setIndex) => {
              const done = (doneSets[exIndex] || []).includes(setIndex);
              return (
                <TouchableOpacity
                  key={setIndex}
                  style={[styles.setDot, done && styles.setDotDone]}
                  onPress={() => toggleSet(exIndex, setIndex)}
                >
                  <Text style={[styles.setDotText, done && styles.setDotTextDone]}>{setIndex + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={styles.label}>Notes sur la séance (optionnel)</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Ex : douleur épaule sur le développé, charge trop légère..."
        placeholderTextColor="#666"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={finishSession}>
        <Text style={styles.buttonText}>Terminer la séance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  exerciseCard: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 12 },
  exerciseName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  exerciseMeta: { color: '#999', fontSize: 13, marginTop: 4 },
  exerciseNotes: { color: '#FFB199', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  setsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  setDot: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#444',
    alignItems: 'center', justifyContent: 'center',
  },
  setDotDone: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  setDotText: { color: '#888', fontSize: 13 },
  setDotTextDone: { color: '#fff', fontWeight: '700' },
  label: { color: '#ccc', fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#1C1C1E', color: '#fff', borderRadius: 10, padding: 14,
    height: 80, textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF3B30', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
