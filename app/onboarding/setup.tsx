import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Card, H1, H2, Input, Switch, Select, Adapt, Sheet } from '@tamagui/core';
import { User, Settings, Volume2, VolumeX, Vibrate, Eye, ArrowRight, Check } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import { saveUserProfile } from '@/utils/storage';
import { UserProfile } from '@/types/game';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export default function SetupScreen() {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🔬');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [difficulty, setDifficulty] = useState('1');
  
  const { updateGame, updateAccessibility } = useSettings();

  const avatarOptions = [
    { emoji: '👨‍🔬', name: 'Scientist' },
    { emoji: '👩‍🔬', name: 'Researcher' },
    { emoji: '🧙‍♂️', name: 'Math Wizard' },
    { emoji: '👨‍🎓', name: 'Student' },
    { emoji: '👩‍🎓', name: 'Graduate' },
    { emoji: '🤖', name: 'Robot' }
  ];

  const difficultyOptions = [
    { value: '1', label: '1-digit (Beginner)' },
    { value: '2', label: '2-digit (Easy)' },
    { value: '3', label: '3-digit (Medium)' }
  ];

  const handleComplete = async () => {
    if (name.trim().length < 2) {
      alert('Please enter a name with at least 2 characters');
      return;
    }

    // Save user profile
    const profile: UserProfile = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      avatar: selectedAvatar,
      createdAt: new Date(),
      lastPlayed: new Date(),
      favoriteOperation: 'addition',
      totalPlayTime: 0
    };

    await saveUserProfile(profile);

    // Update settings
    await updateGame({
      soundEnabled,
      hapticFeedback: hapticEnabled,
      tutorialCompleted: true,
      guestMode: false
    });

    await updateAccessibility({
      highContrast,
      largeText: false,
      reduceMotion: false,
      screenReader: false
    });

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const handleGuestMode = async () => {
    await updateGame({
      soundEnabled: true,
      hapticFeedback: true,
      tutorialCompleted: true,
      guestMode: true
    });

    router.replace('/(tabs)');
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$4" paddingTop="$8">
        {/* Header */}
        <AnimatedYStack entering={FadeInDown.delay(100)} alignItems="center" space="$2">
          <H1 color="$purple10" textAlign="center">
            Let's Set You Up!
          </H1>
          <Text color="$gray10" textAlign="center" fontSize="$4">
            Customize your learning experience
          </Text>
        </AnimatedYStack>

        {/* Profile Setup */}
        <AnimatedCard entering={FadeInDown.delay(200)} padding="$4" backgroundColor="$background">
          <H2 color="$color" marginBottom="$3">👤 Your Profile</H2>
          <YStack space="$4">
            <YStack space="$2">
              <Text color="$gray10" fontSize="$3">Choose your avatar:</Text>
              <XStack space="$2" flexWrap="wrap">
                {avatarOptions.map((avatar) => (
                  <Button
                    key={avatar.emoji}
                    size="$4"
                    backgroundColor={selectedAvatar === avatar.emoji ? '$purple2' : '$gray1'}
                    borderColor={selectedAvatar === avatar.emoji ? '$purple6' : '$gray6'}
                    borderWidth={2}
                    onPress={() => setSelectedAvatar(avatar.emoji)}
                  >
                    <Text fontSize={24}>{avatar.emoji}</Text>
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack space="$2">
              <Text color="$gray10" fontSize="$3">What should we call you?</Text>
              <Input
                size="$4"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                maxLength={20}
              />
            </YStack>
          </YStack>
        </AnimatedCard>

        {/* Game Settings */}
        <AnimatedCard entering={FadeInDown.delay(300)} padding="$4" backgroundColor="$background">
          <H2 color="$color" marginBottom="$3">🎮 Game Preferences</H2>
          <YStack space="$4">
            <YStack space="$2">
              <Text color="$gray10" fontSize="$3">Starting difficulty:</Text>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <Select.Trigger width="100%" backgroundColor="$gray1">
                  <Select.Value placeholder="Choose difficulty" />
                </Select.Trigger>
                <Adapt when="sm">
                  <Sheet modal dismissOnSnapToBottom>
                    <Sheet.Frame>
                      <Sheet.ScrollView>
                        <Adapt.Contents />
                      </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay />
                  </Sheet>
                </Adapt>
                <Select.Content zIndex={200000}>
                  <Select.Viewport>
                    {difficultyOptions.map((option) => (
                      <Select.Item key={option.value} index={parseInt(option.value)} value={option.value}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select>
            </YStack>

            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                {soundEnabled ? <Volume2 color="$color" size="$1" /> : <VolumeX color="$gray8" size="$1" />}
                <Text color="$color">Sound Effects</Text>
              </XStack>
              <Switch
                size="$3"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              >
                <Switch.Thumb backgroundColor="white" />
              </Switch>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Vibrate color={hapticEnabled ? "$color" : "$gray8"} size="$1" />
                <Text color="$color">Haptic Feedback</Text>
              </XStack>
              <Switch
                size="$3"
                checked={hapticEnabled}
                onCheckedChange={setHapticEnabled}
              >
                <Switch.Thumb backgroundColor="white" />
              </Switch>
            </XStack>
          </YStack>
        </AnimatedCard>

        {/* Accessibility */}
        <AnimatedCard entering={FadeInDown.delay(400)} padding="$4" backgroundColor="$background">
          <H2 color="$color" marginBottom="$3">♿ Accessibility</H2>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" space="$2">
              <Eye color={highContrast ? "$color" : "$gray8"} size="$1" />
              <Text color="$color">High Contrast Mode</Text>
            </XStack>
            <Switch
              size="$3"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            >
              <Switch.Thumb backgroundColor="white" />
            </Switch>
          </XStack>
        </AnimatedCard>

        {/* Action Buttons */}
        <AnimatedYStack entering={FadeInDown.delay(500)} space="$3" marginTop="$4">
          <Button
            size="$5"
            backgroundColor="$purple10"
            color="white"
            fontWeight="600"
            onPress={handleComplete}
            icon={<Check color="white" size="$1.5" />}
            disabled={name.trim().length < 2}
          >
            Start Learning!
          </Button>
          
          <Button
            size="$4"
            backgroundColor="transparent"
            color="$gray10"
            fontWeight="600"
            onPress={handleGuestMode}
          >
            Continue as Guest
          </Button>
        </AnimatedYStack>

        {/* Info */}
        <Card padding="$3" backgroundColor="$blue2" marginBottom="$4">
          <Text color="$blue10" fontSize="$3" textAlign="center">
            💡 You can change these settings anytime in your profile
          </Text>
        </Card>
      </YStack>
    </YStack>
  );
}