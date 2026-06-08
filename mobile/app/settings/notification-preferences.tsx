import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NotificationPreferences } from '@focuspilot/shared';
import { PushSettingsCard } from '@/components/notifications/PushSettingsCard';
import { SettingToggle } from '@/components/settings/SettingToggle';
import { Button, LoadingScreen } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { api } from '@/lib/api';

const PREF_ITEMS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: 'project_updates',
    label: 'Project updates',
    description: 'Emails when projects you follow have important changes.',
  },
  {
    key: 'comments',
    label: 'Comments & mentions',
    description: 'When someone mentions you or replies to your comments.',
  },
  {
    key: 'reminders',
    label: 'Reminders',
    description: 'Due dates, overdue tasks, and scheduled reminders.',
  },
  {
    key: 'marketing_emails',
    label: 'Product updates',
    description: 'Occasional news about Focuspilot features.',
  },
];

async function fetchPrefs(): Promise<NotificationPreferences> {
  const response = await api.get<NotificationPreferences>('/user/self/notification-preferences/');
  return response.data;
}

export default function NotificationPreferencesScreen() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    project_updates: true,
    comments: true,
    reminders: true,
    marketing_emails: true,
  });

  const query = useQuery({
    queryKey: ['user/self/notification-preferences/'],
    queryFn: fetchPrefs,
  });

  useEffect(() => {
    if (query.data) setPrefs(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch('/user/self/notification-preferences/', prefs);
      return response.data;
    },
    onSuccess: () => {
      Alert.alert('Saved', 'Your email preferences have been updated.');
    },
    onError: () => {
      Alert.alert('Could not save', 'Please try again.');
    },
  });

  if (query.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <PushSettingsCard />

      <Text style={styles.sectionTitle}>Email preferences</Text>
      <Text style={styles.intro}>
        Choose which emails Focuspilot sends you. In-app alerts appear in the notification bell.
      </Text>

      {PREF_ITEMS.map(item => (
        <SettingToggle
          key={item.key}
          label={item.label}
          description={item.description}
          value={prefs[item.key]}
          onValueChange={value => setPrefs(prev => ({ ...prev, [item.key]: value }))}
        />
      ))}

      <View style={styles.footer}>
        <Button label="Save preferences" onPress={() => mutation.mutate()} loading={mutation.isPending} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 17,
    marginBottom: spacing.xs,
  },
  intro: {
    ...typography.caption,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  footer: {
    marginTop: spacing.md,
  },
});
