import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { ReportMenuCard } from '@/components/reports/ReportMenuCard';
import { colors, spacing, typography } from '@/constants/theme';

const reports = [
  {
    key: 'overview',
    href: '/reports/overview' as Href,
    icon: 'grid-outline' as const,
    title: 'Overview',
    description: 'Revenue, hours logged, outstanding invoices, and studio health',
    accent: colors.success,
  },
  {
    key: 'projects',
    href: '/reports/projects' as Href,
    icon: 'folder-outline' as const,
    title: 'Projects',
    description: 'Time and cost by project with budget burn indicators',
    accent: colors.clay,
  },
  {
    key: 'team',
    href: '/reports/team' as Href,
    icon: 'people-outline' as const,
    title: 'Team',
    description: 'Hours logged per team member for the selected period',
    accent: colors.brand,
  },
  {
    key: 'finance',
    href: '/reports/finance' as Href,
    icon: 'wallet-outline' as const,
    title: 'Finance',
    description: 'Revenue, outstanding invoices, and billing status breakdown',
    accent: colors.primary,
  },
  {
    key: 'procurement',
    href: '/reports/procurement' as Href,
    icon: 'cube-outline' as const,
    title: 'Procurement',
    description: 'Spend, delivery status, and procurement items across projects',
    accent: colors.warning,
  },
];

export default function ReportsHubScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.intro}>
        Studio insights at a glance. Pull any report to refresh live data.
      </Text>
      {reports.map(report => (
        <ReportMenuCard
          key={report.key}
          icon={report.icon}
          title={report.title}
          description={report.description}
          accent={report.accent}
          onPress={() => router.push(report.href)}
        />
      ))}
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
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
});
