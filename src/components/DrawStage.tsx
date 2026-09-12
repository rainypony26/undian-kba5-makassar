import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gift,
  Users,
  Award,
  Sparkles,
  Layers,
  Trophy,
  Image as ImageIcon,
  Music,
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

    // FESTIVE DRUMROLL + RISING SUSPENSE TENSION
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

    // ULTRA FESTIVE SOUND: Orchestral Fanfare, Cymbal Crash, Audience Cheers & Applause, Party Horns!
    if (config.soundEnabled) {
      playFestiveFanfare(config.soundVolume);
    }

    // Confetti Fireworks
    fireGrandConfetti();
    if (activePrize?.quantity === 1) {
      fireGoldShower();
    }

    // Open winner modal
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

  const isKbaTheme = config.theme === 'kba';
  const showBanner = config.showBannerBackdrop ?? true;

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 select-none overflow-hidden">
      {/* BACKGROUND BANNER POSTER INTEGRATION */}
      {showBanner && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bannerImg}
            alt="14th KBA SMPN 5 Makassar Banner"
            className="w-full h-full object-cover object-center scale-[1.02] filter blur-[1.5px] brightness-[0.72] contrast-[1.1]"
          />
          {/* Vignette Gradients for readability & stage elegance */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070505]/95 via-[#0e0707]/60 to-[#070505]/85" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90" />
        </div>
      )}

      {/* Top stage toolbar: Prize selector, Audio, Banner toggle, Fullscreen */}
      <div className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 bg-neutral-950/80 border border-yellow-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-2xl">
        {/* Prize Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/30 text-yellow-400 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-amber-300/90 uppercase tracking-wider">
              Kategori Hadiah Panggung
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
              className="bg-neutral-900 text-yellow-300 font-bold text-sm sm:text-base rounded-lg px-2.5 py-1.5 border border-yellow-500/50 hover:border-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer shadow-inner"
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

        {/* Controls: Batch, Audio, Banner Backdrop Toggle, Sound Test, Fullscreen */}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showBanner
                ? 'bg-red-950/70 border-red-500/50 text-yellow-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
            title="Tampilkan / Sembunyikan Poster Acara di Latar Belakang"
          >
            <ImageIcon className="w-4 h-4 text-yellow-400" />
            <span className="hidden md:inline">Poster Acara</span>
          </button>

          {/* Quick Sound Test (Festive Trompet & Fanfare Preview) */}
          <button
            onClick={() => {
              playPartyHorn(config.soundVolume);
              setTimeout(() => playFestiveFanfare(config.soundVolume), 350);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
            title="Tes Suara Fanfare, Terompet Pesta & Tepuk Tangan Meriah"
          >
            <Music className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Tes Suara Meriah</span>
          </button>

          {/* Batch Size Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1.5 rounded-xl border border-yellow-500/30 text-xs">
            <Layers className="w-4 h-4 text-yellow-400" />
            <select
              value={config.batchSize}
              onChange={(e) =>
                onUpdateState((prev) => ({
                  ...prev,
                  config: { ...prev.config, batchSize: parseInt(e.target.value, 10) },
                }))
              }
              disabled={isRolling}
              className="bg-neutral-950 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-neutral-700 cursor-pointer focus:outline-none"
            >
              <option value={1}>1 Nomor</option>
              <option value={3}>3 Nomor</option>
              <option value={5}>5 Nomor</option>
              <option value={10}>10 Nomor</option>
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
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-500'
            }`}
            title={config.soundEnabled ? 'Efek Suara Aktif' : 'Suara Dimatikan'}
          >
            {config.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-yellow-500/30 transition-all cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Proyektor)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Center Stage: Banner Heading & Slot Machine */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center my-auto py-4">
        {/* KBA Event Header Badge */}
        {isKbaTheme && (
          <div className="flex flex-col items-center text-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/40 border border-yellow-400/60 shadow-[0_0_20px_rgba(220,38,38,0.5)] mb-2">
              <span className="text-sm">🇮🇩</span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-wider uppercase">
                14TH KBA ESEMPE NEGERI 5 MAKASSAR
              </span>
              <span className="text-xs text-red-200 hidden sm:inline">• BENTENG ROTTERDAM</span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
              BERSATU DALAM SEMANGAT 1945
            </h2>
            <p className="text-xs text-neutral-300/80 italic">
              "Melangkah Bersama, Menginspirasi Indonesia • Lebih dari Alumni, Kita Keluarga..."
            </p>
          </div>
        )}

        {/* Active Prize Card */}
        {activePrize && (
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black tracking-wide uppercase mb-1.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
              <span>DOORPRIZE SEDANG DIUNDI</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-500 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {activePrize.name}
            </h1>

            {activePrize.description && (
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-1 max-w-lg mx-auto drop-shadow">
                {activePrize.description}
              </p>
            )}

            {/* Quota Tracker */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Users className="w-4 h-4 text-yellow-400" />
                Kupon Tersedia:{' '}
                <strong className="text-yellow-300 font-mono-numbers">
                  {eligiblePool.length}
                </strong>
              </span>
              <span className="text-neutral-500">•</span>
              <span className="flex items-center gap-1.5 text-amber-200">
                <Award className="w-4 h-4 text-red-400" />
                Sisa Kuota Hadiah:{' '}
                <strong className="text-yellow-400 font-mono-numbers font-bold">
                  {remainingQuota} / {activePrize.quantity}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Slot Reel Box */}
        <div className="w-full flex justify-center perspective-reel">
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

        {/* Big Draw Action Button */}
        <div className="mt-4 sm:mt-6 flex flex-col items-center">
          <button
            onClick={handleStartDraw}
            disabled={isRolling || eligiblePool.length === 0}
            className={`group relative px-8 sm:px-14 py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl md:text-3xl tracking-wider uppercase transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer ${
              isRolling
                ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-neutral-950 hover:shadow-[0_0_60px_rgba(234,179,8,0.7)] border-2 border-yellow-200'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {isRolling ? (
                <>
                  <RotateCcw className="w-7 h-7 animate-spin text-neutral-400" />
                  <span>MENGACAK NOMOR...</span>
                </>
              ) : (
                <>
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current transition-transform group-hover:scale-110 text-neutral-950" />
                  <span>PUTAR UNDIAN SEKARANG!</span>
                </>
              )}
            </div>

            {!isRolling && (
              <span className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 opacity-40 blur group-hover:opacity-80 transition duration-500 -z-10" />
            )}
          </button>

          <span className="text-xs text-amber-200/80 mt-3 drop-shadow font-medium">
            💡 Tekan tombol di atas atau tombol <kbd className="px-2 py-0.5 bg-black/60 rounded border border-yellow-400/40 text-yellow-300 font-mono">Spasi</kbd> pada keyboard
          </span>
        </div>
      </div>

      {/* Bottom bar: Recent confirmed winners preview */}
      <div className="relative z-10 w-full max-w-5xl bg-neutral-950/80 border border-yellow-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-xl mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Pemenang Doorprize Terbaru ({winners.filter((w) => w.status === 'confirmed').length})
          </span>
          {onNavigateToWinners && (
            <button
              onClick={onNavigateToWinners}
              className="text-xs text-yellow-400 hover:text-yellow-300 font-bold hover:underline cursor-pointer"
            >
              Lihat Rekap Berita Acara & Ekspor CSV →
            </button>
          )}
        </div>

        {winners.length === 0 ? (
          <p className="text-xs text-neutral-400 italic py-1">
            Belum ada nomor yang diundi. Klik "PUTAR UNDIAN SEKARANG" untuk memilih pemenang!
          </p>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {winners
              .filter((w) => w.status === 'confirmed')
              .slice(0, 6)
              .map((w) => (
                <div
                  key={w.id}
                  className="flex-shrink-0 flex items-center gap-2 bg-black/80 border border-yellow-500/40 rounded-lg px-3 py-1.5 text-xs shadow-md"
                >
                  <span className="font-mono-numbers font-bold text-yellow-300">
                    {w.ticketNumber}
                  </span>
                  {w.name && <span className="text-white font-medium">{w.name}</span>}
                  <span className="text-amber-400/80 text-[10px]">({w.prizeName.slice(0, 16)})</span>
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
