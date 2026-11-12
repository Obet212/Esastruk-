import { TransferData } from '../types';

export interface ExtractedTransferInfo {
  bankName: string;
  bankLogoType: 'bca' | 'bri' | 'mandiri' | 'bni' | 'bsi' | 'dana' | 'gopay' | 'qris' | 'other';
  senderName: string;
  senderAccount: string;
  recipientBank: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  refNumber: string;
  date: string;
  time: string;
  notes: string;
}

// Heuristic extractor from text recognized from image
export function parseTransferText(rawText: string): ExtractedTransferInfo {
  const clean = rawText.replace(/\r/g, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  let bankName = 'BCA';
  let bankLogoType: 'bca' | 'bri' | 'mandiri' | 'bni' | 'bsi' | 'dana' | 'gopay' | 'qris' | 'other' = 'bca';
  const lower = clean.toLowerCase();

  if (lower.includes('bca') || lower.includes('klikbca') || lower.includes('m-bca') || lower.includes('mybca')) {
    bankName = 'Bank Central Asia (BCA)';
    bankLogoType = 'bca';
  } else if (lower.includes('bri') || lower.includes('brimo') || lower.includes('rakyat indonesia')) {
    bankName = 'Bank Rakyat Indonesia (BRI)';
    bankLogoType = 'bri';
  } else if (lower.includes('mandiri') || lower.includes('livin')) {
    bankName = 'Bank Mandiri (Livin)';
    bankLogoType = 'mandiri';
  } else if (lower.includes('bni') || lower.includes('wondr')) {
    bankName = 'Bank Negara Indonesia (BNI)';
    bankLogoType = 'bni';
  } else if (lower.includes('bsi') || lower.includes('syariah indonesia')) {
    bankName = 'Bank Syariah Indonesia (BSI)';
    bankLogoType = 'bsi';
  } else if (lower.includes('dana')) {
    bankName = 'DANA Indonesia';
    bankLogoType = 'dana';
  } else if (lower.includes('gopay') || lower.includes('gojek')) {
    bankName = 'GoPay';
    bankLogoType = 'gopay';
  } else if (lower.includes('qris')) {
    bankName = 'QRIS Nasional';
    bankLogoType = 'qris';
  }

  // Find amount
  let amount = 0;
  // Match Rp 50.000, 100.000, 150000 etc.
  const amountMatches = clean.match(/(?:rp|idr|nominal|jumlah|total)[\s.:]*([0-9.,]{3,})/i) 
    || clean.match(/([0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]{2})?)/);
    
  if (amountMatches && amountMatches[1]) {
    const rawNum = amountMatches[1].replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) amount = parsed;
  }

  // Find Admin fee
  let adminFee = 0;
  const adminMatches = clean.match(/(?:admin|biaya)[\s.:]*([0-9.,]+)/i);
  if (adminMatches && adminMatches[1]) {
    const rawAdmin = adminMatches[1].replace(/\./g, '').replace(/,/g, '.');
    const parsedAdmin = parseFloat(rawAdmin);
    if (!isNaN(parsedAdmin) && parsedAdmin >= 0 && parsedAdmin < 25000) adminFee = parsedAdmin;
  }

  // Find Reference Number
  let refNumber = '';
  const refMatches = clean.match(/(?:ref|referensi|no\.?\s*trx|transaksi|id\s*trx)[\s.:]*([A-Z0-9-]{6,30})/i);
  if (refMatches && refMatches[1]) {
    refNumber = refMatches[1].trim();
  } else {
    // Generate fallback reference
    const now = new Date();
    refNumber = 'TRX' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + Math.floor(10000000 + Math.random() * 90000000);
  }

  // Find Date & Time
  let date = '';
  let time = '';
  const dateMatch = clean.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/);
  if (dateMatch) {
    date = dateMatch[1].replace(/[\-.]/g, '/');
  } else {
    const now = new Date();
    date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  }

  const timeMatch = clean.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
  if (timeMatch) {
    time = timeMatch[1];
  } else {
    const now = new Date();
    time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }

  // Search recipient & sender names
  let recipientName = 'Penerima Transfer';
  let senderName = 'Pemilik Rekening';
  let recipientAccount = '1234567890';
  let senderAccount = '9876543210';

  const recipientMatch = clean.match(/(?:penerima|tujuan|ke\s*rekening|nama\s*penerima)[\s.:]*([A-Za-z\s]{3,30})/i);
  if (recipientMatch && recipientMatch[1]) {
    recipientName = recipientMatch[1].trim().toUpperCase();
  }

  const senderMatch = clean.match(/(?:pengirim|dari\s*rekening|nama\s*pengirim)[\s.:]*([A-Za-z\s]{3,30})/i);
  if (senderMatch && senderMatch[1]) {
    senderName = senderMatch[1].trim().toUpperCase();
  }

  const accMatch = clean.match(/(?:no\.?\s*rek(?:ening)?|rekening\s*tujuan)[\s.:]*([0-9\s-]{8,20})/i);
  if (accMatch && accMatch[1]) {
    recipientAccount = accMatch[1].replace(/[\s-]/g, '');
  }

  return {
    bankName,
    bankLogoType,
    senderName,
    senderAccount,
    recipientBank: bankName.split(' ')[0],
    recipientName,
    recipientAccount,
    amount: amount || 100000,
    adminFee,
    totalAmount: (amount || 100000) + adminFee,
    refNumber,
    date,
    time,
    notes: 'Transfer Berhasil'
  };
}
