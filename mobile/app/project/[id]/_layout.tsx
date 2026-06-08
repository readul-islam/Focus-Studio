import { Slot, Stack, useLocalSearchParams, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectHubHeader } from '@/components/project/ProjectHubHeader';
import { ProjectHubTabs, useHideProjectHubChrome } from '@/components/project/ProjectHubTabs';
import { ErrorState, LoadingInline, ScreenCanvas } from '@/components/design-system';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { ProjectHubProvider, useProjectHub } from '@/context/ProjectHubContext';
import { colors } from '@/constants/theme';

function ProjectHubShell() {
  const hideChrome = useHideProjectHubChrome();
  const { hubProject, isLoading, isError, refetch, projectName, projectId } = useProjectHub();

  if (isLoading && !hubProject) {
    return (
      <ScreenCanvas>
        <LoadingInline />
      </ScreenCanvas>
    );
  }

  if (isError && !hubProject) {
    return (
      <ScreenCanvas>
        <ErrorState title="Couldn't load project" onRetry={refetch} />
      </ScreenCanvas>
    );
  }

  return (
    <View style={styles.shell}>
      <Stack.Screen
        options={{
          title: projectName,
          headerLargeTitle: false,
          headerRight: () => (
            <StackHeaderActions>
              <Pressable
                onPress={() => router.push(`/project/${projectId}/edit`)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Edit project"
                style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
              >
                <Ionicons name="create-outline" size={22} color={colors.text} />
              </Pressable>
            </StackHeaderActions>
          ),
        }}
      />
      {!hideChrome ? (
        <View style={styles.chrome}>
          <ProjectHubHeader />
          <ProjectHubTabs projectId={projectId} />
        </View>
      ) : null}
      <Slot />
    </View>
  );
}

export default function ProjectHubLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ProjectHubProvider projectId={String(id ?? '')}>
      <ProjectHubShell />
    </ProjectHubProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  chrome: {
    backgroundColor: colors.canvas,
  },
  editButton: {
    padding: 4,
    borderRadius: 8,
  },
  editButtonPressed: {
    opacity: 0.6,
  },
});
