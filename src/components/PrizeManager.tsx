import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Gift, Check, X, Award } from 'lucide-react';
import type { AppState, Prize } from '../types';

interface PrizeManagerProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onSelectPrizeToDraw?: (prizeId: string) => void;
}

export const PrizeManager: React.FC<PrizeManagerProps> = ({
  state,
  onUpdateState,
  onSelectPrizeToDraw,
}) => {
  const { prizes, winners, config } = state;
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [color, setColor] = useState('#F59E0B');
  const [showAddForm, setShowAddForm] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setQuantity(1);
    setColor('#F59E0B');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSavePrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      // Update existing
      onUpdateState((prev) => ({
        ...prev,
        prizes: prev.prizes.map((p) =>
          p.id === editingId
            ? { ...p, name: name.trim(), description: description.trim(), quantity, color }
            : p
        ),
      }));
    } else {
      // Add new
      const newPrize: Prize = {
        id: `prize-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        quantity: Math.max(1, quantity),
        color,
      };
      onUpdateState((prev) => ({
        ...prev,
        prizes: [...prev.prizes, newPrize],
      }));
    }

    resetForm();
  };

  const handleStartEdit = (prize: Prize) => {
    setEditingId(prize.id);
    setName(prize.name);
    setDescription(prize.description || '');
    setQuantity(prize.quantity);
    setColor(prize.color || '#F59E0B');
    setShowAddForm(true);
  };

  const handleDeletePrize = (prizeId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori hadiah ini?')) {
      onUpdateState((prev) => ({
        ...prev,
        prizes: prev.prizes.filter((p) => p.id !== prizeId),
        config: {
          ...prev.config,
          selectedPrizeId:
            prev.config.selectedPrizeId === prizeId
              ? prev.prizes.find((p) => p.id !== prizeId)?.id || null
              : prev.config.selectedPrizeId,
        },
      }));
    }
  };

  const colorPresets = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Gift className="w-8 h-8 text-amber-400" />
            Kategori & Manajemen Hadiah
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Atur daftar hadiah, urutan penarikan, dan kuota jumlah pemenang untuk masing-masing hadiah.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Hadiah</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal / Card */}
      {showAddForm && (
        <form
          onSubmit={handleSavePrize}
          className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 sm:p-6 mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              {editingId ? 'Edit Kategori Hadiah' : 'Tambah Hadiah Baru'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Hadiah *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Grand Prize - Motor Listrik"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Jumlah Pemenang (Kuota) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Deskripsi / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Sponsor dari PT ABC untuk seluruh peserta"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Warna Aksen Kartu
              </label>
              <div className="flex items-center gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                      color === c ? 'border-white scale-110' : 'border-transparent opacity-70'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer ml-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Hadiah</span>
            </button>
          </div>
        </form>
      )}

      {/* Prize Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prizes.map((prize, idx) => {
          const wonCount = winners.filter(
            (w) => w.prizeId === prize.id && w.status === 'confirmed'
          ).length;
          const isSelected = config.selectedPrizeId === prize.id;
          const isComplete = wonCount >= prize.quantity;

          return (
            <div
              key={prize.id}
              style={{ borderLeftColor: prize.color || '#F59E0B' }}
              className={`relative bg-neutral-900/90 border border-neutral-800 border-l-4 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${
                isSelected ? 'ring-2 ring-amber-400/50 bg-neutral-800/60' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{prize.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(prize)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                      title="Edit Hadiah"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrize(prize.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                      title="Hapus Hadiah"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {prize.description && (
                  <p className="text-xs text-neutral-400 mb-3">{prize.description}</p>
                )}

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-400">Progres Pemenang:</span>
                    <span
                      className={`font-mono-numbers font-bold ${
                        isComplete ? 'text-green-400' : 'text-amber-300'
                      }`}
                    >
                      {wonCount} / {prize.quantity} Pemenang {isComplete && '(Lengkap)'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(100, (wonCount / prize.quantity) * 100)}%`,
                        backgroundColor: prize.color || '#F59E0B',
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                {isSelected ? (
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Sedang Dipilih di Panggung
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      onUpdateState((prev) => ({
                        ...prev,
                        config: { ...prev.config, selectedPrizeId: prize.id },
                      }));
                      if (onSelectPrizeToDraw) {
                        onSelectPrizeToDraw(prize.id);
                      }
                    }}
                    className="text-xs text-neutral-300 hover:text-amber-400 font-medium hover:underline cursor-pointer"
                  >
                    Pilih untuk Diundi →
                  </button>
                )}

                <span className="text-[11px] text-neutral-500">
                  Sisa: {Math.max(0, prize.quantity - wonCount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
