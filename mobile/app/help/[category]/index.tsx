import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { ListCard } from '@/components/design-system';
import { colors, spacing, typography } from '@/constants/theme';
import { getArticlesByCategory, getCategory } from '@/lib/help-content';

export default function HelpCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const categoryMeta = getCategory(String(category ?? ''));
  const articles = getArticlesByCategory(String(category ?? ''));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: categoryMeta?.name ?? 'Articles' }} />
      {categoryMeta ? <Text style={styles.intro}>{categoryMeta.description}</Text> : null}

      {articles.length === 0 ? (
        <Text style={styles.empty}>No articles in this category yet.</Text>
      ) : (
        articles.map(article => (
          <ListCard
            key={article.slug}
            title={article.title}
            subtitle={article.description}
            meta={`${article.readTime} min read`}
            onPress={() => router.push(`/help/${article.category}/${article.slug}` as Href)}
          />
        ))
      )}
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
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
