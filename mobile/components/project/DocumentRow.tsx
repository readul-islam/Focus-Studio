import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProjectDocument } from '@focuspilot/shared';
import { colors, radius, spacing, typography } from '@/constants/theme';

function documentIcon(type: ProjectDocument['type']): keyof typeof Ionicons.glyphMap {
  if (type === 'FOLDER') return 'folder-outline';
  if (type === 'LINK') return 'link-outline';
  return 'document-outline';
}

export function DocumentRow({
  document,
  onPress,
}: {
  document: ProjectDocument;
  onPress: () => void;
}) {
  const isFolder = document.type === 'FOLDER';
  const meta = isFolder
    ? `${document.item_count ?? 0} item${document.item_count === 1 ? '' : 's'}`
    : document.type === 'LINK'
      ? 'Link'
      : 'File';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, isFolder && styles.iconFolder]}>
        <Ionicons name={documentIcon(document.type)} size={18} color={isFolder ? colors.clay : colors.textSecondary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {document.name}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Ionicons name={isFolder ? 'chevron-forward' : 'open-outline'} size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFolder: {
    backgroundColor: '#fff4ed',
  },
  body: {
    flex: 1,
  },
  name: {
    ...typography.subheading,
    fontSize: 15,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
