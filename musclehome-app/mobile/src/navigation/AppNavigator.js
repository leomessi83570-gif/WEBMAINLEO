import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';

import OnboardingScreen from '../screens/OnboardingScreen';
import PhotoCaptureScreen from '../screens/PhotoCaptureScreen';
import AnalysisResultScreen from '../screens/AnalysisResultScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProgressScreen from '../screens/ProgressScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0F0F0F' },
  headerTintColor: '#fff',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#0F0F0F' },
};

export default function AppNavigator() {
  const { loaded, onboarded } = useUser();

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!onboarded ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: '' }} />
          <Stack.Screen name="PhotoCapture" component={PhotoCaptureScreen} options={{ title: '' }} />
          <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ title: '' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: '' }} />
          <Stack.Screen name="Workout" component={WorkoutScreen} options={{ title: '' }} />
          <Stack.Screen name="Nutrition" component={NutritionScreen} options={{ title: 'Nutrition' }} />
          <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: '' }} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ title: '', presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
