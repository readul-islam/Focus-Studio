import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';

type CrmTab = 'contacts' | 'pipeline';

const tabs: { key: CrmTab; label: string; icon: keyof typeof Ionicons.glyphMap; href: Href }[] = [
  { key: 'contacts', label: 'Contacts', icon: 'people-outline', href: '/contacts' as Href },
  { key: 'pipeline', label: 'Pipeline', icon: 'funnel-outline', href: '/contacts/pipeline' as Href },
];

function getActiveTab(pathname: string): CrmTab {
  if (pathname.startsWith('/contacts/pipeline')) return 'pipeline';
  return 'contacts';
}

export function CrmHubTabs() {
  const pathname = usePathname();
  const active = getActiveTab(pathname);

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {tabs.map(tab => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.push(tab.href)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  row: {
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
