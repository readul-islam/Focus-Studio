import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { IntegrationStatus } from '@focuspilot/shared';
import { LoadingInline } from '@/components/design-system';
import { Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { api } from '@/lib/api';
import { openStudioWebPath, studioWebPath } from '@/lib/web';

async function fetchStatus(): Promise<IntegrationStatus> {
  const response = await api.get<IntegrationStatus>('/user/integration-status/');
  return response.data;
}

const integrations: {
  key: keyof IntegrationStatus;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  connectPath: string;
}[] = [
  {
    key: 'gmail_connected',
    label: 'Gmail',
    description: 'Sync email threads to your inbox',
    icon: 'mail-outline',
    connectPath: '/settings/studio/integrations',
  },
  {
    key: 'calendar_connected',
    label: 'Google Calendar',
    description: 'Show meetings on your calendar',
    icon: 'calendar-outline',
    connectPath: '/settings/studio/integrations',
  },
  {
    key: 'xero_connected',
    label: 'Xero',
    description: 'Accounting and finance sync',
    icon: 'cash-outline',
    connectPath: '/settings/studio/integrations',
  },
  {
    key: 'notion_connected',
    label: 'Notion',
    description: 'Sync tasks with Notion',
    icon: 'document-text-outline',
    connectPath: '/settings/studio/integrations',
  },
];

export default function IntegrationsSettingsScreen() {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['user/integration-status/'],
    queryFn: fetchStatus,
  });

  const openConnect = async (path: string) => {
    try {
      await openStudioWebPath(path);
    } catch {
      Alert.alert(
        'Open in browser',
        `Connect integrations in the Studio web app:\n\n${studioWebPath(path)}`,
      );
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Stack.Screen options={{ title: 'Integrations' }} />
      <Text style={styles.intro}>
        OAuth connections are completed in the Studio web app. Pull to refresh after connecting, then return here.
      </Text>

      <Button label="Open integrations in browser" onPress={() => openConnect('/settings/studio/integrations')} />

      {isLoading ? <LoadingInline /> : null}

      {integrations.map(item => {
        const connected = Boolean(data?.[item.key]);
        return (
          <View key={item.key} style={[styles.card, connected && styles.cardConnected]}>
            <View style={[styles.iconWrap, connected && styles.iconWrapConnected]}>
              <Ionicons name={item.icon} size={20} color={connected ? colors.success : colors.textMuted} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <View style={styles.cardActions}>
              <View style={[styles.badge, connected ? styles.badgeOn : styles.badgeOff]}>
                <Text style={[styles.badgeText, connected ? styles.badgeTextOn : styles.badgeTextOff]}>
                  {connected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
              {!connected ? (
                <Pressable onPress={() => openConnect(item.connectPath)} hitSlop={8}>
                  <Text style={styles.connectLink}>Connect</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}

      {data?.zapier_configured ? (
        <View style={[styles.card, styles.cardConnected]}>
          <View style={[styles.iconWrap, styles.iconWrapConnected]}>
            <Ionicons name="flash-outline" size={20} color={colors.success} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardLabel}>Zapier / API</Text>
            <Text style={styles.cardDescription}>Automation hooks configured for your studio</Text>
          </View>
          <View style={[styles.badge, styles.badgeOn]}>
            <Text style={[styles.badgeText, styles.badgeTextOn]}>Active</Text>
          </View>
        </View>
      ) : null}
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
    gap: spacing.sm,
  },
  intro: {
    ...typography.caption,
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardConnected: {
    borderColor: '#bbf7d0',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapConnected: {
    backgroundColor: '#ecfdf5',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardLabel: {
    ...typography.subheading,
    fontSize: 15,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOn: {
    backgroundColor: '#ecfdf5',
  },
  badgeOff: {
    backgroundColor: colors.surfaceElevated,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextOn: {
    color: colors.success,
  },
  badgeTextOff: {
    color: colors.textMuted,
  },
  connectLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
});
