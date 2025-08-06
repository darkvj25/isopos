// POS System Types for Philippines

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'cashier';
  fullName: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode?: string;
  description?: string;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  vatAmount: number;
  total: number;
  paymentMethod: 'cash' | 'gcash' | 'maya' | 'card';
  amountReceived: number;
  change: number;
  cashierId: string;
  cashierName: string;
  timestamp: Date;
  customer?: string;
}

export interface DailySales {
  date: string;
  totalSales: number;
  totalTransactions: number;
  vatCollected: number;
  cashSales: number;
  digitalSales: number;
}

export interface BusinessSettings {
  businessName: string;
  address: string;
  tin: string;
  birPermitNumber: string;
  contactNumber: string;
  email?: string;
  receiptFooter: string;
  vatEnabled: boolean;
  vatRate: number;
  gcashQR?: string;
  mayaQR?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  adjustmentType: 'add' | 'remove';
  quantity: number;
  reason: string;
  userId: string;
  timestamp: Date;
}

export interface PosState {
  currentUser: User | null;
  cart: CartItem[];
  products: Product[];
  sales: Sale[];
  users: User[];
  settings: BusinessSettings;
  stockAdjustments: StockAdjustment[];
}

// Payment Method Types
export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card';

// Philippines specific constants
export const PHILIPPINES_VAT_RATE = 0.12;
export const PESO_SYMBOL = '₱';

// Receipt settings
export const RECEIPT_WIDTH = 80; // characters
export const RECEIPT_PAPER_SIZE = '80mm';