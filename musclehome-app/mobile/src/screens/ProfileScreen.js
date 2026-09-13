import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useUser } from '../context/UserContext';
import { computeStreak } from '../utils/streak';
import { BADGES } from '../utils/rewards';
import Tap from '../components/Tap';

const AVATAR = require('../../assets/mascot-idle.png');

export default function ProfileScreen({ navigation }) {
  const { profile, logs, weeklyGoal, badges, isPremium, reset } = useUser();
  const streakInfo = computeStreak(logs, weeklyGoal);
  const sessionsDone = logs.filter((l) => l.type === 'session').length;

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

      <View style={styles.statsRow}>
        <Stat value={streakInfo.streakWeeks} label="Semaines de streak" />
        <Stat value={sessionsDone} label="Séances au total" />
        <Stat value={badges.length} label="Badges" />
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

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  stat: { flex: 1, backgroundColor: '#201409', borderWidth: 1, borderColor: '#3A2A1A', borderRadius: 14, padding: 14, alignItems: 'center' },
  statValue: { color: '#F3E7D6', fontSize: 20, fontFamily: 'ArchivoBlack_400Regular', fontVariant: ['tabular-nums'] },
  statLabel: { color: '#B39D85', fontSize: 10.5, marginTop: 4, textAlign: 'center' },

  sectionTitle: { color: '#E8623F', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 8 },
  paragraph: { color: '#B39D85', fontSize: 13.5, lineHeight: 19, marginBottom: 20 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
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
