import React, { Component, ReactNode } from 'react';
import { YStack, Text, Button, Card } from '@tamagui/core';
import { AlertTriangle } from '@tamagui/lucide-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Here you would typically log to a crash reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center" padding="$4">
          <Card padding="$6" backgroundColor="$red2" borderColor="$red6" borderWidth={2}>
            <YStack alignItems="center" space="$4">
              <AlertTriangle color="$red10" size="$4" />
              <Text fontSize="$6" fontWeight="600" color="$red10" textAlign="center">
                Something went wrong
              </Text>
              <Text color="$gray10" textAlign="center" fontSize="$4">
                We're sorry, but there was an unexpected error. Please restart the app.
              </Text>
              <Button
                backgroundColor="$red10"
                color="white"
                onPress={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </YStack>
          </Card>
        </YStack>
      );
    }

    return this.props.children;
  }
}