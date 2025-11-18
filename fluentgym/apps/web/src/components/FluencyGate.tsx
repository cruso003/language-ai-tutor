'use client';

import { useEffect, useState } from 'react';

interface FluencyGateProps {
  isActive: boolean;
  onTimeout: () => void;
  timeLimit?: number; // in seconds
}

export function FluencyGate({ isActive, onTimeout, timeLimit = 3 }: FluencyGateProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(timeLimit);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          onTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, onTimeout, timeLimit]);

  if (!isActive) return null;

  const percentage = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft < 1;

  return (
    <div className="fixed left-0 right-0 top-16 z-50 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:bg-dark-card/95">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fluency Challenge: Respond quickly!
          </span>
          <span
            className={`text-2xl font-bold ${
              isUrgent ? 'animate-pulse text-red-600' : 'text-primary'
            }`}
          >
            {Math.ceil(timeLeft)}s
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-100 ${
              isUrgent ? 'bg-red-600' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
