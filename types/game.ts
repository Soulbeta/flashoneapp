export interface GameConfig {
  difficulty: number; // 1-6 (digits)
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
  speed: number; // milliseconds
  numbersCount: number; // how many numbers to show
}

export interface GameState {
  currentNumbers: number[];
  currentIndex: number;
  userAnswer: string;
  correctAnswer: number;
  isPlaying: boolean;
  showResult: boolean;
  score: number;
  streak: number;
}

export interface GameStats {
  totalGames: number;
  totalCorrect: number;
  totalIncorrect: number;
  currentStreak: number;
  bestStreak: number;
  coins: number;
  level: number;
  experience: number;
  starsEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'games' | 'streak' | 'accuracy' | 'speed' | 'level';
  unlocked: boolean;
  dateUnlocked?: Date;
  reward: {
    coins: number;
    experience: number;
  };
}

export interface Avatar {
  id: string;
  name: string;
  description: string;
  image: string;
  unlockRequirement: number;
  unlocked: boolean;
  cost: number;
}

export interface WorldLevel {
  id: number;
  country: string;
  flag: string;
  difficulty: number;
  requiredStars: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestTime?: number;
  bestAccuracy?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: Date;
  lastPlayed: Date;
  favoriteOperation: string;
  totalPlayTime: number;
}