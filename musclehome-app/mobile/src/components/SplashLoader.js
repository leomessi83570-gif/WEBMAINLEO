import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const MASCOT = require('../../assets/mascot-idle.png');
const EASE = Easing.bezier(0.77, 0, 0.175, 1);

/**
 * Écran de chargement (polices, profil AsyncStorage) avec la mascotte à la place
 * d'un simple fond noir.
 */
export default function SplashLoader() {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: EASE }),
        withTiming(0, { duration: 700, easing: EASE })
      ),
      -1,
      false
    );
  }, [bob]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * bob.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={style}>
        <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
      </Animated.View>
      <Text style={styles.brand}>BUFFALO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130D09', alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 200, height: 240 },
  brand: {
    color: '#B39D85', fontSize: 14, fontWeight: '800',
    letterSpacing: 4, marginTop: 12,
  },
});
