import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CatalogProductRow } from '@/components/catalog/CatalogProductRow';
import { FilterChips, LoadingInline } from '@/components/design-system';
import { FinancePickerField } from '@/components/finance/FinancePickerField';
import { Button, EmptyState, Input } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import {
  addCatalogProductToProject,
  catalogCategories,
  fetchCatalogProducts,
  fetchProjectRooms,
  formatCatalogPrice,
  type CatalogProduct,
} from '@/lib/catalog';

export default function ProjectCatalogScreen() {
  const { projectId } = useProjectHub();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['supplier_portal/catalog/browse', search, category],
    queryFn: () =>
      fetchCatalogProducts({
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
      }),
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['projects/project-rooms', projectId],
    queryFn: () => fetchProjectRooms(projectId),
    enabled: Boolean(selectedProduct && projectId),
  });

  const categories = useMemo(() => catalogCategories(data ?? []), [data]);
  const categoryOptions = useMemo(
    () => [{ key: 'all', label: 'All' }, ...categories.map(value => ({ key: value, label: value }))],
    [categories],
  );

  const addMutation = useMutation({
    mutationFn: () =>
      addCatalogProductToProject({
        catalogProductId: selectedProduct!.id,
        projectId,
        quantity,
        roomId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects/project-procurements', projectId] });
      closeAddSheet();
      Alert.alert('Added to procurement', 'The catalog product was added to this project.', [
        { text: 'View procurement', onPress: () => router.replace(`/project/${projectId}/procurement`) },
        { text: 'Keep browsing', style: 'cancel' },
      ]);
    },
    onError: () => {
      Alert.alert('Could not add product', 'Please try again or use the web app.');
    },
  });

  const closeAddSheet = () => {
    setSelectedProduct(null);
    setRoomId(null);
    setQuantity(1);
  };

  const openProduct = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setRoomId(null);
    setQuantity(1);
  };

  if (isError) {
    return (
      <View style={styles.centered}>
        <EmptyState title="Couldn't load catalog" message="Pull down to try again." />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Browse catalog', headerBackTitle: 'Procurement' }} />

      <FlatList
        style={styles.list}
        contentContainerStyle={data?.length === 0 && !isLoading ? styles.emptyContainer : styles.content}
        data={data ?? []}
        keyExtractor={item => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              Verified supplier products you can add directly to project procurement.
            </Text>
            <Input value={search} onChangeText={setSearch} placeholder="Search products or suppliers…" />
            {categoryOptions.length > 1 ? (
              <FilterChips options={categoryOptions} value={category} onChange={setCategory} />
            ) : null}
            {isLoading && !data ? <LoadingInline /> : null}
          </View>
        }
        renderItem={({ item }) => <CatalogProductRow product={item} onPress={() => openProduct(item)} />}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              title={search || category !== 'all' ? 'No matching products' : 'No catalog products yet'}
              message={
                search || category !== 'all'
                  ? 'Try another search or category.'
                  : 'Verified suppliers will appear here once they publish products.'
              }
            />
          )
        }
      />

      <Modal visible={Boolean(selectedProduct)} animationType="slide" presentationStyle="pageSheet">
        {selectedProduct ? (
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={closeAddSheet} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
              <Text style={styles.sheetTitle}>Add to project</Text>
              <View style={styles.sheetHeaderSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.sheetBody}>
              {selectedProduct.primary_image ? (
                <Image source={{ uri: selectedProduct.primary_image }} style={styles.heroImage} resizeMode="cover" />
              ) : null}

              <Text style={styles.productName}>{selectedProduct.name}</Text>
              <Text style={styles.supplierName}>{selectedProduct.supplier_name}</Text>

              {selectedProduct.description ? (
                <Text style={styles.description}>{selectedProduct.description}</Text>
              ) : null}

              <View style={styles.priceRow}>
                {formatCatalogPrice(selectedProduct.trade_price, selectedProduct.currency) ? (
                  <Text style={styles.tradePrice}>
                    Trade {formatCatalogPrice(selectedProduct.trade_price, selectedProduct.currency)}
                  </Text>
                ) : null}
                {selectedProduct.dimension ? <Text style={styles.dimension}>{selectedProduct.dimension}</Text> : null}
              </View>

              <FinancePickerField
                label="Room"
                value={roomId}
                options={(rooms ?? []).map(room => ({ id: room.id, label: room.name }))}
                onChange={setRoomId}
                loading={roomsLoading}
                optional
              />

              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <Pressable
                    onPress={() => setQuantity(current => Math.max(1, current - 1))}
                    style={styles.quantityButton}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease quantity"
                  >
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </Pressable>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <Pressable
                    onPress={() => setQuantity(current => current + 1)}
                    style={styles.quantityButton}
                    accessibilityRole="button"
                    accessibilityLabel="Increase quantity"
                  >
                    <Ionicons name="add" size={18} color={colors.text} />
                  </Pressable>
                </View>
              </View>

              <Button
                label="Add to procurement"
                onPress={() => addMutation.mutate()}
                loading={addMutation.isPending}
              />
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.canvas,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    ...typography.subheading,
    fontSize: 16,
  },
  sheetHeaderSpacer: {
    width: 24,
  },
  sheetBody: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  productName: {
    ...typography.heading,
    fontSize: 20,
  },
  supplierName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  priceRow: {
    gap: 4,
  },
  tradePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
  dimension: {
    fontSize: 13,
    color: colors.textMuted,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    ...typography.label,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  quantityValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
