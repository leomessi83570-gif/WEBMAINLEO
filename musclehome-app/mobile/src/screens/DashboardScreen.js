import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../context/UserContext';
import Mascot from '../components/Mascot';
import { computeStreak, getWeekDayStatus } from '../utils/streak';
import { getDashboardLine } from '../utils/mascotLines';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function DashboardScreen({ navigation }) {
  const { program, isPremium, logs, weeklyGoal } = useUser();

  const todaySession = program?.sessions?.[0]; // V1 : on propose toujours la 1ère séance du cycle
  const sessionsDone = logs.filter((l) => l.type === 'session').length;

  const streakInfo = computeStreak(logs, weeklyGoal);
  const weekDays = getWeekDayStatus(logs);
  const mascotLine = getDashboardLine(streakInfo);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.hello}>Salut 👋</Text>
      <Text style={styles.title}>Prêt pour aujourd'hui ?</Text>

      <View style={{ marginBottom: 20 }}>
        <Mascot line={mascotLine} />
      </View>

      <View style={styles.streakCard}>
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
      </View>

      <View style={styles.statsRow}>
        <Stat label="Séances faites" value={sessionsDone} />
        <Stat label="Objectif" value={program?.goal_label || '—'} />
      </View>

      {todaySession ? (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Workout', { session: todaySession })}
        >
          <Text style={styles.cardLabel}>Séance du jour</Text>
          <Text style={styles.cardTitle}>{todaySession.name}</Text>
          <Text style={styles.cardSub}>{todaySession.exercises?.length || 0} exercices</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.paragraph}>Aucun programme généré pour l'instant.</Text>
      )}

      <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('Progress')}>
        <Text style={styles.linkCardText}>📈 Voir ma progression</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('Nutrition')}>
        <Text style={styles.linkCardText}>🍽️ Mon plan nutrition</Text>
      </TouchableOpacity>

      {!isPremium && (
        <TouchableOpacity style={styles.premiumCard} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.premiumTitle}>Passe Premium</Text>
          <Text style={styles.premiumSub}>
            Analyse photo avancée, programme adaptatif, coach IA illimité.
          </Text>
        </TouchableOpacity>
      )}
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
  hello: { color: '#A6927E', fontSize: 15 },
  title: { color: '#F3E7D6', fontSize: 26, fontWeight: '700', marginBottom: 20 },

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
  streakNum: { color: '#F3E7D6', fontSize: 26, fontWeight: '800' },
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
  weekGoalValue: { color: '#F3E7D6', fontSize: 11.5, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 16 },
  statValue: { color: '#F3E7D6', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#B39D85', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#CE6A2E', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardLabel: { color: '#FFE3CC', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { color: '#1E1006', fontSize: 22, fontWeight: '700', marginTop: 6 },
  cardSub: { color: '#4A2E17', fontSize: 13, marginTop: 4 },
  linkCard: { backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 16, marginBottom: 12 },
  linkCardText: { color: '#F3E7D6', fontSize: 15, fontWeight: '600' },
  paragraph: { color: '#B39D85', fontSize: 14, marginBottom: 16 },
  premiumCard: {
    borderWidth: 1, borderColor: '#CE6A2E', borderRadius: 14, padding: 16, marginTop: 12,
  },
  premiumTitle: { color: '#F0954B', fontSize: 16, fontWeight: '700' },
  premiumSub: { color: '#B39D85', fontSize: 13, marginTop: 4 },
});
