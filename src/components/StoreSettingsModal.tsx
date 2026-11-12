import React from 'react';
import { X, Settings, Store, Printer, Save, Check } from 'lucide-react';
import { PaperWidth, ReceiptTheme, StoreProfile } from '../types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StoreProfile;
  onSaveProfile: (profile: StoreProfile) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = React.useState<StoreProfile>(profile);
  const [savedToast, setSavedToast] = React.useState(false);

  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 border border-slate-700 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Pengaturan Toko & Printer
            </h3>
            <p className="text-xs text-slate-400">
              Konfigurasi default untuk nama toko dan preferensi cetak.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nama Toko Default</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={e => setFormData(p => ({ ...p, storeName: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
              placeholder="ESA STRUK STORE"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Cabang / Subtitle</label>
            <input
              type="text"
              value={formData.branch}
              onChange={e => setFormData(p => ({ ...p, branch: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Pusat Kota"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Jl. Merdeka No. 12"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">No. Kontak / WA</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="08123456789"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Ukuran Kertas Default</label>
              <select
                value={formData.defaultPaperWidth}
                onChange={e => setFormData(p => ({ ...p, defaultPaperWidth: e.target.value as PaperWidth }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="58mm">58 mm (Printer Mini)</option>
                <option value="80mm">80 mm (Printer Standar)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Tema Font Default</label>
              <select
                value={formData.defaultTheme}
                onChange={e => setFormData(p => ({ ...p, defaultTheme: e.target.value as ReceiptTheme }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="classic">Classic Monospace</option>
                <option value="dotmatrix">Dot Matrix</option>
                <option value="modern">Modern Clean</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Catatan Kaki Default</label>
            <textarea
              rows={2}
              value={formData.footerNote}
              onChange={e => setFormData(p => ({ ...p, footerNote: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              {savedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedToast ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
