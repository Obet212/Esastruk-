import React from 'react';
import { 
  Receipt, 
  Smartphone, 
  History, 
  Settings, 
  ScanLine, 
  Store, 
  ArrowLeftRight, 
  Zap, 
  Coffee, 
  Wrench,
  Download
} from 'lucide-react';
import { ReceiptCategory } from '../types';

interface NavbarProps {
  currentCategory: ReceiptCategory;
  onSelectCategory: (cat: ReceiptCategory) => void;
  onOpenOcr: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenApkModal: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenOcr,
  onOpenHistory,
  onOpenSettings,
  onOpenApkModal,
  historyCount
}) => {
  const categories: { id: ReceiptCategory; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'retail', label: 'Kasir Toko', icon: <Store className="w-4 h-4" /> },
    { id: 'transfer', label: 'Transfer & QRIS', icon: <ArrowLeftRight className="w-4 h-4" />, badge: 'Populer' },
    { id: 'pln', label: 'Token PLN', icon: <Zap className="w-4 h-4" /> },
    { id: 'cafe', label: 'Cafe & Resto', icon: <Coffee className="w-4 h-4" /> },
    { id: 'service', label: 'Bengkel & Servis', icon: <Wrench className="w-4 h-4" /> }
  ];

  return (
    <header className="no-print bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-emerald-500/20 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  ESA STRUK
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v2.3
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cetak Struk Digital & Thermal ESC/POS
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOcr}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-500/30 transition-all cursor-pointer"
              title="Ekstrak data dari screenshot bukti transfer"
            >
              <ScanLine className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline">Scan Screenshot</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
              title="Lihat riwayat struk tersimpan"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Riwayat</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500 text-slate-950 font-black">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer"
              title="Pengaturan Profil Toko & Printer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* APK Download Button with Glow */}
            <button
              onClick={onOpenApkModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span className="font-extrabold hidden sm:inline">Unduh APK v2.3</span>
              <span className="font-extrabold sm:hidden">APK</span>
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/60">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-slate-950 text-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
