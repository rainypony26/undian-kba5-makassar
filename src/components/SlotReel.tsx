import React, { useEffect, useState, useRef } from 'react';
import { playTick } from '../utils/audio';
import { Award, Stamp, CheckCircle2 } from 'lucide-react';

interface SlotReelProps {
  isRolling: boolean;
  targetNumber: string;
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
}) => {
  const [displayChars, setDisplayChars] = useState<string[]>(() => {
    return targetNumber.split('').map(() => '•');
  });

  const [hasLanded, setHasLanded] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (!isRolling) {
      setDisplayChars(targetNumber.split(''));
      return;
    }

    setHasLanded(false);
    const chars = targetNumber.split('');
    const len = chars.length;
    const startTime = Date.now();
    const totalDurationMs = durationSeconds * 1000;

    const possibleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const currentList = Array(len).fill('0');

    let animationFrameId: number;
    let lastTickTime = 0;

    const updateRoll = () => {
      const elapsed = Date.now() - startTime;
      const overallProgress = Math.min(elapsed / totalDurationMs, 1);

      // Columns settle rhythmically from left to right in the last 40%
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

      // Sound ticks: Snappy mechanical shuffle
      const now = Date.now();
      const tickInterval = 55 + overallProgress * 90;
      if (now - lastTickTime > tickInterval) {
        lastTickTime = now;
        if (soundEnabled && !allSettled) {
          playTick(soundVolume * 0.7, 0.9 + overallProgress * 0.4);
        }
      }

      if (overallProgress < 1 && !allSettled) {
        animationFrameId = requestAnimationFrame(updateRoll);
      } else {
        setDisplayChars(chars);
        setHasLanded(true);
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

  return (
    <div className="w-full max-w-2xl mx-auto my-4 px-3">
      {/* VINTAGE KUPON UNDIAN 1945 CARD */}
      <div className="relative parchment-ticket border-2 border-amber-600/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative Ticket Side Notches */}
        <div className="ticket-notch-left hidden sm:block" />
        <div className="ticket-notch-right hidden sm:block" />

        {/* Vintage Golden Corner Ornaments */}
        <div className="absolute top-2 left-2 text-amber-500/40 text-xs select-none">❖</div>
        <div className="absolute top-2 right-2 text-amber-500/40 text-xs select-none">❖</div>
        <div className="absolute bottom-2 left-2 text-amber-500/40 text-xs select-none">❖</div>
        <div className="absolute bottom-2 right-2 text-amber-500/40 text-xs select-none">❖</div>

        {/* Subtle Background Watermark: 1945 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <span className="font-serif-display text-[140px] sm:text-[200px] font-black tracking-widest text-amber-100">
            1945
          </span>
        </div>

        {/* Inner Certificate Border */}
        <div className="border border-amber-600/30 rounded-2xl p-4 sm:p-6 text-center relative">
          {/* Header Ticket Information */}
          <div className="flex items-center justify-between border-b border-amber-800/40 pb-3 mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400/90 uppercase tracking-widest">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Kupon Doorprize Resmi</span>
            </div>
            <div className="text-[10px] text-amber-200/60 font-serif-title tracking-wider">
              14th KBA SMPN 5 MAKASSAR
            </div>
            <div className="text-[10px] font-mono text-amber-500/80 hidden sm:inline">
              NO. SERI-1945
            </div>
          </div>

          <span className="block text-[11px] sm:text-xs text-amber-300/70 uppercase tracking-widest font-semibold mb-2">
            NOMOR TIKET PESERTA BERUNTUNG
          </span>

          {/* MAIN TICKET NUMBER DISPLAY (Clean, Prestigious Typography - NOT a Slot Machine) */}
          <div className="py-3 sm:py-5 flex items-center justify-center gap-2 sm:gap-3">
            {displayChars.map((ch, idx) => {
              const isSep = ch === '-' || ch === ' ';
              if (isSep) {
                return (
                  <span
                    key={idx}
                    className="font-serif-display text-3xl sm:text-5xl text-amber-500/70 px-1 select-none"
                  >
                    {ch}
                  </span>
                );
              }

              return (
                <div
                  key={idx}
                  className={`relative flex items-center justify-center w-12 sm:w-16 md:w-20 h-16 sm:h-20 md:h-24 rounded-xl border transition-all duration-200 select-none ${
                    isRolling
                      ? 'bg-red-950/40 border-amber-500/40 text-amber-200 scale-102'
                      : 'bg-gradient-to-b from-[#2a1310] to-[#160807] border-amber-500/60 text-amber-100 shadow-inner'
                  }`}
                >
                  <span className="font-mono-numbers text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {ch}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Official 1945 Red Ink Stamp Effect upon stopping */}
          {hasLanded && !isRolling && (
            <div className="absolute -bottom-3 right-2 sm:right-6 pointer-events-none stamp-animate">
              <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-red-600/90 text-red-500 bg-red-950/40 backdrop-blur-xs p-1 shadow-lg">
                <Stamp className="w-5 h-5 text-red-500 mb-0.5" />
                <span className="font-serif-display text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-red-400 leading-tight">
                  TERPILIH SAH
                </span>
                <span className="text-[7px] sm:text-[8px] font-mono text-red-300/80">
                  12 SEPT 2026
                </span>
                <span className="text-[7px] text-red-400 font-bold">KBA 5 MAKASSAR</span>
              </div>
            </div>
          )}

          {/* Ticket Footer / Perforated divider */}
          <div className="mt-4 pt-3 border-t border-dashed border-amber-700/40 flex items-center justify-between text-[10px] text-amber-400/60 font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-500" />
              Terverifikasi Panitia Reuni Akbar
            </span>
            <span>BENTENG ROTTERDAM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
