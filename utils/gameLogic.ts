import { GameConfig } from '@/types/game';

export function generateNumbers(config: GameConfig): number[] {
  const numbers: number[] = [];
  const min = Math.pow(10, config.difficulty - 1);
  const max = Math.pow(10, config.difficulty) - 1;
  
  for (let i = 0; i < config.numbersCount; i++) {
    numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  
  return numbers;
}

export function calculateAnswer(numbers: number[], operation: string): number {
  if (numbers.length === 0) return 0;
  
  let result = numbers[0];
  
  for (let i = 1; i < numbers.length; i++) {
    switch (operation) {
      case 'addition':
        result += numbers[i];
        break;
      case 'subtraction':
        result -= numbers[i];
        break;
      case 'multiplication':
        result *= numbers[i];
        break;
      case 'division':
        if (numbers[i] !== 0) {
          result = Math.round(result / numbers[i]);
        }
        break;
      case 'mixed':
        const ops = ['addition', 'subtraction'];
        const randomOp = ops[Math.floor(Math.random() * ops.length)];
        if (randomOp === 'addition') {
          result += numbers[i];
        } else {
          result -= numbers[i];
        }
        break;
      default:
        result += numbers[i];
    }
  }
  
  return Math.max(0, result); // Ensure non-negative results for children
}

export function checkAnswer(userAnswer: number, correctAnswer: number): boolean {
  return userAnswer === correctAnswer;
}

export function calculateStars(accuracy: number, speed: number, difficulty: number): number {
  if (accuracy < 70) return 1;
  if (accuracy >= 90 && speed <= 1000) return 3;
  if (accuracy >= 80) return 2;
  return 1;
}

export function calculateCoinsEarned(stars: number, streak: number, difficulty: number): number {
  let coins = stars * 5;
  coins += Math.floor(streak / 5) * 2; // Bonus for streaks
  coins += difficulty * 2; // Bonus for difficulty
  return coins;
}

export function calculateExperience(isCorrect: boolean, difficulty: number, streak: number): number {
  if (!isCorrect) return 2;
  
  let exp = 10 * difficulty;
  exp += Math.min(streak, 10) * 2; // Bonus for streak, capped at 10
  return exp;
}

export function shouldLevelUp(currentExp: number, currentLevel: number): boolean {
  const expNeeded = currentLevel * 100;
  return currentExp >= expNeeded;
}

export function getNextLevelExp(level: number): number {
  return level * 100;
}

// Adaptive speed system
export function calculateNewSpeed(currentSpeed: number, accuracy: number): number {
  const MIN_SPEED = 500;
  const MAX_SPEED = 3000;
  const SPEED_ADJUSTMENT = 250;
  
  if (accuracy >= 70) {
    // Increase speed (decrease time) for good accuracy
    return Math.max(MIN_SPEED, currentSpeed - SPEED_ADJUSTMENT);
  } else if (accuracy < 50) {
    // Decrease speed (increase time) for poor accuracy
    return Math.min(MAX_SPEED, currentSpeed + SPEED_ADJUSTMENT);
  }
  
  return currentSpeed; // No change for moderate accuracy
}

// Flash sequence timing
export function getOptimalFlashTiming(difficulty: number, userLevel: number): number {
  const BASE_TIME = 2000;
  const DIFFICULTY_FACTOR = difficulty * 200;
  const LEVEL_FACTOR = Math.max(0, userLevel - 1) * 100;
  
  return Math.max(500, BASE_TIME - DIFFICULTY_FACTOR + LEVEL_FACTOR);
}

// Educational helpers
export function generateProgressiveNumbers(startDifficulty: number, targetDifficulty: number, count: number): number[][] {
  const sequences: number[][] = [];
  const difficultyRange = targetDifficulty - startDifficulty;
  
  for (let i = 0; i < count; i++) {
    const currentDifficulty = startDifficulty + Math.floor((i / count) * difficultyRange);
    const config: GameConfig = {
      difficulty: currentDifficulty,
      operation: 'addition',
      speed: 1500,
      numbersCount: 5,
    };
    sequences.push(generateNumbers(config));
  }
  
  return sequences;
}

// Performance tracking
export function calculatePerformanceMetrics(games: Array<{correct: boolean, timeSpent: number, difficulty: number}>) {
  const totalGames = games.length;
  const correctGames = games.filter(g => g.correct).length;
  const averageTime = games.reduce((sum, g) => sum + g.timeSpent, 0) / totalGames;
  const averageDifficulty = games.reduce((sum, g) => sum + g.difficulty, 0) / totalGames;
  
  return {
    accuracy: (correctGames / totalGames) * 100,
    averageResponseTime: averageTime,
    averageDifficulty,
    improvementRate: calculateImprovementRate(games),
  };
}

function calculateImprovementRate(games: Array<{correct: boolean, timeSpent: number}>): number {
  if (games.length < 10) return 0;
  
  const firstHalf = games.slice(0, Math.floor(games.length / 2));
  const secondHalf = games.slice(Math.floor(games.length / 2));
  
  const firstHalfAccuracy = firstHalf.filter(g => g.correct).length / firstHalf.length;
  const secondHalfAccuracy = secondHalf.filter(g => g.correct).length / secondHalf.length;
  
  return ((secondHalfAccuracy - firstHalfAccuracy) / firstHalfAccuracy) * 100;
}