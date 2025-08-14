import React, { useEffect } from 'react';
import { YStack, Text, Button, H1 } from '@tamagui/core';
import { router } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export default function OnboardingIndex() {
  const { game } = useSettings();

  useEffect(() => {
    if (game.tutorialCompleted) {
      router.replace('/(tabs)');
    }
  }, [game.tutorialCompleted]);

  return (
    <YStack flex={1} backgroundColor="$blue1" justifyContent="center" alignItems="center" padding="$4">
      <AnimatedYStack entering={FadeInUp.delay(200)} alignItems="center" space="$6">
        <Text fontSize={80}>🧮</Text>
        <H1 color="$blue10" textAlign="center" fontSize="$8">
          Flash Anzan
        </H1>
        <Text color="$blue10" textAlign="center" fontSize="$6" opacity={0.8}>
          Mental Arithmetic Trainer
        </Text>
        <Text color="$gray10" textAlign="center" fontSize="$4" maxWidth={300}>
          Master the ancient Japanese art of mental calculation using the abacus method
        </Text>
      </AnimatedYStack>

      <AnimatedYStack entering={FadeInDown.delay(600)} space="$4" width="100%" maxWidth={300} marginTop="$8">
        <Button
          size="$5"
          backgroundColor="$blue10"
          color="white"
          fontWeight="600"
          onPress={() => router.push('/onboarding/welcome')}
        >
          Get Started
        </Button>
        
        <Button
          size="$4"
          backgroundColor="transparent"
          color="$blue10"
          fontWeight="600"
          onPress={() => {
            router.replace('/(tabs)');
          }}
        >
          Continue as Guest
        </Button>
      </AnimatedYStack>
    </YStack>
  );
}