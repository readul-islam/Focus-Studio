import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function HelpLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Help center' }} />
      <Stack.Screen name="support" options={{ title: 'AI support', headerBackTitle: 'Help' }} />
      <Stack.Screen name="[category]/index" options={{ title: 'Articles', headerBackTitle: 'Help' }} />
      <Stack.Screen name="[category]/[slug]" options={{ title: 'Article', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
