import React from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  QrCode, 
  Barcode, 
  Calendar, 
  Clock, 
  Hash, 
  DollarSign, 
  CreditCard,
  Building,
  User,
  Percent,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { 
  CafeData, 
  PlnData, 
  ReceiptCategory, 
  ReceiptItem, 
  RetailData, 
  ServiceData, 
  TransferData 
} from '../types';
import { formatRupiah, generateRandomTrx, getCurrentDateFormatted, getCurrentTimeFormatted } from '../utils/receiptGenerator';

interface ReceiptEditorProps {
  category: ReceiptCategory;
  retailData: RetailData;
  setRetailData: React.Dispatch<React.SetStateAction<RetailData>>;
  transferData: TransferData;
  setTransferData: React.Dispatch<React.SetStateAction<TransferData>>;
  plnData: PlnData;
  setPlnData: React.Dispatch<React.SetStateAction<PlnData>>;
  cafeData: CafeData;
  setCafeData: React.Dispatch<React.SetStateAction<CafeData>>;
  serviceData: ServiceData;
  setServiceData: React.Dispatch<React.SetStateAction<ServiceData>>;
  onLoadPreset: (cat: ReceiptCategory) => void;
}

export const ReceiptEditor: React.FC<ReceiptEditorProps> = ({
  category,
  retailData,
  setRetailData,
  transferData,
  setTransferData,
  plnData,
  setPlnData,
  cafeData,
  setCafeData,
  serviceData,
  setServiceData,
  onLoadPreset
}) => {
  return (
    <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Editor Header & Preset Loader */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <span>Editor Struk</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700 uppercase">
              {category}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sesuaikan data struk secara real-time untuk dicetak atau dibagikan.
          </p>
        </div>

        <button
          onClick={() => onLoadPreset(category)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Muat Contoh Data</span>
        </button>
      </div>

      {/* CATEGORY-SPECIFIC FORM FIELDS */}
      {category === 'retail' && (
        <RetailEditor data={retailData} setData={setRetailData} />
      )}

      {category === 'transfer' && (
        <TransferEditor data={transferData} setData={setTransferData} />
      )}

      {category === 'pln' && (
        <PlnEditor data={plnData} setData={setPlnData} />
      )}

      {category === 'cafe' && (
        <CafeEditor data={cafeData} setData={setCafeData} />
      )}

      {category === 'service' && (
        <ServiceEditor data={serviceData} setData={setServiceData} />
      )}
    </div>
  );
};

// RETAIL FORM EDITOR
const RetailEditor: React.FC<{
  data: RetailData;
  setData: React.Dispatch<React.SetStateAction<RetailData>>;
}> = ({ data, setData }) => {
  const addItem = () => {
    const newItem: ReceiptItem = {
      id: String(Date.now()),
      name: 'Item Baru',
      qty: 1,
      price: 10000,
      subtotal: 10000
    };
    setData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, updates: Partial<ReceiptItem>) => {
    setData(prev => {
      const items = [...prev.items];
      const target = { ...items[index], ...updates };
      const disc = target.discountPercent || 0;
      target.subtotal = target.qty * target.price * (1 - disc / 100);
      items[index] = target;
      return { ...prev, items };
    });
  };

  const removeItem = (index: number) => {
    if (data.items.length <= 1) return;
    setData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const subtotal = data.items.reduce((s, i) => s + i.subtotal, 0);
  const taxAmount = (subtotal - data.discountStore) * (data.taxPercent / 100);
  const grandTotal = Math.max(0, subtotal - data.discountStore + taxAmount);

  const setExactPaid = () => {
    setData(prev => ({ ...prev, cashPaid: grandTotal }));
  };

  const quickCashOptions = [
    grandTotal,
    Math.ceil(grandTotal / 10000) * 10000,
    Math.ceil(grandTotal / 50000) * 50000,
    Math.ceil(grandTotal / 100000) * 100000
  ].filter((v, i, a) => v >= grandTotal && a.indexOf(v) === i);

  return (
    <div className="space-y-5">
      {/* Toko Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Toko / Usaha</label>
          <input
            type="text"
            value={data.storeName}
            onChange={e => setData(prev => ({ ...prev, storeName: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="Contoh: TOKO BERKAH JAYA"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Cabang / Slogan</label>
          <input
            type="text"
            value={data.storeBranch}
            onChange={e => setData(prev => ({ ...prev, storeBranch: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="Cabang Pasar Minggu"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-400 font-medium mb-1">Alamat Toko</label>
          <input
            type="text"
            value={data.address}
            onChange={e => setData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="Jl. Raya Utama No. 88, Jakarta"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">No. Telepon / WA</label>
          <input
            type="text"
            value={data.phone}
            onChange={e => setData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="0812-3456-7890"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Kasir</label>
          <input
            type="text"
            value={data.cashier}
            onChange={e => setData(prev => ({ ...prev, cashier: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="Kasir 01"
          />
        </div>
      </div>

      {/* Transaction Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div>
          <label className="block text-slate-400 font-medium mb-1">No. Transaksi</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={data.transactionNo}
              onChange={e => setData(prev => ({ ...prev, transactionNo: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={() => setData(prev => ({ ...prev, transactionNo: generateRandomTrx('TRX') }))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              title="Acak No. Transaksi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Tanggal</label>
          <input
            type="text"
            value={data.date}
            onChange={e => setData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Waktu</label>
          <input
            type="text"
            value={data.time}
            onChange={e => setData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Daftar Produk / Barang ({data.items.length})
          </label>
          <button
            onClick={addItem}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Barang</span>
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.items.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-12 gap-2 items-center text-xs"
            >
              <div className="col-span-12 sm:col-span-5">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateItem(index, { name: e.target.value })}
                  placeholder="Nama barang..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-3 sm:col-span-2">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] text-slate-500 mr-1">Qty</span>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => updateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-transparent text-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="col-span-5 sm:col-span-3">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] text-slate-500 mr-1">Rp</span>
                  <input
                    type="number"
                    step="500"
                    value={item.price}
                    onChange={e => updateItem(index, { price: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-transparent text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
                <span className="font-bold text-emerald-400 text-right">
                  {formatRupiah(item.subtotal)}
                </span>
                <button
                  onClick={() => removeItem(index)}
                  disabled={data.items.length <= 1}
                  className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 rounded hover:bg-slate-900 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts & Tax */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Diskon Toko (Rp)</label>
          <input
            type="number"
            step="1000"
            value={data.discountStore}
            onChange={e => setData(prev => ({ ...prev, discountStore: Math.max(0, parseFloat(e.target.value) || 0) }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">PPN (%)</label>
          <input
            type="number"
            value={data.taxPercent}
            onChange={e => setData(prev => ({ ...prev, taxPercent: Math.max(0, parseFloat(e.target.value) || 0) }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="0 atau 11"
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-300">Total Tagihan:</span>
          <span className="font-black text-base text-emerald-400">{formatRupiah(grandTotal)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Metode Pembayaran</label>
            <select
              value={data.paymentMethod}
              onChange={e => setData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="TUNAI">TUNAI (Cash)</option>
              <option value="QRIS">QRIS</option>
              <option value="DEBIT BCA">DEBIT BCA</option>
              <option value="DEBIT BRI">DEBIT BRI</option>
              <option value="DEBIT MANDIRI">DEBIT MANDIRI</option>
              <option value="TRANSFER">TRANSFER BANK</option>
              <option value="DANA">DANA</option>
              <option value="GOPAY">GOPAY</option>
              <option value="SHOPEEPAY">SHOPEEPAY</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Nominal Diterima (Rp)</label>
            <input
              type="number"
              step="1000"
              value={data.cashPaid}
              onChange={e => setData(prev => ({ ...prev, cashPaid: Math.max(0, parseFloat(e.target.value) || 0) }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>
        </div>

        {/* Quick Cash Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-semibold mr-1">Tombol Cepat:</span>
          <button
            onClick={setExactPaid}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-emerald-400"
          >
            Uang Pas
          </button>
          {quickCashOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => setData(prev => ({ ...prev, cashPaid: opt }))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
            >
              {formatRupiah(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Barcode & QRIS Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={data.showQris}
            onChange={e => setData(prev => ({ ...prev, showQris: e.target.checked }))}
            className="accent-emerald-500 w-4 h-4 rounded"
          />
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Tampilkan QRIS Pembayaran</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={data.showBarcode}
            onChange={e => setData(prev => ({ ...prev, showBarcode: e.target.checked }))}
            className="accent-emerald-500 w-4 h-4 rounded"
          />
          <Barcode className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Tampilkan Barcode Transaksi</span>
        </label>
      </div>

      {/* Footer Notes */}
      <div className="text-xs">
        <label className="block text-slate-400 font-medium mb-1">Catatan Kaki Struk</label>
        <textarea
          rows={2}
          value={data.footerNote}
          onChange={e => setData(prev => ({ ...prev, footerNote: e.target.value }))}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          placeholder="Barang yang sudah dibeli tidak dapat ditukar..."
        />
      </div>
    </div>
  );
};

// TRANSFER EDITOR
const TransferEditor: React.FC<{
  data: TransferData;
  setData: React.Dispatch<React.SetStateAction<TransferData>>;
}> = ({ data, setData }) => {
  const bankPresets = [
    { name: 'Bank Central Asia (BCA)', logo: 'bca', admin: 2500 },
    { name: 'Bank Rakyat Indonesia (BRI)', logo: 'bri', admin: 2500 },
    { name: 'Bank Mandiri (Livin)', logo: 'mandiri', admin: 2500 },
    { name: 'Bank Negara Indonesia (BNI)', logo: 'bni', admin: 2500 },
    { name: 'Bank Syariah Indonesia (BSI)', logo: 'bsi', admin: 2500 },
    { name: 'DANA Indonesia', logo: 'dana', admin: 0 },
    { name: 'GoPay', logo: 'gopay', admin: 1000 },
    { name: 'QRIS Nasional', logo: 'qris', admin: 0 }
  ];

  const handleBankSelect = (p: typeof bankPresets[0]) => {
    setData(prev => ({
      ...prev,
      bankName: p.name,
      bankLogoType: p.logo as any,
      adminFee: p.admin,
      totalAmount: prev.amount + p.admin
    }));
  };

  const handleAmountChange = (amt: number) => {
    setData(prev => ({
      ...prev,
      amount: amt,
      totalAmount: amt + prev.adminFee
    }));
  };

  const handleAdminChange = (adm: number) => {
    setData(prev => ({
      ...prev,
      adminFee: adm,
      totalAmount: prev.amount + adm
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Quick Bank Chips */}
      <div>
        <label className="block text-slate-400 font-medium mb-1.5">Pilihan Bank / Dompet Digital:</label>
        <div className="flex flex-wrap gap-1.5">
          {bankPresets.map((b, idx) => (
            <button
              key={idx}
              onClick={() => handleBankSelect(b)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                data.bankLogoType === b.logo
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {b.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Bank Header</label>
          <input
            type="text"
            value={data.bankName}
            onChange={e => setData(prev => ({ ...prev, bankName: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Status Transaksi</label>
          <select
            value={data.status}
            onChange={e => setData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
          >
            <option value="BERHASIL">BERHASIL</option>
            <option value="SUKSES">SUKSES</option>
            <option value="SELESAI">SELESAI</option>
          </select>
        </div>
      </div>

      {/* Meta Date & Ref */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">No. Referensi / ID</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={data.refNumber}
              onChange={e => setData(prev => ({ ...prev, refNumber: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={() => setData(prev => ({ ...prev, refNumber: 'TRX' + Date.now() }))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              title="Acak Ref"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Tanggal</label>
          <input
            type="text"
            value={data.date}
            onChange={e => setData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Waktu</label>
          <input
            type="text"
            value={data.time}
            onChange={e => setData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Sender & Recipient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400">
            Rekening Pengirim (Sumber)
          </span>
          <div>
            <label className="block text-slate-400 mb-0.5">Nama Pengirim</label>
            <input
              type="text"
              value={data.senderName}
              onChange={e => setData(prev => ({ ...prev, senderName: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-0.5">No. Rekening / No. HP</label>
            <input
              type="text"
              value={data.senderAccount}
              onChange={e => setData(prev => ({ ...prev, senderAccount: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-teal-400">
            Rekening Tujuan (Penerima)
          </span>
          <div>
            <label className="block text-slate-400 mb-0.5">Nama Penerima</label>
            <input
              type="text"
              value={data.recipientName}
              onChange={e => setData(prev => ({ ...prev, recipientName: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-0.5">Bank Tujuan</label>
              <input
                type="text"
                value={data.recipientBank}
                onChange={e => setData(prev => ({ ...prev, recipientBank: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-0.5">No. Rekening</label>
              <input
                type="text"
                value={data.recipientAccount}
                onChange={e => setData(prev => ({ ...prev, recipientAccount: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Amount & Admin Fee */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Nominal Transfer (Rp)</label>
          <input
            type="number"
            step="10000"
            value={data.amount}
            onChange={e => handleAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Biaya Admin (Rp)</label>
          <div className="flex gap-1.5">
            <input
              type="number"
              step="500"
              value={data.adminFee}
              onChange={e => handleAdminChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={() => handleAdminChange(0)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px]"
            >
              Rp 0
            </button>
            <button
              onClick={() => handleAdminChange(2500)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px]"
            >
              2.5k
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Berita / Catatan Transfer</label>
        <input
          type="text"
          value={data.notes}
          onChange={e => setData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          placeholder="Pembayaran Invoice..."
        />
      </div>
    </div>
  );
};

// PLN EDITOR
const PlnEditor: React.FC<{
  data: PlnData;
  setData: React.Dispatch<React.SetStateAction<PlnData>>;
}> = ({ data, setData }) => {
  const generateNewToken = () => {
    // Generate 20 digits grouped in 4s: XXXX-XXXX-XXXX-XXXX-XXXX
    let digits = '';
    for (let i = 0; i < 20; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    const grouped = digits.match(/.{1,4}/g)?.join('-') || digits;
    setData(prev => ({ ...prev, tokenNumber: grouped }));
  };

  const handleNominalSelect = (nom: number) => {
    // Estimate kWh: approx 1 kWh ~ Rp 1.444,70
    const estKwh = ((nom - data.adminBank) / 1444.7).toFixed(1);
    setData(prev => ({
      ...prev,
      nominalToken: nom,
      totalPaid: nom + prev.adminBank,
      kwhValue: estKwh
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 20 Digit Token Generator */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            Nomor Token PLN (20 Digit)
          </label>
          <button
            onClick={generateNewToken}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Acak Token</span>
          </button>
        </div>
        <input
          type="text"
          value={data.tokenNumber}
          onChange={e => setData(prev => ({ ...prev, tokenNumber: e.target.value }))}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold text-center text-base tracking-widest focus:outline-none focus:border-emerald-500"
          placeholder="1234-5678-9012-3456-7890"
        />
        <div className="flex justify-between items-center text-slate-400 pt-1">
          <span>Perkiraan kWh Didapat:</span>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={data.kwhValue}
              onChange={e => setData(prev => ({ ...prev, kwhValue: e.target.value }))}
              className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono text-right"
            />
            <span className="font-bold text-white">kWh</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">No. Meter / ID Pelanggan</label>
          <input
            type="text"
            value={data.meterId}
            onChange={e => setData(prev => ({ ...prev, meterId: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
            placeholder="14234567890"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Pelanggan</label>
          <input
            type="text"
            value={data.customerName}
            onChange={e => setData(prev => ({ ...prev, customerName: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 uppercase font-semibold"
            placeholder="AHMAD SUHENDAR"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Tarif / Daya</label>
          <input
            type="text"
            value={data.tariffPower}
            onChange={e => setData(prev => ({ ...prev, tariffPower: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
            placeholder="R1M / 900 VA"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Biaya Admin Bank (Rp)</label>
          <input
            type="number"
            step="500"
            value={data.adminBank}
            onChange={e => {
              const adm = parseFloat(e.target.value) || 0;
              setData(prev => ({ ...prev, adminBank: adm, totalPaid: prev.nominalToken + adm }));
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Nominal Buttons */}
      <div>
        <label className="block text-slate-400 font-medium mb-1.5">Pilihan Nominal Token:</label>
        <div className="flex flex-wrap gap-2">
          {[20000, 50000, 100000, 200000, 500000, 1000000].map(nom => (
            <button
              key={nom}
              onClick={() => handleNominalSelect(nom)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                data.nominalToken === nom
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {formatRupiah(nom)}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs">
        <label className="block text-slate-400 font-medium mb-1">Catatan Kaki Struk PLN</label>
        <textarea
          rows={2}
          value={data.footerNote}
          onChange={e => setData(prev => ({ ...prev, footerNote: e.target.value }))}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};

// CAFE & RESTO EDITOR
const CafeEditor: React.FC<{
  data: CafeData;
  setData: React.Dispatch<React.SetStateAction<CafeData>>;
}> = ({ data, setData }) => {
  const addItem = () => {
    const newItem: ReceiptItem = {
      id: String(Date.now()),
      name: 'Menu Baru',
      qty: 1,
      price: 25000,
      subtotal: 25000
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (index: number, updates: Partial<ReceiptItem>) => {
    setData(prev => {
      const items = [...prev.items];
      const target = { ...items[index], ...updates };
      target.subtotal = target.qty * target.price;
      items[index] = target;
      return { ...prev, items };
    });
  };

  const removeItem = (index: number) => {
    if (data.items.length <= 1) return;
    setData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const subtotal = data.items.reduce((s, i) => s + i.subtotal, 0);
  const serviceCharge = subtotal * (data.serviceChargePercent / 100);
  const tax = (subtotal + serviceCharge) * (data.taxPercent / 100);
  const grandTotal = Math.max(0, subtotal + serviceCharge + tax - data.discount);

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Cafe / Restoran</label>
          <input
            type="text"
            value={data.cafeName}
            onChange={e => setData(prev => ({ ...prev, cafeName: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 font-medium mb-1">No. Meja</label>
            <input
              type="text"
              value={data.tableNo}
              onChange={e => setData(prev => ({ ...prev, tableNo: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Tipe Order</label>
            <select
              value={data.orderType}
              onChange={e => setData(prev => ({ ...prev, orderType: e.target.value as any }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="Dine In">Dine In</option>
              <option value="Take Away">Take Away</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center">
          <label className="font-bold uppercase tracking-wider text-slate-300">
            Daftar Pesanan ({data.items.length})
          </label>
          <button
            onClick={addItem}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Menu</span>
          </button>
        </div>

        {data.items.map((item, index) => (
          <div key={item.id || index} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6">
              <input
                type="text"
                value={item.name}
                onChange={e => updateItem(index, { name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={e => updateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-center font-bold"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                step="1000"
                value={item.price}
                onChange={e => updateItem(index, { price: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeItem(index)}
                disabled={data.items.length <= 1}
                className="text-slate-500 hover:text-red-400 disabled:opacity-30 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Free Wi-Fi Info */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">Wi-Fi SSID</label>
          <input
            type="text"
            value={data.wifiSsid}
            onChange={e => setData(prev => ({ ...prev, wifiSsid: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white font-mono"
            placeholder="Cafe-Guest"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Wi-Fi Password</label>
          <input
            type="text"
            value={data.wifiPassword}
            onChange={e => setData(prev => ({ ...prev, wifiPassword: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white font-mono"
            placeholder="ngopidulu123"
          />
        </div>
      </div>
    </div>
  );
};

// SERVICE & WORKSHOP EDITOR
const ServiceEditor: React.FC<{
  data: ServiceData;
  setData: React.Dispatch<React.SetStateAction<ServiceData>>;
}> = ({ data, setData }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Bengkel / Servis</label>
          <input
            type="text"
            value={data.shopName}
            onChange={e => setData(prev => ({ ...prev, shopName: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">No. Polisi Plat</label>
          <input
            type="text"
            value={data.policeNo}
            onChange={e => setData(prev => ({ ...prev, policeNo: e.target.value.toUpperCase() }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
            placeholder="B 1234 ESA"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Tipe Kendaraan</label>
          <input
            type="text"
            value={data.vehicleType}
            onChange={e => setData(prev => ({ ...prev, vehicleType: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="Honda Vario 160"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Odometer (KM)</label>
          <input
            type="text"
            value={data.odometerKm}
            onChange={e => setData(prev => ({ ...prev, odometerKm: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
            placeholder="24.500 km"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Nama Pelanggan</label>
          <input
            type="text"
            value={data.customerName}
            onChange={e => setData(prev => ({ ...prev, customerName: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Teknisi / Mekanik</label>
          <input
            type="text"
            value={data.technician}
            onChange={e => setData(prev => ({ ...prev, technician: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Garansi Servis (Hari)</label>
          <input
            type="number"
            value={data.warrantyDays}
            onChange={e => setData(prev => ({ ...prev, warrantyDays: parseInt(e.target.value) || 0 }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-medium mb-1">Diskon Servis (Rp)</label>
          <input
            type="number"
            value={data.discount}
            onChange={e => setData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
