import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';

const POSES = {
  idle: require('../../assets/mascot-idle.png'),
  celebrate: require('../../assets/mascot-celebrate.png'),
  worried: require('../../assets/mascot-worried.png'),
};

const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

/**
 * Avatar mascotte animé (thread UI via Reanimated) + bulle de dialogue, façon Duolingo.
 * `mood` choisit la pose ('idle' | 'celebrate' | 'worried'), `line` le texte affiché.
 */
export default function Mascot({ line, tag = 'Buffalo dit', mood = 'idle', size = 76 }) {
  const bob = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: EASE_IN_OUT }),
        withTiming(0, { duration: 1400, easing: EASE_IN_OUT })
      ),
      -1,
      false
    );
  }, [bob]);

  useEffect(() => {
    pop.value = 0.85;
    pop.value = withSpring(1, { duration: 400, dampingRatio: 0.8 });
  }, [mood, pop]);

  const avatarStyle = useAnimatedStyle(() => {
    const translateY = -4 * bob.value;
    const rotate = mood === 'celebrate' ? `${-4 + 8 * bob.value}deg` : '0deg';
    return {
      transform: [{ translateY }, { scale: pop.value }, { rotate }],
    };
  });

  if (!line) return null;

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.avatarBox, { width: size, height: size }, avatarStyle]}>
        <Image source={POSES[mood] || POSES.idle} style={styles.avatar} resizeMode="contain" />
      </Animated.View>
      <Animated.View key={line} entering={FadeIn.duration(200)} style={styles.bubble}>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.line}>{line}</Text>
      </Animated.View>
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
