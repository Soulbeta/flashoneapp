import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, Button, Card, H1, H2, Input } from '@tamagui/core';
import { Play, Pause, RotateCcw, Settings, Check, X } from '@tamagui/lucide-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  FadeInDown,
  FadeOutUp 
} from 'react-native-reanimated';
import { GameConfig, GameState, GameStats } from '@/types/game';
import { generateNumbers, checkAnswer } from '@/utils/gameLogic';
import { saveGameStats, loadGameStats } from '@/utils/storage';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function GameScreen() {
  const [config, setConfig] = useState<GameConfig>({
    difficulty: 1,
    operation: 'addition',
    speed: 1500,
    numbersCount: 5,
  });

  const [gameState, setGameState] = useState<GameState>({
    currentNumbers: [],
    currentIndex: 0,
    userAnswer: '',
    correctAnswer: 0,
    isPlaying: false,
    showResult: false,
    score: 0,
    streak: 0,
  });

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

  const numberOpacity = useSharedValue(0);
  const numberScale = useSharedValue(0.8);
  const resultScale = useSharedValue(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadStats();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadStats = async () => {
    const loadedStats = await loadGameStats();
    if (loadedStats) {
      setStats(loadedStats);
    }
  };

  const animatedNumberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [{ scale: numberScale.value }],
  }));

  const animatedResultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const startGame = () => {
    const numbers = generateNumbers(config);
    const correctAnswer = numbers.reduce((sum, num) => {
      switch (config.operation) {
        case 'addition':
          return sum + num;
        case 'subtraction':
          return sum - num;
        case 'multiplication':
          return sum * num;
        case 'division':
          return Math.round(sum / num);
        default:
          return sum + num;
      }
    }, numbers[0]);

    setGameState({
      currentNumbers: numbers,
      currentIndex: 0,
      userAnswer: '',
      correctAnswer,
      isPlaying: true,
      showResult: false,
      score: gameState.score,
      streak: gameState.streak,
    });

    showNumbers(numbers);
  };

  const showNumbers = (numbers: number[]) => {
    let index = 0;
    
    const showNext = () => {
      if (index < numbers.length) {
        numberOpacity.value = withSequence(
          withTiming(0, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
        numberScale.value = withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
        
        setGameState(prev => ({ ...prev, currentIndex: index }));
        index++;
        
        intervalRef.current = setTimeout(() => {
          numberOpacity.value = withTiming(0, { duration: 200 });
          setTimeout(showNext, 200);
        }, config.speed);
      } else {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    showNext();
  };

  const submitAnswer = async () => {
    const userNum = parseInt(gameState.userAnswer);
    const isCorrect = checkAnswer(userNum, gameState.correctAnswer);
    
    const newStreak = isCorrect ? gameState.streak + 1 : 0;
    const newScore = isCorrect ? gameState.score + 10 : gameState.score;
    
    setGameState(prev => ({
      ...prev,
      showResult: true,
      streak: newStreak,
      score: newScore,
    }));

    // Update stats
    const newStats = {
      ...stats,
      totalGames: stats.totalGames + 1,
      totalCorrect: isCorrect ? stats.totalCorrect + 1 : stats.totalCorrect,
      totalIncorrect: isCorrect ? stats.totalIncorrect : stats.totalIncorrect + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      coins: isCorrect ? stats.coins + 5 : stats.coins,
      experience: isCorrect ? stats.experience + 10 : stats.experience + 2,
      level: Math.floor((isCorrect ? stats.experience + 10 : stats.experience + 2) / 100) + 1,
      starsEarned: isCorrect && newStreak > 0 && newStreak % 5 === 0 ? stats.starsEarned + 1 : stats.starsEarned,
    };

    setStats(newStats);
    await saveGameStats(newStats);

    // Show result animation
    resultScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 200 })
    );
  };

  const resetGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setGameState({
      currentNumbers: [],
      currentIndex: 0,
      userAnswer: '',
      correctAnswer: 0,
      isPlaying: false,
      showResult: false,
      score: 0,
      streak: 0,
    });
    
    numberOpacity.value = 0;
    numberScale.value = 0.8;
    resultScale.value = 0;
  };

  const getCurrentNumber = () => {
    if (gameState.currentNumbers.length > 0 && gameState.currentIndex < gameState.currentNumbers.length) {
      return gameState.currentNumbers[gameState.currentIndex];
    }
    return null;
  };

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      {/* Header */}
      <AnimatedYStack entering={FadeInDown.delay(100)}>
        <H1 color="$blue10" textAlign="center" marginBottom="$2">
          Flash Anzan Practice
        </H1>
        
        {/* Game Stats */}
        <XStack justifyContent="space-between" marginBottom="$4">
          <Card padding="$3" backgroundColor="$blue2">
            <Text color="$blue10" fontSize="$3" fontWeight="600">
              Score: {gameState.score}
            </Text>
          </Card>
          <Card padding="$3" backgroundColor="$green2">
            <Text color="$green10" fontSize="$3" fontWeight="600">
              Streak: {gameState.streak}
            </Text>
          </Card>
        </XStack>
      </AnimatedYStack>

      {/* Game Area */}
      <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
        {/* Number Display */}
        <Card 
          width={200} 
          height={200} 
          justifyContent="center" 
          alignItems="center"
          backgroundColor="$gray1"
          borderColor="$gray4"
          borderWidth={2}
        >
          {gameState.isPlaying && getCurrentNumber() !== null ? (
            <Animated.View style={animatedNumberStyle}>
              <AnimatedText fontSize={60} fontWeight="bold" color="$blue10">
                {getCurrentNumber()}
              </AnimatedText>
            </Animated.View>
          ) : !gameState.isPlaying && !gameState.showResult && gameState.currentNumbers.length > 0 ? (
            <Text fontSize="$6" color="$gray10">
              Calculate!
            </Text>
          ) : (
            <Text fontSize="$4" color="$gray8" textAlign="center">
              {gameState.currentNumbers.length === 0 ? 'Press Start to begin' : 'Enter your answer'}
            </Text>
          )}
        </Card>

        {/* Answer Input */}
        {!gameState.isPlaying && gameState.currentNumbers.length > 0 && !gameState.showResult && (
          <AnimatedYStack entering={FadeInDown.delay(200)} space="$3" alignItems="center">
            <Input
              size="$5"
              width={200}
              textAlign="center"
              fontSize="$5"
              placeholder="Your answer"
              value={gameState.userAnswer}
              onChangeText={(text) => setGameState(prev => ({ ...prev, userAnswer: text }))}
              keyboardType="numeric"
            />
            <Button
              size="$4"
              backgroundColor="$green10"
              color="white"
              onPress={submitAnswer}
              disabled={!gameState.userAnswer}
              icon={<Check color="white" size="$1" />}
            >
              Submit Answer
            </Button>
          </AnimatedYStack>
        )}

        {/* Result Display */}
        {gameState.showResult && (
          <Animated.View style={animatedResultStyle}>
            <Card padding="$4" backgroundColor={parseInt(gameState.userAnswer) === gameState.correctAnswer ? '$green2' : '$red2'}>
              <YStack alignItems="center" space="$2">
                {parseInt(gameState.userAnswer) === gameState.correctAnswer ? (
                  <Check color="$green10" size="$3" />
                ) : (
                  <X color="$red10" size="$3" />
                )}
                <Text fontSize="$5" fontWeight="600" color={parseInt(gameState.userAnswer) === gameState.correctAnswer ? '$green10' : '$red10'}>
                  {parseInt(gameState.userAnswer) === gameState.correctAnswer ? 'Correct!' : 'Try Again!'}
                </Text>
                <Text color="$gray10">
                  Correct answer: {gameState.correctAnswer}
                </Text>
                <Text color="$gray10">
                  Your answer: {gameState.userAnswer}
                </Text>
              </YStack>
            </Card>
          </Animated.View>
        )}
      </YStack>

      {/* Control Buttons */}
      <AnimatedYStack entering={FadeInDown.delay(300)} space="$3">
        <XStack space="$3" justifyContent="center">
          <Button
            size="$4"
            backgroundColor="$blue10"
            color="white"
            onPress={startGame}
            disabled={gameState.isPlaying}
            icon={<Play color="white" size="$1" />}
            flex={1}
          >
            {gameState.currentNumbers.length === 0 ? 'Start Game' : 'New Round'}
          </Button>
          
          <Button
            size="$4"
            backgroundColor="$gray10"
            color="white"
            onPress={resetGame}
            icon={<RotateCcw color="white" size="$1" />}
          >
            Reset
          </Button>
        </XStack>

        {/* Difficulty Controls */}
        <Card padding="$3" backgroundColor="$gray1">
          <Text color="$color" fontWeight="600" marginBottom="$2" textAlign="center">
            Difficulty: {config.difficulty} digits | Speed: {config.speed}ms
          </Text>
          <XStack space="$2" justifyContent="center">
            <Button 
              size="$3" 
              onPress={() => setConfig(prev => ({ ...prev, difficulty: Math.max(1, prev.difficulty - 1) }))}
              disabled={config.difficulty <= 1}
            >
              -
            </Button>
            <Button 
              size="$3" 
              onPress={() => setConfig(prev => ({ ...prev, difficulty: Math.min(6, prev.difficulty + 1) }))}
              disabled={config.difficulty >= 6}
            >
              +
            </Button>
            <Button 
              size="$3" 
              onPress={() => setConfig(prev => ({ ...prev, speed: Math.max(500, prev.speed - 250) }))}
              disabled={config.speed <= 500}
            >
              Faster
            </Button>
            <Button 
              size="$3" 
              onPress={() => setConfig(prev => ({ ...prev, speed: Math.min(3000, prev.speed + 250) }))}
              disabled={config.speed >= 3000}
            >
              Slower
            </Button>
          </XStack>
        </Card>
      </AnimatedYStack>
    </YStack>
  );
}