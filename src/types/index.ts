export type DrawMode = 'range' | 'custom';

export type WinnerStatus = 'confirmed' | 'disqualified';

export interface Participant {
  id: string;
  ticketNumber: string; // e.g. "0042", "A-108"
  name?: string;
  department?: string;
  phone?: string;
}

export interface Prize {
  id: string;
  name: string;
  description?: string;
  quantity: number; // kuota pemenang
  image?: string;
  color?: string;
}

export interface Winner {
  id: string;
  drawTime: string; // ISO string
  ticketNumber: string;
  name?: string;
  department?: string;
  prizeId: string;
  prizeName: string;
  status: WinnerStatus;
  note?: string;
}

export interface DrawConfig {
  mode: DrawMode;
  rangeStart: number;
  rangeEnd: number;
  digitsLength: number; // e.g. 4 for 0001
  prefix: string; // e.g. "TKT-"
  suffix: string;
  allowDuplicateWinners: boolean; // default false
  rollDurationSeconds: number; // e.g. 4
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  selectedPrizeId: string | null;
  batchSize: number; // 1, 3, 5, 10
  theme: 'kba' | 'gold' | 'neon' | 'festive' | 'slate';
  showBannerBackdrop?: boolean;
}

export interface AppState {
  config: DrawConfig;
  participants: Participant[];
  prizes: Prize[];
  winners: Winner[];
}
