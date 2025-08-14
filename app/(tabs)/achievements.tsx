import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { YStack, XStack, Text, Card, H1, H3, Progress, Button } from '@tamagui/core';
import { Trophy, Star, Lock, Unlock, Gift } from '@tamagui/lucide-icons';
import { Achievement, GameStats } from '@/types/game';
import { loadGameStats, loadAchievements, saveAchievements } from '@/utils/storage';
import { checkAchievements, ACHIEVEMENT_DEFINITIONS } from '@/utils/achievements';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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
    loadData();
  }, []);

  const loadData = async () => {
    const loadedStats = await loadGameStats();
    const loadedAchievements = await loadAchievements();
    
    if (loadedStats) {
      setStats(loadedStats);
      const updatedAchievements = checkAchievements(loadedStats, loadedAchievements);
      setAchievements(updatedAchievements);
      await saveAchievements(updatedAchievements);
    }
  };

  const getProgressForAchievement = (achievement: Achievement): number => {
    switch (achievement.type) {
      case 'games':
        return Math.min(100, (stats.totalGames / achievement.requirement) * 100);
      case 'streak':
        return Math.min(100, (stats.bestStreak / achievement.requirement) * 100);
      case 'accuracy':
        const accuracy = stats.totalGames > 0 ? (stats.totalCorrect / stats.totalGames) * 100 : 0;
        return Math.min(100, (accuracy / achievement.requirement) * 100);
      case 'level':
        return Math.min(100, (stats.level / achievement.requirement) * 100);
      case 'speed':
        return 0; // Would need separate tracking
      default:
        return 0;
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;
  const overallProgress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const categorizedAchievements = {
    beginner: achievements.filter(a => ['first_game', 'ten_games', 'streak_5'].includes(a.id)),
    intermediate: achievements.filter(a => ['hundred_games', 'streak_10', 'accuracy_90', 'level_5'].includes(a.id)),
    advanced: achievements.filter(a => ['streak_20', 'speed_demon', 'level_10', 'perfectionist'].includes(a.id)),
    master: achievements.filter(a => ['mathematician'].includes(a.id)),
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <YStack padding="$4" space="$4">
        {/* Header */}
        <AnimatedYStack entering={FadeInUp.delay(100)} alignItems="center" space="$2">
          <H1 color="$yellow10" textAlign="center">
            🏆 Achievements
          </H1>
          <Text color="$gray10" textAlign="center" fontSize="$4">
            Unlock rewards as you master mental arithmetic
          </Text>
        </AnimatedYStack>

        {/* Overall Progress */}
        <AnimatedCard entering={FadeInDown.delay(200)} padding="$4" backgroundColor="$background">
          <H3 color="$color" marginBottom="$3">Progress Overview</H3>
          <YStack space="$3">
            <XStack justifyContent="space-between">
              <Text color="$gray10">Achievements Unlocked</Text>
              <Text fontWeight="600" color="$yellow10">
                {unlockedCount}/{totalCount}
              </Text>
            </XStack>
            <Progress value={overallProgress} backgroundColor="$gray5">
              <Progress.Indicator backgroundColor="$yellow10" />
            </Progress>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Total Coins Earned</Text>
              <Text fontWeight="600" color="$blue10">{stats.coins} 🪙</Text>
            </XStack>
          </YStack>
        </AnimatedCard>

        {/* Achievement Categories */}
        {Object.entries(categorizedAchievements).map(([category, categoryAchievements], categoryIndex) => {
          if (categoryAchievements.length === 0) return null;
          
          const categoryTitles = {
            beginner: '🌱 Beginner',
            intermediate: '🔥 Intermediate', 
            advanced: '⚡ Advanced',
            master: '👑 Master'
          };

          const categoryColors = {
            beginner: '$green10',
            intermediate: '$orange10',
            advanced: '$purple10', 
            master: '$yellow10'
          };

          return (
            <YStack key={category} space="$3">
              <AnimatedYStack entering={FadeInDown.delay(300 + categoryIndex * 100)}>
                <H3 color={categoryColors[category as keyof typeof categoryColors]} marginBottom="$2">
                  {categoryTitles[category as keyof typeof categoryTitles]}
                </H3>
              </AnimatedYStack>
              
              {categoryAchievements.map((achievement, index) => {
                const progress = getProgressForAchievement(achievement);
                return (
                  <AnimatedCard
                    key={achievement.id}
                    entering={FadeInDown.delay(400 + categoryIndex * 100 + index * 50)}
                    padding="$4"
                    backgroundColor={achievement.unlocked ? '$green1' : '$gray1'}
                    borderColor={achievement.unlocked ? '$green6' : '$gray6'}
                    borderWidth={2}
                    opacity={achievement.unlocked ? 1 : 0.8}
                  >
                    <XStack space="$3" alignItems="center">
                      <YStack alignItems="center" space="$1">
                        <Text fontSize={32}>{achievement.icon}</Text>
                        {achievement.unlocked ? (
                          <Unlock color="$green10" size="$1" />
                        ) : (
                          <Lock color="$gray8" size="$1" />
                        )}
                      </YStack>
                      
                      <YStack flex={1} space="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                          <Text 
                            fontWeight="600" 
                            color={achievement.unlocked ? '$green10' : '$color'} 
                            fontSize="$4"
                          >
                            {achievement.title}
                          </Text>
                          {achievement.unlocked && (
                            <XStack space="$1" alignItems="center">
                              <Gift color="$yellow10" size="$1" />
                              <Text color="$yellow10" fontWeight="600" fontSize="$2">
                                +{achievement.reward.coins} coins
                              </Text>
                            </XStack>
                          )}
                        </XStack>
                        
                        <Text color="$gray10" fontSize="$3" marginBottom="$2">
                          {achievement.description}
                        </Text>
                        
                        {!achievement.unlocked && (
                          <YStack space="$1">
                            <Progress value={progress} backgroundColor="$gray5" height={6}>
                              <Progress.Indicator backgroundColor="$blue10" />
                            </Progress>
                            <Text color="$gray8" fontSize="$2">
                              Progress: {Math.round(progress)}%
                            </Text>
                          </YStack>
                        )}
                        
                        {achievement.unlocked && achievement.dateUnlocked && (
                          <Text color="$gray8" fontSize="$2">
                            Unlocked: {achievement.dateUnlocked.toLocaleDateString()}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  </AnimatedCard>
                );
              })}
            </YStack>
          );
        })}

        {/* Special Achievements */}
        <AnimatedCard entering={FadeInDown.delay(800)} padding="$4" backgroundColor="$blue2">
          <H3 color="$blue10" marginBottom="$2">🎯 Special Challenges</H3>
          <YStack space="$2">
            <Text color="$blue10" fontSize="$3">
              • Complete a perfect game (100% accuracy)
            </Text>
            <Text color="$blue10" fontSize="$3">
              • Reach a 25-answer streak
            </Text>
            <Text color="$blue10" fontSize="$3">
              • Master all 6 difficulty levels
            </Text>
            <Text color="$blue10" fontSize="$3">
              • Play for 7 consecutive days
            </Text>
          </YStack>
        </AnimatedCard>

        {/* Tips */}
        <AnimatedCard entering={FadeInDown.delay(900)} padding="$4" backgroundColor="$yellow2">
          <H3 color="$yellow10" marginBottom="$2">💡 Achievement Tips</H3>
          <YStack space="$1">
            <Text color="$yellow10" fontSize="$3">
              • Practice daily to build consistent streaks
            </Text>
            <Text color="$yellow10" fontSize="$3">
              • Focus on accuracy before attempting higher speeds
            </Text>
            <Text color="$yellow10" fontSize="$3">
              • Try different operations to unlock variety achievements
            </Text>
            <Text color="$yellow10" fontSize="$3">
              • Use earned coins to unlock new avatars and themes
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