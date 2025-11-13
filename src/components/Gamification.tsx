// src/components/Gamification.tsx
import Confetti from 'react-confetti';
import { Flame } from 'lucide-react';

export const StreakFlame = ({ days }: { days: number }) => {
  if (days === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg animate-pulse">
      <Flame className="w-6 h-6" /> {days} day{days > 1 ? 's' : ''}
    </div>
  );
};

export const VictoryConfetti = () => <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />;