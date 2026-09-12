import React from 'react';
import { Trophy, CheckCircle2, XCircle, Copy, Sparkles } from 'lucide-react';
import type { Winner, Prize } from '../types';

interface WinnerModalProps {
  isOpen: boolean;
  winners: Winner[];
  prize?: Prize;
  onConfirm: () => void;
  onDisqualifyAndRedraw: () => void;
  onClose: () => void;
  theme?: 'kba' | 'gold' | 'neon' | 'festive' | 'slate';
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  winners,
  prize,
  onConfirm,
  onDisqualifyAndRedraw,
  onClose,
  theme = 'kba',
}) => {
  if (!isOpen || winners.length === 0) return null;

  const isSingle = winners.length === 1;
  const mainWinner = winners[0];

  const handleCopy = () => {
    const text = winners
      .map(
        (w, i) =>
          `${i + 1}. ${w.ticketNumber} - ${w.name || 'Peserta'} (${w.department || '-'}) | Hadiah: ${w.prizeName}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('Informasi pemenang berhasil disalin!');
  };

  const getThemeAccents = () => {
    switch (theme) {
      case 'kba':
        return {
          glow: 'shadow-[0_0_100px_rgba(220,38,38,0.6)] border-yellow-400/80 ring-2 ring-yellow-400/30',
          badge: 'bg-red-600/30 text-yellow-300 border-yellow-500/60 font-black tracking-widest',
          buttonConfirm: 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-neutral-950 font-black shadow-[0_0_20px_rgba(234,179,8,0.5)]',
        };
      case 'neon':
        return {
          glow: 'shadow-[0_0_80px_rgba(6,182,212,0.4)]',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          buttonConfirm: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white',
        };
      case 'festive':
        return {
          glow: 'shadow-[0_0_80px_rgba(239,68,68,0.5)]',
          badge: 'bg-red-500/20 text-amber-300 border-red-500/40',
          buttonConfirm: 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white',
        };
      case 'slate':
        return {
          glow: 'shadow-[0_0_80px_rgba(59,130,246,0.35)]',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          buttonConfirm: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white',
        };
      case 'gold':
      default:
        return {
          glow: 'shadow-[0_0_90px_rgba(245,158,11,0.4)]',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          buttonConfirm: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-neutral-950 font-bold',
        };
    }
  };

  const themeStyle = getThemeAccents();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl bg-neutral-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center overflow-hidden ${themeStyle.glow}`}
      >
        {/* Background decorative aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy badge */}
        <div className="flex justify-center mb-4">
          <div className="relative p-4 rounded-full bg-gradient-to-b from-amber-400/20 to-neutral-900 border border-amber-400/40 animate-bounce">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            <Sparkles className="absolute top-2 right-2 w-5 h-5 text-yellow-200 animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase border mb-2 ${themeStyle.badge}`}
        >
          {prize ? prize.name : 'SELAMAT KEPADA PEMENANG!'}
        </span>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 mb-6">
          {isSingle ? 'Nomor Beruntung Terpilih!' : `${winners.length} Nomor Pemenang Terpilih!`}
        </h2>

        {/* Winner Display Area */}
        {isSingle ? (
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 mb-6 shadow-inner">
            <div className="font-mono-numbers text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wider mb-2">
              {mainWinner.ticketNumber}
            </div>
            {mainWinner.name && (
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                {mainWinner.name}
              </div>
            )}
            {mainWinner.department && (
              <div className="text-sm sm:text-base text-neutral-400">
                {mainWinner.department}
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2.5 mb-6 pr-1 custom-scrollbar text-left">
            {winners.map((w, i) => (
              <div
                key={w.id || i}
                className="flex items-center justify-between bg-neutral-950/80 border border-neutral-800/80 rounded-xl px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-mono-numbers text-lg font-bold text-amber-300">
                      {w.ticketNumber}
                    </span>
                    {w.name && (
                      <span className="ml-2 text-sm text-neutral-200 font-medium">
                        - {w.name}
                      </span>
                    )}
                  </div>
                </div>
                {w.department && (
                  <span className="text-xs text-neutral-400 hidden sm:inline">
                    {w.department}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ${themeStyle.buttonConfirm}`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Sahkan Pemenang</span>
          </button>

          <button
            onClick={onDisqualifyAndRedraw}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-700/50 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            title="Gugurkan jika peserta tidak hadir, dan undi ulang nomor baru"
          >
            <XCircle className="w-5 h-5" />
            <span>Gugur / Undi Ulang</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Salin ke clipboard"
          >
            <Copy className="w-4 h-4" />
            <span className="sm:hidden">Salin Data</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
        >
          Tutup sementara (Data tetap disimpan di riwayat)
        </button>
      </div>
    </div>
  );
};
