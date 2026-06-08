import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function ReportsLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Reports' }} />
      <Stack.Screen name="overview" options={{ title: 'Overview', headerBackTitle: 'Reports' }} />
      <Stack.Screen name="projects" options={{ title: 'Projects', headerBackTitle: 'Reports' }} />
      <Stack.Screen name="team" options={{ title: 'Team', headerBackTitle: 'Reports' }} />
      <Stack.Screen name="finance" options={{ title: 'Finance', headerBackTitle: 'Reports' }} />
      <Stack.Screen name="procurement" options={{ title: 'Procurement', headerBackTitle: 'Reports' }} />
    </Stack>
  );
}
