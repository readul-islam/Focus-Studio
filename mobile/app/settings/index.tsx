import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { AvatarCircle, MenuRow, SectionHeader } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/lib/routes';

export default function SettingsHubScreen() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.first_name ?? user?.email ?? 'User';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <View style={styles.hero}>
        <AvatarCircle name={displayName} size={56} />
        <View style={styles.heroText}>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          {user?.studio?.name ? <Text style={styles.heroStudio}>{user.studio.name}</Text> : null}
        </View>
      </View>

      <SectionHeader title="Account" />
      <MenuRow icon="person-outline" label="Profile" value="Name & contact" onPress={() => router.push(routes.settingsProfile)} />
      <MenuRow icon="shield-checkmark-outline" label="Security" value="Password & 2FA" onPress={() => router.push(routes.settingsSecurity)} />
      <MenuRow
        icon="notifications-outline"
        label="Notifications"
        value="Push & email"
        onPress={() => router.push(routes.settingsNotificationPrefs)}
      />
      <MenuRow icon="help-circle-outline" label="Help center" onPress={() => router.push(routes.help)} />

      <SectionHeader title="Connections" />
      <MenuRow icon="link-outline" label="Integrations" value="Gmail, Xero…" onPress={() => router.push(routes.settingsIntegrations)} />

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Studio branding, team roles, and advanced settings are available on the web app.
        </Text>
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroText: {
    flex: 1,
  },
  heroName: {
    ...typography.heading,
    fontSize: 20,
  },
  heroEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  heroStudio: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  note: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
  },
  noteText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
