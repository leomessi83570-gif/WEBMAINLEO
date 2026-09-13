import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = ['#E8623F', '#F5885E', '#F3E7D6', '#FFE3CC', '#B39D85'];
const PIECE_COUNT = 26;

function Piece({ index }) {
  const progress = useSharedValue(0);
  const startX = Math.random() * SCREEN_WIDTH;
  const drift = (Math.random() - 0.5) * 140;
  const size = 6 + Math.random() * 6;
  const color = COLORS[index % COLORS.length];
  const delay = Math.random() * 200;
  const duration = 1400 + Math.random() * 700;
  const rotations = (Math.random() - 0.5) * 6;

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: progress.value * 500 },
      { translateX: progress.value * drift },
      { rotate: `${progress.value * rotations * 360}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        { left: startX, width: size, height: size * 1.6, backgroundColor: color },
        style,
      ]}
    />
  );
}

/**
 * Pluie de confettis brève, déclenchée en changeant `triggerKey` (ex: à chaque
 * déblocage de badge rare/épique/légendaire) — réservée à ces moments rares pour
 * garder son impact.
 */
export default function Confetti({ triggerKey }) {
  if (!triggerKey) return null;
  return (
    <View style={styles.container} pointerEvents="none" key={triggerKey}>
      {Array.from({ length: PIECE_COUNT }).map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  piece: { position: 'absolute', top: -20, borderRadius: 2 },
});
