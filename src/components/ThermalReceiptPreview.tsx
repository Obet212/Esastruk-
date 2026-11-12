import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  BookmarkPlus, 
  Maximize2, 
  Sparkles, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { 
  CafeData, 
  PaperWidth, 
  PlnData, 
  ReceiptCategory, 
  ReceiptTheme, 
  RetailData, 
  ServiceData, 
  TransferData 
} from '../types';
import { 
  formatRupiah, 
  formatRupiahNumber, 
  generateQrCodeDataUrl, 
  generateRetailText, 
  generateTransferText, 
  generatePlnText 
} from '../utils/receiptGenerator';

interface ThermalReceiptPreviewProps {
  category: ReceiptCategory;
  retailData: RetailData;
  transferData: TransferData;
  plnData: PlnData;
  cafeData: CafeData;
  serviceData: ServiceData;
  paperWidth: PaperWidth;
  onChangePaperWidth: (w: PaperWidth) => void;
  receiptTheme: ReceiptTheme;
  onChangeTheme: (t: ReceiptTheme) => void;
  onSaveToHistory: () => void;
}

export const ThermalReceiptPreview: React.FC<ThermalReceiptPreviewProps> = ({
  category,
  retailData,
  transferData,
  plnData,
  cafeData,
  serviceData,
  paperWidth,
  onChangePaperWidth,
  receiptTheme,
  onChangeTheme,
  onSaveToHistory
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // Load QR Code whenever category data changes
  useEffect(() => {
    let payload = 'ESA-STRUK';
    if (category === 'retail') {
      payload = retailData.qrisValue || retailData.transactionNo;
    } else if (category === 'transfer') {
      payload = `REF:${transferData.refNumber}|AMOUNT:${transferData.amount}|BANK:${transferData.recipientBank}`;
    } else if (category === 'pln') {
      payload = `PLN-TOKEN:${plnData.tokenNumber}|METER:${plnData.meterId}`;
    } else if (category === 'cafe') {
      payload = `CAFE:${cafeData.cafeName}|TABLE:${cafeData.tableNo}|TRX:${cafeData.transactionNo}`;
    } else if (category === 'service') {
      payload = `POLICE:${serviceData.policeNo}|TRX:${serviceData.transactionNo}`;
    }

    generateQrCodeDataUrl(payload).then(setQrDataUrl);
  }, [category, retailData, transferData, plnData, cafeData, serviceData]);

  // Handle Print via Window Dialog
  const handlePrint = () => {
    window.print();
  };

  // Handle Copy Monospace Text
  const handleCopyText = async () => {
    let text = '';
    const widthCols = paperWidth === '58mm' ? 32 : 48;
    if (category === 'retail') {
      text = generateRetailText(retailData, widthCols);
    } else if (category === 'transfer') {
      text = generateTransferText(transferData, widthCols);
    } else if (category === 'pln') {
      text = generatePlnText(plnData, widthCols);
    } else {
      text = generateRetailText(retailData, widthCols);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Handle Download Receipt as Image (PNG) using Canvas DOM rasterizer
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);

    try {
      const element = receiptRef.current;
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      // Create an SVG with embedded HTML foreignObject to capture CSS and styles faithfully
      const cloned = element.cloneNode(true) as HTMLElement;
      // Ensure dark fonts for print
      cloned.style.margin = '0';
      cloned.style.boxShadow = 'none';

      const htmlContent = cloned.outerHTML;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: monospace; background: white; color: black;">
              ${htmlContent}
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        // scale 2x for retina sharpness
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(scale, scale);
          ctx.drawImage(image, 0, 0);

          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `Struk-${category}-${Date.now()}.png`;
          downloadLink.href = pngUrl;
          downloadLink.click();
        }
        URL.revokeObjectURL(blobURL);
        setIsExporting(false);
      };
      image.onerror = () => {
        // Fallback: simple print or alert
        setIsExporting(false);
        window.print();
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Export image error:', err);
      setIsExporting(false);
      window.print();
    }
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    const widthCols = paperWidth === '58mm' ? 32 : 48;
    let text = '';
    if (category === 'retail') text = generateRetailText(retailData, widthCols);
    else if (category === 'transfer') text = generateTransferText(transferData, widthCols);
    else if (category === 'pln') text = generatePlnText(plnData, widthCols);
    else text = generateRetailText(retailData, widthCols);

    const encoded = encodeURIComponent(`*STRUK DIGITAL ESA STRUK*\n\n\`\`\`\n${text}\n\`\`\``);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const fontClass = 
    receiptTheme === 'dotmatrix' ? 'font-dotmatrix tracking-wider' :
    receiptTheme === 'modern' ? 'font-sans' : 'font-thermal';

  const is58mm = paperWidth === '58mm';
  const paperWidthClass = is58mm ? 'w-[320px] max-w-[320px] text-[12px]' : 'w-[420px] max-w-[420px] text-[13px]';

  return (
    <div className="flex flex-col items-center">
      {/* Control Toolbar */}
      <div className="no-print w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Paper Size Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangePaperWidth('58mm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              is58mm
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            58 mm (32 col)
          </button>
          <button
            onClick={() => onChangePaperWidth('80mm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !is58mm
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            80 mm (48 col)
          </button>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline mr-1">Tema:</span>
          {(['classic', 'modern', 'dotmatrix'] as ReceiptTheme[]).map((thm) => (
            <button
              key={thm}
              onClick={() => onChangeTheme(thm)}
              className={`px-2.5 py-1.5 rounded-lg font-medium capitalize text-xs transition-all cursor-pointer ${
                receiptTheme === thm
                  ? 'bg-slate-700 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {thm === 'dotmatrix' ? 'Dot Matrix' : thm}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Simpan ke riwayat"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Simpan</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Salin teks struk format monospace"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Kirim ke WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Unduh struk sebagai gambar PNG"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all transform active:scale-95 cursor-pointer"
            title="Cetak struk ke printer thermal / sistem"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Thermal</span>
          </button>
        </div>
      </div>

      {/* Realistic Paper Thermal Container */}
      <div className="relative py-4 px-2 max-w-full overflow-x-auto flex justify-center">
        {/* Paper top jagged rip */}
        <div 
          ref={receiptRef}
          className={`
            bg-white text-black p-5 sm:p-6
            receipt-paper-shadow transition-all duration-200
            border-t-2 border-b-2 border-dashed border-gray-300
            ${paperWidthClass}
            ${fontClass}
            thermal-receipt-printable
            ${is58mm ? 'thermal-receipt-58mm' : 'thermal-receipt-80mm'}
          `}
          style={{
            minHeight: '400px',
            color: '#111827',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Header watermark/cut guide */}
          <div className="text-center text-[10px] text-gray-400 mb-2 font-mono tracking-widest no-print">
            - - - - - GUNTING DI SINI - - - - -
          </div>

          {/* RENDER CATEGORY SPECIFIC CONTENT */}
          {category === 'retail' && (
            <RenderRetailReceipt data={retailData} is58mm={is58mm} qrUrl={qrDataUrl} />
          )}

          {category === 'transfer' && (
            <RenderTransferReceipt data={transferData} is58mm={is58mm} qrUrl={qrDataUrl} />
          )}

          {category === 'pln' && (
            <RenderPlnReceipt data={plnData} is58mm={is58mm} qrUrl={qrDataUrl} />
          )}

          {category === 'cafe' && (
            <RenderCafeReceipt data={cafeData} is58mm={is58mm} qrUrl={qrDataUrl} />
          )}

          {category === 'service' && (
            <RenderServiceReceipt data={serviceData} is58mm={is58mm} qrUrl={qrDataUrl} />
          )}

          {/* Footer feed lines simulation */}
          <div className="mt-6 pt-3 text-center text-[10px] text-gray-500 border-t border-dashed border-gray-400">
            <p className="font-bold tracking-wider">ESA STRUK DIGITAL</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Aplikasi Cetak Struk v2.0</p>
          </div>
          <div className="h-4 no-print" />
        </div>
      </div>
    </div>
  );
};

// Sub-component: Retail Receipt
const RenderRetailReceipt: React.FC<{ data: RetailData; is58mm: boolean; qrUrl: string }> = ({
  data,
  is58mm,
  qrUrl
}) => {
  const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = (subtotal - data.discountStore) * (data.taxPercent / 100);
  const grandTotal = Math.max(0, subtotal - data.discountStore + taxAmount);
  const change = Math.max(0, data.cashPaid - grandTotal);

  return (
    <div className="space-y-3">
      {/* Store Header */}
      <div className="text-center space-y-0.5">
        <h1 className="font-black text-base sm:text-lg uppercase tracking-tight text-gray-900">
          {data.storeName || 'NAMA TOKO ANDA'}
        </h1>
        {data.storeBranch && <p className="text-xs font-semibold text-gray-700">{data.storeBranch}</p>}
        {data.address && <p className="text-[11px] text-gray-600 leading-snug">{data.address}</p>}
        {data.phone && <p className="text-[11px] text-gray-600">Telp: {data.phone}</p>}
      </div>

      <div className="border-t border-b border-black py-1.5 text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>Tgl: {data.date}</span>
          <span>{data.time}</span>
        </div>
        <div className="flex justify-between">
          <span>No: {data.transactionNo}</span>
          <span>Kasir: {data.cashier}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-1.5 py-1">
        {data.items.map((item, index) => (
          <div key={item.id || index} className="text-[11px] leading-tight">
            <div className="font-semibold text-gray-900">{item.name}</div>
            <div className="flex justify-between text-gray-700 pl-1">
              <span>
                {item.qty} x {formatRupiahNumber(item.price)}
                {item.discountPercent ? ` (Disc ${item.discountPercent}%)` : ''}
              </span>
              <span className="font-bold text-gray-900">{formatRupiah(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calculation Summary */}
      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>

        {data.discountStore > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Diskon Toko:</span>
            <span>-{formatRupiah(data.discountStore)}</span>
          </div>
        )}

        {data.taxPercent > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>PPN ({data.taxPercent}%):</span>
            <span>{formatRupiah(taxAmount)}</span>
          </div>
        )}

        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>{formatRupiah(grandTotal)}</span>
        </div>

        <div className="flex justify-between text-gray-800 pt-1">
          <span>Bayar ({data.paymentMethod}):</span>
          <span>{formatRupiah(data.cashPaid)}</span>
        </div>

        <div className="flex justify-between font-bold text-gray-900">
          <span>Kembali:</span>
          <span>{formatRupiah(change)}</span>
        </div>
      </div>

      {/* QRIS / Barcode */}
      {data.showQris && qrUrl && (
        <div className="pt-2 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1">SCAN QRIS UNTUK BAYAR</p>
          <img src={qrUrl} alt="QRIS" className="w-24 h-24 border border-black p-1" />
        </div>
      )}

      {data.showBarcode && (
        <div className="pt-2 flex flex-col items-center">
          <div className="h-9 w-44 bg-gray-900 flex items-center justify-around px-2">
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white h-full" 
                style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '4px' }}
              />
            ))}
          </div>
          <p className="text-[10px] tracking-widest font-mono mt-0.5">{data.barcodeValue || data.transactionNo}</p>
        </div>
      )}

      {/* Footer Notes */}
      {data.footerNote && (
        <div className="pt-2 text-center text-[10px] text-gray-700 whitespace-pre-line leading-relaxed border-t border-dashed border-gray-300">
          {data.footerNote}
        </div>
      )}
    </div>
  );
};

// Sub-component: Transfer Bank & QRIS Receipt
const RenderTransferReceipt: React.FC<{ data: TransferData; is58mm: boolean; qrUrl: string }> = ({
  data,
  is58mm,
  qrUrl
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-block px-2.5 py-0.5 bg-black text-white text-[11px] font-black uppercase tracking-wider rounded">
          BUKTI TRANSFER
        </div>
        <h2 className="font-extrabold text-base tracking-tight text-gray-900">
          {data.bankName}
        </h2>
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
          <span>STATUS:</span>
          <span className="px-1.5 py-0.2 border border-black rounded text-[10px] font-black">
            {data.status}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-b border-black py-1.5 text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span className="text-gray-600">Tanggal:</span>
          <span className="font-semibold">{data.date} {data.time}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">No. Referensi:</span>
          <span className="font-mono font-bold">{data.refNumber}</span>
        </div>
      </div>

      {/* Sender & Recipient Box */}
      <div className="space-y-2 text-[11px] py-1">
        <div className="bg-gray-50 p-2 border border-gray-200 rounded">
          <div className="text-[10px] uppercase font-bold text-gray-500">Rekening Sumber / Pengirim</div>
          <div className="font-bold text-gray-900">{data.senderName}</div>
          <div className="font-mono text-gray-700">{data.senderAccount}</div>
        </div>

        <div className="bg-gray-50 p-2 border border-gray-200 rounded">
          <div className="text-[10px] uppercase font-bold text-gray-500">Tujuan Transfer</div>
          <div className="font-bold text-gray-900">{data.recipientName}</div>
          <div className="font-mono text-gray-700">{data.recipientBank} - {data.recipientAccount}</div>
        </div>
      </div>

      {/* Amounts */}
      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span>Nominal Transfer:</span>
          <span className="font-bold">{formatRupiah(data.amount)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Biaya Admin:</span>
          <span>{formatRupiah(data.adminFee)}</span>
        </div>
        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>TOTAL TRANSAKSI:</span>
          <span>{formatRupiah(data.totalAmount)}</span>
        </div>
      </div>

      {data.notes && (
        <div className="p-2 bg-gray-100 rounded text-[10px] text-gray-700">
          <span className="font-bold">Berita:</span> {data.notes}
        </div>
      )}

      {/* QR Verification */}
      {qrUrl && (
        <div className="pt-1 flex flex-col items-center">
          <img src={qrUrl} alt="QR Validasi" className="w-20 h-20 border border-black p-0.5" />
          <span className="text-[9px] font-mono text-gray-500 mt-0.5">Scan untuk verifikasi transfer</span>
        </div>
      )}

      <div className="text-center text-[10px] text-gray-600 leading-snug pt-1">
        Struk ini adalah bukti sah transfer transaksi elektronik.
      </div>
    </div>
  );
};

// Sub-component: PLN Receipt
const RenderPlnReceipt: React.FC<{ data: PlnData; is58mm: boolean; qrUrl: string }> = ({
  data,
  is58mm,
  qrUrl
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center space-y-0.5">
        <h2 className="font-black text-base uppercase tracking-tight text-gray-900">
          STRUK PEMBELIAN TOKEN PLN
        </h2>
        <p className="text-[11px] text-gray-600">PLN PRABAYAR / LISTRIK PINTAR</p>
      </div>

      <div className="border-t border-b border-black py-1.5 text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>No. Meter / IDPEL:</span>
          <span className="font-mono font-bold text-gray-900">{data.meterId}</span>
        </div>
        <div className="flex justify-between">
          <span>Nama Pelanggan:</span>
          <span className="font-semibold">{data.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span>Tarif / Daya:</span>
          <span>{data.tariffPower}</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl / Jam:</span>
          <span>{data.date} {data.time}</span>
        </div>
        <div className="flex justify-between">
          <span>No. Ref:</span>
          <span className="font-mono">{data.transactionNo}</span>
        </div>
      </div>

      {/* 20 Digit Token Display Box */}
      <div className="border-2 border-black p-2.5 text-center bg-gray-50 rounded">
        <p className="text-[10px] font-bold text-gray-600 tracking-wider">STROOM / TOKEN PLN:</p>
        <p className="font-mono font-black text-base sm:text-lg tracking-wider text-black py-1 select-all">
          {data.tokenNumber || '1234-5678-9012-3456-7890'}
        </p>
        <p className="text-[11px] font-bold text-gray-800">
          Jumlah kWh: <span className="font-black text-black">{data.kwhValue || '0.0'} kWh</span>
        </p>
      </div>

      {/* Payment Breakdowns */}
      <div className="space-y-1 text-[11px] pt-1">
        <div className="flex justify-between">
          <span>Nominal Token:</span>
          <span>{formatRupiah(data.nominalToken)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Admin Bank:</span>
          <span>{formatRupiah(data.adminBank)}</span>
        </div>
        {data.ppn > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>PPN:</span>
            <span>{formatRupiah(data.ppn)}</span>
          </div>
        )}
        {data.ppj > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>PPJ:</span>
            <span>{formatRupiah(data.ppj)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>TOTAL BAYAR:</span>
          <span>{formatRupiah(data.totalPaid)}</span>
        </div>
      </div>

      <div className="text-center text-[10px] text-gray-600 leading-snug pt-1 whitespace-pre-line">
        {data.footerNote || 'Informasi Hubungi Call Center PLN 123.\nToken tidak dapat dibatalkan setelah dicetak.'}
      </div>
    </div>
  );
};

// Sub-component: Cafe & Resto Receipt
const RenderCafeReceipt: React.FC<{ data: CafeData; is58mm: boolean; qrUrl: string }> = ({
  data,
  is58mm,
  qrUrl
}) => {
  const subtotal = data.items.reduce((s, i) => s + i.subtotal, 0);
  const serviceCharge = subtotal * (data.serviceChargePercent / 100);
  const tax = (subtotal + serviceCharge) * (data.taxPercent / 100);
  const grandTotal = Math.max(0, subtotal + serviceCharge + tax - data.discount);
  const change = Math.max(0, data.cashPaid - grandTotal);

  return (
    <div className="space-y-3">
      <div className="text-center space-y-0.5">
        <h1 className="font-black text-base uppercase text-gray-900">{data.cafeName}</h1>
        {data.address && <p className="text-[11px] text-gray-600">{data.address}</p>}
      </div>

      <div className="border-t border-b border-black py-1.5 text-[11px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>MEJA: {data.tableNo}</span>
          <span className="uppercase">[{data.orderType}]</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl: {data.date} {data.time}</span>
          <span>No: {data.transactionNo}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Kasir: {data.cashier}</span>
          <span>Server: {data.waiterName}</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5 py-1">
        {data.items.map((item, idx) => (
          <div key={idx} className="text-[11px] leading-tight">
            <div className="font-semibold text-gray-900">{item.name}</div>
            <div className="flex justify-between text-gray-700 pl-1">
              <span>{item.qty} x {formatRupiahNumber(item.price)}</span>
              <span className="font-bold text-gray-900">{formatRupiah(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        {data.serviceChargePercent > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Service ({data.serviceChargePercent}%):</span>
            <span>{formatRupiah(serviceCharge)}</span>
          </div>
        )}
        {data.taxPercent > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Tax ({data.taxPercent}%):</span>
            <span>{formatRupiah(tax)}</span>
          </div>
        )}
        {data.discount > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Discount:</span>
            <span>-{formatRupiah(data.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>GRAND TOTAL:</span>
          <span>{formatRupiah(grandTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-800 pt-0.5">
          <span>Bayar ({data.paymentMethod}):</span>
          <span>{formatRupiah(data.cashPaid)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900">
          <span>Kembalian:</span>
          <span>{formatRupiah(change)}</span>
        </div>
      </div>

      {/* WiFi info */}
      {(data.wifiSsid || data.wifiPassword) && (
        <div className="p-2 border border-black/30 rounded text-center text-[10px] space-y-0.5">
          <span className="font-bold">FREE WI-FI:</span>
          <div>SSID: <span className="font-mono font-bold">{data.wifiSsid}</span></div>
          {data.wifiPassword && <div>Password: <span className="font-mono font-bold">{data.wifiPassword}</span></div>}
        </div>
      )}

      {data.footerNote && (
        <div className="text-center text-[10px] text-gray-700 whitespace-pre-line leading-relaxed">
          {data.footerNote}
        </div>
      )}
    </div>
  );
};

// Sub-component: Service & Workshop Receipt
const RenderServiceReceipt: React.FC<{ data: ServiceData; is58mm: boolean; qrUrl: string }> = ({
  data,
  is58mm,
  qrUrl
}) => {
  const partsTotal = data.parts.reduce((s, p) => s + p.subtotal, 0);
  const serviceTotal = data.services.reduce((s, srv) => s + srv.subtotal, 0);
  const subtotal = partsTotal + serviceTotal;
  const grandTotal = Math.max(0, subtotal - data.discount);
  const change = Math.max(0, data.cashPaid - grandTotal);

  return (
    <div className="space-y-3">
      <div className="text-center space-y-0.5">
        <h1 className="font-black text-base uppercase text-gray-900">{data.shopName}</h1>
        {data.address && <p className="text-[11px] text-gray-600">{data.address}</p>}
        {data.phone && <p className="text-[11px] text-gray-600">Telp: {data.phone}</p>}
      </div>

      <div className="border-t border-b border-black py-1.5 text-[11px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>NO POL: {data.policeNo}</span>
          <span>KM: {data.odometerKm}</span>
        </div>
        <div className="flex justify-between">
          <span>Kendaraan: {data.vehicleType}</span>
          <span>Pelanggan: {data.customerName}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tgl: {data.date} {data.time}</span>
          <span>Mekanik: {data.technician}</span>
        </div>
      </div>

      {/* Services */}
      {data.services.length > 0 && (
        <div className="space-y-1">
          <div className="font-bold text-[10px] uppercase text-gray-700 border-b border-gray-300 pb-0.5">
            Jasa Servis
          </div>
          {data.services.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[11px]">
              <span>{item.name}</span>
              <span className="font-bold">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Parts */}
      {data.parts.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="font-bold text-[10px] uppercase text-gray-700 border-b border-gray-300 pb-0.5">
            Suku Cadang / Sparepart
          </div>
          {data.parts.map((item, idx) => (
            <div key={idx} className="text-[11px]">
              <div>{item.name}</div>
              <div className="flex justify-between text-gray-700 pl-1">
                <span>{item.qty} x {formatRupiahNumber(item.price)}</span>
                <span className="font-bold text-gray-900">{formatRupiah(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        {data.discount > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Diskon:</span>
            <span>-{formatRupiah(data.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>TOTAL BIAYA:</span>
          <span>{formatRupiah(grandTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-800">
          <span>Bayar ({data.paymentMethod}):</span>
          <span>{formatRupiah(data.cashPaid)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900">
          <span>Kembalian:</span>
          <span>{formatRupiah(change)}</span>
        </div>
      </div>

      {data.warrantyDays > 0 && (
        <div className="p-1.5 bg-gray-100 rounded text-center text-[10px] font-bold">
          GARANSI SERVIS: {data.warrantyDays} HARI
        </div>
      )}

      {data.notes && (
        <div className="text-center text-[10px] text-gray-600 whitespace-pre-line leading-relaxed">
          {data.notes}
        </div>
      )}
    </div>
  );
};
