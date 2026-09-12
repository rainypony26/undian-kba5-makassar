import React from 'react';
import { Award, CheckCircle2, XCircle, Copy, Stamp, Calendar, MapPin } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      {/* VINTAGE CERTIFICATE / PIAGAM PEMENANG 1945 */}
      <div className="relative w-full max-w-2xl parchment-ticket border-2 border-amber-600/70 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* Vintage Corner Ornaments */}
        <div className="absolute top-3 left-3 text-amber-500/40 text-sm select-none">❖</div>
        <div className="absolute top-3 right-3 text-amber-500/40 text-sm select-none">❖</div>
        <div className="absolute bottom-3 left-3 text-amber-500/40 text-sm select-none">❖</div>
        <div className="absolute bottom-3 right-3 text-amber-500/40 text-sm select-none">❖</div>

        {/* Inner Certificate Border */}
        <div className="border border-amber-600/40 rounded-2xl p-5 sm:p-7 relative">
          {/* Top Emblem & Header */}
          <div className="flex flex-col items-center mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-serif-title uppercase tracking-widest mb-2 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Piagam Ketetapan Pemenang Doorprize Resmi</span>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-amber-200/80 uppercase tracking-wider font-serif-title">
              14th KBA ESEMPE NEGERI 5 MAKASSAR • SEMANGAT 1945
            </h3>
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-amber-100 tracking-tight mt-1 mb-4">
            {prize ? prize.name : 'Selamat Kepada Pemenang!'}
          </h2>

          {/* Winner Display Box */}
          {isSingle ? (
            <div className="relative bg-gradient-to-b from-[#25100e] to-[#140606] border border-amber-500/50 rounded-2xl p-6 mb-5 shadow-inner">
              <span className="text-[11px] text-amber-400/80 font-mono tracking-widest uppercase block mb-1">
                NOMOR KUPON TERPILIH
              </span>

              <div className="font-mono-numbers text-4xl sm:text-6xl font-black text-amber-200 tracking-widest mb-2 drop-shadow-md">
                {mainWinner.ticketNumber}
              </div>

              {mainWinner.name && (
                <div className="font-serif-title text-xl sm:text-2xl font-bold text-white mb-1">
                  {mainWinner.name}
                </div>
              )}

              {mainWinner.department && (
                <div className="text-xs sm:text-sm text-amber-300/80 font-medium">
                  {mainWinner.department}
                </div>
              )}

              {/* Official Red Ink Stamp */}
              <div className="absolute top-2 right-2 sm:right-4 stamp-animate pointer-events-none opacity-90">
                <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-dashed border-red-500 text-red-500 bg-red-950/40 backdrop-blur-xs p-1 shadow">
                  <Stamp className="w-4 h-4 text-red-500" />
                  <span className="font-serif-display text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-red-400 leading-tight">
                    SAH 1945
                  </span>
                  <span className="text-[6px] sm:text-[7px] font-mono text-red-300">
                    KBA 5 MAKASSAR
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 mb-5 pr-1 custom-scrollbar text-left">
              {winners.map((w, i) => (
                <div
                  key={w.id || i}
                  className="flex items-center justify-between bg-gradient-to-r from-[#25100e] to-[#140606] border border-amber-600/30 rounded-xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs font-mono">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-mono-numbers text-base font-bold text-amber-200">
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
                    <span className="text-xs text-amber-300/70 hidden sm:inline">
                      {w.department}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Event Metadata Stamp Line */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-amber-300/60 mb-5 font-serif-title">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              12 September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Benteng Rotterdam, Makassar
            </span>
          </div>

          {/* Actions bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-b from-[#8f1d1d] to-[#601212] hover:from-[#a82424] hover:to-[#731616] text-amber-100 border border-amber-500/60 font-serif-title font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Sahkan Pemenang</span>
            </button>

            <button
              onClick={onDisqualifyAndRedraw}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-serif-title text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              title="Gugurkan jika peserta tidak hadir dan tarik nomor baru"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Gugur / Undi Ulang</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-200 border border-neutral-800 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              title="Salin ke clipboard"
            >
              <Copy className="w-4 h-4" />
              <span className="sm:hidden">Salin Data</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 text-xs text-amber-400/50 hover:text-amber-300 underline cursor-pointer"
          >
            Tutup sementara (Data tetap tersimpan di rekapitulasi)
          </button>
        </div>
      </div>
    </div>
  );
};
