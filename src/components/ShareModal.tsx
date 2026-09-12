import React, { useState } from 'react';
import { X, Smartphone, Globe, Wifi, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  localIp,
}) => {
  const [copiedType, setCopiedType] = useState<'online' | 'local' | null>(null);
  const [activeMode, setActiveMode] = useState<'online' | 'local'>('online');

  if (!isOpen) return null;

  const onlineUrl = 'https://rainypony26.github.io/undian-kba5-makassar/';
  const localUrl = `http://${localIp || '10.39.28.72'}:5173`;

  const handleCopy = (url: string, type: 'online' | 'local') => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const currentUrl = activeMode === 'online' ? onlineUrl : localUrl;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=171717&color=facc15`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-yellow-500/40 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Buka di HP / Perangkat Lain</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Callout: Kenapa localhost tidak bisa */}
        <div className="my-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-300 font-bold mb-0.5">
              Kenapa 'localhost' tidak bisa dibuka di HP?
            </strong>
            Kata <code>localhost</code> artinya "komputer ini sendiri". Jika diketik di HP, HP akan mencari di dalam dirinya sendiri.
            Gunakan <strong>Link Online</strong> atau <strong>Scan QR Code</strong> di bawah ini!
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl mb-4 border border-neutral-800">
          <button
            onClick={() => setActiveMode('online')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'online'
                ? 'bg-yellow-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Link Online (Internet)</span>
          </button>

          <button
            onClick={() => setActiveMode('local')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'local'
                ? 'bg-yellow-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Wi-Fi Lokal (Tanpa Kuota)</span>
          </button>
        </div>

        {/* QR Code & Link Area */}
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-5 text-center flex flex-col items-center">
          <span className="text-xs text-neutral-400 mb-2">
            Arahkan kamera HP Anda ke QR Code di bawah ini:
          </span>

          {/* QR Image */}
          <div className="p-3 bg-neutral-900 rounded-2xl border border-yellow-500/30 shadow-inner mb-3">
            <img
              src={qrCodeSrc}
              alt="QR Code Undian"
              className="w-44 h-44 rounded-lg object-contain"
            />
          </div>

          {/* URL Box */}
          <div className="w-full flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-left mb-2">
            <span className="text-xs text-yellow-300 font-mono flex-1 truncate">
              {currentUrl}
            </span>
            <button
              onClick={() => handleCopy(currentUrl, activeMode)}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
              title="Salin Tautan"
            >
              {copiedType === activeMode ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              title="Buka Langsung"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {activeMode === 'local' && (
            <p className="text-[11px] text-neutral-400 italic">
              *Syarat mode Wi-Fi: HP dan laptop ini harus terhubung ke Wi-Fi yang sama.
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
