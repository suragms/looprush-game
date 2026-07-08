import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { HomeScreen } from '@/screens/HomeScreen';
import { GameScreen } from '@/screens/GameScreen';
import { ResultScreen } from '@/screens/ResultScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AchievementsScreen } from '@/screens/AchievementsScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { CustomizeScreen } from '@/screens/CustomizeScreen';
import { DailyChallengeScreen } from '@/screens/DailyChallengeScreen';
import { ToastContainer } from '@/components/ToastContainer';

const SCREENS: Record<string, React.FC> = {
  home: HomeScreen,
  game: GameScreen,
  result: ResultScreen,
  settings: SettingsScreen,
  achievements: AchievementsScreen,
  stats: StatsScreen,
  customize: CustomizeScreen,
  daily: DailyChallengeScreen,
};

export default function App() {
  const screen = useGameStore((s) => s.screen);

  const ScreenComponent = SCREENS[screen];
  if (!ScreenComponent) return null;

  return (
    <div className="h-full-safe w-full relative bg-bg-deep overflow-hidden">
      <ScreenComponent />
      <ToastContainer />
    </div>
  );
}
