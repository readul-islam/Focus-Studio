import { Platform, StyleSheet, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { WorkspaceMenuTrigger } from '@/components/navigation/WorkspaceMenu';
import { ActiveTimerBar } from '@/components/time/ActiveTimerBar';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
      <View style={styles.shell}>
        <OfflineBanner />
        <Tabs
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
            headerTitleAlign: 'center',
            headerLeft: () => <WorkspaceMenuTrigger />,
            headerLeftContainerStyle: { paddingLeft: spacing.sm },
            headerShadowVisible: false,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: StyleSheet.hairlineWidth,
              height: Platform.OS === 'ios' ? 84 : 64,
              paddingTop: spacing.xs,
              paddingBottom: Platform.OS === 'ios' ? 24 : spacing.sm,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginTop: 2,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            sceneStyle: { backgroundColor: colors.canvas },
          }}
        >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'folder' : 'folder-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
        </Tabs>
        <ActiveTimerBar />
      </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
