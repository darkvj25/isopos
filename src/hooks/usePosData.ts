import { useState, useEffect } from 'react';
import { Product, Sale, BusinessSettings, StockAdjustment, CartItem } from '@/types/pos';
import { getFromLocalStorage, saveToLocalStorage, generateReceiptNumber } from '@/utils/pos';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Sari-Sari Store POS',
  address: '123 Barangay Street, Manila, Philippines',
  tin: '123-456-789-000',
  birPermitNumber: 'FP-12345678',
  contactNumber: '+63 912 345 6789',
  email: 'store@example.com',
  receiptFooter: 'Salamat sa inyong pagbili!',
  vatEnabled: true,
  vatRate: 0.12,
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola 350ml',
    category: 'Beverages',
    price: 25,
    stock: 50,
    barcode: '4902102119825',
    cost: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Lucky Me Pancit Canton',
    category: 'Instant Noodles',
    price: 15,
    stock: 100,
    barcode: '4806516440119',
    cost: 11,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Skyflakes Crackers',
    category: 'Snacks',
    price: 35,
    stock: 30,
    barcode: '4800016005039',
    cost: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Maggi Magic Sarap 8g',
    category: 'Seasonings',
    price: 8,
    stock: 80,
    barcode: '4800024112059',
    cost: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Tanduay Ice 330ml',
    category: 'Beverages',
    price: 45,
    stock: 25,
    barcode: '4800012050016',
    cost: 32,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const usePosData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load all data from localStorage
    const savedProducts = getFromLocalStorage('pos_products', SAMPLE_PRODUCTS);
    const savedSales = getFromLocalStorage('pos_sales', []);
    const savedSettings = getFromLocalStorage('pos_settings', DEFAULT_SETTINGS);
    const savedAdjustments = getFromLocalStorage('pos_stock_adjustments', []);

    setProducts(savedProducts);
    setSales(savedSales);
    setSettings(savedSettings);
    setStockAdjustments(savedAdjustments);
    setIsLoading(false);
  }, []);

  // Product management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveToLocalStorage('pos_products', updatedProducts);
    
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>): void => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, ...updates, updatedAt: new Date() }
        : product
    );
    setProducts(updatedProducts);
    saveToLocalStorage('pos_products', updatedProducts);
  };

  const deleteProduct = (productId: string): void => {
    const updatedProducts = products.filter(product => product.id !== productId);
    setProducts(updatedProducts);
    saveToLocalStorage('pos_products', updatedProducts);
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode);
  };

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.barcode?.includes(query)
    );
  };

  // Stock management
  const adjustStock = (productId: string, quantity: number, type: 'add' | 'remove', reason: string, userId: string): void => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = type === 'add' 
      ? product.stock + quantity 
      : Math.max(0, product.stock - quantity);

    updateProduct(productId, { stock: newStock });

    const adjustment: StockAdjustment = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      adjustmentType: type,
      quantity,
      reason,
      userId,
      timestamp: new Date(),
    };

    const updatedAdjustments = [...stockAdjustments, adjustment];
    setStockAdjustments(updatedAdjustments);
    saveToLocalStorage('pos_stock_adjustments', updatedAdjustments);
  };

  // Sales management
  const recordSale = (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'timestamp'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      receiptNumber: generateReceiptNumber(),
      timestamp: new Date(),
    };

    // Update product stock
    saleData.items.forEach(item => {
      updateProduct(item.productId, { 
        stock: Math.max(0, item.product.stock - item.quantity) 
      });
    });

    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    saveToLocalStorage('pos_sales', updatedSales);
    
    return newSale;
  };

  const getSalesByDate = (date: Date): Sale[] => {
    const targetDate = date.toDateString();
    return sales.filter(sale => new Date(sale.timestamp).toDateString() === targetDate);
  };

  const getTodaySales = (): Sale[] => {
    return getSalesByDate(new Date());
  };

  // Business settings
  const updateSettings = (newSettings: Partial<BusinessSettings>): void => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveToLocalStorage('pos_settings', updatedSettings);
  };

  // Analytics
  const getDailySalesTotal = (date: Date): number => {
    return getSalesByDate(date).reduce((total, sale) => total + sale.total, 0);
  };

  const getMonthlyRevenue = (year: number, month: number): number => {
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return saleDate.getFullYear() === year && saleDate.getMonth() === month;
      })
      .reduce((total, sale) => total + sale.total, 0);
  };

  const getLowStockProducts = (threshold: number = 10): Product[] => {
    return products.filter(product => product.stock <= threshold && product.stock > 0);
  };

  const getOutOfStockProducts = (): Product[] => {
    return products.filter(product => product.stock === 0);
  };

  return {
    // Data
    products,
    sales,
    settings,
    stockAdjustments,
    isLoading,

    // Product methods
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    searchProducts,

    // Stock methods
    adjustStock,
    getLowStockProducts,
    getOutOfStockProducts,

    // Sales methods
    recordSale,
    getSalesByDate,
    getTodaySales,

    // Settings
    updateSettings,

    // Analytics
    getDailySalesTotal,
    getMonthlyRevenue,
  };
};