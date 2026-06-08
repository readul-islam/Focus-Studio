import { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TwoFactorStatus } from '@focuspilot/shared';
import { Button, Input } from '@/components/ui';
import { PasswordField } from '@/components/settings/PasswordField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticSuccess } from '@/lib/haptics';
import {
  confirmTwoFactor,
  disableTwoFactor,
  fetchTwoFactorStatus,
  setupTwoFactor,
} from '@/lib/two-factor';

type SetupState = {
  secret: string;
  provisioningUri: string;
};

export function TwoFactorPanel() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  const statusQuery = useQuery<TwoFactorStatus>({
    queryKey: ['user/2fa/status/'],
    queryFn: fetchTwoFactorStatus,
  });

  const isEnabled = statusQuery.data?.is_enabled ?? false;

  const setupMutation = useMutation({
    mutationFn: setupTwoFactor,
    onSuccess: data => {
      setSetup({ secret: data.secret, provisioningUri: data.provisioning_uri });
      setConfirmCode('');
      setBackupCodes(null);
    },
    onError: error => Alert.alert('Could not start setup', getApiErrorMessage(error)),
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmTwoFactor(confirmCode.trim()),
    onSuccess: async result => {
      setBackupCodes(result.backup_codes);
      setSetup(null);
      setConfirmCode('');
      hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['user/2fa/status/'] });
      await refreshUser();
    },
    onError: error => Alert.alert('Invalid code', getApiErrorMessage(error)),
  });

  const disableMutation = useMutation({
    mutationFn: () => disableTwoFactor(disablePassword, disableCode.trim()),
    onSuccess: async () => {
      setShowDisable(false);
      setDisablePassword('');
      setDisableCode('');
      hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['user/2fa/status/'] });
      await refreshUser();
      Alert.alert('2FA disabled', 'Two-factor authentication has been turned off.');
    },
    onError: error => Alert.alert('Could not disable 2FA', getApiErrorMessage(error)),
  });

  const openAuthenticator = async () => {
    if (!setup?.provisioningUri) return;
    try {
      const canOpen = await Linking.canOpenURL(setup.provisioningUri);
      if (canOpen) {
        await Linking.openURL(setup.provisioningUri);
      } else {
        Alert.alert('Manual setup', `Enter this secret in your authenticator app:\n\n${setup.secret}`);
      }
    } catch {
      Alert.alert('Manual setup', `Enter this secret in your authenticator app:\n\n${setup.secret}`);
    }
  };

  return (
    <View>
      <View style={[styles.statusCard, isEnabled && styles.statusCardEnabled]}>
        <View style={styles.statusIcon}>
          <Ionicons
            name={isEnabled ? 'shield-checkmark' : 'shield-outline'}
            size={22}
            color={isEnabled ? colors.success : colors.textMuted}
          />
        </View>
        <View style={styles.statusBody}>
          <Text style={styles.statusLabel}>{isEnabled ? '2FA is enabled' : '2FA is not enabled'}</Text>
          <Text style={styles.statusHint}>
            {isEnabled
              ? `${statusQuery.data?.backup_codes_remaining ?? 0} backup codes remaining`
              : 'Protect your account with an authenticator app'}
          </Text>
        </View>
      </View>

      {backupCodes ? (
        <View style={styles.backupCard}>
          <Text style={styles.backupTitle}>Save your backup codes</Text>
          <Text style={styles.backupHint}>
            Store these somewhere safe. Each code works once if you lose your authenticator.
          </Text>
          <ScrollView style={styles.backupList} nestedScrollEnabled>
            {backupCodes.map(code => (
              <Text key={code} style={styles.backupCode}>
                {code}
              </Text>
            ))}
          </ScrollView>
          <Button label="Done" onPress={() => setBackupCodes(null)} />
        </View>
      ) : null}

      {setup ? (
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Add to authenticator</Text>
          <Text style={styles.setupHint}>
            Open your authenticator app and add this account, then enter the 6-digit code below.
          </Text>
          <Text style={styles.secret} selectable>
            {setup.secret}
          </Text>
          <Button label="Open authenticator app" variant="secondary" onPress={() => void openAuthenticator()} />
          <Input
            value={confirmCode}
            onChangeText={setConfirmCode}
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={8}
          />
          <Button
            label="Confirm & enable"
            onPress={() => confirmMutation.mutate()}
            loading={confirmMutation.isPending}
            disabled={confirmCode.trim().length < 6}
          />
          <Button label="Cancel" variant="secondary" onPress={() => setSetup(null)} />
        </View>
      ) : null}

      {!isEnabled && !setup && !backupCodes ? (
        <Button
          label="Set up two-factor authentication"
          onPress={() => setupMutation.mutate()}
          loading={setupMutation.isPending}
        />
      ) : null}

      {isEnabled && !showDisable && !backupCodes ? (
        <Button label="Disable two-factor authentication" variant="secondary" onPress={() => setShowDisable(true)} />
      ) : null}

      {showDisable ? (
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Disable 2FA</Text>
          <Text style={styles.setupHint}>Enter your password and a current authenticator or backup code.</Text>
          <PasswordField label="Password" value={disablePassword} onChangeText={setDisablePassword} />
          <Input
            value={disableCode}
            onChangeText={setDisableCode}
            placeholder="Authenticator or backup code"
            keyboardType="number-pad"
          />
          <Button
            label="Disable 2FA"
            variant="danger"
            onPress={() => disableMutation.mutate()}
            loading={disableMutation.isPending}
          />
          <Button label="Cancel" variant="secondary" onPress={() => setShowDisable(false)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
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
  statusCardEnabled: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBody: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  statusHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  setupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  setupTitle: {
    ...typography.subheading,
  },
  setupHint: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  secret: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radius.md,
    textAlign: 'center',
  },
  backupCard: {
    backgroundColor: '#fffbeb',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  backupHint: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  backupList: {
    maxHeight: 160,
  },
  backupCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: colors.text,
    paddingVertical: 4,
  },
});
