import { Alert, FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { ProjectDocument } from '@focuspilot/shared';
import { ErrorState } from '@/components/design-system';
import { DocumentRow } from '@/components/project/DocumentRow';
import { EmptyState } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { getMediaUrl } from '@/lib/media';
import { api } from '@/lib/api';

async function fetchFolderContent(folderId: string): Promise<ProjectDocument[]> {
  const response = await api.get<ProjectDocument[]>(`/documents/documents/${folderId}/folder_content/`);
  return response.data;
}

async function fetchFolderMeta(folderId: string): Promise<ProjectDocument> {
  const response = await api.get<ProjectDocument>(`/documents/documents/${folderId}/`);
  return response.data;
}

export default function ProjectFolderScreen() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { projectId } = useProjectHub();
  const id = String(folderId ?? '');

  const folderQuery = useQuery({
    queryKey: ['documents/folder-meta', id],
    queryFn: () => fetchFolderMeta(id),
    enabled: Boolean(id),
  });

  const contentQuery = useQuery({
    queryKey: ['documents/folder-content', id],
    queryFn: () => fetchFolderContent(id),
    enabled: Boolean(id),
  });

  const openDocument = async (document: ProjectDocument) => {
    if (document.type === 'FOLDER') {
      router.push(`/project/${projectId}/files/${document.id}` as Href);
      return;
    }

    const url = document.type === 'LINK' ? document.link_url : getMediaUrl(document.file);
    if (!url) {
      Alert.alert('Unavailable', 'This file does not have a downloadable link yet.');
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Cannot open', 'This file type cannot be opened on your device.');
      return;
    }
    await Linking.openURL(url);
  };

  const documents = contentQuery.data ?? [];
  const folderName = folderQuery.data?.name ?? 'Folder';

  if (contentQuery.isError) {
    return (
      <View style={styles.errorWrap}>
        <ErrorState title="Couldn't load folder" onRetry={() => contentQuery.refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: folderName }} />
      <Pressable style={styles.breadcrumb} onPress={() => router.push(`/project/${projectId}/files` as Href)}>
        <Ionicons name="folder-outline" size={16} color={colors.clay} />
        <Text style={styles.breadcrumbText}>All files</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
          {folderName}
        </Text>
      </Pressable>
      <FlatList
        style={styles.list}
        contentContainerStyle={documents.length === 0 && !contentQuery.isLoading ? styles.emptyContainer : styles.content}
        data={documents}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <DocumentRow document={item} onPress={() => openDocument(item)} />}
        refreshControl={
          <RefreshControl
            refreshing={contentQuery.isRefetching}
            onRefresh={() => contentQuery.refetch()}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          contentQuery.isLoading ? null : (
            <EmptyState title="Empty folder" message="This folder does not contain any files yet." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  breadcrumbCurrent: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  list: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
});
