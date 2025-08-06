import { CartItem, Sale, Product, PHILIPPINES_VAT_RATE, PESO_SYMBOL } from '@/types/pos';

// Currency formatting for Philippines Peso
export const formatPeso = (amount: number): string => {
  return `${PESO_SYMBOL}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// VAT calculations
export const calculateVAT = (amount: number): number => {
  return amount * PHILIPPINES_VAT_RATE;
};

export const calculateVATExclusive = (totalWithVAT: number): { net: number; vat: number } => {
  const net = totalWithVAT / (1 + PHILIPPINES_VAT_RATE);
  const vat = totalWithVAT - net;
  return { net, vat };
};

// Cart calculations
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
};

export const calculateDiscount = (subtotal: number, discount: number, discountType: 'percentage' | 'fixed'): number => {
  if (discountType === 'percentage') {
    return subtotal * (discount / 100);
  }
  return Math.min(discount, subtotal);
};

export const calculateTotal = (subtotal: number, discount: number): number => {
  return Math.max(0, subtotal - discount);
};

// Receipt number generation
export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const time = Date.now().toString().slice(-6);
  return `${year}${month}${day}-${time}`;
};

// Date formatting for Philippines
export const formatPhilippineDate = (date: Date): string => {
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatPhilippineDateTime = (date: Date): string => {
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Stock management
export const isLowStock = (product: Product, threshold: number = 10): boolean => {
  return product.stock <= threshold && product.stock > 0;
};

export const isOutOfStock = (product: Product): boolean => {
  return product.stock <= 0;
};

// Sales analytics
export const getTopSellingProducts = (sales: Sale[], limit: number = 5): Array<{ product: string; quantity: number; revenue: number }> => {
  const productStats = new Map<string, { quantity: number; revenue: number }>();

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productStats.get(item.product.name) || { quantity: 0, revenue: 0 };
      productStats.set(item.product.name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.subtotal,
      });
    });
  });

  return Array.from(productStats.entries())
    .map(([product, stats]) => ({ product, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

export const getSalesByDateRange = (sales: Sale[], startDate: Date, endDate: Date): Sale[] => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    return saleDate >= startDate && saleDate <= endDate;
  });
};

// Local storage utilities
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

// Barcode validation
export const isValidBarcode = (barcode: string): boolean => {
  return /^\d{8,13}$/.test(barcode);
};

// Receipt generation
export const generateReceiptText = (sale: Sale, businessSettings: any): string => {
  const { net, vat } = calculateVATExclusive(sale.total);
  
  let receipt = '';
  receipt += `${businessSettings.businessName}\n`;
  receipt += `${businessSettings.address}\n`;
  receipt += `TIN: ${businessSettings.tin}\n`;
  receipt += `BIR Permit: ${businessSettings.birPermitNumber}\n`;
  receipt += `Contact: ${businessSettings.contactNumber}\n`;
  receipt += `\n`;
  receipt += `Receipt #: ${sale.receiptNumber}\n`;
  receipt += `Date: ${formatPhilippineDateTime(new Date(sale.timestamp))}\n`;
  receipt += `Cashier: ${sale.cashierName}\n`;
  receipt += `\n`;
  receipt += `${'='.repeat(40)}\n`;
  receipt += `ITEMS\n`;
  receipt += `${'='.repeat(40)}\n`;
  
  sale.items.forEach(item => {
    const itemLine = `${item.product.name}`;
    const qtyPrice = `${item.quantity} x ${formatPeso(item.product.price)}`;
    const total = formatPeso(item.subtotal);
    
    receipt += `${itemLine}\n`;
    receipt += `  ${qtyPrice.padEnd(25)} ${total.padStart(10)}\n`;
  });
  
  receipt += `\n`;
  receipt += `${'-'.repeat(40)}\n`;
  receipt += `Subtotal:${formatPeso(sale.subtotal).padStart(30)}\n`;
  
  if (sale.discount > 0) {
    receipt += `Discount:${formatPeso(sale.discount).padStart(30)}\n`;
  }
  
  receipt += `VAT (12%):${formatPeso(vat).padStart(29)}\n`;
  receipt += `${'='.repeat(40)}\n`;
  receipt += `TOTAL:${formatPeso(sale.total).padStart(33)}\n`;
  receipt += `${'='.repeat(40)}\n`;
  receipt += `\n`;
  receipt += `Payment: ${sale.paymentMethod.toUpperCase()}\n`;
  receipt += `Amount Received: ${formatPeso(sale.amountReceived)}\n`;
  receipt += `Change: ${formatPeso(sale.change)}\n`;
  receipt += `\n`;
  receipt += `${businessSettings.receiptFooter}\n`;
  receipt += `\n`;
  receipt += `Thank you for your business!\n`;
  
  return receipt;
};