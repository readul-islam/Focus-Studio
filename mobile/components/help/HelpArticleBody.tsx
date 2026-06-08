import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

function parseBlocks(content: string): { type: 'h2' | 'h3' | 'p' | 'li'; text: string }[] {
  const lines = content.split('\n');
  const blocks: { type: 'h2' | 'h3' | 'p' | 'li'; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('- ')) {
      blocks.push({ type: 'li', text: trimmed.slice(2) });
    } else {
      blocks.push({ type: 'p', text: trimmed });
    }
  }

  return blocks;
}

export function HelpArticleBody({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <View style={styles.wrap}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h2':
            return (
              <Text key={index} style={styles.h2}>
                {block.text}
              </Text>
            );
          case 'h3':
            return (
              <Text key={index} style={styles.h3}>
                {block.text}
              </Text>
            );
          case 'li':
            return (
              <View key={index} style={styles.liRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.li}>{block.text}</Text>
              </View>
            );
          default:
            return (
              <Text key={index} style={styles.p}>
                {block.text}
              </Text>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  h2: {
    ...typography.subheading,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  p: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  liRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  bullet: {
    fontSize: 15,
    color: colors.brand,
    lineHeight: 23,
  },
  li: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
});
