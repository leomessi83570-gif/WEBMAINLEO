import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Tap from '../components/Tap';

const MASCOT = require('../../assets/mascot-celebrate.png');

/**
 * Premier écran de l'app : la mascotte occupe la quasi-totalité de l'écran et souhaite
 * la bienvenue avant même le questionnaire, façon Duolingo.
 */
export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.duration(500).springify().damping(14)} style={styles.mascotWrap}>
        <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(250)} style={styles.bubble}>
        <Text style={styles.bubbleTag}>Buffalo dit</Text>
        <Text style={styles.bubbleLine}>
          Salut, moi c'est Buffalo. Je vais te construire un programme de muscu à la maison,
          sur mesure. Ça prend deux minutes.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.footer}>
        <Tap style={styles.button} onPress={() => navigation.navigate('Onboarding')}>
          <Text style={styles.buttonText}>Commencer</Text>
        </Tap>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#130D09',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'flex-end',
  },
  mascotWrap: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mascot: { width: '92%', height: 560 },
  bubble: {
    backgroundColor: '#201409',
    borderWidth: 1,
    borderColor: '#3A2A1A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  bubbleTag: {
    color: '#F5885E',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bubbleLine: { color: '#F3E7D6', fontSize: 16, lineHeight: 23, fontWeight: '600' },
  footer: {},
  button: {
    backgroundColor: '#E8623F',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { color: '#F3E7D6', fontSize: 16, fontFamily: 'ArchivoBlack_400Regular' },
});
