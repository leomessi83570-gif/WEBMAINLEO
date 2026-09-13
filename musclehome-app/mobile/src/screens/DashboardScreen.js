import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../context/UserContext';

export default function DashboardScreen({ navigation }) {
  const { program, isPremium, logs } = useUser();

  const todaySession = program?.sessions?.[0]; // V1 : on propose toujours la 1ère séance du cycle
  const sessionsDone = logs.filter((l) => l.type === 'session').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.hello}>Salut 👋</Text>
      <Text style={styles.title}>Prêt pour aujourd'hui ?</Text>

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
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  hello: { color: '#888', fontSize: 15 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#FF3B30', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardLabel: { color: '#FFD9D6', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 6 },
  cardSub: { color: '#FFD9D6', fontSize: 13, marginTop: 4 },
  linkCard: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 12 },
  linkCardText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  paragraph: { color: '#888', fontSize: 14, marginBottom: 16 },
  premiumCard: {
    borderWidth: 1, borderColor: '#FF3B30', borderRadius: 14, padding: 16, marginTop: 12,
  },
  premiumTitle: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  premiumSub: { color: '#ccc', fontSize: 13, marginTop: 4 },
});
