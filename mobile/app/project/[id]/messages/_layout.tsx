import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function ProjectMessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[threadId]" options={{ headerShown: true, headerBackTitle: 'Messages', title: 'Thread' }} />
    </Stack>
  );
}
