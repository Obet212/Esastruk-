import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ApkDownloadBanner, ApkDownloadModal } from './components/ApkDownloadBanner';
import { ThermalReceiptPreview } from './components/ThermalReceiptPreview';
import { ReceiptEditor } from './components/ReceiptEditor';
import { OcrUploadModal } from './components/OcrUploadModal';
import { ReceiptHistoryModal } from './components/ReceiptHistoryModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { 
  ReceiptCategory, 
  PaperWidth, 
  ReceiptTheme, 
  RetailData, 
  TransferData, 
  PlnData, 
  CafeData, 
  ServiceData, 
  StoreProfile, 
  SavedReceipt 
} from './types';
import { 
  getCurrentDateFormatted, 
  getCurrentTimeFormatted, 
  generateRandomTrx 
} from './utils/receiptGenerator';
import confetti from 'canvas-confetti';

const STORAGE_KEY_HISTORY = 'esa_struk_history_v2';
const STORAGE_KEY_PROFILE = 'esa_struk_profile_v2';

const defaultProfile: StoreProfile = {
  storeName: 'ESA STRUK POS',
  branch: 'Pusat Transaksi Digital',
  address: 'Jl. Merdeka Raya No. 45, Jakarta',
  phone: '0812-3456-7890',
  footerNote: 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar atau dikembalikan.',
  defaultPaperWidth: '58mm',
  defaultTheme: 'classic'
};

export default function App() {
  const [category, setCategory] = useState<ReceiptCategory>('retail');
  const [paperWidth, setPaperWidth] = useState<PaperWidth>('58mm');
  const [receiptTheme, setReceiptTheme] = useState<ReceiptTheme>('classic');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Persistent storage state
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // CATEGORY DATA STATES
  const [retailData, setRetailData] = useState<RetailData>({
    storeName: storeProfile.storeName,
    storeBranch: storeProfile.branch,
    address: storeProfile.address,
    phone: storeProfile.phone,
    cashier: 'Kasir 01',
    transactionNo: generateRandomTrx('TRX'),
    date: getCurrentDateFormatted(),
    time: getCurrentTimeFormatted(),
    items: [
      { id: '1', name: 'Minyak Goreng 2L', qty: 1, price: 34000, subtotal: 34000 },
      { id: '2', name: 'Beras Premium 5kg', qty: 1, price: 72500, subtotal: 72500 },
      { id: '3', name: 'Gula Pasir 1kg', qty: 2, price: 17500, subtotal: 35000 },
      { id: '4', name: 'Kopi Kapal Api Spesial', qty: 1, price: 14500, subtotal: 14500 }
    ],
    discountStore: 5000,
    taxPercent: 0,
    paymentMethod: 'TUNAI',
    cashPaid: 160000,
    footerNote: storeProfile.footerNote,
    showBarcode: true,
    barcodeValue: generateRandomTrx('ESA'),
    showQris: true,
    qrisValue: 'https://qris.id/esa-struk'
  });

  const [transferData, setTransferData] = useState<TransferData>({
    bankName: 'Bank Central Asia (BCA)',
    bankLogoType: 'bca',
    transferType: 'BI-FAST',
    senderName: 'AHMAD RIZKY',
    senderAccount: '5820******19',
    recipientBank: 'MANDIRI',
    recipientName: 'ESA DIGITAL STORE',
    recipientAccount: '123000987654',
    amount: 350000,
    adminFee: 2500,
    totalAmount: 352500,
    refNumber: 'TRX' + Date.now().toString().slice(-8),
    date: getCurrentDateFormatted(),
    time: getCurrentTimeFormatted(),
    status: 'BERHASIL',
    notes: 'Pembayaran Tagihan'
  });

  const [plnData, setPlnData] = useState<PlnData>({
    meterId: '14289301948',
    customerName: 'HENDRA WIJAYA',
    tariffPower: 'R1M / 900 VA',
    tokenNumber: '3819-4820-9182-3719-0482',
    nominalToken: 100000,
    adminBank: 3000,
    ppn: 0,
    ppj: 0,
    totalPaid: 103000,
    kwhValue: '67.2',
    transactionNo: generateRandomTrx('PLN'),
    date: getCurrentDateFormatted(),
    time: getCurrentTimeFormatted(),
    cashier: 'ESA LOKET',
    footerNote: 'Informasi Hubungi Call Center PLN 123.\nToken listrik prabayar resmi dari PT PLN (Persero).'
  });

  const [cafeData, setCafeData] = useState<CafeData>({
    cafeName: 'ESA COFFEE & ROASTERY',
    address: 'Jl. Senopati No. 18, Jakarta Selatan',
    phone: '0813-8888-9999',
    tableNo: '08',
    orderType: 'Dine In',
    waiterName: 'Dimas',
    cashier: 'Dinda',
    transactionNo: generateRandomTrx('CFE'),
    date: getCurrentDateFormatted(),
    time: getCurrentTimeFormatted(),
    items: [
      { id: '1', name: 'Iced Aren Latte (Large)', qty: 2, price: 28000, subtotal: 56000 },
      { id: '2', name: 'Croissant Butter Warm', qty: 1, price: 24000, subtotal: 24000 },
      { id: '3', name: 'Manual Brew V60 Gayo', qty: 1, price: 32000, subtotal: 32000 }
    ],
    serviceChargePercent: 5,
    taxPercent: 10,
    discount: 0,
    paymentMethod: 'QRIS',
    cashPaid: 129360,
    wifiSsid: 'EsaCoffee_VIP',
    wifiPassword: 'kopienakbanget',
    footerNote: 'Terima kasih sudah ngopi bersama kami!\nFollow Instagram kami: @esastruk'
  });

  const [serviceData, setServiceData] = useState<ServiceData>({
    shopName: 'BENGKEL ESA MOTOR SPORT',
    address: 'Jl. Otista Raya No. 102, Jakarta',
    phone: '0812-7777-6666',
    policeNo: 'B 4567 ESA',
    vehicleType: 'Yamaha NMAX 155',
    odometerKm: '18.420 km',
    customerName: 'BAMBANG HERMANTO',
    cashier: 'Admin Bengkel',
    technician: 'Pak Joko (Chief Mech)',
    transactionNo: generateRandomTrx('SRV'),
    date: getCurrentDateFormatted(),
    time: getCurrentTimeFormatted(),
    services: [
      { id: '1', name: 'Servis Ringan + Injeksi Tune-up', qty: 1, price: 85000, subtotal: 85000 },
      { id: '2', name: 'Servis CVT & Bersihkan Pulley', qty: 1, price: 45000, subtotal: 45000 }
    ],
    parts: [
      { id: '3', name: 'Oli Mesin Yamalube Super Matic', qty: 1, price: 65000, subtotal: 65000 },
      { id: '4', name: 'Oli Gardan Gear Oil 150ml', qty: 1, price: 18000, subtotal: 18000 },
      { id: '5', name: 'Busi NGK Laser Iridium', qty: 1, price: 35000, subtotal: 35000 }
    ],
    subtotal: 248000,
    discount: 10000,
    grandTotal: 238000,
    paymentMethod: 'DEBIT BCA',
    cashPaid: 238000,
    warrantyDays: 14,
    notes: 'Garansi servis berlaku 14 hari atau 500 km.\nBawa struk ini saat klaim garansi servis.'
  });

  // Save history helper
  const handleSaveToHistory = () => {
    let title = '';
    let amount = 0;
    let payloadData: any = {};

    if (category === 'retail') {
      title = `${retailData.storeName} - ${retailData.transactionNo}`;
      const sub = retailData.items.reduce((s, i) => s + i.subtotal, 0);
      const tax = (sub - retailData.discountStore) * (retailData.taxPercent / 100);
      amount = Math.max(0, sub - retailData.discountStore + tax);
      payloadData = retailData;
    } else if (category === 'transfer') {
      title = `Transfer ${transferData.bankName} ke ${transferData.recipientName}`;
      amount = transferData.totalAmount;
      payloadData = transferData;
    } else if (category === 'pln') {
      title = `Token PLN - ${plnData.customerName} (${plnData.meterId})`;
      amount = plnData.totalPaid;
      payloadData = plnData;
    } else if (category === 'cafe') {
      title = `${cafeData.cafeName} - Meja ${cafeData.tableNo}`;
      const sub = cafeData.items.reduce((s, i) => s + i.subtotal, 0);
      const sc = sub * (cafeData.serviceChargePercent / 100);
      const tax = (sub + sc) * (cafeData.taxPercent / 100);
      amount = Math.max(0, sub + sc + tax - cafeData.discount);
      payloadData = cafeData;
    } else {
      title = `${serviceData.shopName} - ${serviceData.policeNo}`;
      amount = serviceData.grandTotal;
      payloadData = serviceData;
    }

    const newRecord: SavedReceipt = {
      id: String(Date.now()),
      timestamp: Date.now(),
      category,
      title,
      amount,
      data: payloadData
    };

    const updated = [newRecord, ...savedReceipts.slice(0, 99)];
    setSavedReceipts(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {}

    showToast('Struk berhasil disimpan ke riwayat!');
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Save
  const handleSaveProfile = (newProfile: StoreProfile) => {
    setStoreProfile(newProfile);
    setPaperWidth(newProfile.defaultPaperWidth);
    setReceiptTheme(newProfile.defaultTheme);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
    } catch {}
    // Sync into current retail data
    setRetailData(prev => ({
      ...prev,
      storeName: newProfile.storeName,
      storeBranch: newProfile.branch,
      address: newProfile.address,
      phone: newProfile.phone,
      footerNote: newProfile.footerNote
    }));
    showToast('Pengaturan profil toko berhasil diperbarui!');
  };

  // Load from history
  const handleLoadReceipt = (receipt: SavedReceipt) => {
    setCategory(receipt.category);
    if (receipt.category === 'retail') setRetailData(receipt.data as RetailData);
    else if (receipt.category === 'transfer') setTransferData(receipt.data as TransferData);
    else if (receipt.category === 'pln') setPlnData(receipt.data as PlnData);
    else if (receipt.category === 'cafe') setCafeData(receipt.data as CafeData);
    else if (receipt.category === 'service') setServiceData(receipt.data as ServiceData);
    showToast(`Struk "${receipt.title}" berhasil dimuat.`);
  };

  // Delete from history
  const handleDeleteReceipt = (id: string) => {
    const updated = savedReceipts.filter(r => r.id !== id);
    setSavedReceipts(updated);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm('Yakin ingin menghapus seluruh riwayat struk?')) {
      setSavedReceipts([]);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      showToast('Seluruh riwayat struk telah dihapus.');
    }
  };

  // Load Presets
  const handleLoadPreset = (cat: ReceiptCategory) => {
    if (cat === 'retail') {
      setRetailData(prev => ({
        ...prev,
        transactionNo: generateRandomTrx('TRX'),
        date: getCurrentDateFormatted(),
        time: getCurrentTimeFormatted(),
        items: [
          { id: '1', name: 'Gula Pasir Rose Brand 1kg', qty: 2, price: 17500, subtotal: 35000 },
          { id: '2', name: 'Indomie Goreng Spesial (Dus)', qty: 1, price: 115000, subtotal: 115000 },
          { id: '3', name: 'Telur Ayam Negeri 1kg', qty: 1, price: 29000, subtotal: 29000 },
          { id: '4', name: 'Teh Celup Sariwangi 25s', qty: 2, price: 6500, subtotal: 13000 }
        ],
        discountStore: 3000,
        cashPaid: 200000
      }));
    } else if (cat === 'transfer') {
      setTransferData(prev => ({
        ...prev,
        refNumber: 'TRX' + Date.now().toString().slice(-8),
        date: getCurrentDateFormatted(),
        time: getCurrentTimeFormatted(),
        amount: 250000,
        adminFee: 2500,
        totalAmount: 252500
      }));
    } else if (cat === 'pln') {
      setPlnData(prev => ({
        ...prev,
        transactionNo: generateRandomTrx('PLN'),
        date: getCurrentDateFormatted(),
        time: getCurrentTimeFormatted(),
        nominalToken: 50000,
        totalPaid: 53000,
        kwhValue: '34.8'
      }));
    }
    showToast('Data contoh berhasil dimuat!');
  };

  // OCR apply
  const handleApplyExtractedTransfer = (extracted: Partial<TransferData>) => {
    setCategory('transfer');
    setTransferData(prev => ({
      ...prev,
      ...extracted,
      date: extracted.date || prev.date,
      time: extracted.time || prev.time
    }));
    showToast('Data bukti transfer berhasil diterapkan!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentCategory={category}
        onSelectCategory={setCategory}
        onOpenOcr={() => setIsOcrModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        historyCount={savedReceipts.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Unduh APK Terbaru */}
        <ApkDownloadBanner onOpenModal={() => setIsApkModalOpen(true)} />

        {/* Workspace 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Editor & Input Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ReceiptEditor
              category={category}
              retailData={retailData}
              setRetailData={setRetailData}
              transferData={transferData}
              setTransferData={setTransferData}
              plnData={plnData}
              setPlnData={setPlnData}
              cafeData={cafeData}
              setCafeData={setCafeData}
              serviceData={serviceData}
              setServiceData={setServiceData}
              onLoadPreset={handleLoadPreset}
            />
          </div>

          {/* Right Column: Thermal Paper Preview & Action Buttons (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <ThermalReceiptPreview
              category={category}
              retailData={retailData}
              transferData={transferData}
              plnData={plnData}
              cafeData={cafeData}
              serviceData={serviceData}
              paperWidth={paperWidth}
              onChangePaperWidth={setPaperWidth}
              receiptTheme={receiptTheme}
              onChangeTheme={setReceiptTheme}
              onSaveToHistory={handleSaveToHistory}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      <OcrUploadModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onApplyExtracted={handleApplyExtractedTransfer}
      />

      <ReceiptHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedReceipts={savedReceipts}
        onLoadReceipt={handleLoadReceipt}
        onDeleteReceipt={handleDeleteReceipt}
        onClearHistory={handleClearHistory}
      />

      <StoreSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={storeProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200 text-xs flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="no-print mt-12 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} ESA STRUK &bull; Cetak Struk Digital & Thermal ESC/POS
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Unduh APK Android (v2.3)
            </button>
            <a
              href="https://github.com/Obet212/Jadistruk-apk"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
