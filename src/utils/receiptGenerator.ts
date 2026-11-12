import QRCode from 'qrcode';
import { CafeData, PlnData, RetailData, ServiceData, TransferData, PaperWidth } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatRupiahNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('id-ID');
}

export function getCurrentDateFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getCurrentTimeFormatted(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

export function generateRandomTrx(prefix = 'ESA'): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${yymm}-${rand}`;
}

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text || 'https://github.com/Obet212/Jadistruk-apk', {
      margin: 1,
      width: 140,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch {
    return '';
  }
}

// Monospace alignment utilities for ESC/POS and clipboard text
export function padCenter(text: string, width: number): string {
  if (text.length >= width) return text.substring(0, width);
  const leftPad = Math.floor((width - text.length) / 2);
  const rightPad = width - text.length - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

export function padBetween(left: string, right: string, width: number): string {
  const totalLen = left.length + right.length;
  if (totalLen >= width) {
    const space = 1;
    return left.substring(0, width - right.length - space) + ' ' + right;
  }
  return left + ' '.repeat(width - totalLen) + right;
}

export function dividerLine(char = '-', width: number): string {
  return char.repeat(width);
}

// Convert Retail Struk to Pure Monospace Text for WhatsApp / Bluetooth
export function generateRetailText(data: RetailData, width: number = 32): string {
  const lines: string[] = [];
  lines.push(padCenter(data.storeName.toUpperCase(), width));
  if (data.storeBranch) lines.push(padCenter(data.storeBranch, width));
  if (data.address) lines.push(padCenter(data.address, width));
  if (data.phone) lines.push(padCenter(`Telp: ${data.phone}`, width));
  lines.push(dividerLine('=', width));

  lines.push(padBetween(`Tgl: ${data.date}`, data.time, width));
  lines.push(padBetween(`No: ${data.transactionNo}`, `Ksr: ${data.cashier}`, width));
  lines.push(dividerLine('-', width));

  let subtotal = 0;
  for (const item of data.items) {
    lines.push(item.name.substring(0, width));
    const qtyPrice = `${item.qty} x ${formatRupiahNumber(item.price)}`;
    const itemTotal = formatRupiahNumber(item.subtotal);
    lines.push(padBetween(`  ${qtyPrice}`, itemTotal, width));
    subtotal += item.subtotal;
  }

  lines.push(dividerLine('-', width));
  lines.push(padBetween('Subtotal:', formatRupiah(subtotal), width));
  if (data.discountStore > 0) {
    lines.push(padBetween('Diskon:', `-${formatRupiah(data.discountStore)}`, width));
  }
  const taxAmount = (subtotal - data.discountStore) * (data.taxPercent / 100);
  if (data.taxPercent > 0) {
    lines.push(padBetween(`PPN (${data.taxPercent}%):`, formatRupiah(taxAmount), width));
  }
  const grandTotal = Math.max(0, subtotal - data.discountStore + taxAmount);
  lines.push(padBetween('TOTAL:', formatRupiah(grandTotal), width));
  lines.push(dividerLine('-', width));

  lines.push(padBetween(`Bayar (${data.paymentMethod}):`, formatRupiah(data.cashPaid), width));
  const change = Math.max(0, data.cashPaid - grandTotal);
  lines.push(padBetween('Kembali:', formatRupiah(change), width));

  lines.push(dividerLine('=', width));
  if (data.footerNote) {
    const noteWords = data.footerNote.split('\n');
    noteWords.forEach(w => lines.push(padCenter(w, width)));
  }
  lines.push(padCenter('*** ESA STRUK DIGITAL ***', width));

  return lines.join('\n');
}

// Convert Transfer Struk to Text
export function generateTransferText(data: TransferData, width: number = 32): string {
  const lines: string[] = [];
  lines.push(padCenter(`BUKTI TRANSFER ${data.bankName.toUpperCase()}`, width));
  lines.push(padCenter(`STATUS: [ ${data.status} ]`, width));
  lines.push(dividerLine('=', width));
  lines.push(padBetween('Tanggal:', data.date, width));
  lines.push(padBetween('Waktu:', data.time, width));
  lines.push(padBetween('No Ref:', data.refNumber, width));
  lines.push(dividerLine('-', width));
  lines.push(padBetween('Pengirim:', data.senderName, width));
  lines.push(padBetween('Rek Asal:', data.senderAccount, width));
  lines.push(dividerLine('-', width));
  lines.push(padBetween('Bank Tujuan:', data.recipientBank, width));
  lines.push(padBetween('Penerima:', data.recipientName, width));
  lines.push(padBetween('Rek Tujuan:', data.recipientAccount, width));
  lines.push(dividerLine('-', width));
  lines.push(padBetween('Nominal:', formatRupiah(data.amount), width));
  lines.push(padBetween('Biaya Admin:', formatRupiah(data.adminFee), width));
  lines.push(dividerLine('=', width));
  lines.push(padBetween('TOTAL TRANSAKSI:', formatRupiah(data.totalAmount), width));
  lines.push(dividerLine('=', width));
  if (data.notes) lines.push(padCenter(`Berita: ${data.notes}`, width));
  lines.push(padCenter('Simpan struk ini sbg bukti sah', width));
  lines.push(padCenter('ESA STRUK - Cetak Struk Digital', width));
  return lines.join('\n');
}

// Convert PLN Struk to Text
export function generatePlnText(data: PlnData, width: number = 32): string {
  const lines: string[] = [];
  lines.push(padCenter('STRUK PEMBELIAN TOKEN PLN', width));
  lines.push(dividerLine('=', width));
  lines.push(padBetween('No Meter/ID:', data.meterId, width));
  lines.push(padBetween('Nama:', data.customerName, width));
  lines.push(padBetween('Tarif/Daya:', data.tariffPower, width));
  lines.push(padBetween('Tgl / Jam:', `${data.date} ${data.time}`, width));
  lines.push(padBetween('No Reff:', data.transactionNo, width));
  lines.push(dividerLine('-', width));
  lines.push(padCenter('STROOM / TOKEN PLN:', width));
  lines.push(padCenter(data.tokenNumber, width));
  lines.push(padCenter(`Kwh: ${data.kwhValue}`, width));
  lines.push(dividerLine('-', width));
  lines.push(padBetween('Nominal Token:', formatRupiah(data.nominalToken), width));
  lines.push(padBetween('Admin Bank:', formatRupiah(data.adminBank), width));
  if (data.ppn > 0) lines.push(padBetween('PPN:', formatRupiah(data.ppn), width));
  if (data.ppj > 0) lines.push(padBetween('PPJ:', formatRupiah(data.ppj), width));
  lines.push(dividerLine('=', width));
  lines.push(padBetween('TOTAL BAYAR:', formatRupiah(data.totalPaid), width));
  lines.push(dividerLine('=', width));
  lines.push(padCenter('Terima Kasih atas Kunjungan Anda', width));
  lines.push(padCenter('Informasi Hubungi PLN 123', width));
  return lines.join('\n');
}
