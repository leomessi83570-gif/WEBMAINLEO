import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import Mascot from '../components/Mascot';
import Tap from '../components/Tap';
import { computeStreak, getWeekDayStatus } from '../utils/streak';
import { getDashboardState } from '../utils/mascotLines';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const HERO_MASCOT = require('../../assets/mascot-celebrate.png');

// Stagger léger sur l'entrée : la hiérarchie visuelle (héro -> streak -> séance -> reste)
// se lit dans l'ordre où elle apparaît, pas juste dans l'ordre du JSX.
const STAGGER = 70;

export default function DashboardScreen({ navigation }) {
  const { program, isPremium, logs, weeklyGoal, reset } = useUser();

  const confirmReset = () => {
    Alert.alert(
      'Réinitialiser le profil ?',
      "Ça efface le questionnaire, le programme et l'historique pour revoir l'onboarding depuis le début.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: reset },
      ]
    );
  };

  const todaySession = program?.sessions?.[0]; // V1 : on propose toujours la 1ère séance du cycle
  const sessionsDone = logs.filter((l) => l.type === 'session').length;

  const streakInfo = computeStreak(logs, weeklyGoal);
  const weekDays = getWeekDayStatus(logs);
  const mascotState = getDashboardState(streakInfo);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <LinearGradient
          colors={['#2B1D10', '#130D09']}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.hello}>Salut 👋</Text>
              <Text style={styles.title}>Prêt pour aujourd'hui ?</Text>
            </View>
          </View>
          <Image source={HERO_MASCOT} style={styles.heroMascot} resizeMode="contain" />
        </LinearGradient>
      </Animated.View>

      <View style={styles.body}>
        <Animated.View entering={FadeInDown.duration(400).delay(STAGGER).springify()} style={{ marginBottom: 20 }}>
          <Mascot line={mascotState.line} mood={mascotState.mood} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(STAGGER * 2).springify()} style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View style={styles.streakCountRow}>
              <Text style={styles.flame}>🔥</Text>
              <Text style={styles.streakNum}>{streakInfo.streakWeeks}</Text>
              <Text style={styles.streakUnit}>semaine{streakInfo.streakWeeks > 1 ? 's' : ''}</Text>
            </View>
            {streakInfo.shieldAvailable && (
              <View style={styles.shieldBadge}>
                <Text style={styles.shieldText}>🛡️ Bouclier dispo</Text>
              </View>
            )}
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((d, i) => (
              <View key={i} style={styles.weekDayCol}>
                <View
                  style={[
                    styles.weekDot,
                    d.done && styles.weekDotDone,
                    d.isToday && styles.weekDotToday,
                  ]}
                >
                  {d.done && <Text style={styles.weekDotText}>✓</Text>}
                </View>
                <Text style={styles.weekDayLabel}>{DAY_LABELS[i]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.weekGoalRow}>
            <Text style={styles.weekGoalLabel}>Cette semaine</Text>
            <Text style={styles.weekGoalValue}>
              {streakInfo.currentWeekCount} / {weeklyGoal} séances
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(STAGGER * 3).springify()} style={styles.statsRow}>
          <Stat label="Séances faites" value={sessionsDone} />
          <Stat label="Objectif" value={program?.goal_label || '—'} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(STAGGER * 4).springify()}>
          {todaySession ? (
            <Tap
              style={styles.card}
              onPress={() => navigation.navigate('Workout', { session: todaySession })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Séance du jour</Text>
                <Text style={styles.cardTitle}>{todaySession.name}</Text>
                <Text style={styles.cardSub}>{todaySession.exercises?.length || 0} exercices</Text>
              </View>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>→</Text>
              </View>
            </Tap>
          ) : (
            <Text style={styles.paragraph}>Aucun programme généré pour l'instant.</Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(STAGGER * 5).springify()}>
          <Tap style={styles.linkCard} onPress={() => navigation.navigate('Progress')}>
            <Text style={styles.linkCardText}>📈 Voir ma progression</Text>
          </Tap>

          <Tap style={styles.linkCard} onPress={() => navigation.navigate('Nutrition')}>
            <Text style={styles.linkCardText}>🍽️ Mon plan nutrition</Text>
          </Tap>

          {!isPremium && (
            <Tap style={styles.premiumCard} onPress={() => navigation.navigate('Paywall')}>
              <Text style={styles.premiumTitle}>Passe Premium</Text>
              <Text style={styles.premiumSub}>
                Analyse photo avancée, programme adaptatif, coach IA illimité.
              </Text>
            </Tap>
          )}

          <Tap haptic={false} style={styles.resetLink} onPress={confirmReset}>
            <Text style={styles.resetLinkText}>Réinitialiser le profil (dev)</Text>
          </Tap>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },

  hero: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 0,
    overflow: 'hidden',
    minHeight: 220,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroMascot: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginTop: -10,
  },
  hello: { color: '#A6927E', fontSize: 15 },
  title: { color: '#F3E7D6', fontSize: 26, fontWeight: '700' },

  body: { padding: 20, paddingTop: 8 },

  streakCard: {
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  streakCountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  flame: { fontSize: 20 },
  streakNum: { color: '#F3E7D6', fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  streakUnit: { color: '#B39D85', fontSize: 13, fontWeight: '700' },
  shieldBadge: {
    backgroundColor: 'rgba(206,106,46,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(206,106,46,0.35)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  shieldText: { color: '#F0954B', fontSize: 11, fontWeight: '800' },
  weekRow: { flexDirection: 'row', gap: 7 },
  weekDayCol: { flex: 1, alignItems: 'center', gap: 6 },
  weekDot: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(55,38,20,0.27)',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotDone: { backgroundColor: '#CE6A2E', borderColor: '#CE6A2E' },
  weekDotToday: { borderColor: '#F0954B', borderWidth: 2 },
  weekDotText: { color: '#1E1006', fontWeight: '800', fontSize: 13 },
  weekDayLabel: { color: '#7C6A57', fontSize: 10, textTransform: 'uppercase' },
  weekGoalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  weekGoalLabel: { color: '#B39D85', fontSize: 11.5 },
  weekGoalValue: { color: '#F3E7D6', fontSize: 11.5, fontWeight: '700', fontVariant: ['tabular-nums'] },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 16 },
  statValue: { color: '#F3E7D6', fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { color: '#B39D85', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#CE6A2E', borderRadius: 16, padding: 20, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  cardLabel: { color: '#FFE3CC', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { color: '#1E1006', fontSize: 22, fontWeight: '700', marginTop: 6 },
  cardSub: { color: '#4A2E17', fontSize: 13, marginTop: 4 },
  cardArrow: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(30,16,6,0.18)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  cardArrowText: { color: '#1E1006', fontSize: 18, fontWeight: '700' },
  linkCard: { backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 16, marginBottom: 12 },
  linkCardText: { color: '#F3E7D6', fontSize: 15, fontWeight: '600' },
  paragraph: { color: '#B39D85', fontSize: 14, marginBottom: 16 },
  premiumCard: {
    borderWidth: 1, borderColor: '#CE6A2E', borderRadius: 14, padding: 16, marginTop: 12,
  },
  premiumTitle: { color: '#F0954B', fontSize: 16, fontWeight: '700' },
  premiumSub: { color: '#B39D85', fontSize: 13, marginTop: 4 },
  resetLink: { marginTop: 24, alignItems: 'center' },
  resetLinkText: { color: '#5A4A38', fontSize: 12, textDecorationLine: 'underline' },
});
