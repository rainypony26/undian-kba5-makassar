import type { AppState, Prize, Participant, Winner, DrawConfig } from '../types';

const STORAGE_KEY = 'sistem_nomor_undian_kba_v2';

export const DEFAULT_CONFIG: DrawConfig = {
  mode: 'range',
  rangeStart: 1,
  rangeEnd: 500,
  digitsLength: 4,
  prefix: 'KBA-',
  suffix: '',
  allowDuplicateWinners: false,
  rollDurationSeconds: 5,
  soundEnabled: true,
  soundVolume: 0.8,
  selectedPrizeId: 'prize-1',
  batchSize: 1,
  theme: 'kba',
  showBannerBackdrop: true,
};

export const DEFAULT_PRIZES: Prize[] = [
  {
    id: 'prize-1',
    name: 'Rice Cooker Digital',
    description: 'Hadiah Utama 14th KBA SMPN 5 Makassar',
    quantity: 2,
    color: '#DC2626',
  },
  {
    id: 'prize-2',
    name: 'Kompor Gas 2 Tungku',
    description: 'Hadiah Utama Panggung Semangat 1945',
    quantity: 2,
    color: '#D97706',
  },
  {
    id: 'prize-3',
    name: 'Rice Box Modern',
    description: 'Hadiah Menarik Doorprize Benteng Rotterdam',
    quantity: 3,
    color: '#B45309',
  },
  {
    id: 'prize-4',
    name: 'Kipas Angin Berdiri',
    description: 'Doorprize Favorit Alumni SMPN 5 Makassar',
    quantity: 5,
    color: '#E11D48',
  },
  {
    id: 'prize-5',
    name: 'Paket Bingkisan Spesial KBA',
    description: 'Hadiah Hiburan Keluarga Besar Alumni',
    quantity: 10,
    color: '#EA580C',
  },
];

export const SAMPLE_PARTICIPANTS: Participant[] = [
  { id: 'p-1', ticketNumber: 'KBA-0001', name: 'Andi M. Faisal', department: 'Alumni Angkatan 1995' },
  { id: 'p-2', ticketNumber: 'KBA-0002', name: 'Nur Rahmawati', department: 'Alumni Angkatan 1998' },
  { id: 'p-3', ticketNumber: 'KBA-0003', name: 'Muhammad Ikbal', department: 'Alumni Angkatan 2002' },
  { id: 'p-4', ticketNumber: 'KBA-0004', name: 'Dewi Sartika', department: 'Alumni Angkatan 2005' },
  { id: 'p-5', ticketNumber: 'KBA-0005', name: 'Syamsul Rizal', department: 'Alumni Angkatan 1992' },
  { id: 'p-6', ticketNumber: 'KBA-0006', name: 'Hasnawaty', department: 'Alumni Angkatan 2000' },
  { id: 'p-7', ticketNumber: 'KBA-0007', name: 'Fathur Rahman', department: 'Alumni Angkatan 2010' },
  { id: 'p-8', ticketNumber: 'KBA-0008', name: 'Indah Permatasari', department: 'Alumni Angkatan 2012' },
  { id: 'p-9', ticketNumber: 'TKT-0009', name: 'Hendra Gunawan', department: 'Sales' },
  { id: 'p-10', ticketNumber: 'TKT-0010', name: 'Nurul Hidayah', department: 'Sekretariat' },
];

export function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) },
        participants: parsed.participants || SAMPLE_PARTICIPANTS,
        prizes: parsed.prizes?.length ? parsed.prizes : DEFAULT_PRIZES,
        winners: parsed.winners || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse saved state from localStorage:', e);
  }

  return {
    config: DEFAULT_CONFIG,
    participants: SAMPLE_PARTICIPANTS,
    prizes: DEFAULT_PRIZES,
    winners: [],
  };
}

export function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

/**
 * Export winners data to a downloadable CSV with BOM (Excel-safe UTF-8)
 */
export function exportWinnersToCSV(winners: Winner[]) {
  if (winners.length === 0) {
    alert('Belum ada pemenang untuk diekspor.');
    return;
  }

  const headers = ['No', 'Waktu Undi', 'Nomor Undian', 'Nama Pemenang', 'Departemen/Keterangan', 'Hadiah', 'Status'];
  const rows = winners.map((w, index) => {
    const formattedDate = new Date(w.drawTime).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
    return [
      index + 1,
      `"${formattedDate}"`,
      `"${w.ticketNumber}"`,
      `"${w.name || '-'}"`,
      `"${w.department || '-'}"`,
      `"${w.prizeName}"`,
      `"${w.status === 'confirmed' ? 'Sah' : 'Gugur'}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rekap_pemenang_undian_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export entire app backup as JSON file
 */
export function exportBackupJSON(state: AppState) {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `backup_undian_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
