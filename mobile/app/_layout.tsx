import { useCallback, useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from '@/components/brand/AnimatedSplash';
import { PushNotificationProvider } from '@/components/notifications/PushNotificationProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { TimeTrackerProvider } from '@/context/TimeTrackerContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash already hidden — e.g. fast refresh */
});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <PushNotificationProvider>
              <TimeTrackerProvider>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)/login" />
                  <Stack.Screen name="(auth)/verify-2fa" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
                {showSplash ? <AnimatedSplash onFinish={handleSplashFinish} /> : null}
              </TimeTrackerProvider>
            </PushNotificationProvider>
          </AuthProvider>
        </QueryProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </View>
  );
}
