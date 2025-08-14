import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { YStack, XStack, Text, Card, H1, H3, Progress, Circle } from '@tamagui/core';
import { MapPin, Lock, Star, Trophy } from '@tamagui/lucide-icons';
import { GameStats } from '@/types/game';
import { loadGameStats } from '@/utils/storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface WorldLevel {
  id: number;
  country: string;
  flag: string;
  difficulty: number;
  requiredStars: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
}

export default function ProgressScreen() {
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

  const [worldLevels] = useState<WorldLevel[]>([
    { id: 1, country: 'Japan', flag: '🇯🇵', difficulty: 1, requiredStars: 0, unlocked: true, completed: false, stars: 0 },
    { id: 2, country: 'China', flag: '🇨🇳', difficulty: 2, requiredStars: 5, unlocked: false, completed: false, stars: 0 },
    { id: 3, country: 'Korea', flag: '🇰🇷', difficulty: 2, requiredStars: 10, unlocked: false, completed: false, stars: 0 },
    { id: 4, country: 'India', flag: '🇮🇳', difficulty: 3, requiredStars: 15, unlocked: false, completed: false, stars: 0 },
    { id: 5, country: 'Singapore', flag: '🇸🇬', difficulty: 3, requiredStars: 25, unlocked: false, completed: false, stars: 0 },
    { id: 6, country: 'Germany', flag: '🇩🇪', difficulty: 4, requiredStars: 35, unlocked: false, completed: false, stars: 0 },
    { id: 7, country: 'Finland', flag: '🇫🇮', difficulty: 4, requiredStars: 50, unlocked: false, completed: false, stars: 0 },
    { id: 8, country: 'Canada', flag: '🇨🇦', difficulty: 5, requiredStars: 70, unlocked: false, completed: false, stars: 0 },
    { id: 9, country: 'Switzerland', flag: '🇨🇭', difficulty: 5, requiredStars: 90, unlocked: false, completed: false, stars: 0 },
    { id: 10, country: 'International', flag: '🌍', difficulty: 6, requiredStars: 120, unlocked: false, completed: false, stars: 0 },
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const loadedStats = await loadGameStats();
    if (loadedStats) {
      setStats(loadedStats);
    }
  };

  const getUnlockedLevels = () => {
    return worldLevels.map(level => ({
      ...level,
      unlocked: stats.starsEarned >= level.requiredStars,
    }));
  };

  const accuracy = stats.totalGames > 0 ? Math.round((stats.totalCorrect / stats.totalGames) * 100) : 0;
  const levelProgress = (stats.experience % 100) / 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <YStack padding="$4" space="$4">
        {/* Header */}
        <YStack alignItems="center" space="$2">
          <H1 color="$blue10" textAlign="center">
            World Progress Map
          </H1>
          <Text color="$gray10" textAlign="center" fontSize="$4">
            Travel the world mastering Flash Anzan
          </Text>
        </YStack>

        {/* Overall Progress */}
        <AnimatedCard entering={FadeInDown.delay(100)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">Overall Progress</H3>
          <YStack space="$3">
            <XStack justifyContent="space-between">
              <Text color="$gray10">Current Level</Text>
              <Text fontWeight="600" color="$blue10">Level {stats.level}</Text>
            </XStack>
            <Progress value={levelProgress * 100} backgroundColor="$gray5">
              <Progress.Indicator backgroundColor="$blue10" />
            </Progress>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Stars Collected</Text>
              <Text fontWeight="600" color="$yellow10">{stats.starsEarned} ⭐</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Accuracy Rate</Text>
              <Text fontWeight="600" color="$green10">{accuracy}%</Text>
            </XStack>
          </YStack>
        </AnimatedCard>

        {/* World Map */}
        <YStack space="$3">
          <H3 color="$color" textAlign="center">Journey Through Countries</H3>
          
          {getUnlockedLevels().map((level, index) => (
            <AnimatedCard
              key={level.id}
              entering={FadeInDown.delay(200 + index * 100)}
              padding="$4"
              backgroundColor={level.unlocked ? '$background' : '$gray2'}
              borderColor={level.unlocked ? '$blue6' : '$gray6'}
              borderWidth={level.unlocked ? 2 : 1}
              opacity={level.unlocked ? 1 : 0.6}
            >
              <XStack space="$3" alignItems="center">
                <YStack alignItems="center" space="$1">
                  <Text fontSize={40}>{level.flag}</Text>
                  {level.unlocked ? (
                    <MapPin color="$blue10" size="$1" />
                  ) : (
                    <Lock color="$gray8" size="$1" />
                  )}
                </YStack>
                
                <YStack flex={1} space="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color={level.unlocked ? '$color' : '$gray8'} fontSize="$5">
                      {level.country}
                    </Text>
                    {level.unlocked && (
                      <XStack space="$1" alignItems="center">
                        <Star color="$yellow10" size="$1" fill="$yellow10" />
                        <Text color="$yellow10" fontWeight="600">
                          {level.stars}/3
                        </Text>
                      </XStack>
                    )}
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text color={level.unlocked ? '$gray10' : '$gray8'} fontSize="$3">
                      Difficulty: {level.difficulty} digits
                    </Text>
                    {!level.unlocked && (
                      <Text color="$gray8" fontSize="$3">
                        Requires {level.requiredStars} ⭐
                      </Text>
                    )}
                  </XStack>
                  
                  {level.completed && (
                    <XStack alignItems="center" space="$1">
                      <Trophy color="$green10" size="$1" />
                      <Text color="$green10" fontWeight="600" fontSize="$3">
                        Completed
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </XStack>
            </AnimatedCard>
          ))}
        </YStack>

        {/* Tips */}
        <AnimatedCard entering={FadeInDown.delay(1000)} padding="$4" backgroundColor="$blue2">
          <H3 color="$blue10" marginBottom="$2">💡 Tips for Success</H3>
          <YStack space="$1">
            <Text color="$blue10" fontSize="$3">
              • Practice daily for at least 10 minutes
            </Text>
            <Text color="$blue10" fontSize="$3">
              • Start slow and gradually increase speed
            </Text>
            <Text color="$blue10" fontSize="$3">
              • Visualize the abacus while calculating
            </Text>
            <Text color="$blue10" fontSize="$3">
              • Take breaks to avoid mental fatigue
            </Text>
          </YStack>
        </AnimatedCard>
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