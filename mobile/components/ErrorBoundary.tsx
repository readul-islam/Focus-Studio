import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  children: ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container} accessibilityRole="alert">
        <Ionicons name="warning-outline" size={40} color={colors.danger} />
        <Text style={styles.title}>{this.props.title ?? 'Something went wrong'}</Text>
        <Text style={styles.message}>
          The app hit an unexpected error. Try again — your data is still saved on the server.
        </Text>
        <Button label="Try again" onPress={this.handleReset} accessibilityLabel="Try again after error" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.canvas,
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  message: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
});
