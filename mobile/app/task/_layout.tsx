import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function TaskLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions}>
      <Stack.Screen name="new" options={{ presentation: 'modal', title: 'New task' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Task' }} />
      <Stack.Screen name="[id]/edit" options={{ presentation: 'modal', title: 'Edit task' }} />
    </Stack>
  );
}
