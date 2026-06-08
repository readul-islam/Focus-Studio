import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function ProjectFilesLayout() {
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
      <Stack.Screen name="[folderId]" options={{ headerShown: true, headerBackTitle: 'Files', title: 'Folder' }} />
    </Stack>
  );
}
