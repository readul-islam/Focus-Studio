import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function ContactsLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'CRM' }} />
      <Stack.Screen name="pipeline" options={{ title: 'CRM' }} />
      <Stack.Screen name="lead/new" options={{ title: 'New lead', presentation: 'modal' }} />
      <Stack.Screen name="lead/[id]" options={{ title: 'Lead' }} />
      <Stack.Screen name="new" options={{ title: 'New contact', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
