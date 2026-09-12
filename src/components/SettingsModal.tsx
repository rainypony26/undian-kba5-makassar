import React from 'react';
import {
  Settings,
  X,
  Volume2,
  Clock,
  Palette,
  Download,
  Upload,
  RotateCcw,
  Check,
  Music,
} from 'lucide-react';
import type { AppState, DrawConfig } from '../types';
import { exportBackupJSON, DEFAULT_CONFIG } from '../utils/storage';
import { playFestiveFanfare, playPartyHorn, playTick } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
}) => {
  if (!isOpen) return null;

  const { config } = state;

  const handleUpdateConfig = <K extends keyof DrawConfig>(key: K, value: DrawConfig[K]) => {
    onUpdateState((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.prizes || parsed.participants || parsed.winners) {
          onUpdateState(() => parsed);
          alert('Backup berhasil dimuat!');
        } else {
          alert('Format file JSON tidak sesuai.');
        }
      } catch {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan pengaturan durasi, tema, dan suara ke setelan awal?')) {
      handleUpdateConfig('rollDurationSeconds', DEFAULT_CONFIG.rollDurationSeconds);
      handleUpdateConfig('theme', DEFAULT_CONFIG.theme);
      handleUpdateConfig('soundEnabled', DEFAULT_CONFIG.soundEnabled);
      handleUpdateConfig('soundVolume', DEFAULT_CONFIG.soundVolume);
      handleUpdateConfig('allowDuplicateWinners', DEFAULT_CONFIG.allowDuplicateWinners);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Pengaturan Sistem Undian</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto space-y-6 py-4 pr-1 custom-scrollbar">
          {/* Durasi Animasi */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Durasi Putaran Animasi ({config.rollDurationSeconds} Detik)</span>
            </label>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={config.rollDurationSeconds}
              onChange={(e) =>
                handleUpdateConfig('rollDurationSeconds', parseInt(e.target.value, 10))
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
              <span>Cepat (2 dtk)</span>
              <span>Standar (5 dtk)</span>
              <span>Dramatis (12 dtk)</span>
            </div>
          </div>

          {/* Pengaturan Audio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Efek Suara (Web Audio Synthesizer)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  playTick(config.soundVolume);
                  playPartyHorn(config.soundVolume);
                  setTimeout(() => playFestiveFanfare(config.soundVolume), 300);
                }}
                className="text-xs text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1.5 cursor-pointer bg-neutral-800 px-3 py-1.5 rounded-lg border border-yellow-500/30"
              >
                <Music className="w-3.5 h-3.5 text-yellow-300" />
                <span>Tes Suara Meriah</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={(e) => handleUpdateConfig('soundEnabled', e.target.checked)}
                  className="rounded text-amber-500 accent-amber-400"
                />
                <span>Aktifkan Efek Suara</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Volume:</span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={config.soundVolume}
                  onChange={(e) =>
                    handleUpdateConfig('soundVolume', parseFloat(e.target.value))
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Aturan Pemenang Duplikat */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-white block">
                  Izinkan Menang Berkali-kali
                </span>
                <span className="text-xs text-neutral-400">
                  Jika tidak dicentang (default), nomor yang sudah menang tidak akan terpilih lagi.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.allowDuplicateWinners}
                onChange={(e) =>
                  handleUpdateConfig('allowDuplicateWinners', e.target.checked)
                }
                className="w-4 h-4 rounded text-amber-500 accent-amber-400 cursor-pointer ml-3"
              />
            </label>
          </div>

          {/* Tema Visual Panggung */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Tema Warna Tampilan Panggung</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { id: 'kba', label: '14th KBA Makassar', border: 'border-yellow-400', color: 'bg-red-600' },
                { id: 'gold', label: 'Gold Luxury', border: 'border-amber-500', color: 'bg-amber-500' },
                { id: 'neon', label: 'Cyber Neon', border: 'border-cyan-500', color: 'bg-cyan-500' },
                { id: 'festive', label: 'Festive Red', border: 'border-red-500', color: 'bg-red-500' },
                { id: 'slate', label: 'Modern Slate', border: 'border-blue-500', color: 'bg-blue-500' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleUpdateConfig('theme', t.id as DrawConfig['theme'])}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    config.theme === t.id
                      ? `${t.border} bg-neutral-800 text-white font-bold ring-2 ring-yellow-400/40`
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${t.color}`} />
                  <span className="text-[11px] leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div>
            <span className="text-sm font-semibold text-white block mb-2">
              Cadangkan & Pulihkan Data
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportBackupJSON(state)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Backup (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Restore File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
