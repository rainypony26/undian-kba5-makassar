import React from 'react';
import {
  Sparkles,
  Trophy,
  Gift,
  Users,
  Settings,
  Disc,
  Smartphone,
} from 'lucide-react';

export type ActiveTab = 'stage' | 'prizes' | 'participants' | 'winners';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenShare?: () => void;
  winnerCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onOpenSettings,
  onOpenShare,
  winnerCount,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'stage', label: 'Panggung Undian', icon: <Disc className="w-4 h-4" /> },
    { id: 'prizes', label: 'Kategori Hadiah', icon: <Gift className="w-4 h-4" /> },
    { id: 'participants', label: 'Nomor & Peserta', icon: <Users className="w-4 h-4" /> },
    {
      id: 'winners',
      label: 'Daftar Pemenang',
      icon: <Trophy className="w-4 h-4" />,
      badge: winnerCount > 0 ? winnerCount : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onChangeTab('stage')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-neutral-950" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight block leading-tight">
              LUCKY DRAW <span className="text-amber-400">PRO</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase block">
              Sistem Nomor Undian
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-neutral-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick actions (Share / Open on Phone & Settings) */}
        <div className="flex items-center gap-2">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Scan QR Code / Buka di HP atau Laptop Lain"
            >
              <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Buka di HP</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
            title="Buka Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
