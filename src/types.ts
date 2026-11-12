export type ReceiptCategory = 'retail' | 'transfer' | 'pln' | 'cafe' | 'service';
export type PaperWidth = '58mm' | '80mm';
export type ReceiptTheme = 'classic' | 'modern' | 'dotmatrix' | 'minimal';

export interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discountPercent?: number;
  subtotal: number;
}

export interface RetailData {
  storeName: string;
  storeBranch: string;
  address: string;
  phone: string;
  cashier: string;
  transactionNo: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  discountStore: number;
  taxPercent: number;
  paymentMethod: string;
  cashPaid: number;
  footerNote: string;
  showBarcode: boolean;
  barcodeValue: string;
  showQris: boolean;
  qrisValue: string;
}

export interface TransferData {
  bankName: string;
  bankLogoType: 'bca' | 'bri' | 'mandiri' | 'bni' | 'bsi' | 'dana' | 'gopay' | 'qris' | 'other';
  transferType: string;
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
  status: 'BERHASIL' | 'SUKSES' | 'SELESAI';
  notes: string;
}

export interface PlnData {
  meterId: string;
  customerName: string;
  tariffPower: string;
  tokenNumber: string;
  nominalToken: number;
  adminBank: number;
  ppn: number;
  ppj: number;
  totalPaid: number;
  kwhValue: string;
  transactionNo: string;
  date: string;
  time: string;
  cashier: string;
  footerNote: string;
}

export interface CafeData {
  cafeName: string;
  address: string;
  phone: string;
  tableNo: string;
  orderType: 'Dine In' | 'Take Away';
  waiterName: string;
  cashier: string;
  transactionNo: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  serviceChargePercent: number;
  taxPercent: number;
  discount: number;
  paymentMethod: string;
  cashPaid: number;
  wifiSsid: string;
  wifiPassword: string;
  footerNote: string;
}

export interface ServiceData {
  shopName: string;
  address: string;
  phone: string;
  policeNo: string;
  vehicleType: string;
  odometerKm: string;
  customerName: string;
  cashier: string;
  technician: string;
  transactionNo: string;
  date: string;
  time: string;
  services: ReceiptItem[];
  parts: ReceiptItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  cashPaid: number;
  warrantyDays: number;
  notes: string;
}

export interface StoreProfile {
  storeName: string;
  branch: string;
  address: string;
  phone: string;
  logoUrl?: string;
  footerNote: string;
  defaultPaperWidth: PaperWidth;
  defaultTheme: ReceiptTheme;
}

export interface SavedReceipt {
  id: string;
  timestamp: number;
  category: ReceiptCategory;
  title: string;
  amount: number;
  data: RetailData | TransferData | PlnData | CafeData | ServiceData;
}
