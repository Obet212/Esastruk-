import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  Printer, 
  Search, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { SavedReceipt, ReceiptCategory } from '../types';
import { formatRupiah } from '../utils/receiptGenerator';

interface ReceiptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReceipts: SavedReceipt[];
  onLoadReceipt: (receipt: SavedReceipt) => void;
  onDeleteReceipt: (id: string) => void;
  onClearHistory: () => void;
}

export const ReceiptHistoryModal: React.FC<ReceiptHistoryModalProps> = ({
  isOpen,
  onClose,
  savedReceipts,
  onLoadReceipt,
  onDeleteReceipt,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = savedReceipts.filter(r => {
    const matchesCat = filterCat === 'all' || r.category === filterCat;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedReceipts, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `esa-struk-backup-${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Riwayat Struk Tersimpan ({savedReceipts.length})
            </h3>
            <p className="text-xs text-slate-400">
              Daftar struk yang pernah Anda buat dan simpan di browser ini.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi atau nama..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="retail">Kasir Retail</option>
            <option value="transfer">Transfer & QRIS</option>
            <option value="pln">Token PLN</option>
            <option value="cafe">Cafe & Resto</option>
            <option value="service">Bengkel / Servis</option>
          </select>
        </div>

        {/* List of Receipts */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-96 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <span>Belum ada struk tersimpan atau cocok dengan pencarian.</span>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{item.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>{new Date(item.timestamp).toLocaleString('id-ID')}</span>
                    <span className="font-bold text-emerald-400">{formatRupiah(item.amount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onLoadReceipt(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold transition-all"
                  >
                    <span>Buka</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteReceipt(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-all"
                    title="Hapus struk ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={exportJson}
              disabled={savedReceipts.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>
            <button
              onClick={onClearHistory}
              disabled={savedReceipts.length === 0}
              className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-40"
            >
              Hapus Semua
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
