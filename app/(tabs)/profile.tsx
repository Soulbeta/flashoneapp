import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { YStack, XStack, Text, Card, H1, H3, Button, Input, Avatar, Sheet } from '@tamagui/core';
import { User, Settings, Trophy, Target, Calendar, Edit, Save, X } from '@tamagui/lucide-icons';
import { GameStats, UserProfile } from '@/types/game';
import { loadGameStats, loadUserProfile, saveUserProfile, clearAllData } from '@/utils/storage';
import { getAvailableAvatars, MATHEMATICIAN_AVATARS } from '@/utils/avatars';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export default function ProfileScreen() {
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    coins: 100,
    level: 1,
    experience: 0,
    starsEarned: 0,
  });

  const [profile, setProfile] = useState<UserProfile>({
    id: 'user1',
    name: 'Young Mathematician',
    avatar: '👨‍🔬',
    createdAt: new Date(),
    lastPlayed: new Date(),
    favoriteOperation: 'addition',
    totalPlayTime: 0,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState(getAvailableAvatars(0));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedStats = await loadGameStats();
    const loadedProfile = await loadUserProfile();
    
    if (loadedStats) {
      setStats(loadedStats);
      setAvailableAvatars(getAvailableAvatars(loadedStats.totalGames));
    }
    
    if (loadedProfile) {
      setProfile(loadedProfile);
      setNewName(loadedProfile.name);
    }
  };

  const handleSaveName = async () => {
    if (newName.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
      return;
    }
    
    const updatedProfile = { ...profile, name: newName.trim() };
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
    setIsEditingName(false);
  };

  const handleAvatarSelect = async (avatarEmoji: string) => {
    const updatedProfile = { ...profile, avatar: avatarEmoji };
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
    setShowAvatarSheet(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            // Reset to initial state
            const initialStats: GameStats = {
              totalGames: 0,
              totalCorrect: 0,
              totalIncorrect: 0,
              currentStreak: 0,
              bestStreak: 0,
              coins: 100,
              level: 1,
              experience: 0,
              starsEarned: 0,
            };
            setStats(initialStats);
            Alert.alert('Success', 'Progress has been reset successfully!');
          },
        },
      ]
    );
  };

  const accuracy = stats.totalGames > 0 ? Math.round((stats.totalCorrect / stats.totalGames) * 100) : 0;
  const levelProgress = (stats.experience % 100) / 100;
  const playingDays = Math.floor((new Date().getTime() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <YStack padding="$4" space="$4">
        {/* Header */}
        <AnimatedYStack entering={FadeInUp.delay(100)} alignItems="center" space="$2">
          <H1 color="$purple10" textAlign="center">
            👤 Profile
          </H1>
          <Text color="$gray10" textAlign="center" fontSize="$4">
            Track your mathematical journey
          </Text>
        </AnimatedYStack>

        {/* Profile Card */}
        <AnimatedCard entering={FadeInDown.delay(200)} padding="$4" backgroundColor="$background">
          <YStack alignItems="center" space="$3">
            <Button
              circular
              size="$8"
              backgroundColor="transparent"
              onPress={() => setShowAvatarSheet(true)}
            >
              <Text fontSize={60}>{profile.avatar}</Text>
            </Button>
            
            {isEditingName ? (
              <XStack space="$2" alignItems="center">
                <Input
                  flex={1}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Enter your name"
                  maxLength={20}
                />
                <Button size="$3" onPress={handleSaveName} backgroundColor="$green10">
                  <Save color="white" size="$1" />
                </Button>
                <Button size="$3" onPress={() => setIsEditingName(false)} backgroundColor="$red10">
                  <X color="white" size="$1" />
                </Button>
              </XStack>
            ) : (
              <XStack alignItems="center" space="$2">
                <H3 color="$color">{profile.name}</H3>
                <Button size="$2" backgroundColor="$blue10" onPress={() => setIsEditingName(true)}>
                  <Edit color="white" size="$0.5" />
                </Button>
              </XStack>
            )}
            
            <Text color="$gray10" textAlign="center">
              Level {stats.level} • {stats.coins} coins • {stats.starsEarned} stars
            </Text>
          </YStack>
        </AnimatedCard>

        {/* Statistics */}
        <AnimatedCard entering={FadeInDown.delay(300)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">📊 Your Statistics</H3>
          <YStack space="$3">
            <XStack justifyContent="space-between">
              <Text color="$gray10">Games Played</Text>
              <Text fontWeight="600" color="$blue10">{stats.totalGames}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Accuracy Rate</Text>
              <Text fontWeight="600" color="$green10">{accuracy}%</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Best Streak</Text>
              <Text fontWeight="600" color="$yellow10">{stats.bestStreak}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Current Streak</Text>
              <Text fontWeight="600" color="$orange10">{stats.currentStreak}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Days Playing</Text>
              <Text fontWeight="600" color="$purple10">{playingDays}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Favorite Operation</Text>
              <Text fontWeight="600" color="$color" textTransform="capitalize">
                {profile.favoriteOperation}
              </Text>
            </XStack>
          </YStack>
        </AnimatedCard>

        {/* Level Progress */}
        <AnimatedCard entering={FadeInDown.delay(400)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">⭐ Level Progress</H3>
          <YStack space="$2">
            <XStack justifyContent="space-between">
              <Text color="$gray10">Level {stats.level}</Text>
              <Text color="$gray10">{stats.experience % 100}/100 XP</Text>
            </XStack>
            <Progress value={levelProgress * 100} backgroundColor="$gray5">
              <Progress.Indicator backgroundColor="$purple10" />
            </Progress>
            <Text color="$gray8" fontSize="$2" textAlign="center">
              {100 - (stats.experience % 100)} XP to next level
            </Text>
          </YStack>
        </AnimatedCard>

        {/* Achievements Summary */}
        <AnimatedCard entering={FadeInDown.delay(500)} padding="$4" backgroundColor="$yellow2">
          <H3 color="$yellow10" marginBottom="$3">🏆 Recent Achievements</H3>
          <YStack space="$2">
            <XStack alignItems="center" space="$2">
              <Trophy color="$yellow10" size="$1" />
              <Text color="$yellow10">Level {stats.level} Mathematician</Text>
            </XStack>
            {stats.bestStreak >= 5 && (
              <XStack alignItems="center" space="$2">
                <Target color="$yellow10" size="$1" />
                <Text color="$yellow10">Streak Master ({stats.bestStreak})</Text>
              </XStack>
            )}
            {accuracy >= 80 && stats.totalGames >= 10 && (
              <XStack alignItems="center" space="$2">
                <Target color="$yellow10" size="$1" />
                <Text color="$yellow10">Accuracy Expert ({accuracy}%)</Text>
              </XStack>
            )}
          </YStack>
        </AnimatedCard>

        {/* Account Actions */}
        <AnimatedCard entering={FadeInDown.delay(600)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">⚙️ Account Actions</H3>
          <YStack space="$3">
            <Button
              backgroundColor="$red10"
              color="white"
              onPress={handleResetProgress}
              icon={<X color="white" size="$1" />}
            >
              Reset All Progress
            </Button>
          </YStack>
        </AnimatedCard>

        {/* Avatar Selection Sheet */}
        <Sheet
          modal
          open={showAvatarSheet}
          onOpenChange={setShowAvatarSheet}
          snapPoints={[85]}
          position={0}
          dismissOnSnapToBottom
        >
          <Sheet.Overlay />
          <Sheet.Handle />
          <Sheet.Frame padding="$4" backgroundColor="$background">
            <YStack space="$4">
              <H3 color="$color" textAlign="center">Choose Your Avatar</H3>
              <Text color="$gray10" textAlign="center" fontSize="$3">
                Unlock more avatars by playing more games!
              </Text>
              
              <YStack space="$3">
                {MATHEMATICIAN_AVATARS.map((avatar, index) => {
                  const isUnlocked = stats.totalGames >= avatar.unlockRequirement;
                  return (
                    <Card
                      key={avatar.id}
                      padding="$3"
                      backgroundColor={isUnlocked ? '$background' : '$gray2'}
                      borderColor={profile.avatar === avatar.image ? '$blue6' : '$gray6'}
                      borderWidth={profile.avatar === avatar.image ? 2 : 1}
                      opacity={isUnlocked ? 1 : 0.6}
                      onPress={() => isUnlocked && handleAvatarSelect(avatar.image)}
                    >
                      <XStack space="$3" alignItems="center">
                        <Text fontSize={40}>{avatar.image}</Text>
                        <YStack flex={1}>
                          <Text fontWeight="600" color={isUnlocked ? '$color' : '$gray8'}>
                            {avatar.name}
                          </Text>
                          <Text color="$gray10" fontSize="$3">
                            {avatar.description}
                          </Text>
                          {!isUnlocked && (
                            <Text color="$red10" fontSize="$2">
                              Requires {avatar.unlockRequirement} games played
                            </Text>
                          )}
                        </YStack>
                      </XStack>
                    </Card>
                  );
                })}
              </YStack>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
});