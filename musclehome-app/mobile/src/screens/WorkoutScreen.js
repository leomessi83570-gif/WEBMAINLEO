import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import { useUser } from '../context/UserContext';
import { getMascotLine } from '../utils/mascotLines';
import { rollReward } from '../utils/rewards';
import Tap from '../components/Tap';

const CELEBRATE_IMAGE = require('../../assets/mascot-celebrate.png');

export default function WorkoutScreen({ route, navigation }) {
  const { session } = route.params;
  const { addLog, addBadge } = useUser();
  const [doneSets, setDoneSets] = useState({}); // { exerciseIndex: setsCompleted }
  const [notes, setNotes] = useState('');
  const [celebration, setCelebration] = useState(null); // texte de la mascotte, ou null si masqué
  const [reward, setReward] = useState(null);

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
    const r = rollReward();
    if (r.badge) await addBadge(r.badge);
    setReward(r);
    setCelebration(getMascotLine('session_done'));
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
        placeholderTextColor="#7C6A57"
        multiline
      />

      <Tap style={styles.button} onPress={finishSession}>
        <Text style={styles.buttonText}>Terminer la séance</Text>
      </Tap>

      <Modal visible={!!celebration} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Image source={CELEBRATE_IMAGE} style={styles.modalMascot} resizeMode="contain" />
            <Text style={styles.modalTitle}>Séance dans la poche 💪</Text>
            <Text style={styles.modalLine}>{celebration}</Text>

            {reward && (
              <View style={[styles.rewardBox, reward.tier !== 'commun' && styles.rewardBoxHighlight]}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  {reward.detail && <Text style={styles.rewardDetail}>{reward.detail}</Text>}
                </View>
              </View>
            )}

            <Tap
              style={styles.modalButton}
              onPress={() => {
                setCelebration(null);
                setReward(null);
                navigation.navigate('Dashboard');
              }}
            >
              <Text style={styles.buttonText}>Retour à l'accueil</Text>
            </Tap>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  title: { color: '#F3E7D6', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  exerciseCard: { backgroundColor: '#201409', borderRadius: 14, padding: 16, marginBottom: 12 },
  exerciseName: { color: '#F3E7D6', fontSize: 17, fontWeight: '700' },
  exerciseMeta: { color: '#A6927E', fontSize: 13, marginTop: 4 },
  exerciseNotes: { color: '#F0954B', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  setsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  setDot: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#3A2A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  setDotDone: { backgroundColor: '#CE6A2E', borderColor: '#CE6A2E' },
  setDotText: { color: '#B39D85', fontSize: 13 },
  setDotTextDone: { color: '#F3E7D6', fontWeight: '700' },
  label: { color: '#D8C9B8', fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#201409', color: '#F3E7D6', borderRadius: 10, padding: 14,
    height: 80, textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#CE6A2E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontWeight: '700' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(19,13,9,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalMascot: { width: 160, height: 200, marginBottom: 8 },
  modalTitle: { color: '#F3E7D6', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalLine: { color: '#D8C9B8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  rewardBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%',
    backgroundColor: '#2E2019', borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#3A2A1A',
  },
  rewardBoxHighlight: { borderColor: '#F0954B', backgroundColor: 'rgba(206,106,46,0.14)' },
  rewardIcon: { fontSize: 28 },
  rewardTitle: { color: '#F3E7D6', fontSize: 14, fontWeight: '800' },
  rewardDetail: { color: '#B39D85', fontSize: 12, marginTop: 2, lineHeight: 16 },
  modalButton: {
    backgroundColor: '#CE6A2E', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center', width: '100%',
  },
});
