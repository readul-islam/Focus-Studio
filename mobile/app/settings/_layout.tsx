import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions} />
  );
}
