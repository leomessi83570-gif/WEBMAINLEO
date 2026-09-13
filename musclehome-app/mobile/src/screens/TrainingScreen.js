import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import Tap from '../components/Tap';
import { guessExerciseIcon } from '../utils/exerciseIcons';

export default function TrainingScreen({ navigation }) {
  const { program, logs } = useUser();
  const sessions = program?.sessions || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
      <Text style={styles.title}>Entraînement</Text>
      <Text style={styles.subtitle}>{program?.goal_label || 'Ton programme'}</Text>

      {sessions.length === 0 ? (
        <Text style={styles.paragraph}>Aucun programme généré pour l'instant.</Text>
      ) : (
        sessions.map((session, i) => {
          const doneCount = logs.filter((l) => l.type === 'session' && l.session_name === session.name).length;
          return (
            <Animated.View key={i} entering={FadeInDown.duration(350).delay(i * 60)}>
              <Tap
                style={styles.sessionCard}
                onPress={() => navigation.navigate('Workout', { session })}
              >
                <View style={styles.sessionIconBox}>
                  <Text style={styles.sessionIcon}>{guessExerciseIcon(session.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionName}>{session.name}</Text>
                  <Text style={styles.sessionMeta}>
                    {session.exercises?.length || 0} exercices
                    {doneCount > 0 ? ` · faite ${doneCount}×` : ''}
                  </Text>
                  <View style={styles.exerciseChips}>
                    {(session.exercises || []).slice(0, 4).map((ex, j) => (
                      <View key={j} style={styles.exerciseChip}>
                        <Text style={styles.exerciseChipIcon}>{guessExerciseIcon(ex.name)}</Text>
                      </View>
                    ))}
                    {(session.exercises?.length || 0) > 4 && (
                      <Text style={styles.exerciseChipMore}>+{session.exercises.length - 4}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.sessionArrow}>→</Text>
              </Tap>
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  title: { color: '#F3E7D6', fontSize: 26, fontFamily: 'ArchivoBlack_400Regular' },
  subtitle: { color: '#B39D85', fontSize: 14, marginTop: 4, marginBottom: 24 },
  paragraph: { color: '#B39D85', fontSize: 14 },

  sessionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A',
    borderRadius: 20, padding: 16, marginBottom: 14,
  },
  sessionIconBox: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(232,98,63,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  sessionIcon: { fontSize: 24 },
  sessionName: { color: '#F3E7D6', fontSize: 16, fontWeight: '800' },
  sessionMeta: { color: '#B39D85', fontSize: 12, marginTop: 2, marginBottom: 8 },
  exerciseChips: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  exerciseChip: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: '#2E2019',
    alignItems: 'center', justifyContent: 'center',
  },
  exerciseChipIcon: { fontSize: 13 },
  exerciseChipMore: { color: '#7C6A57', fontSize: 11, fontWeight: '700', marginLeft: 2 },
  sessionArrow: { color: '#E8623F', fontSize: 20, fontWeight: '700' },
});
