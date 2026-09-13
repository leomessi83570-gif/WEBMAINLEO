import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import SplashLoader from '../components/SplashLoader';

import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PhotoCaptureScreen from '../screens/PhotoCaptureScreen';
import AnalysisResultScreen from '../screens/AnalysisResultScreen';
import MainTabs from './MainTabs';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#130D09' },
  headerTintColor: '#F3E7D6',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#130D09' },
  // Transition native (pas de JS hand-rolled) pour que chaque changement d'écran
  // glisse au lieu d'apparaître d'un coup façon page web.
  animation: 'slide_from_right',
};

export default function AppNavigator() {
  const { loaded, onboarded } = useUser();

  if (!loaded) {
    return <SplashLoader />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!onboarded ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: '', headerShown: false }} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: '' }} />
          <Stack.Screen name="PhotoCapture" component={PhotoCaptureScreen} options={{ title: '' }} />
          <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ title: '' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Workout" component={WorkoutScreen} options={{ title: '' }} />
          <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: '' }} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ title: '', presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
