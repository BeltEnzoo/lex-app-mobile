import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Lora_400Regular, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';

import { WhatsAppFab } from '@/components/WhatsAppFab';
import { AppAlertHost } from '@/components/AppAlertHost';
import { colors, fonts } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Lex CardioSegura', headerShown: false }} />
        <Stack.Screen name="mapa" options={{ title: 'Zonas cardioasistidas' }} />
        <Stack.Screen name="zona-cardioasistida/index" options={{ title: 'Zona cardioasistida' }} />
        <Stack.Screen name="zona-cardioasistida/video" options={{ title: 'Video' }} />
        <Stack.Screen name="zona-cardioasistida/pdf" options={{ title: 'PDF' }} />
        <Stack.Screen
          name="elegir-lugar-cardioasistido/index"
          options={{ title: 'Lugar Cardioasistido' }}
        />
        <Stack.Screen name="elegir-lugar-cardioasistido/pdf" options={{ title: 'Guía PDF' }} />
        <Stack.Screen name="aprender-rcp/index" options={{ title: 'Aprender RCP y uso de DEA' }} />
        <Stack.Screen name="aprender-rcp/video" options={{ title: 'Video' }} />
        <Stack.Screen name="aprender-rcp/pdf" options={{ title: 'PDF' }} />
        <Stack.Screen name="servicios-red-lex/index" options={{ title: 'Servicios Red Lex' }} />
        <Stack.Screen name="servicios-red-lex/pdf" options={{ title: 'Material PDF' }} />
        <Stack.Screen name="servicios-red-lex/videos" options={{ title: 'Videos Red Lex' }} />
        <Stack.Screen name="incorporar-zona" options={{ title: 'Incorporar zona' }} />
      </Stack>
      <WhatsAppFab />
      <AppAlertHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
