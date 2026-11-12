import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Smartphone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  QrCode, 
  GitBranch, 
  Layers, 
  Printer, 
  Share2, 
  X,
  Sparkles
} from 'lucide-react';
import { generateQrCodeDataUrl } from '../utils/receiptGenerator';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadBanner: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  return (
    <div className="no-print bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base sm:text-lg">
                ESA STRUK APK Android v2.3
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Rilis Terbaru
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Install aplikasi Android native: terima share bukti transfer, cetak langsung via Bluetooth thermal 58/80mm tanpa ribet!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="https://github.com/Obet212/Jadistruk-apk/releases/download/v2.3/ESASTRUK-2.3.apk"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 text-center cursor-pointer"
            download
          >
            <Download className="w-4 h-4" />
            <span>Unduh APK (v2.3)</span>
          </a>
          <button
            onClick={onOpenModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            Info & QR
          </button>
        </div>
      </div>
    </div>
  );
};

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const apkDownloadUrl = 'https://github.com/Obet212/Jadistruk-apk/releases/download/v2.3/ESASTRUK-2.3.apk';
  const releaseUrl = 'https://github.com/Obet212/Jadistruk-apk/releases/tag/v2.3';
  const repoUrl = 'https://github.com/Obet212/Jadistruk-apk';

  useEffect(() => {
    generateQrCodeDataUrl(apkDownloadUrl).then(setQrUrl);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">ESA STRUK Android v2.3</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                APK Official
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Repository: Obet212/Jadistruk-apk &bull; Format: Android APK (.apk)
            </p>
          </div>
        </div>

        {/* QR Code and Download CTA */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex flex-col items-center bg-white p-2.5 rounded-xl shadow-md shrink-0">
            {qrUrl ? (
              <img src={qrUrl} alt="Scan QR to Download APK" className="w-32 h-32" />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-slate-100 text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-800 mt-1">Scan Kamera HP</span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">
                Download Langsung ke Perangkat Android Anda
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Arahkan kamera smartphone ke QR code di samping atau klik tombol unduh di bawah ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
              <a
                href={apkDownloadUrl}
                download="ESASTRUK-2.3.apk"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File ESASTRUK-2.3.apk</span>
              </a>

              <a
                href={releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Halaman Rilis GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Key Features of APK */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fitur Unggulan Versi 2.0:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <Share2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Share Receiver Android</strong>
                <span className="text-slate-400">
                  Langsung share gambar bukti transfer dari m-banking ke ESA STRUK.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <Printer className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Cetak Bluetooth Thermal</strong>
                <span className="text-slate-400">
                  Koneksi bluetooth instan ke printer thermal 58mm & 80mm ESC/POS.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Ekstraksi OCR Presisi</strong>
                <span className="text-slate-400">
                  Mengenali otomatis nominal, bank, rekening tujuan, dan nomor referensi.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">100% Offline & Aman</strong>
                <span className="text-slate-400">
                  Seluruh data struk tersimpan aman di perangkat pengguna.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Petunjuk Instalasi APK di Android:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
            <li>Download file <code className="text-amber-200">ESASTRUK-2.0.apk</code> melalui link di atas.</li>
            <li>Buka file yang diunduh pada bilah notifikasi atau folder Download.</li>
            <li>Jika muncul peringatan <em>"Instal aplikasi yang tidak dikenal"</em>, aktifkan izin untuk browser/file manager Anda.</li>
            <li>Tekan tombol <strong>Instal</strong> dan aplikasi siap digunakan!</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Tutup
          </button>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </div>
  );
};
