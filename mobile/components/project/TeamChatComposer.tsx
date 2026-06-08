import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextArea } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticSuccess } from '@/lib/haptics';

type TeamChatComposerProps = {
  onSend: (content: string) => Promise<void>;
  sending?: boolean;
};

export function TeamChatComposer({ onSend, sending }: TeamChatComposerProps) {
  const [draft, setDraft] = useState('');

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    try {
      await onSend(content);
      setDraft('');
      hapticSuccess();
    } catch (error) {
      Alert.alert('Could not send message', getApiErrorMessage(error));
    }
  };

  return (
    <View style={styles.wrap}>
      <TextArea
        value={draft}
        onChangeText={setDraft}
        placeholder="Message the team…"
        style={styles.input}
        editable={!sending}
      />
      <Pressable
        onPress={() => void handleSend()}
        disabled={!draft.trim() || sending}
        style={({ pressed }) => [
          styles.sendButton,
          (!draft.trim() || sending) && styles.sendButtonDisabled,
          pressed && draft.trim() && !sending && styles.sendButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Send team message"
      >
        {sending ? (
          <ActivityIndicator color={colors.primaryForeground} size="small" />
        ) : (
          <Ionicons name="send" size={18} color={colors.primaryForeground} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
