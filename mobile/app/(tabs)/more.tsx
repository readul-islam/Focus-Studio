import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  AvatarCircle,
  MenuRow,
  ScreenCanvas,
  SectionHeader,
} from '@/components/design-system';
import { Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { routes } from '@/lib/routes';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const displayName = user?.name ?? user?.first_name ?? user?.email ?? 'User';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenCanvas edges={[]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          style={({ pressed }) => [styles.profileCard, pressed && styles.profileCardPressed]}
          onPress={() => router.push(routes.settings)}
        >
          <AvatarCircle name={displayName} size={52} />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.studio?.name ? <Text style={styles.profileStudio}>{user.studio.name}</Text> : null}
          </View>
          <Text style={styles.profileChevron}>›</Text>
        </Pressable>

        <SectionHeader title="Account" />
        <MenuRow icon="person-outline" label="Profile" onPress={() => router.push(routes.settingsProfile)} />
        <MenuRow icon="shield-checkmark-outline" label="Security" onPress={() => router.push(routes.settingsSecurity)} />
        <MenuRow
          icon="notifications-outline"
          label="Notifications"
          value={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          onPress={() => router.push(routes.notifications)}
        />
        <MenuRow
          icon="options-outline"
          label="Notification preferences"
          onPress={() => router.push(routes.settingsNotificationPrefs)}
        />
        <MenuRow icon="link-outline" label="Integrations" onPress={() => router.push(routes.settingsIntegrations)} />

        <SectionHeader title="Support" />
        <MenuRow icon="help-circle-outline" label="Help center" onPress={() => router.push(routes.help)} />

        <View style={styles.footer}>
          <Text style={styles.version}>Focuspilot Mobile · v0.1.0</Text>
          <Button label="Sign out" onPress={handleLogout} variant="danger" />
        </View>
      </ScrollView>
    </ScreenCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
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
  profileCardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  profileChevron: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '300',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    ...typography.subheading,
    fontSize: 17,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileStudio: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
});
