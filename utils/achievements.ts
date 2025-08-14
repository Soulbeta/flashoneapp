import { Achievement, GameStats } from '@/types/game';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'dateUnlocked'>[] = [
  {
    id: 'first_game',
    title: 'First Steps',
    description: 'Play your first Flash Anzan game',
    icon: '🎮',
    requirement: 1,
    type: 'games',
    reward: { coins: 10, experience: 20 }
  },
  {
    id: 'ten_games',
    title: 'Getting Started',
    description: 'Complete 10 games',
    icon: '🚀',
    requirement: 10,
    type: 'games',
    reward: { coins: 50, experience: 100 }
  },
  {
    id: 'hundred_games',
    title: 'Dedicated Student',
    description: 'Complete 100 games',
    icon: '📚',
    requirement: 100,
    type: 'games',
    reward: { coins: 200, experience: 500 }
  },
  {
    id: 'streak_5',
    title: 'On Fire!',
    description: 'Get a streak of 5 correct answers',
    icon: '🔥',
    requirement: 5,
    type: 'streak',
    reward: { coins: 25, experience: 50 }
  },
  {
    id: 'streak_10',
    title: 'Hot Streak',
    description: 'Get a streak of 10 correct answers',
    icon: '⚡',
    requirement: 10,
    type: 'streak',
    reward: { coins: 75, experience: 150 }
  },
  {
    id: 'streak_20',
    title: 'Unstoppable',
    description: 'Get a streak of 20 correct answers',
    icon: '🌟',
    requirement: 20,
    type: 'streak',
    reward: { coins: 150, experience: 300 }
  },
  {
    id: 'accuracy_90',
    title: 'Precision Master',
    description: 'Achieve 90% accuracy over 50 games',
    icon: '🎯',
    requirement: 90,
    type: 'accuracy',
    reward: { coins: 100, experience: 250 }
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a game at maximum speed (0.5s)',
    icon: '💨',
    requirement: 500,
    type: 'speed',
    reward: { coins: 200, experience: 400 }
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    requirement: 5,
    type: 'level',
    reward: { coins: 100, experience: 0 }
  },
  {
    id: 'level_10',
    title: 'Master Student',
    description: 'Reach level 10',
    icon: '🏆',
    requirement: 10,
    type: 'level',
    reward: { coins: 300, experience: 0 }
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Get 100% accuracy in 20 consecutive games',
    icon: '💎',
    requirement: 100,
    type: 'accuracy',
    reward: { coins: 500, experience: 1000 }
  },
  {
    id: 'mathematician',
    title: 'Young Mathematician',
    description: 'Master all four operations',
    icon: '🧮',
    requirement: 1,
    type: 'games',
    reward: { coins: 250, experience: 500 }
  }
];

export function checkAchievements(stats: GameStats, currentAchievements: Achievement[]): Achievement[] {
  const updated = [...currentAchievements];
  const accuracy = stats.totalGames > 0 ? (stats.totalCorrect / stats.totalGames) * 100 : 0;
  
  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    const existing = updated.find(a => a.id === def.id);
    if (existing && existing.unlocked) return;
    
    let shouldUnlock = false;
    
    switch (def.type) {
      case 'games':
        shouldUnlock = stats.totalGames >= def.requirement;
        break;
      case 'streak':
        shouldUnlock = stats.bestStreak >= def.requirement;
        break;
      case 'accuracy':
        shouldUnlock = accuracy >= def.requirement && stats.totalGames >= 20;
        break;
      case 'level':
        shouldUnlock = stats.level >= def.requirement;
        break;
      case 'speed':
        // This would need to be tracked separately in real implementation
        shouldUnlock = false;
        break;
    }
    
    if (shouldUnlock) {
      if (existing) {
        existing.unlocked = true;
        existing.dateUnlocked = new Date();
      } else {
        updated.push({
          ...def,
          unlocked: true,
          dateUnlocked: new Date()
        });
      }
    }
  });
  
  return updated;
}

export function getNewlyUnlockedAchievements(
  oldAchievements: Achievement[],
  newAchievements: Achievement[]
): Achievement[] {
  return newAchievements.filter(newAch => {
    const oldAch = oldAchievements.find(old => old.id === newAch.id);
    return newAch.unlocked && (!oldAch || !oldAch.unlocked);
  });
}