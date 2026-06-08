import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { routes } from '@/lib/routes';

type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accent?: boolean;
};

const actions: QuickAction[] = [
  { key: 'task', label: 'Task', icon: 'checkbox-outline', onPress: () => router.push(routes.taskNew), accent: true },
  { key: 'project', label: 'Project', icon: 'folder-outline', onPress: () => router.push(routes.projectNew), accent: true },
  { key: 'contact', label: 'Contact', icon: 'person-add-outline', onPress: () => router.push(routes.contactNew) },
  { key: 'calendar', label: 'Calendar', icon: 'calendar-outline', onPress: () => router.push('/calendar') },
  { key: 'inbox', label: 'Inbox', icon: 'mail-outline', onPress: () => router.push(routes.inbox) },
  { key: 'compose', label: 'Email', icon: 'create-outline', onPress: () => router.push(routes.inboxCompose) },
  { key: 'search', label: 'Search', icon: 'search-outline', onPress: () => router.push(routes.search) },
];

export function QuickActions() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Quick actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {actions.map(action => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.chip,
              action.accent && styles.chipAccent,
              pressed && styles.chipPressed,
            ]}
          >
            <Ionicons
              name={action.icon}
              size={18}
              color={action.accent ? colors.primaryForeground : colors.textSecondary}
            />
            <Text style={[styles.chipLabel, action.accent && styles.chipLabelAccent]}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  chipLabelAccent: {
    color: colors.primaryForeground,
  },
});
