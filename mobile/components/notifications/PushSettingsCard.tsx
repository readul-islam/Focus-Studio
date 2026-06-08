import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { SettingToggle } from '@/components/settings/SettingToggle';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { usePushNotificationsContext } from '@/context/PushNotificationsContext';

export function PushSettingsCard() {
  const { enabled, permissionGranted, isDevice, loading, enable, disable } = usePushNotificationsContext();

  const handleToggle = async (value: boolean) => {
    if (value) {
      const granted = await enable();
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications in system settings to receive alerts when you are assigned to tasks or projects.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }

    await disable();
  };

  let description = 'Alerts for task assignments, project updates, and mentions.';
  let statusLabel = 'Off';
  if (!isDevice) {
    description = 'Requires a physical device. In-app notifications still work in the simulator.';
    statusLabel = 'Simulator';
  } else if (enabled && permissionGranted) {
    statusLabel = 'On';
  } else if (enabled && !permissionGranted) {
    description = 'Permission denied — allow notifications in system settings.';
    statusLabel = 'Blocked';
  }

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Push notifications</Text>
        <Text style={[styles.status, statusLabel === 'On' && styles.statusOn]}>{statusLabel}</Text>
      </View>
      <SettingToggle
        label="Mobile alerts"
        description={description}
        value={enabled && (permissionGranted || !isDevice)}
        onValueChange={handleToggle}
        disabled={loading || !isDevice}
      />
      {!isDevice ? (
        <Text style={styles.hint}>Use a dev or preview build on a real device for full push delivery.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subheading,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusOn: {
    color: colors.success,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
