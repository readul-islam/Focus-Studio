import { Alert, FlatList, Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { ProjectDocument } from '@focuspilot/shared';
import { ErrorState } from '@/components/design-system';
import { DocumentRow } from '@/components/project/DocumentRow';
import { EmptyState } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { getMediaUrl } from '@/lib/media';
import { api } from '@/lib/api';

async function fetchRootDocuments(projectId: string): Promise<ProjectDocument[]> {
  const response = await api.get<ProjectDocument[]>('/documents/documents/root_documents/', {
    params: { project_id: projectId },
  });
  return response.data;
}

export default function ProjectFilesTab() {
  const { projectId } = useProjectHub();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['documents/root', projectId],
    queryFn: () => fetchRootDocuments(projectId),
    enabled: Boolean(projectId),
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

  const documents = data ?? [];

  if (isError) {
    return (
      <View style={styles.errorWrap}>
        <ErrorState title="Couldn't load files" onRetry={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={documents.length === 0 && !isLoading ? styles.emptyContainer : styles.content}
      data={documents}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <DocumentRow document={item} onPress={() => openDocument(item)} />}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      ListEmptyComponent={
        isLoading ? null : (
          <EmptyState
            title="No files yet"
            message="Folders and files uploaded to this project appear here."
          />
        )
      }
    />
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
    justifyContent: 'center',
    padding: spacing.md,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
});
