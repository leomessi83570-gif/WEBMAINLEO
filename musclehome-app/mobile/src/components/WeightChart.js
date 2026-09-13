import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

const WIDTH = 320;
const HEIGHT = 120;
const PADDING = 16;

/**
 * Petit graphique de poids dans le temps — pas de bibliothèque de charts, juste une
 * polyline SVG sur les entrées réelles de l'utilisateur (jamais de données inventées).
 */
export default function WeightChart({ entries }) {
  if (entries.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Ajoute au moins 2 pesées pour voir ta courbe de progression.
        </Text>
      </View>
    );
  }

  const values = entries.map((e) => e.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = entries.map((e, i) => {
    const x = PADDING + (i / (entries.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((e.value - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const last = entries[entries.length - 1];
  const first = entries[0];
  const delta = last.value - first.value;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.current}>{last.value} kg</Text>
        <Text style={[styles.delta, delta <= 0 ? styles.deltaDown : styles.deltaUp]}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg depuis le début
        </Text>
      </View>
      <Svg width={WIDTH} height={HEIGHT}>
        <Line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#2E2019" strokeWidth={1} />
        <Polyline points={polylinePoints} fill="none" stroke="#E8623F" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? '#F5885E' : '#E8623F'} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  current: { color: '#F3E7D6', fontSize: 22, fontFamily: 'ArchivoBlack_400Regular' },
  delta: { fontSize: 12, fontWeight: '700' },
  deltaDown: { color: '#7BC49A' },
  deltaUp: { color: '#B39D85' },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#7C6A57', fontSize: 12.5, textAlign: 'center' },
});
