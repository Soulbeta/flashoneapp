import { Avatar } from '@/types/game';

export const MATHEMATICIAN_AVATARS: Omit<Avatar, 'unlocked'>[] = [
  {
    id: 'euler',
    name: 'Leonhard Euler',
    description: 'Swiss mathematician who made groundbreaking discoveries in calculus',
    image: '👨‍🔬',
    unlockRequirement: 0,
    cost: 0
  },
  {
    id: 'gauss',
    name: 'Carl Friedrich Gauss',
    description: 'German mathematician known as the "Prince of Mathematics"',
    image: '🧙‍♂️',
    unlockRequirement: 10,
    cost: 100
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    description: 'English mathematician who invented calculus',
    image: '🍎',
    unlockRequirement: 25,
    cost: 200
  },
  {
    id: 'ramanujan',
    name: 'Srinivasa Ramanujan',
    description: 'Indian mathematician with extraordinary intuition for numbers',
    image: '🔢',
    unlockRequirement: 50,
    cost: 300
  },
  {
    id: 'hypatia',
    name: 'Hypatia of Alexandria',
    description: 'Ancient Greek mathematician and astronomer',
    image: '👩‍🔬',
    unlockRequirement: 75,
    cost: 400
  },
  {
    id: 'fibonacci',
    name: 'Leonardo Fibonacci',
    description: 'Italian mathematician famous for the Fibonacci sequence',
    image: '🌀',
    unlockRequirement: 100,
    cost: 500
  },
  {
    id: 'archimedes',
    name: 'Archimedes',
    description: 'Ancient Greek mathematician and inventor',
    image: '⚖️',
    unlockRequirement: 150,
    cost: 750
  },
  {
    id: 'turing',
    name: 'Alan Turing',
    description: 'English mathematician and computer science pioneer',
    image: '💻',
    unlockRequirement: 200,
    cost: 1000
  }
];

export function getAvailableAvatars(totalGames: number): Avatar[] {
  return MATHEMATICIAN_AVATARS.map(avatar => ({
    ...avatar,
    unlocked: totalGames >= avatar.unlockRequirement
  }));
}