import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import TrainingScreen from '../screens/TrainingScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Accueil: '🏠',
  Entrainement: '🏋️',
  Nutrition: '🍽️',
  Profil: '👤',
};

function TabIcon({ route, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{ICONS[route.name]}</Text>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F5885E',
        tabBarInactiveTintColor: '#7C6A57',
        tabBarStyle: {
          backgroundColor: '#150F0A',
          borderTopColor: '#2E2019',
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused }) => <TabIcon route={route} focused={focused} />,
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} />
      <Tab.Screen name="Entrainement" component={TrainingScreen} options={{ title: 'Entraînement' }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
