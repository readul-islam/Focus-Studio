import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/constants/theme';
import { routes } from '@/lib/routes';

export function HeaderSearchButton() {
  return (
    <Pressable
      onPress={() => router.push(routes.search)}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      hitSlop={8}
      accessibilityLabel="Search"
    >
      <Ionicons name="search-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

export function HeaderCreateContactButton() {
  return (
    <Pressable
      onPress={() => router.push(routes.contactNew)}
      style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
      hitSlop={8}
      accessibilityLabel="Create contact"
    >
      <Ionicons name="add" size={22} color={colors.primaryForeground} />
    </Pressable>
  );
}

export function HeaderCreateProjectButton() {
  return (
    <Pressable
      onPress={() => router.push(routes.projectNew)}
      style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
      hitSlop={8}
      accessibilityLabel="Create project"
    >
      <Ionicons name="add" size={22} color={colors.primaryForeground} />
    </Pressable>
  );
}

export function HeaderCreateTaskButton({ projectId }: { projectId?: number }) {
  return (
    <Pressable
      onPress={() =>
        router.push(projectId ? routes.taskNewForProject(projectId) : routes.taskNew)
      }
      style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
      hitSlop={8}
      accessibilityLabel="Create task"
    >
      <Ionicons name="add" size={22} color={colors.primaryForeground} />
    </Pressable>
  );
}

export function HeaderActions({
  showCreate = false,
  showCreateProject = false,
  showCreateContact = false,
  projectId,
}: {
  showCreate?: boolean;
  showCreateProject?: boolean;
  showCreateContact?: boolean;
  projectId?: number;
}) {
  return (
    <View style={styles.row}>
      <HeaderSearchButton />
      {showCreateContact ? <HeaderCreateContactButton /> : null}
      {showCreateProject ? <HeaderCreateProjectButton /> : null}
      {showCreate ? <HeaderCreateTaskButton projectId={projectId} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
