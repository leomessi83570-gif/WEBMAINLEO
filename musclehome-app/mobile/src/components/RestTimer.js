import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Tap from './Tap';
import { formatSeconds } from '../utils/time';

/**
 * Bandeau de repos chronométré affiché sous l'exercice dont une série vient d'être
 * validée. Se ferme tout seul à zéro (avec un petit signal haptique) ou via "Passer".
 */
export default function RestTimer({ totalSeconds, onDone }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          onDone?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  const progress = 1 - secondsLeft / totalSeconds;

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
      <Text style={styles.time}>{formatSeconds(secondsLeft)}</Text>
      <Tap
        haptic={false}
        style={styles.skip}
        onPress={() => {
          clearInterval(intervalRef.current);
          onDone?.();
        }}
      >
        <Text style={styles.skipText}>Passer</Text>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#2E2019', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#E8623F', borderRadius: 4 },
  time: { color: '#F5885E', fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'], minWidth: 36, textAlign: 'right' },
  skip: { paddingHorizontal: 4 },
  skipText: { color: '#7C6A57', fontSize: 12, textDecorationLine: 'underline' },
});
