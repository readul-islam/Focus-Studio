import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function InboxLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Inbox' }} />
      <Stack.Screen name="compose" options={{ title: 'New email', presentation: 'modal' }} />
      <Stack.Screen name="[threadId]" options={{ title: 'Message', headerBackTitle: 'Inbox' }} />
    </Stack>
  );
}
