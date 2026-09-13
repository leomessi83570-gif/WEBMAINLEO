import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Pressable avec feedback tactile (scale 0.97) + haptique léger, comme recommandé
 * pour tout élément appuyable qui n'est pas une ligne de liste pleine largeur.
 * `haptic` peut être désactivé (ex: bouton "annuler") en passant `haptic={false}`.
 */
export default function Tap({ children, style, onPress, haptic = true, disabled, ...props }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 120, easing: EASE_OUT });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150, easing: EASE_OUT });
  };

  const handlePress = (e) => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
