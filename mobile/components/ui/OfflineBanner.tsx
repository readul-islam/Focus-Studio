import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="text" accessibilityLabel="You are offline. Showing saved data.">
      <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
      <Text style={styles.text}>Offline — showing saved data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: '#fffbeb',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#fde68a',
  },
  text: {
    ...typography.caption,
    color: '#92400e',
    fontWeight: '600',
  },
});
