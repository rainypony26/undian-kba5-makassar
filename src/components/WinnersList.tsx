import React, { useState } from 'react';
import {
  Trophy,
  Download,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Printer,
  Calendar,
} from 'lucide-react';
import type { AppState } from '../types';
import { exportWinnersToCSV } from '../utils/storage';

interface WinnersListProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const WinnersList: React.FC<WinnersListProps> = ({ state, onUpdateState }) => {
  const { winners, prizes } = state;
  const [selectedPrizeFilter, setSelectedPrizeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtered list
  const filteredWinners = winners.filter((w) => {
    const matchPrize = selectedPrizeFilter === 'all' || w.prizeId === selectedPrizeFilter;
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchSearch =
      w.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.name && w.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.department && w.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.prizeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchPrize && matchStatus && matchSearch;
  });

  // Toggle status
  const handleToggleStatus = (winnerId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      winners: prev.winners.map((w) =>
        w.id === winnerId
          ? {
              ...w,
              status: w.status === 'confirmed' ? 'disqualified' : 'confirmed',
            }
          : w
      ),
    }));
  };

  // Delete winner entry
  const handleDeleteWinner = (winnerId: string) => {
    if (confirm('Hapus nomor ini dari daftar riwayat pemenang?')) {
      onUpdateState((prev) => ({
        ...prev,
        winners: prev.winners.filter((w) => w.id !== winnerId),
      }));
    }
  };

  // Clear all winners
  const handleClearAll = () => {
    const code = prompt('Ketik "RESET" untuk mengosongkan seluruh riwayat pemenang:');
    if (code === 'RESET') {
      onUpdateState((prev) => ({
        ...prev,
        winners: [],
      }));
      alert('Riwayat pemenang telah direset.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Daftar & Berita Acara Pemenang
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Rekapitulasi seluruh nomor dan pemenang undian yang telah terpilih beserta status verifikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportWinnersToCSV(winners)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
            title="Download file CSV untuk Microsoft Excel"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor ke CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
            title="Cetak Berita Acara (Print)"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-700">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari pemenang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 text-sm text-white focus:outline-none"
          />
        </div>

        {/* Filter Prize */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-700 text-sm">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedPrizeFilter}
            onChange={(e) => setSelectedPrizeFilter(e.target.value)}
            className="w-full bg-transparent border-0 text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Kategori Hadiah</option>
            {prizes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-700 text-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent border-0 text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="confirmed">Hanya Sah / Terverifikasi</option>
            <option value="disqualified">Hanya Gugur / Batal</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        {winners.length === 0 ? (
          <div className="p-16 text-center text-neutral-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-neutral-400">Belum ada riwayat pemenang.</p>
            <p className="text-xs text-neutral-500 mt-1">
              Buka tab "Panggung Undian" dan mulai penarikan nomor undian pertama Anda!
            </p>
          </div>
        ) : filteredWinners.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            <p className="font-semibold text-neutral-400">Tidak ada pemenang yang cocok dengan filter pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nomor Undian</th>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4">Kategori Hadiah</th>
                  <th className="py-3 px-4">Waktu Undian</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredWinners.map((winner, idx) => {
                  const isConfirmed = winner.status === 'confirmed';
                  const dateStr = new Date(winner.drawTime).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={winner.id}
                      className={`hover:bg-neutral-800/40 transition-colors ${
                        !isConfirmed ? 'opacity-60 bg-red-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-neutral-500 font-mono-numbers">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono-numbers text-base font-black text-amber-300">
                          {winner.ticketNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-semibold">
                          {winner.name || <span className="text-neutral-500 italic">Peserta Kupon</span>}
                        </div>
                        {winner.department && (
                          <div className="text-xs text-neutral-400">{winner.department}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-neutral-300 font-medium">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-800 text-xs border border-neutral-700">
                          {winner.prizeName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 text-xs font-mono-numbers">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(winner.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isConfirmed
                              ? 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                          }`}
                          title="Klik untuk mengubah status"
                        >
                          {isConfirmed ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sah</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Gugur</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteWinner(winner.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                          title="Hapus riwayat pemenang ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info & reset button */}
        {winners.length > 0 && (
          <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Menampilkan {filteredWinners.length} dari {winners.length} data pemenang
            </span>

            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer"
            >
              Reset / Bersihkan Seluruh Riwayat Pemenang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
