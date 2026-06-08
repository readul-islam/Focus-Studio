import { BrandMark } from '@/components/brand/BrandMark';
import { Button, Input } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.requires2fa) {
        router.push({
          pathname: '/(auth)/verify-2fa',
          params: { email: result.email ?? email.trim() },
        });
        return;
      }
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <BrandMark style={styles.brandMark} />

            <View style={styles.intro}>
              <Text style={styles.title}>Sign in</Text>
              <Text style={styles.subtitle}>Welcome back — sign in to your studio</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Input
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                placeholder="you@studio.com"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                autoFocus
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
                leading={<Ionicons name="mail-outline" size={16} color={colors.textMuted} />}
                style={error ? styles.inputError : undefined}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <Input
                ref={passwordRef}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                placeholder="Enter your password"
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                leading={<Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />}
                style={error ? styles.inputError : undefined}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button label="Sign in" onPress={handleLogin} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  form: {
    maxWidth: 384,
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
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorBox: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 16,
  },
});
