export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  lowStockThreshold: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  type: 'sale' | 'purchase';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Cashier' | 'Storekeeper';
  password?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'in' | 'out';
  quantity: number;
  reference: string; // e.g., Invoice #, Purchase Order #
}

export interface AppSettings {
  companyName: string;
  address: string;
  phone: string;
  vatRate: number; // e.g., 0.14 for 14%
}