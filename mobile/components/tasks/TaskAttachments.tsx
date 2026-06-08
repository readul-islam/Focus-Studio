import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TaskAttachment } from '@focuspilot/shared';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { uploadTaskAttachments, type UploadFile } from '@/lib/upload';
import { formatTimeAgo } from '@/lib/format';
import { api } from '@/lib/api';

const MAX_BYTES = 5 * 1024 * 1024;

async function fetchAttachments(taskId: number): Promise<TaskAttachment[]> {
  const response = await api.get<TaskAttachment[]>(`/task/tasks/${taskId}/attachments/`);
  return response.data;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({ taskId }: { taskId: number }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['task-attachments', taskId],
    queryFn: () => fetchAttachments(taskId),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) => api.delete(`/task/attachments/${attachmentId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      hapticSuccess();
    },
    onError: () => Alert.alert('Could not remove file', 'Please try again.'),
  });

  const uploadFiles = async (files: UploadFile[]) => {
    const oversized = files.find(file => {
      // Size unknown from picker sometimes — server will reject if too large
      return false;
    });
    if (oversized) return;

    setUploading(true);
    try {
      await uploadTaskAttachments(taskId, files);
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      hapticSuccess();
    } catch {
      Alert.alert('Upload failed', 'Files must be under 5MB and an allowed type.');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    hapticLight();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      Alert.alert('File too large', 'Maximum size is 5MB.');
      return;
    }
    const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
    await uploadFiles([
      {
        uri: asset.uri,
        name,
        type: asset.mimeType ?? 'image/jpeg',
      },
    ]);
  };

  const pickDocument = async () => {
    hapticLight();
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: true });
    if (result.canceled) return;
    const files: UploadFile[] = result.assets.map(asset => ({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'application/octet-stream',
    }));
    const tooLarge = result.assets.find(asset => asset.size && asset.size > MAX_BYTES);
    if (tooLarge) {
      Alert.alert('File too large', `${tooLarge.name} exceeds the 5MB limit.`);
      return;
    }
    await uploadFiles(files);
  };

  const openAttachment = (attachment: TaskAttachment) => {
    const url = attachment.file_url;
    if (!url) return;
    Linking.openURL(url).catch(() => Alert.alert('Could not open file'));
  };

  const confirmDelete = (attachment: TaskAttachment) => {
    Alert.alert('Remove attachment?', attachment.file_name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(attachment.id),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Attachments</Text>
        <View style={styles.actions}>
          <Pressable onPress={pickImage} style={styles.actionButton} disabled={uploading}>
            <Ionicons name="image-outline" size={18} color={colors.text} />
          </Pressable>
          <Pressable onPress={pickDocument} style={styles.actionButton} disabled={uploading}>
            <Ionicons name="attach-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {uploading || isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : null}

      {attachments.length === 0 && !isLoading ? (
        <Text style={styles.empty}>Add photos or documents from your device.</Text>
      ) : (
        attachments.map(attachment => (
          <Pressable
            key={attachment.id}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => openAttachment(attachment)}
            onLongPress={() => confirmDelete(attachment)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="document-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.fileName} numberOfLines={1}>
                {attachment.file_name}
              </Text>
              <Text style={styles.fileMeta}>
                {[formatFileSize(attachment.file_size), formatTimeAgo(attachment.created_at)]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.textMuted} />
          </Pressable>
        ))
      )}
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
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.label,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginVertical: spacing.sm,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  rowPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
