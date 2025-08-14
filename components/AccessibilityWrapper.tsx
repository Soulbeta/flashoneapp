import React from 'react';
import { YStack } from '@tamagui/core';
import { useSettings } from '@/contexts/SettingsContext';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AccessibilityWrapper({ 
  children, 
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  ...props 
}: AccessibilityWrapperProps) {
  const { accessibility } = useSettings();

  return (
    <YStack
      {...props}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={{
        ...(accessibility.highContrast && {
          borderWidth: 2,
          borderColor: '#000000',
        })
      }}
    >
      {children}
    </YStack>
  );
}