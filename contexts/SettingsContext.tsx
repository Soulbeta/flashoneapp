import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

interface GameSettings {
  soundEnabled: boolean;
  hapticFeedback: boolean;
  tutorialCompleted: boolean;
  guestMode: boolean;
}

interface SettingsContextType {
  accessibility: AccessibilitySettings;
  game: GameSettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  updateGame: (settings: Partial<GameSettings>) => void;
}

const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReader: false,
};

const defaultGame: GameSettings = {
  soundEnabled: true,
  hapticFeedback: true,
  tutorialCompleted: false,
  guestMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(defaultAccessibility);
  const [game, setGame] = useState<GameSettings>(defaultGame);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [accessibilitySettings, gameSettings] = await Promise.all([
        AsyncStorage.getItem('accessibility_settings'),
        AsyncStorage.getItem('game_settings'),
      ]);

      if (accessibilitySettings) {
        setAccessibility({ ...defaultAccessibility, ...JSON.parse(accessibilitySettings) });
      }

      if (gameSettings) {
        setGame({ ...defaultGame, ...JSON.parse(gameSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateAccessibility = async (newSettings: Partial<AccessibilitySettings>) => {
    try {
      const updated = { ...accessibility, ...newSettings };
      setAccessibility(updated);
      await AsyncStorage.setItem('accessibility_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateGame = async (newSettings: Partial<GameSettings>) => {
    try {
      const updated = { ...game, ...newSettings };
      setGame(updated);
      await AsyncStorage.setItem('game_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving game settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ accessibility, game, updateAccessibility, updateGame }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}