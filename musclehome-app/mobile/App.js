import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({ ArchivoBlack_400Regular });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#130D09' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
