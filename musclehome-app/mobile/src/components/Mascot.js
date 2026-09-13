import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';

const POSES = {
  idle: require('../../assets/mascot-idle.png'),
  celebrate: require('../../assets/mascot-celebrate.png'),
  worried: require('../../assets/mascot-worried.png'),
};

/**
 * Avatar mascotte animé + bulle de dialogue, façon Duolingo.
 * `mood` choisit la pose ('idle' | 'celebrate' | 'worried'), `line` le texte affiché.
 */
export default function Mascot({ line, tag = 'Buffalo dit', mood = 'idle', size = 76 }) {
  const bob = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(mood === 'idle' ? 1 : 0.85)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  useEffect(() => {
    // petit "pop" quand la pose change (célébration / inquiétude)
    pop.setValue(0.85);
    Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [mood, pop]);

  if (!line) return null;

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const rotate =
    mood === 'celebrate'
      ? bob.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] })
      : '0deg';

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.avatarBox,
          { width: size, height: size, transform: [{ translateY }, { scale: pop }, { rotate }] },
        ]}
      >
        <Image source={POSES[mood] || POSES.idle} style={styles.avatar} resizeMode="contain" />
      </Animated.View>
      <View style={styles.bubble}>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.line}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  avatarBox: { flexShrink: 0 },
  avatar: { width: '100%', height: '100%' },
  bubble: {
    flex: 1,
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginBottom: 6,
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
