import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { HelpArticleBody } from '@/components/help/HelpArticleBody';
import { ListCard, SectionHeader } from '@/components/design-system';
import { colors, spacing, typography } from '@/constants/theme';
import { articlePath, findArticleBySlug, getArticle } from '@/lib/help-content';

export default function HelpArticleScreen() {
  const { category, slug } = useLocalSearchParams<{ category: string; slug: string }>();
  const article = getArticle(String(category ?? ''), String(slug ?? ''));

  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>Article not found.</Text>
      </View>
    );
  }

  const related = (article.related ?? []).map(relatedSlug => findArticleBySlug(relatedSlug)).filter(Boolean);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: article.title }} />
      <Text style={styles.description}>{article.description}</Text>
      <Text style={styles.meta}>{article.readTime} min read</Text>

      <HelpArticleBody content={article.content} />

      {related.length > 0 ? (
        <>
          <SectionHeader title="Related" />
          {related.map(item => (
            item ? (
              <ListCard
                key={item.slug}
                title={item.title}
                subtitle={item.description}
                onPress={() => router.push(articlePath(item.category, item.slug) as Href)}
              />
            ) : null
          ))}
        </>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: {
    color: colors.textMuted,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
