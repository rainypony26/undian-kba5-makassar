import React, { useState } from 'react';
import {
  Hash,
  Users,
  Upload,
  Plus,
  Trash2,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';
import type { AppState, Participant } from '../types';

interface ParticipantManagerProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  state,
  onUpdateState,
}) => {
  const { config, participants, winners } = state;

  // Search & manual add states
  const [searchTerm, setSearchTerm] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);

  // Manual single add
  const [singleTicket, setSingleTicket] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleDept, setSingleDept] = useState('');

  // Switch mode
  const handleModeChange = (mode: 'range' | 'custom') => {
    onUpdateState((prev) => ({
      ...prev,
      config: { ...prev.config, mode },
    }));
  };

  // Range configuration updates
  const handleRangeUpdate = (key: string, val: unknown) => {
    onUpdateState((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: val },
    }));
  };

  // Add single participant
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTicket.trim()) return;

    const newP: Participant = {
      id: `p-${Date.now()}`,
      ticketNumber: singleTicket.trim(),
      name: singleName.trim() || undefined,
      department: singleDept.trim() || undefined,
    };

    onUpdateState((prev) => ({
      ...prev,
      participants: [newP, ...prev.participants],
    }));

    setSingleTicket('');
    setSingleName('');
    setSingleDept('');
  };

  // Parse pasted text or CSV
  const handleProcessPastedText = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedList: Participant[] = [];

    lines.forEach((line, idx) => {
      // Split by comma, tab, or semicolon
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length > 0 && parts[0]) {
        parsedList.push({
          id: `p-${Date.now()}-${idx}`,
          ticketNumber: parts[0],
          name: parts[1] || undefined,
          department: parts[2] || undefined,
        });
      }
    });

    if (parsedList.length > 0) {
      onUpdateState((prev) => ({
        ...prev,
        participants: [...prev.participants, ...parsedList],
      }));
      setPasteText('');
      setShowPasteModal(false);
      alert(`Berhasil mengimpor ${parsedList.length} peserta!`);
    } else {
      alert('Format teks tidak valid. Silakan periksa kembali.');
    }
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPasteText(content);
        setShowPasteModal(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear all custom participants
  const handleClearParticipants = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data peserta kustom?')) {
      onUpdateState((prev) => ({
        ...prev,
        participants: [],
      }));
    }
  };

  // Delete single participant
  const handleDeleteParticipant = (id: string) => {
    onUpdateState((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  };

  // Calculate stats
  const wonTicketsSet = new Set(winners.map((w) => w.ticketNumber));

  const totalRangeCount = Math.max(0, config.rangeEnd - config.rangeStart + 1);

  const filteredParticipants = participants.filter(
    (p) =>
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Hash className="w-8 h-8 text-amber-400" />
          Manajemen Nomor & Peserta Undian
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Tentukan metode pengundian: menggunakan rentang angka otomatis atau daftar kupon peserta kustom.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl mb-8">
        <button
          onClick={() => handleModeChange('range')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            config.mode === 'range'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>Mode Rentang Angka (Range)</span>
        </button>

        <button
          onClick={() => handleModeChange('custom')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            config.mode === 'custom'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mode Daftar Peserta Kustom / CSV</span>
        </button>
      </div>

      {/* MODE 1: RANGE */}
      {config.mode === 'range' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-amber-400" />
              Pengaturan Rentang Angka Otomatis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nomor Mulai
                </label>
                <input
                  type="number"
                  min={0}
                  value={config.rangeStart}
                  onChange={(e) => handleRangeUpdate('rangeStart', parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nomor Selesai
                </label>
                <input
                  type="number"
                  min={config.rangeStart}
                  value={config.rangeEnd}
                  onChange={(e) => handleRangeUpdate('rangeEnd', parseInt(e.target.value, 10) || 100)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Panjang Digit (Leading Zeros)
                </label>
                <select
                  value={config.digitsLength}
                  onChange={(e) => handleRangeUpdate('digitsLength', parseInt(e.target.value, 10))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value={1}>1 digit (1, 2, ...)</option>
                  <option value={2}>2 digit (01, 02, ...)</option>
                  <option value={3}>3 digit (001, 002, ...)</option>
                  <option value={4}>4 digit (0001, 0002, ...)</option>
                  <option value={5}>5 digit (00001, ...)</option>
                  <option value={6}>6 digit (000001, ...)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Prefix (Awalan Kupon)
                </label>
                <input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => handleRangeUpdate('prefix', e.target.value)}
                  placeholder="Contoh: TKT-, A-"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Live Preview of Numbers */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                Pratinjau Format Nomor:
              </span>
              <div className="flex flex-wrap gap-2 font-mono-numbers text-sm">
                {[0, 1, 2, 3, 4].map((offset) => {
                  const num = config.rangeStart + offset;
                  if (num > config.rangeEnd) return null;
                  const formatted = `${config.prefix || ''}${num
                    .toString()
                    .padStart(config.digitsLength, '0')}${config.suffix || ''}`;
                  return (
                    <span
                      key={offset}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-amber-300 font-bold"
                    >
                      {formatted}
                    </span>
                  );
                })}
                {totalRangeCount > 5 && (
                  <span className="px-2.5 py-1 text-neutral-500 self-center">
                    ... hingga{' '}
                    <strong className="text-amber-400">
                      {`${config.prefix || ''}${config.rangeEnd
                        .toString()
                        .padStart(config.digitsLength, '0')}${config.suffix || ''}`}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* Range Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-800 text-center">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Total Kupon di Rentang</span>
                <span className="text-2xl font-black text-white font-mono-numbers">
                  {totalRangeCount.toLocaleString()}
                </span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Sudah Menang (Tercabut)</span>
                <span className="text-2xl font-black text-amber-400 font-mono-numbers">
                  {wonTicketsSet.size}
                </span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Sisa Kupon Tersedia</span>
                <span className="text-2xl font-black text-green-400 font-mono-numbers">
                  {Math.max(0, totalRangeCount - wonTicketsSet.size).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CUSTOM PARTICIPANTS */}
      {config.mode === 'custom' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold border border-neutral-700 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload CSV / TXT</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowPasteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold border border-neutral-700 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Paste Daftar Teks</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">
                Total: <strong className="text-white font-mono-numbers">{participants.length}</strong>{' '}
                Peserta
              </span>
              {participants.length > 0 && (
                <button
                  onClick={handleClearParticipants}
                  className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                  title="Hapus Semua Peserta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Single Participant Form */}
          <form
            onSubmit={handleAddSingle}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
          >
            <div>
              <input
                type="text"
                required
                placeholder="Nomor Kupon (wajib)*"
                value={singleTicket}
                onChange={(e) => setSingleTicket(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Nama Peserta (opsional)"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Divisi / No. Telp (opsional)"
                value={singleDept}
                onChange={(e) => setSingleDept(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kupon</span>
              </button>
            </div>
          </form>

          {/* Search bar & Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/50">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nomor kupon, nama, atau departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-0 text-sm text-white focus:outline-none"
              />
            </div>

            {participants.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-neutral-400">Belum ada daftar peserta kustom.</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Upload file CSV atau gunakan tombol "Paste Daftar Teks" untuk memasukkan data secara massal.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider sticky top-0 border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">No. Kupon</th>
                      <th className="py-3 px-4">Nama Peserta</th>
                      <th className="py-3 px-4">Departemen / Info</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredParticipants.map((p) => {
                      const hasWon = wonTicketsSet.has(p.ticketNumber);
                      return (
                        <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono-numbers font-bold text-amber-300">
                            {p.ticketNumber}
                          </td>
                          <td className="py-2.5 px-4 text-white font-medium">
                            {p.name || <span className="text-neutral-600">-</span>}
                          </td>
                          <td className="py-2.5 px-4 text-neutral-400 text-xs">
                            {p.department || <span className="text-neutral-600">-</span>}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {hasWon ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                                Sudah Menang
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/30">
                                Siap Diundi
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="p-1 rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Paste Data Kupon / Peserta
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Format: <code>NomorKupon, Nama, Departemen</code> (satu peserta per baris). Pemisah bisa menggunakan koma, titik koma, atau tab dari Excel.
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="001, Ahmad Fauzi, IT Division&#10;002, Siti Nurhaliza, Finance&#10;003, Bambang Tri, HRD"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-sm text-white font-mono-numbers focus:outline-none focus:border-amber-400 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleProcessPastedText}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Impor Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
