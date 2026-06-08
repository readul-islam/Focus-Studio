import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { colors } from '@/constants/theme';

/** Shared header options for screens outside the tab navigator. */
export const sharedStackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerBackTitle: 'Back',
  headerTitleAlign: 'center',
  headerRight: () => <StackHeaderActions />,
  contentStyle: { backgroundColor: colors.canvas },
};
