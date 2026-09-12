import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gift,
  Users,
  Award,
  Layers,
  Image as ImageIcon,
  Music,
  Stamp,
  Scroll,
} from 'lucide-react';
import type { AppState, Prize, Winner } from '../types';
import { SlotReel } from './SlotReel';
import { WinnerModal } from './WinnerModal';
import {
  startFestiveDrumroll,
  playFestiveFanfare,
  playPartyHorn,
} from '../utils/audio';
import { fireGrandConfetti, fireGoldShower } from '../utils/confetti';
import bannerImg from '../assets/banner_kba.jpg';

interface DrawStageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onNavigateToWinners?: () => void;
}

export const DrawStage: React.FC<DrawStageProps> = ({
  state,
  onUpdateState,
  onNavigateToWinners,
}) => {
  const { config, prizes, participants, winners } = state;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [stagedNumber, setStagedNumber] = useState<string>('0000');
  const [stagedWinners, setStagedWinners] = useState<Winner[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const stopDrumrollRef = useRef<(() => void) | null>(null);

  // Active prize
  const activePrize: Prize | undefined =
    prizes.find((p) => p.id === config.selectedPrizeId) || prizes[0];

  // Count winners for active prize
  const confirmedForPrize = winners.filter(
    (w) => w.prizeId === activePrize?.id && w.status === 'confirmed'
  ).length;
  const remainingQuota = activePrize ? Math.max(0, activePrize.quantity - confirmedForPrize) : 0;

  // Compute pool of eligible participants/numbers
  const getEligiblePool = useCallback((): Array<{ ticket: string; name?: string; dept?: string; id?: string }> => {
    const wonTickets = new Set(
      winners
        .filter((w) => w.status === 'confirmed' || !config.allowDuplicateWinners)
        .map((w) => w.ticketNumber)
    );

    if (config.mode === 'range') {
      const pool: Array<{ ticket: string; name?: string; dept?: string; id?: string }> = [];
      const padLen = config.digitsLength || 4;
      for (let i = config.rangeStart; i <= config.rangeEnd; i++) {
        const numStr = i.toString().padStart(padLen, '0');
        const formatted = `${config.prefix || ''}${numStr}${config.suffix || ''}`;
        if (!wonTickets.has(formatted)) {
          pool.push({ ticket: formatted });
        }
      }
      return pool;
    } else {
      return participants
        .filter((p) => !wonTickets.has(p.ticketNumber))
        .map((p) => ({
          ticket: p.ticketNumber,
          name: p.name,
          dept: p.department,
          id: p.id,
        }));
    }
  }, [config, participants, winners]);

  const eligiblePool = getEligiblePool();

  useEffect(() => {
    if (stagedNumber === '0000' && eligiblePool.length > 0) {
      setStagedNumber(eligiblePool[0].ticket);
    } else if (eligiblePool.length === 0) {
      setStagedNumber('HABIS');
    }
  }, [eligiblePool, stagedNumber]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // START DRAW
  const handleStartDraw = () => {
    if (isRolling) return;

    if (eligiblePool.length === 0) {
      alert('Semua nomor / kupon yang tersedia sudah terpilih atau habis!');
      return;
    }

    if (remainingQuota <= 0) {
      const proceed = confirm(
        `Kuota untuk "${activePrize?.name}" sudah tercapai (${confirmedForPrize}/${activePrize?.quantity}). Tetap lanjutkan undian?`
      );
      if (!proceed) return;
    }

    const effectiveBatchSize = Math.min(config.batchSize || 1, eligiblePool.length);
    const shuffled = [...eligiblePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, effectiveBatchSize);

    setStagedNumber(selected[0].ticket);

    const now = new Date().toISOString();
    const newWinners: Winner[] = selected.map((s, idx) => ({
      id: `w-${Date.now()}-${idx}`,
      drawTime: now,
      ticketNumber: s.ticket,
      name: s.name,
      department: s.dept,
      prizeId: activePrize?.id || 'default',
      prizeName: activePrize?.name || 'Hadiah Undian',
      status: 'confirmed',
    }));

    setStagedWinners(newWinners);
    setIsRolling(true);

    // FESTIVE DRUMROLL + RISING SUSPENSE
    if (config.soundEnabled) {
      stopDrumrollRef.current = startFestiveDrumroll(
        config.soundVolume,
        config.rollDurationSeconds || 5
      );
    }
  };

  // FINISH DRAW
  const handleReelFinish = () => {
    setIsRolling(false);

    if (stopDrumrollRef.current) {
      stopDrumrollRef.current();
      stopDrumrollRef.current = null;
    }

    // Festive March & Victory Fanfare
    if (config.soundEnabled) {
      playFestiveFanfare(config.soundVolume);
    }

    // Confetti
    fireGrandConfetti();
    if (activePrize?.quantity === 1) {
      fireGoldShower();
    }

    setShowWinnerModal(true);
  };

  const handleConfirmWinner = () => {
    onUpdateState((prev) => ({
      ...prev,
      winners: [...stagedWinners, ...prev.winners],
    }));
    setShowWinnerModal(false);
  };

  const handleDisqualifyAndRedraw = () => {
    const disqualified = stagedWinners.map((w) => ({
      ...w,
      status: 'disqualified' as const,
      note: 'Gugur karena tidak hadir / verifikasi gagal',
    }));

    onUpdateState((prev) => ({
      ...prev,
      winners: [...disqualified, ...prev.winners],
    }));

    setShowWinnerModal(false);
    setTimeout(() => {
      handleStartDraw();
    }, 400);
  };

  const showBanner = config.showBannerBackdrop ?? true;

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 select-none overflow-hidden">
      {/* VINTAGE 1945 BACKGROUND AMBIANCE */}
      {showBanner && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bannerImg}
            alt="14th KBA SMPN 5 Makassar Banner"
            className="w-full h-full object-cover object-center scale-[1.02] filter brightness-[0.45] contrast-[1.1] sepia-[0.2]"
          />
          {/* Subtle Burgundy & Charcoal Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0707] via-[#130909]/75 to-[#0b0505]/90" />
        </div>
      )}

      {/* Top stage toolbar: Prize selector, Audio, Banner toggle, Fullscreen */}
      <div className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 bg-neutral-950/85 border border-amber-700/40 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl">
        {/* Prize Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950/80 text-amber-400 border border-amber-600/40 shadow-xs">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-amber-300/80 font-serif-title uppercase tracking-wider">
              Kategori Hadiah Undian
            </label>
            <select
              value={config.selectedPrizeId || activePrize?.id}
              onChange={(e) =>
                onUpdateState((prev) => ({
                  ...prev,
                  config: { ...prev.config, selectedPrizeId: e.target.value },
                }))
              }
              disabled={isRolling}
              className="bg-neutral-900 text-amber-200 font-serif-title font-bold text-sm sm:text-base rounded-lg px-2.5 py-1.5 border border-amber-600/50 hover:border-amber-400 focus:outline-none cursor-pointer"
            >
              {prizes.map((p) => {
                const won = winners.filter(
                  (w) => w.prizeId === p.id && w.status === 'confirmed'
                ).length;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({won}/{p.quantity} Pemenang)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Toggle Banner Backdrop */}
          <button
            onClick={() =>
              onUpdateState((prev) => ({
                ...prev,
                config: {
                  ...prev.config,
                  showBannerBackdrop: !(prev.config.showBannerBackdrop ?? true),
                },
              }))
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-serif-title font-semibold transition-all cursor-pointer ${
              showBanner
                ? 'bg-red-950/80 border-red-700/60 text-amber-200'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
            title="Tampilkan / Sembunyikan Poster Latar Belakang"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Poster Panggung</span>
          </button>

          {/* Sound Test */}
          <button
            onClick={() => {
              playPartyHorn(config.soundVolume);
              setTimeout(() => playFestiveFanfare(config.soundVolume), 350);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 text-xs font-serif-title font-bold transition-all cursor-pointer"
            title="Tes Suara Fanfare & Tepuk Tangan Acara"
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Uji Suara</span>
          </button>

          {/* Batch Size Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1.5 rounded-xl border border-amber-700/40 text-xs">
            <Layers className="w-4 h-4 text-amber-400" />
            <select
              value={config.batchSize}
              onChange={(e) =>
                onUpdateState((prev) => ({
                  ...prev,
                  config: { ...prev.config, batchSize: parseInt(e.target.value, 10) },
                }))
              }
              disabled={isRolling}
              className="bg-neutral-950 text-amber-200 font-bold px-1.5 py-0.5 rounded border border-neutral-800 cursor-pointer focus:outline-none"
            >
              <option value={1}>1 Kupon</option>
              <option value={3}>3 Kupon</option>
              <option value={5}>5 Kupon</option>
              <option value={10}>10 Kupon</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() =>
              onUpdateState((prev) => ({
                ...prev,
                config: { ...prev.config, soundEnabled: !prev.config.soundEnabled },
              }))
            }
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              config.soundEnabled
                ? 'bg-amber-950/60 border-amber-600/40 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title={config.soundEnabled ? 'Efek Suara Aktif' : 'Suara Dimatikan'}
          >
            {config.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-700/40 transition-all cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Proyektor)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Center Stage: Dignified 1945 Ballot Stage */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center my-auto py-3">
        {/* Event Header Ribbon */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-950/70 border border-amber-500/50 shadow-xs mb-2">
            <span className="text-xs">🇮🇩</span>
            <span className="text-xs sm:text-sm font-serif-display font-bold text-amber-300 tracking-widest uppercase">
              14TH KBA ESEMPE NEGERI 5 MAKASSAR
            </span>
            <span className="text-xs text-amber-400/60 hidden sm:inline">• BENTENG ROTTERDAM</span>
          </div>

          <h2 className="font-serif-title text-base sm:text-xl md:text-2xl font-black text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
            BERSATU DALAM SEMANGAT 1945
          </h2>
          <p className="text-xs text-amber-200/60 italic font-serif-title mt-0.5">
            "Melangkah Bersama, Menginspirasi Indonesia • Lebih dari Alumni, Kita Keluarga..."
          </p>
        </div>

        {/* Active Prize Card */}
        {activePrize && (
          <div className="text-center my-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[11px] font-serif-title uppercase tracking-widest mb-1">
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>PENGUNDIAN HADIAH</span>
            </div>

            <h1 className="font-serif-title text-2xl sm:text-4xl md:text-5xl font-extrabold text-amber-100 tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
              {activePrize.name}
            </h1>

            {activePrize.description && (
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-lg mx-auto font-serif-title">
                {activePrize.description}
              </p>
            )}

            {/* Quota Tracker */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs font-serif-title">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Kupon Terdaftar:{' '}
                <strong className="text-amber-200 font-mono-numbers">
                  {eligiblePool.length}
                </strong>
              </span>
              <span className="text-amber-700">•</span>
              <span className="flex items-center gap-1.5 text-amber-200">
                <Award className="w-3.5 h-3.5 text-red-400" />
                Sisa Kuota:{' '}
                <strong className="text-amber-300 font-mono-numbers font-bold">
                  {remainingQuota} / {activePrize.quantity}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Vintage Kupon Ticket Display */}
        <div className="w-full flex justify-center">
          <SlotReel
            isRolling={isRolling}
            targetNumber={stagedNumber}
            durationSeconds={config.rollDurationSeconds || 5}
            soundEnabled={config.soundEnabled}
            soundVolume={config.soundVolume}
            onFinish={handleReelFinish}
            theme={config.theme}
          />
        </div>

        {/* Dignified Draw Button (Prestigious Patriotic Seal Button) */}
        <div className="mt-2 sm:mt-4 flex flex-col items-center">
          <button
            onClick={handleStartDraw}
            disabled={isRolling || eligiblePool.length === 0}
            className={`group relative px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-serif-title font-bold text-base sm:text-xl tracking-wider uppercase transition-all duration-200 transform active:scale-95 shadow-xl cursor-pointer ${
              isRolling
                ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                : 'bg-gradient-to-b from-[#8b1c1c] via-[#6e1515] to-[#4c0d0d] hover:from-[#a02222] hover:to-[#5e1212] text-amber-100 border-2 border-amber-500/70 shadow-[0_8px_20px_rgba(0,0,0,0.6)]'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isRolling ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>MEMILIH KUPON BERUNTUNG...</span>
                </>
              ) : (
                <>
                  <Stamp className="w-5 h-5 text-amber-400" />
                  <span>TARIK KUPON UNDIAN</span>
                </>
              )}
            </div>
          </button>

          <span className="text-[11px] text-amber-300/60 mt-2 font-serif-title">
            💡 Tekan tombol di atas atau tekan <kbd className="px-1.5 py-0.5 bg-black/60 rounded border border-amber-600/40 text-amber-300 font-mono text-[10px]">Spasi</kbd> pada keyboard
          </span>
        </div>
      </div>

      {/* Bottom bar: Recent confirmed winners preview */}
      <div className="relative z-10 w-full max-w-5xl bg-neutral-950/85 border border-amber-700/40 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-lg mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-300 font-serif-title uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Rekap Kupon Terpilih ({winners.filter((w) => w.status === 'confirmed').length})
          </span>
          {onNavigateToWinners && (
            <button
              onClick={onNavigateToWinners}
              className="text-xs text-amber-400 hover:text-amber-300 font-serif-title font-bold hover:underline cursor-pointer"
            >
              Lihat Berita Acara Lengkap & Ekspor →
            </button>
          )}
        </div>

        {winners.length === 0 ? (
          <p className="text-xs text-neutral-400 italic py-1 font-serif-title">
            Belum ada nomor yang ditarik. Klik "TARIK KUPON UNDIAN" untuk memulai!
          </p>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {winners
              .filter((w) => w.status === 'confirmed')
              .slice(0, 6)
              .map((w) => (
                <div
                  key={w.id}
                  className="flex-shrink-0 flex items-center gap-2 bg-neutral-900/90 border border-amber-700/40 rounded-lg px-3 py-1.5 text-xs shadow-xs"
                >
                  <span className="font-mono-numbers font-bold text-amber-300">
                    {w.ticketNumber}
                  </span>
                  {w.name && <span className="text-neutral-200 font-medium">{w.name}</span>}
                  <span className="text-amber-400/60 text-[10px]">({w.prizeName.slice(0, 16)})</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Winner Celebration Modal */}
      <WinnerModal
        isOpen={showWinnerModal}
        winners={stagedWinners}
        prize={activePrize}
        onConfirm={handleConfirmWinner}
        onDisqualifyAndRedraw={handleDisqualifyAndRedraw}
        onClose={() => setShowWinnerModal(false)}
        theme={config.theme}
      />
    </div>
  );
};
