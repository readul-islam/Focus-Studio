import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatCatalogPrice, type CatalogProduct } from '@/lib/catalog';

type CatalogProductRowProps = {
  product: CatalogProduct;
  onPress: () => void;
};

export function CatalogProductRow({ product, onPress }: CatalogProductRowProps) {
  const tradePrice = formatCatalogPrice(product.trade_price, product.currency);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.thumbWrap}>
        {product.primary_image ? (
          <Image source={{ uri: product.primary_image }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="storefront-outline" size={20} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.supplier} numberOfLines={1}>
          {product.supplier_name}
        </Text>
        <View style={styles.metaRow}>
          {product.category ? <Text style={styles.meta}>{product.category}</Text> : null}
          {tradePrice ? <Text style={styles.price}>{tradePrice} trade</Text> : null}
        </View>
        {product.lead_time_days != null ? (
          <Text style={styles.leadTime}>{product.lead_time_days} day lead time</Text>
        ) : null}
      </View>

      <Ionicons name="add-circle-outline" size={22} color={colors.brand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 3,
  },
  title: {
    ...typography.subheading,
    fontSize: 15,
  },
  supplier: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
  leadTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
