import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { WorkspaceMenuTrigger } from '@/components/navigation/WorkspaceMenu';

/** Header right actions for stack screens — always includes the workspace menu. */
export function StackHeaderActions({ children }: { children?: ReactNode }) {
  return (
    <View style={styles.row}>
      {children}
      <WorkspaceMenuTrigger />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginRight: 4,
  },
});
