import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const MASCOT_IMAGE = require('../../assets/mascot.png');

/**
 * Avatar mascotte + bulle de dialogue, façon Duolingo. `line` est le texte à afficher,
 * généralement produit par getDashboardLine()/getMascotLine() (src/utils/mascotLines.js).
 */
export default function Mascot({ line, tag = 'Buffalo dit' }) {
  if (!line) return null;

  return (
    <View style={styles.row}>
      <View style={styles.avatarBox}>
        <Image source={MASCOT_IMAGE} style={styles.avatar} resizeMode="cover" />
      </View>
      <View style={styles.bubble}>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.line}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#2B1D10',
    borderWidth: 1,
    borderColor: '#3A2A1A',
  },
  avatar: { width: '100%', height: '100%' },
  bubble: {
    flex: 1,
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  tag: {
    color: '#F0954B',
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  line: { color: '#F3E7D6', fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
