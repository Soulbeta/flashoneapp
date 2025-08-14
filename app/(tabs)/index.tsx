import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { YStack, XStack, Text, Button, Card, Progress, Circle, H1, H3 } from '@tamagui/core';
import { Play, Trophy, Star, Coins } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { GameStats } from '@/types/game';
import { loadGameStats } from '@/utils/storage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function HomeScreen() {
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

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const loadedStats = await loadGameStats();
    if (loadedStats) {
      setStats(loadedStats);
    }
  };

  const accuracy = stats.totalGames > 0 ? Math.round((stats.totalCorrect / stats.totalGames) * 100) : 0;
  const levelProgress = (stats.experience % 100) / 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <YStack padding="$4" space="$4">
        <AnimatedYStack entering={FadeInUp.delay(100)}>
          <H1 color="$blue10" textAlign="center" marginBottom="$2">
            Flash Anzan Trainer
          </H1>
          <Text color="$gray10" textAlign="center" fontSize="$4">
            Master mental arithmetic the Japanese way
          </Text>
        </AnimatedYStack>

        {/* Quick Stats Cards */}
        <XStack space="$3" justifyContent="space-between">
          <AnimatedCard entering={FadeInDown.delay(200)} flex={1} padding="$3" backgroundColor="$blue2">
            <YStack alignItems="center" space="$1">
              <Coins color="$blue10" size="$2" />
              <Text fontWeight="600" color="$blue10" fontSize="$5">
                {stats.coins}
              </Text>
              <Text color="$gray10" fontSize="$2">
                Coins
              </Text>
            </YStack>
          </AnimatedCard>
          
          <AnimatedCard entering={FadeInDown.delay(300)} flex={1} padding="$3" backgroundColor="$yellow2">
            <YStack alignItems="center" space="$1">
              <Star color="$yellow10" size="$2" />
              <Text fontWeight="600" color="$yellow10" fontSize="$5">
                {stats.starsEarned}
              </Text>
              <Text color="$gray10" fontSize="$2">
                Stars
              </Text>
            </YStack>
          </AnimatedCard>
          
          <AnimatedCard entering={FadeInDown.delay(400)} flex={1} padding="$3" backgroundColor="$green2">
            <YStack alignItems="center" space="$1">
              <Trophy color="$green10" size="$2" />
              <Text fontWeight="600" color="$green10" fontSize="$5">
                {stats.level}
              </Text>
              <Text color="$gray10" fontSize="$2">
                Level
              </Text>
            </YStack>
          </AnimatedCard>
        </XStack>

        {/* Level Progress */}
        <AnimatedCard entering={FadeInDown.delay(500)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">Level Progress</H3>
          <Progress value={levelProgress * 100} backgroundColor="$gray5">
            <Progress.Indicator backgroundColor="$blue10" />
          </Progress>
          <XStack justifyContent="space-between" marginTop="$2">
            <Text color="$gray10" fontSize="$3">Level {stats.level}</Text>
            <Text color="$gray10" fontSize="$3">{stats.experience % 100}/100 XP</Text>
          </XStack>
        </AnimatedCard>

        {/* Performance Stats */}
        <AnimatedCard entering={FadeInDown.delay(600)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">Your Performance</H3>
          <YStack space="$3">
            <XStack justifyContent="space-between">
              <Text color="$gray10">Games Played</Text>
              <Text fontWeight="600" color="$color">{stats.totalGames}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Accuracy</Text>
              <Text fontWeight="600" color="$green10">{accuracy}%</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Current Streak</Text>
              <Text fontWeight="600" color="$blue10">{stats.currentStreak}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Best Streak</Text>
              <Text fontWeight="600" color="$yellow10">{stats.bestStreak}</Text>
            </XStack>
          </YStack>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedYStack entering={FadeInDown.delay(700)} space="$3">
          <Button
            size="$5"
            backgroundColor="$blue10"
            color="white"
            fontWeight="600"
            borderRadius="$4"
            onPress={() => router.push('/game')}
            icon={<Play color="white" size="$1.5" />}
          >
            Start Practice Session
          </Button>
          
          <Button
            size="$4"
            backgroundColor="$gray2"
            color="$color"
            fontWeight="600"
            borderRadius="$4"
            onPress={() => router.push('/progress')}
          >
            View Progress Map
          </Button>
        </AnimatedYStack>
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