import { GameStats, GameConfig } from '@/types/game';

interface SpeedAdaptationConfig {
  targetAccuracy: number;
  minSpeed: number;
  maxSpeed: number;
  adjustmentStep: number;
  evaluationWindow: number;
}

export class AdaptiveSpeedController {
  private config: SpeedAdaptationConfig;
  private recentGames: Array<{ correct: boolean; speed: number; timestamp: Date }> = [];

  constructor() {
    this.config = {
      targetAccuracy: 75, // Target 75% accuracy
      minSpeed: 500,      // Minimum 0.5s per number
      maxSpeed: 3000,     // Maximum 3s per number
      adjustmentStep: 250, // Adjust by 0.25s
      evaluationWindow: 10 // Evaluate based on last 10 games
    };
  }

  calculateOptimalSpeed(currentSpeed: number, recentPerformance: boolean[]): number {
    if (recentPerformance.length < 3) {
      return currentSpeed; // Need at least 3 games for adjustment
    }

    const accuracy = this.calculateAccuracy(recentPerformance);
    const trend = this.calculateTrend(recentPerformance);
    
    let newSpeed = currentSpeed;

    if (accuracy > this.config.targetAccuracy + 10) {
      // Accuracy is high, increase difficulty (reduce time)
      newSpeed = Math.max(this.config.minSpeed, currentSpeed - this.config.adjustmentStep);
    } else if (accuracy < this.config.targetAccuracy - 15) {
      // Accuracy is low, decrease difficulty (increase time)
      newSpeed = Math.min(this.config.maxSpeed, currentSpeed + this.config.adjustmentStep);
    }

    // Consider trend for fine-tuning
    if (trend === 'improving' && accuracy > 60) {
      newSpeed = Math.max(this.config.minSpeed, newSpeed - this.config.adjustmentStep / 2);
    } else if (trend === 'declining' && accuracy < 60) {
      newSpeed = Math.min(this.config.maxSpeed, newSpeed + this.config.adjustmentStep / 2);
    }

    return newSpeed;
  }

  private calculateAccuracy(games: boolean[]): number {
    const correct = games.filter(g => g).length;
    return (correct / games.length) * 100;
  }

  private calculateTrend(games: boolean[]): 'improving' | 'stable' | 'declining' {
    if (games.length < 6) return 'stable';
    
    const firstHalf = games.slice(0, Math.floor(games.length / 2));
    const secondHalf = games.slice(Math.floor(games.length / 2));
    
    const firstAccuracy = this.calculateAccuracy(firstHalf);
    const secondAccuracy = this.calculateAccuracy(secondHalf);
    
    const difference = secondAccuracy - firstAccuracy;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }

  getRecommendedDifficulty(stats: GameStats): number {
    const accuracy = stats.totalGames > 0 ? (stats.totalCorrect / stats.totalGames) * 100 : 0;
    const level = stats.level;
    
    // Base difficulty on user level and recent accuracy
    if (accuracy >= 85 && level >= 3) return Math.min(6, level + 1);
    if (accuracy >= 75 && level >= 2) return level;
    if (accuracy >= 60) return Math.max(1, level - 1);
    
    return 1; // Start with easiest for low accuracy
  }

  shouldSuggestBreak(consecutiveGames: number, accuracy: number): boolean {
    // Suggest break if played many consecutive games with declining accuracy
    return consecutiveGames >= 20 && accuracy < 60;
  }

  getMotivationalMessage(performance: { accuracy: number; trend: string; streak: number }): string {
    const { accuracy, trend, streak } = performance;
    
    if (streak >= 10) {
      return "🔥 Amazing streak! You're on fire!";
    }
    
    if (accuracy >= 90) {
      return "🎯 Excellent accuracy! You're mastering this!";
    }
    
    if (trend === 'improving') {
      return "📈 Great improvement! Keep it up!";
    }
    
    if (accuracy < 50) {
      return "🌟 Take your time - accuracy is more important than speed!";
    }
    
    return "💪 Good progress! Practice makes perfect!";
  }

  generatePersonalizedPracticeSession(stats: GameStats): GameConfig {
    const accuracy = stats.totalGames > 0 ? (stats.totalCorrect / stats.totalGames) * 100 : 0;
    
    return {
      difficulty: this.getRecommendedDifficulty(stats),
      operation: this.getRecommendedOperation(stats),
      speed: this.getOptimalStartSpeed(accuracy, stats.level),
      numbersCount: this.getOptimalNumbersCount(stats.level, accuracy)
    };
  }

  private getRecommendedOperation(stats: GameStats): 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed' {
    // Start with addition, gradually introduce other operations
    if (stats.level <= 2) return 'addition';
    if (stats.level <= 4) return Math.random() > 0.5 ? 'addition' : 'subtraction';
    if (stats.level <= 6) return ['addition', 'subtraction', 'multiplication'][Math.floor(Math.random() * 3)] as any;
    return 'mixed';
  }

  private getOptimalStartSpeed(accuracy: number, level: number): number {
    const baseSpeed = 2000; // Start with 2 seconds
    const levelAdjustment = Math.max(0, (level - 1) * 200); // Faster for higher levels
    const accuracyAdjustment = accuracy > 80 ? -300 : accuracy < 60 ? 300 : 0;
    
    return Math.max(
      this.config.minSpeed,
      Math.min(this.config.maxSpeed, baseSpeed - levelAdjustment + accuracyAdjustment)
    );
  }

  private getOptimalNumbersCount(level: number, accuracy: number): number {
    let count = 5; // Default
    
    if (level >= 5 && accuracy > 80) count = 7;
    if (level >= 8 && accuracy > 85) count = 10;
    if (accuracy < 60) count = 3;
    
    return count;
  }
}

export const adaptiveSpeedController = new AdaptiveSpeedController();