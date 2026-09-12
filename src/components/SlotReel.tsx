import React, { useEffect, useState, useRef } from 'react';
import { playTick } from '../utils/audio';

interface SlotReelProps {
  isRolling: boolean;
  targetNumber: string; // The winning final number (e.g. "TKT-0428")
  durationSeconds: number;
  soundEnabled: boolean;
  soundVolume: number;
  onFinish?: () => void;
  theme?: 'kba' | 'gold' | 'neon' | 'festive' | 'slate';
}

export const SlotReel: React.FC<SlotReelProps> = ({
  isRolling,
  targetNumber,
  durationSeconds,
  soundEnabled,
  soundVolume,
  onFinish,
  theme = 'kba',
}) => {
  const [displayChars, setDisplayChars] = useState<string[]>(() => {
    return targetNumber.split('').map(() => '?');
  });

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (!isRolling) {
      setDisplayChars(targetNumber.split(''));
      return;
    }

    const chars = targetNumber.split('');
    const len = chars.length;
    const startTime = Date.now();
    const totalDurationMs = durationSeconds * 1000;

    // Set initial question marks or random chars
    const possibleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const currentList = Array(len).fill('0');

    let animationFrameId: number;
    let lastTickTime = 0;

    const updateRoll = () => {
      const elapsed = Date.now() - startTime;
      const overallProgress = Math.min(elapsed / totalDurationMs, 1);

      // Columns settle from left to right
      const settleWindowStart = 0.55;

      let allSettled = true;

      for (let i = 0; i < len; i++) {
        const colSettleThreshold = settleWindowStart + ((1 - settleWindowStart) * (i + 1)) / len;

        if (overallProgress >= colSettleThreshold) {
          currentList[i] = chars[i];
        } else {
          allSettled = false;
          if (/\d/.test(chars[i])) {
            currentList[i] = Math.floor(Math.random() * 10).toString();
          } else if (/[A-Z]/i.test(chars[i])) {
            currentList[i] = possibleChars[Math.floor(Math.random() * possibleChars.length)];
          } else {
            currentList[i] = chars[i];
          }
        }
      }

      setDisplayChars([...currentList]);

      const now = Date.now();
      const tickInterval = 45 + overallProgress * 85;
      if (now - lastTickTime > tickInterval) {
        lastTickTime = now;
        if (soundEnabled && !allSettled) {
          playTick(soundVolume, 1 + overallProgress * 0.5);
        }
      }

      if (overallProgress < 1 && !allSettled) {
        animationFrameId = requestAnimationFrame(updateRoll);
      } else {
        setDisplayChars(chars);
        if (onFinishRef.current) {
          onFinishRef.current();
        }
      }
    };

    animationFrameId = requestAnimationFrame(updateRoll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRolling, targetNumber, durationSeconds, soundEnabled, soundVolume]);

  // Color styling based on theme
  const getThemeClasses = () => {
    switch (theme) {
      case 'kba':
        return {
          box: 'border-yellow-400/80 bg-gradient-to-b from-[#2a0808]/95 via-[#1a0505]/95 to-[#0f0303]/95 text-yellow-300 shadow-[0_0_35px_rgba(220,38,38,0.5)] border-2 ring-2 ring-amber-500/40',
          activeText: 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-200 to-yellow-400 drop-shadow-[0_4px_10px_rgba(180,83,9,0.8)]',
          glowBorder: 'border-yellow-300 ring-4 ring-yellow-400/60 shadow-[0_0_50px_rgba(234,179,8,0.7)]',
        };
      case 'neon':
        return {
          box: 'border-cyan-500/50 bg-slate-900/90 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
          activeText: 'text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-sky-300 to-indigo-400',
          glowBorder: 'border-cyan-400',
        };
      case 'festive':
        return {
          box: 'border-amber-500/50 bg-red-950/90 text-amber-300 shadow-[0_0_25px_rgba(239,68,68,0.35)]',
          activeText: 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-orange-400',
          glowBorder: 'border-amber-400',
        };
      case 'slate':
        return {
          box: 'border-blue-500/50 bg-slate-900/90 text-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.3)]',
          activeText: 'text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-blue-200 to-indigo-300',
          glowBorder: 'border-blue-400',
        };
      case 'gold':
      default:
        return {
          box: 'border-amber-500/50 bg-neutral-950/90 text-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.35)]',
          activeText: 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-500',
          glowBorder: 'border-amber-400',
        };
    }
  };

  const themeStyle = getThemeClasses();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 my-6 py-4">
      {displayChars.map((ch, idx) => {
        const isSeparator = ch === '-' || ch === ' ' || ch === '/';

        if (isSeparator) {
          return (
            <div
              key={idx}
              className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-amber-400/80 px-1 select-none"
            >
              {ch}
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={`relative flex items-center justify-center min-w-[50px] sm:min-w-[70px] md:min-w-[95px] lg:min-w-[110px] h-[75px] sm:h-[105px] md:h-[140px] lg:h-[160px] rounded-2xl border-2 transition-all duration-300 overflow-hidden select-none ${
              themeStyle.box
            } ${isRolling ? 'scale-[1.02] ' + themeStyle.glowBorder : ''}`}
          >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none" />

            {/* Horizontal reel divider line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -translate-y-1/2 pointer-events-none" />

            {/* Digit character */}
            <span
              className={`font-mono-numbers text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${
                themeStyle.activeText
              } ${isRolling ? 'blur-[0.5px]' : ''}`}
            >
              {ch}
            </span>
          </div>
        );
      })}
    </div>
  );
};
