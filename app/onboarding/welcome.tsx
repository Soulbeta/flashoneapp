import React, { useState } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, H1, H2, Card, Progress } from '@tamagui/core';
import { ChevronRight, ChevronLeft, Brain, Target, Trophy, Globe } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeOutLeft, FadeInUp } from 'react-native-reanimated';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedCard = Animated.createAnimatedComponent(Card);

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Flash Anzan!',
    subtitle: 'Learn mental math the Japanese way',
    icon: '🧮',
    description: 'Flash Anzan is a traditional Japanese method that trains your brain to perform lightning-fast mental calculations using visualization techniques.',
    color: '$blue10'
  },
  {
    id: 'how-it-works',
    title: 'How Flash Anzan Works',
    subtitle: 'See numbers, visualize the abacus',
    icon: '⚡',
    description: 'Numbers flash on screen one by one. You visualize an abacus in your mind, moving the beads mentally as each number appears, then calculate the final answer.',
    color: '$green10'
  },
  {
    id: 'benefits',
    title: 'Amazing Benefits',
    subtitle: 'More than just math skills',
    icon: '🧠',
    description: 'Flash Anzan improves concentration, memory, visualization skills, and processing speed while building confidence in mathematics.',
    color: '$purple10'
  },
  {
    id: 'gamification',
    title: 'Make Learning Fun',
    subtitle: 'Earn rewards and unlock achievements',
    icon: '🎮',
    description: 'Travel the world, collect stars, unlock mathematician avatars, and compete with friends while mastering mental arithmetic!',
    color: '$orange10'
  }
];

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/onboarding/tutorial');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/setup');
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Progress Bar */}
      <YStack paddingTop="$8" paddingHorizontal="$4" paddingBottom="$4">
        <Progress value={progress} backgroundColor="$gray5" height={4}>
          <Progress.Indicator backgroundColor={step.color} />
        </Progress>
        <XStack justifyContent="space-between" marginTop="$2">
          <Text color="$gray10" fontSize="$2">
            Step {currentStep + 1} of {onboardingSteps.length}
          </Text>
          <Button
            size="$2"
            backgroundColor="transparent"
            color="$gray10"
            onPress={handleSkip}
          >
            Skip
          </Button>
        </XStack>
      </YStack>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} justifyContent="center" padding="$4" space="$6">
          {/* Content */}
          <AnimatedYStack entering={FadeInRight.delay(200)} key={step.id} alignItems="center" space="$4">
            <Text fontSize={80} textAlign="center">
              {step.icon}
            </Text>
            
            <H1 color={step.color} textAlign="center" fontSize="$7">
              {step.title}
            </H1>
            
            <H2 color="$gray10" textAlign="center" fontSize="$5" opacity={0.8}>
              {step.subtitle}
            </H2>
            
            <Text 
              color="$color" 
              textAlign="center" 
              fontSize="$4" 
              lineHeight="$6"
              maxWidth={width - 80}
            >
              {step.description}
            </Text>
          </AnimatedYStack>

          {/* Feature Cards */}
          {step.id === 'benefits' && (
            <AnimatedYStack entering={FadeInUp.delay(400)} space="$3">
              {[
                { icon: Brain, title: 'Enhanced Memory', desc: 'Strengthen visual and working memory' },
                { icon: Target, title: 'Better Focus', desc: 'Improve concentration and attention span' },
                { icon: Trophy, title: 'Math Confidence', desc: 'Build confidence in mathematical abilities' },
                { icon: Globe, title: 'Cultural Learning', desc: 'Experience traditional Japanese methodology' }
              ].map((benefit, index) => (
                <AnimatedCard 
                  key={benefit.title}
                  entering={FadeInUp.delay(500 + index * 100)}
                  padding="$3" 
                  backgroundColor="$gray1"
                >
                  <XStack space="$3" alignItems="center">
                    <benefit.icon color={step.color} size="$1.5" />
                    <YStack flex={1}>
                      <Text fontWeight="600" color="$color">{benefit.title}</Text>
                      <Text color="$gray10" fontSize="$3">{benefit.desc}</Text>
                    </YStack>
                  </XStack>
                </AnimatedCard>
              ))}
            </AnimatedYStack>
          )}
        </YStack>
      </ScrollView>

      {/* Navigation */}
      <XStack padding="$4" justifyContent="space-between" alignItems="center">
        <Button
          size="$4"
          backgroundColor={currentStep === 0 ? '$gray5' : '$gray10'}
          color="white"
          onPress={handlePrevious}
          disabled={currentStep === 0}
          icon={<ChevronLeft color="white" size="$1" />}
        >
          Back
        </Button>

        <XStack space="$2">
          {onboardingSteps.map((_, index) => (
            <Button
              key={index}
              circular
              size="$2"
              backgroundColor={index === currentStep ? step.color : '$gray5'}
              onPress={() => setCurrentStep(index)}
            />
          ))}
        </XStack>

        <Button
          size="$4"
          backgroundColor={step.color}
          color="white"
          onPress={handleNext}
          icon={<ChevronRight color="white" size="$1" />}
        >
          {currentStep === onboardingSteps.length - 1 ? 'Start Tutorial' : 'Next'}
        </Button>
      </XStack>
    </YStack>
  );
}