import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaySupplierButton } from '@/components/catalog/PaySupplierButton';
import { StatusBadge } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  isCatalogProcurement,
  procurementEtaLabel,
  procurementLineTotal,
  procurementProductImageUrl,
  procurementProductName,
  procurementStatusStyle,
  procurementSupplierName,
  type ProcurementItem,
} from '@/lib/procurement';
import { formatCurrency } from '@/lib/format';

type ProcurementItemRowProps = {
  item: ProcurementItem;
  projectId: string;
  currency?: string | null;
  onPress?: () => void;
};

export function ProcurementItemRow({ item, projectId, currency, onPress }: ProcurementItemRowProps) {
  const imageUrl = procurementProductImageUrl(item);
  const statusStyle = procurementStatusStyle(item.status);
  const lineTotal = procurementLineTotal(item);
  const meta = procurementEtaLabel(item);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.cardPressed]}
    >
      <View style={styles.thumbWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="cube-outline" size={20} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {procurementProductName(item)}
            </Text>
            {isCatalogProcurement(item) ? (
              <View style={styles.catalogBadge}>
                <Text style={styles.catalogBadgeText}>Catalog</Text>
              </View>
            ) : null}
          </View>
          <StatusBadge label={statusStyle.label} color={statusStyle.color} backgroundColor={statusStyle.backgroundColor} />
        </View>

        <Text style={styles.supplier} numberOfLines={1}>
          {procurementSupplierName(item)}
        </Text>

        {isCatalogProcurement(item) ? <PaySupplierButton item={item} projectId={projectId} /> : null}

        <View style={styles.metaRow}>
          {item.room?.name ? <Text style={styles.meta}>{item.room.name}</Text> : null}
          {item.quantity != null ? (
            <Text style={styles.meta}>
              Qty {item.quantity}
              {lineTotal != null ? ` · ${formatCurrency(lineTotal, currency ?? 'GBP')}` : ''}
            </Text>
          ) : null}
        </View>

        {meta ? <Text style={styles.eta}>{meta}</Text> : null}

        {item.display_po || item.display_invoice ? (
          <View style={styles.linksRow}>
            {item.display_po ? <Text style={styles.linkText}>{item.display_po}</Text> : null}
            {item.display_invoice ? <Text style={styles.linkText}>{item.display_invoice}</Text> : null}
          </View>
        ) : null}
      </View>

      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.subheading,
    fontSize: 15,
  },
  catalogBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: '#EFF6FF',
  },
  catalogBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  supplier: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaRow: {
    gap: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  eta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand,
  },
});
