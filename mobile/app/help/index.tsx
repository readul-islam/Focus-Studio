import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  articlePath,
  getPopularArticles,
  HELP_CATEGORIES,
  searchHelpArticles,
} from '@/lib/help-content';

export default function HelpCenterScreen() {
  const [search, setSearch] = useState('');
  const popular = useMemo(() => getPopularArticles(), []);
  const results = useMemo(() => searchHelpArticles(search), [search]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.intro}>Guides for projects, CRM, finance, and the mobile app.</Text>

      <Input
        value={search}
        onChangeText={setSearch}
        placeholder="Search help articles…"
        leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
      />

      {results.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search results</Text>
          {results.map(article => (
            <Pressable
              key={`${article.category}-${article.slug}`}
              onPress={() => router.push(articlePath(article.category, article.slug) as Href)}
              style={({ pressed }) => [styles.articleRow, pressed && styles.rowPressed]}
            >
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleDescription} numberOfLines={2}>
                {article.description}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push('/help/support' as Href)}
        style={({ pressed }) => [styles.supportCard, pressed && styles.rowPressed]}
      >
        <View style={styles.supportIcon}>
          <Ionicons name="chatbubbles-outline" size={22} color={colors.brand} />
        </View>
        <View style={styles.supportBody}>
          <Text style={styles.supportTitle}>Ask AI support</Text>
          <Text style={styles.supportDescription}>Get instant answers about Focuspilot features</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <Text style={styles.sectionTitle}>Popular articles</Text>
      {popular.map(article => (
        <Pressable
          key={`${article.category}-${article.slug}`}
          onPress={() => router.push(articlePath(article.category, article.slug) as Href)}
          style={({ pressed }) => [styles.articleRow, pressed && styles.rowPressed]}
        >
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleMeta}>{article.readTime} min read</Text>
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>Browse by topic</Text>
      {HELP_CATEGORIES.map(category => (
        <Pressable
          key={category.slug}
          onPress={() => router.push(`/help/${category.slug}` as Href)}
          style={({ pressed }) => [styles.categoryRow, pressed && styles.rowPressed]}
        >
          <View style={styles.categoryIcon}>
            <Ionicons name={category.icon} size={20} color={colors.brand} />
          </View>
          <View style={styles.categoryBody}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {category.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}

      <Text style={styles.footer}>Need more help? Email support@focuspilot.io</Text>
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
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 17,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportBody: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  supportDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  articleRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  articleDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  articleMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBody: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  categoryDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
