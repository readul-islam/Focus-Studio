import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';

type HubTab = 'overview' | 'tasks' | 'messages' | 'team' | 'procurement' | 'finance' | 'files';

const tabs: { key: HubTab; label: string; icon: keyof typeof Ionicons.glyphMap; segment: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline', segment: '' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline', segment: 'tasks' },
  { key: 'messages', label: 'Email', icon: 'mail-outline', segment: 'messages' },
  { key: 'team', label: 'Team', icon: 'people-outline', segment: 'team' },
  { key: 'procurement', label: 'Procurement', icon: 'cart-outline', segment: 'procurement' },
  { key: 'finance', label: 'Finance', icon: 'cash-outline', segment: 'finance' },
  { key: 'files', label: 'Files', icon: 'folder-outline', segment: 'files' },
];

function getActiveTab(pathname: string, projectId: string): HubTab {
  const base = `/project/${projectId}`;
  if (pathname.startsWith(`${base}/tasks`)) return 'tasks';
  if (pathname.startsWith(`${base}/messages`)) return 'messages';
  if (pathname.startsWith(`${base}/team`)) return 'team';
  if (pathname.startsWith(`${base}/procurement`)) return 'procurement';
  if (pathname.startsWith(`${base}/finance`)) return 'finance';
  if (pathname.startsWith(`${base}/files`)) return 'files';
  return 'overview';
}

export function ProjectHubTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const active = getActiveTab(pathname, projectId);

  const navigate = (segment: string) => {
    const href = (segment ? `/project/${projectId}/${segment}` : `/project/${projectId}`) as Href;
    router.push(href);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.container}
    >
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => navigate(tab.segment)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Ionicons
              name={tab.icon}
              size={15}
              color={isActive ? colors.primaryForeground : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function useHideProjectHubChrome(): boolean {
  const pathname = usePathname();
  return (
    /\/messages\/[^/]+$/.test(pathname) ||
    /\/files\/\d+$/.test(pathname) ||
    /\/catalog$/.test(pathname) ||
    /\/edit$/.test(pathname)
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primaryForeground,
  },
});
