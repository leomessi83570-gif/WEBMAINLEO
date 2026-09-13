import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TextInput } from 'react-native';
import { useUser } from '../context/UserContext';
import { computeStreak } from '../utils/streak';
import { BADGES } from '../utils/rewards';
import { getLeagueInfo } from '../utils/leagues';
import Tap from '../components/Tap';
import WeightChart from '../components/WeightChart';

const AVATAR = require('../../assets/mascot-idle.png');

export default function ProfileScreen({ navigation }) {
  const { profile, logs, weeklyGoal, badges, isPremium, reset, addLog } = useUser();
  const streakInfo = computeStreak(logs, weeklyGoal);
  const sessionsDone = logs.filter((l) => l.type === 'session').length;
  const league = getLeagueInfo(sessionsDone);

  const weightEntries = logs
    .filter((l) => l.type === 'weight')
    .map((l) => ({ date: l.date, value: l.value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const [newWeight, setNewWeight] = useState('');

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

  const submitWeight = async () => {
    const value = parseFloat(newWeight.replace(',', '.'));
    if (!value || value <= 0) return;
    await addLog({ type: 'weight', value });
    setNewWeight('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <Image source={AVATAR} style={styles.avatar} resizeMode="contain" />
        <View>
          <Text style={styles.title}>Ton profil</Text>
          <Text style={styles.subtitle}>
            {profile?.age ? `${profile.age} ans · ` : ''}
            {profile?.goal ? goalLabel(profile.goal) : 'Objectif non défini'}
          </Text>
        </View>
      </View>

      <View style={styles.leagueCard}>
        <View style={styles.leagueTop}>
          <Text style={styles.leagueIcon}>{league.current.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.leagueEyebrow}>Ligue actuelle</Text>
            <Text style={styles.leagueName}>{league.current.label}</Text>
          </View>
        </View>
        {league.next && (
          <>
            <View style={styles.leagueTrack}>
              <View style={[styles.leagueFill, { width: `${league.progress * 100}%` }]} />
            </View>
            <Text style={styles.leagueSub}>
              {league.remaining} séance{league.remaining > 1 ? 's' : ''} avant {league.next.label} {league.next.icon}
            </Text>
          </>
        )}
      </View>

      <View style={styles.statsRow}>
        <Stat value={streakInfo.streakWeeks} label="Semaines de streak" />
        <Stat value={sessionsDone} label="Séances au total" />
        <Stat value={badges.length} label="Badges" />
      </View>

      <Text style={styles.sectionTitle}>Poids</Text>
      <View style={styles.weightCard}>
        <WeightChart entries={weightEntries} />
        <View style={styles.weightInputRow}>
          <TextInput
            style={styles.weightInput}
            keyboardType="numeric"
            value={newWeight}
            onChangeText={setNewWeight}
            placeholder={profile?.weight_kg ? String(profile.weight_kg) : '75'}
            placeholderTextColor="#7C6A57"
          />
          <Tap style={styles.weightButton} onPress={submitWeight}>
            <Text style={styles.weightButtonText}>Ajouter la pesée</Text>
          </Tap>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges débloqués</Text>
      {badges.length === 0 ? (
        <Text style={styles.paragraph}>
          Aucun badge pour l'instant — ils tombent au hasard après une séance, tente ta chance.
        </Text>
      ) : (
        <View style={styles.badgeRow}>
          {badges.map((key) => {
            const b = BADGES[key];
            if (!b) return null;
            return (
              <View key={key} style={styles.badgeChip}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
                <Text style={styles.badgeLabel}>{b.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Compte</Text>
      {!isPremium && (
        <Tap style={styles.premiumCard} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.premiumTitle}>Passe Premium</Text>
          <Text style={styles.premiumSub}>Analyse photo avancée, programme adaptatif, coach IA illimité.</Text>
        </Tap>
      )}

      <Tap style={styles.linkCard} onPress={() => navigation.navigate('Progress')}>
        <Text style={styles.linkCardText}>🕘 Historique complet des séances</Text>
      </Tap>

      <Tap haptic={false} style={styles.resetLink} onPress={confirmReset}>
        <Text style={styles.resetLinkText}>Réinitialiser le profil (dev)</Text>
      </Tap>
    </ScrollView>
  );
}

function goalLabel(goal) {
  const map = {
    perte_de_gras: 'Perte de gras',
    prise_de_masse: 'Prise de masse',
    recomposition: 'Recomposition',
    performance: 'Performance / force',
  };
  return map[goal] || goal;
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 72, height: 96 },
  title: { color: '#F3E7D6', fontSize: 24, fontFamily: 'ArchivoBlack_400Regular' },
  subtitle: { color: '#B39D85', fontSize: 13, marginTop: 4 },

  leagueCard: {
    backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A',
    borderRadius: 18, padding: 16, marginBottom: 20,
  },
  leagueTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  leagueIcon: { fontSize: 30 },
  leagueEyebrow: { color: '#B39D85', fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  leagueName: { color: '#F3E7D6', fontSize: 18, fontFamily: 'ArchivoBlack_400Regular' },
  leagueTrack: { height: 8, borderRadius: 4, backgroundColor: '#2E2019', overflow: 'hidden' },
  leagueFill: { height: '100%', backgroundColor: '#E8623F', borderRadius: 4 },
  leagueSub: { color: '#B39D85', fontSize: 11.5, marginTop: 8 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 14, alignItems: 'center' },
  statValue: { color: '#F3E7D6', fontSize: 20, fontFamily: 'ArchivoBlack_400Regular', fontVariant: ['tabular-nums'] },
  statLabel: { color: '#B39D85', fontSize: 10.5, marginTop: 4, textAlign: 'center' },

  sectionTitle: { color: '#E8623F', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 20 },
  paragraph: { color: '#B39D85', fontSize: 13.5, lineHeight: 19, marginBottom: 20 },

  weightCard: { backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 18, padding: 16 },
  weightInputRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  weightInput: {
    width: 80, backgroundColor: '#2E2019', color: '#F3E7D6', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#3A2A1A',
  },
  weightButton: { flex: 1, backgroundColor: '#E8623F', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weightButtonText: { color: '#F3E7D6', fontSize: 13, fontWeight: '700' },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  badgeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A',
    borderRadius: 100, paddingVertical: 8, paddingHorizontal: 14,
  },
  badgeIcon: { fontSize: 18 },
  badgeLabel: { color: '#F3E7D6', fontSize: 13, fontWeight: '700' },

  premiumCard: { borderWidth: 1, borderColor: '#E8623F', borderRadius: 14, padding: 16, marginBottom: 12 },
  premiumTitle: { color: '#F5885E', fontSize: 16, fontWeight: '700' },
  premiumSub: { color: '#B39D85', fontSize: 13, marginTop: 4 },
  linkCard: { backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 16, marginBottom: 12 },
  linkCardText: { color: '#F3E7D6', fontSize: 15, fontWeight: '600' },
  resetLink: { marginTop: 16, alignItems: 'center' },
  resetLinkText: { color: '#5A4A38', fontSize: 12, textDecorationLine: 'underline' },
});
