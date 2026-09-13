import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Image, ScrollView, Linking } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useUser } from '../context/UserContext';
import { getMascotLine } from '../utils/mascotLines';
import { rollReward } from '../utils/rewards';
import { parseRestSeconds } from '../utils/time';
import { guessExerciseIcon } from '../utils/exerciseIcons';
import { playSound } from '../utils/sounds';
import Tap from '../components/Tap';
import Mascot from '../components/Mascot';
import CircularTimer from '../components/CircularTimer';
import Confetti from '../components/Confetti';

const CELEBRATE_IMAGE = require('../../assets/mascot-celebrate.png');
const WORRIED_IMAGE = require('../../assets/mascot-worried.png');

export default function WorkoutScreen({ route, navigation }) {
  const { session } = route.params;
  const { addLog, addBadge, soundEnabled } = useUser();
  const exercises = session.exercises || [];

  // step = index de l'exercice en cours (0..N-1), ou N pour l'étape récap/notes finale
  const [step, setStep] = useState(0);
  const [setIndex, setSetIndex] = useState(0); // série en cours dans l'exercice courant (0-based)
  const [phase, setPhase] = useState('active'); // 'active' | 'rest'
  const [restSeconds, setRestSeconds] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [notes, setNotes] = useState('');
  const [celebration, setCelebration] = useState(null);
  const [reward, setReward] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const intervalRef = useRef(null);

  const isRecap = step >= exercises.length;
  const exercise = !isRecap ? exercises[step] : null;

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startRest = (seconds) => {
    clearInterval(intervalRef.current);
    setRestSeconds(seconds);
    setRestLeft(seconds);
    setPhase('rest');
    intervalRef.current = setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const finishSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (soundEnabled) playSound('setDone');
    const isLastSet = setIndex >= exercise.sets - 1;

    if (isLastSet) {
      goNextExercise();
      return;
    }

    const seconds = parseRestSeconds(exercise.rest);
    setSetIndex((i) => i + 1);
    if (seconds) {
      startRest(seconds);
    }
  };

  const goNextExercise = () => {
    clearInterval(intervalRef.current);
    setPhase('active');
    setSetIndex(0);
    setStep((s) => s + 1);
  };

  const finishSession = async () => {
    await addLog({ type: 'session', session_name: session.name, notes });
    const r = rollReward();
    if (r.badge) await addBadge(r.badge);
    if (soundEnabled) playSound(r.tier === 'epique' || r.tier === 'legendaire' ? 'badge' : 'success');
    setReward(r);
    setCelebration(getMascotLine('session_done'));
  };

  const closeCelebration = () => {
    setCelebration(null);
    setReward(null);
    navigation.navigate('MainTabs', { screen: 'Accueil' });
  };

  const watchDemo = () => {
    const query = encodeURIComponent(`${exercise.name} exercice technique musculation`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`).catch(() => {});
  };

  const skipUnknownExercise = () => {
    setShowHelp(false);
    goNextExercise();
  };

  const progressSteps = exercises.length + 1;

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {Array.from({ length: progressSteps }).map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotDone]} />
        ))}
      </View>

      {isRecap ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 40 }}>
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={{ marginBottom: 20 }}>
              <Mascot line={getMascotLine('session_done')} mood="celebrate" variant="hero" size={150} />
            </View>
            <Text style={styles.recapTitle}>Séance terminée, {session.name} !</Text>
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
              <Text style={styles.buttonText}>Valider la séance</Text>
            </Tap>
          </Animated.View>
        </ScrollView>
      ) : (
        <Animated.View key={step} entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(150)} style={styles.player}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseEyebrow}>
              Exercice {step + 1}/{exercises.length}
            </Text>
            <View style={styles.exerciseIconBox}>
              <Text style={styles.exerciseIconBig}>{guessExerciseIcon(exercise.name)}</Text>
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.notes ? <Text style={styles.exerciseNotes}>{exercise.notes}</Text> : null}
            <Tap haptic={false} style={styles.unknownLink} onPress={() => setShowHelp(true)}>
              <Text style={styles.unknownLinkText}>Je ne connais pas cet exercice ?</Text>
            </Tap>
          </View>

          <View style={styles.center}>
            {phase === 'active' ? (
              <>
                <Text style={styles.setLabel}>
                  Série {setIndex + 1} / {exercise.sets}
                </Text>
                <Text style={styles.repsTarget}>{exercise.reps}</Text>
                <Text style={styles.repsUnit}>répétitions</Text>
              </>
            ) : (
              <CircularTimer
                secondsLeft={restLeft}
                totalSeconds={restSeconds}
                size={230}
                label="repos"
              />
            )}
          </View>

          <View style={styles.footer}>
            {phase === 'active' ? (
              <Tap style={styles.button} onPress={finishSet}>
                <Text style={styles.buttonText}>
                  {setIndex >= exercise.sets - 1 ? 'Exercice terminé' : 'Série terminée'}
                </Text>
              </Tap>
            ) : restLeft === 0 ? (
              <Tap style={styles.button} onPress={() => setPhase('active')}>
                <Text style={styles.buttonText}>Série suivante</Text>
              </Tap>
            ) : (
              <Tap haptic={false} style={styles.buttonGhost} onPress={() => setPhase('active')}>
                <Text style={styles.buttonGhostText}>Passer le repos</Text>
              </Tap>
            )}
          </View>
        </Animated.View>
      )}

      <Modal visible={!!celebration} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {reward && (reward.tier === 'epique' || reward.tier === 'legendaire') && (
            <Confetti triggerKey={celebration} />
          )}
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

            <Tap style={styles.modalButton} onPress={closeCelebration}>
              <Text style={styles.buttonText}>Retour à l'accueil</Text>
            </Tap>
          </View>
        </View>
      </Modal>

      <Modal visible={showHelp} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Image source={WORRIED_IMAGE} style={styles.helpMascot} resizeMode="contain" />
            <Text style={styles.modalTitle}>Pas de souci !</Text>
            <Text style={styles.modalLine}>
              {exercise ? `${exercise.name} — ` : ''}personne ne connaît tous les exercices par cœur. Regarde une démo vidéo, ou passe cet exercice pour cette fois.
            </Text>
            {exercise?.notes ? (
              <View style={styles.helpNotesBox}>
                <Text style={styles.helpNotesText}>{exercise.notes}</Text>
              </View>
            ) : null}

            <Tap style={styles.modalButton} onPress={watchDemo}>
              <Text style={styles.buttonText}>Voir une démo vidéo</Text>
            </Tap>
            <Tap haptic={false} style={styles.buttonGhost} onPress={skipUnknownExercise}>
              <Text style={styles.buttonGhostText}>Passer cet exercice</Text>
            </Tap>
            <Tap haptic={false} style={styles.buttonGhost} onPress={() => setShowHelp(false)}>
              <Text style={styles.buttonGhostText}>Retour</Text>
            </Tap>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09', paddingTop: 56 },

  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 20 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#2E2019' },
  progressDotDone: { backgroundColor: '#E8623F' },

  player: { flex: 1, paddingHorizontal: 20, paddingBottom: 30 },

  exerciseHeader: { alignItems: 'center', marginBottom: 8 },
  exerciseEyebrow: { color: '#B39D85', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  exerciseIconBox: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(232,98,63,0.14)',
    alignItems: 'center', justifyContent: 'center', marginTop: 14, marginBottom: 14,
  },
  exerciseIconBig: { fontSize: 34 },
  exerciseName: { color: '#F3E7D6', fontSize: 24, fontFamily: 'ArchivoBlack_400Regular', textAlign: 'center' },
  exerciseNotes: { color: '#F5885E', fontSize: 13, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
  unknownLink: { marginTop: 10, paddingVertical: 4 },
  unknownLinkText: { color: '#7C6A57', fontSize: 12.5, textDecorationLine: 'underline' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  setLabel: { color: '#B39D85', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  repsTarget: { color: '#F3E7D6', fontSize: 88, fontFamily: 'ArchivoBlack_400Regular' },
  repsUnit: { color: '#7C6A57', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: -8 },

  footer: {},
  button: {
    backgroundColor: '#E8623F', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontFamily: 'ArchivoBlack_400Regular' },
  buttonGhost: { alignItems: 'center', paddingVertical: 14 },
  buttonGhostText: { color: '#7C6A57', fontSize: 13, textDecorationLine: 'underline' },

  recapTitle: { color: '#F3E7D6', fontSize: 22, fontFamily: 'ArchivoBlack_400Regular', marginBottom: 20, textAlign: 'center' },
  label: { color: '#D8C9B8', fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#201409', color: '#F3E7D6', borderRadius: 10, padding: 14,
    height: 80, textAlignVertical: 'top', marginBottom: 24, borderWidth: 1, borderColor: '#3A2A1A',
  },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(19,13,9,0.82)', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    width: '100%', backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A',
    borderRadius: 24, padding: 24, alignItems: 'center',
  },
  modalMascot: { width: 160, height: 200, marginBottom: 8 },
  helpMascot: { width: 120, height: 150, marginBottom: 4 },
  helpNotesBox: {
    width: '100%', backgroundColor: '#2E2019', borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#3A2A1A',
  },
  helpNotesText: { color: '#D8C9B8', fontSize: 12.5, lineHeight: 18, fontStyle: 'italic' },
  modalTitle: { color: '#F3E7D6', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalLine: { color: '#D8C9B8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  rewardBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%',
    backgroundColor: '#2E2019', borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#3A2A1A',
  },
  rewardBoxHighlight: { borderColor: '#F5885E', backgroundColor: 'rgba(206,106,46,0.14)' },
  rewardIcon: { fontSize: 28 },
  rewardTitle: { color: '#F3E7D6', fontSize: 14, fontWeight: '800' },
  rewardDetail: { color: '#B39D85', fontSize: 12, marginTop: 2, lineHeight: 16 },
  modalButton: {
    backgroundColor: '#E8623F', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center', width: '100%',
  },
});
