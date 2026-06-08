import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function ContactDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Contacts',
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Contact' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit contact', presentation: 'modal' }} />
    </Stack>
  );
}
