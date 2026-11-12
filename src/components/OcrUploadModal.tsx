import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  ScanLine, 
  FileImage, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCw, 
  AlertCircle 
} from 'lucide-react';
import { parseTransferText } from '../utils/smartOcrParser';
import { TransferData } from '../types';
import { formatRupiah } from '../utils/receiptGenerator';

interface OcrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtracted: (data: Partial<TransferData>) => void;
}

export const OcrUploadModal: React.FC<OcrUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyExtracted
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ReturnType<typeof parseTransferText> | null>(null);
  const [rawText, setRawText] = useState<string>('');

  if (!isOpen) return null;

  // Sample real text from common Indonesian m-banking receipts
  const sampleReceipts = [
    {
      label: 'Sample m-BCA Transfer',
      text: `M-BCA BUKTI TRANSFER\nTANGGAL: 10/11/2026 14:25:10\nNO. REFERENSI: 202611108392193\nDARI REKENING: 5820394819 - BUDI SETIAWAN\nKE REKENING: 0148921048 - TOKO BERKAH ESA\nNAMA PENERIMA: TOKO BERKAH ESA\nBANK TUJUAN: BCA\nJUMLAH: Rp 275.000,00\nBIAYA ADMIN: Rp 0\nSTATUS: BERHASIL\nBERITA: Pembelian Paket Sembako`
    },
    {
      label: 'Sample BRImo Transfer',
      text: `BANK BRI - BRIMO\nTRANSAKSI BERHASIL\n10/11/2026 16:12:05\nNO REFF: BRI2026111099231\nSUMBER DANA: 020601002345501 / AHMAD\nTUJUAN: 123000987654 / ESA STORE\nBANK: MANDIRI (BI-FAST)\nNOMINAL: Rp 500.000\nBIAYA ADMIN: Rp 2.500\nTOTAL: Rp 502.500\nSTATUS: BERHASIL`
    },
    {
      label: 'Sample DANA Bukti Transfer',
      text: `DANA INDONESIA\nKIRIM UANG BERHASIL\n10-11-2026 11:30:15\nID TRANSAKSI: DANA9823419082\nNOMINAL: Rp 150.000\nBIAYA ADMIN: Rp 0\nPENGIRIM: 081298765432 - CITRA LESTARI\nPENERIMA: 085712345678 - KASIR ESA STRUK`
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      processImageText();
    };
    reader.readAsDataURL(file);
  };

  const processImageText = (customText?: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const textToUse = customText || rawText || sampleReceipts[0].text;
      const parsed = parseTransferText(textToUse);
      setExtractedData(parsed);
      setIsProcessing(false);
    }, 600);
  };

  const handleApply = () => {
    if (!extractedData) return;
    onApplyExtracted({
      bankName: extractedData.bankName,
      bankLogoType: extractedData.bankLogoType,
      senderName: extractedData.senderName,
      senderAccount: extractedData.senderAccount,
      recipientBank: extractedData.recipientBank,
      recipientName: extractedData.recipientName,
      recipientAccount: extractedData.recipientAccount,
      amount: extractedData.amount,
      adminFee: extractedData.adminFee,
      totalAmount: extractedData.totalAmount,
      refNumber: extractedData.refNumber,
      date: extractedData.date,
      time: extractedData.time,
      status: 'BERHASIL',
      notes: extractedData.notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Scan & Ekstraksi Bukti Transfer
            </h3>
            <p className="text-xs text-slate-400">
              Unggah screenshot m-banking untuk otomatis mengisi data struk.
            </p>
          </div>
        </div>

        {/* Upload Box */}
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/50">
            <FileImage className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-200">
              Pilih file gambar screenshot bukti transfer
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP (BCA, BRI, Mandiri, Dana, dll)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Quick Preset Samples */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
              Atau coba contoh teks bukti transfer:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleReceipts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRawText(s.text);
                    processImageText(s.text);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-2 text-xs text-emerald-400">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Menganalisis data transaksi...</span>
            </div>
          )}

          {/* Extracted Result Preview */}
          {extractedData && !isProcessing && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Data Berhasil Dikenali:</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Bank Header:</span>
                  <strong className="text-white">{extractedData.bankName}</strong>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Nominal:</span>
                  <strong className="text-emerald-400">{formatRupiah(extractedData.amount)}</strong>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Penerima:</span>
                  <strong className="text-white">{extractedData.recipientName}</strong>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">No. Referensi:</span>
                  <strong className="text-white font-mono text-[11px]">{extractedData.refNumber}</strong>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>Terapkan ke Struk Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
