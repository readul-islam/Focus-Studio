import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { BrandMark } from '@/components/brand/BrandMark';
import { Button, Input, Screen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function Verify2FAScreen() {
  const { verify2fa } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      setError('Missing email. Go back and sign in again.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verify2fa(String(email), code.trim());
      router.replace('/(tabs)');
    } catch {
      setError('Invalid code. Try your authenticator app or a backup code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.form}>
            <BrandMark style={styles.brandMark} />

            <View style={styles.intro}>
              <Text style={styles.title}>Two-factor authentication</Text>
              <Text style={styles.subtitle}>Enter the 6-digit code for {email}</Text>
            </View>

            <Input
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={8}
              autoComplete="one-time-code"
              returnKeyType="done"
              onSubmitEditing={handleVerify}
              style={{ marginBottom: spacing.md }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Verify" onPress={handleVerify} loading={loading} disabled={!code.trim()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  form: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  brandMark: {
    marginBottom: 40,
  },
  intro: {
    marginBottom: 32,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
