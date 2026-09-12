import { useState, useEffect } from 'react';
import type { AppState } from './types';
import { loadInitialState, saveStateToStorage } from './utils/storage';
import { Navbar, type ActiveTab } from './components/Navbar';
import { DrawStage } from './components/DrawStage';
import { PrizeManager } from './components/PrizeManager';
import { ParticipantManager } from './components/ParticipantManager';
import { WinnersList } from './components/WinnersList';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';

export function App() {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stage');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Sync to local storage on any state change
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  };

  // Keyboard shortcut: Spacebar to roll if on stage and not typing in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTab === 'stage' && !isSettingsOpen) {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT';
        if (!isInput) {
          e.preventDefault();
          // Find and click the draw button if present
          const drawBtn = document.querySelector('button[class*="PUTAR UNDIAN"]') as HTMLButtonElement | null;
          if (drawBtn && !drawBtn.disabled) {
            drawBtn.click();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isSettingsOpen]);

  // Theme styling for page background
  const getThemeBackground = () => {
    switch (state.config.theme) {
      case 'kba':
        return 'bg-[#080404] text-yellow-50';
      case 'neon':
        return 'bg-gradient-to-b from-[#060913] via-[#090e1f] to-[#04060d] text-cyan-50';
      case 'festive':
        return 'bg-gradient-to-b from-[#180509] via-[#1a080d] to-[#0d0305] text-amber-50';
      case 'slate':
        return 'bg-gradient-to-b from-[#0a0f1d] via-[#0d1424] to-[#060810] text-slate-50';
      case 'gold':
      default:
        return 'bg-gradient-to-b from-[#0b0c10] via-[#0e0f14] to-[#07080a] text-neutral-50';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${getThemeBackground()}`}>
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        winnerCount={state.winners.filter((w) => w.status === 'confirmed').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'stage' && (
          <DrawStage
            state={state}
            onUpdateState={updateState}
            onNavigateToWinners={() => setActiveTab('winners')}
          />
        )}

        {activeTab === 'prizes' && (
          <PrizeManager
            state={state}
            onUpdateState={updateState}
            onSelectPrizeToDraw={(_prizeId) => setActiveTab('stage')}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantManager
            state={state}
            onUpdateState={updateState}
          />
        )}

        {activeTab === 'winners' && (
          <WinnersList
            state={state}
            onUpdateState={updateState}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateState={updateState}
      />

      {/* Share / Open on Phone Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        localIp="10.39.28.72"
      />
    </div>
  );
}

export default App;
