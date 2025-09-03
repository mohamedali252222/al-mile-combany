import { Product, Customer, Supplier, User, Invoice, AppSettings } from '../types';

export const initialProducts: Product[] = [
  { id: 'prod1', name: 'أسمنت بورتلاندي', sku: 'CEM-001', barcode: '622000000001', category: 'أسمنت', purchasePrice: 1500, salePrice: 1650, quantity: 500, lowStockThreshold: 50 },
  { id: 'prod2', name: 'حديد تسليح 16 مم', sku: 'STL-016', barcode: '622000000002', category: 'حديد', purchasePrice: 25000, salePrice: 27000, quantity: 80, lowStockThreshold: 10 },
  { id: 'prod3', name: 'رمل بناء (متر مكعب)', sku: 'SND-001', barcode: '622000000003', category: 'ركام', purchasePrice: 80, salePrice: 100, quantity: 200, lowStockThreshold: 20 },
  { id: 'prod4', name: 'طوب أحمر (ألف طوبة)', sku: 'BRK-001', barcode: '622000000004', category: 'طوب', purchasePrice: 1200, salePrice: 1350, quantity: 20, lowStockThreshold: 5 },
];

export const initialCustomers: Customer[] = [
  { id: 'cust1', name: 'شركة النصر للمقاولات', phone: '01001234567', address: '123 شارع رمسيس, القاهرة' },
  { id: 'cust2', name: 'المهندس/ أحمد محمود', phone: '01227654321', address: '45 شارع التحرير, الجيزة' },
];

export const initialSuppliers: Supplier[] = [
  { id: 'supp1', name: 'مصنع العز للصلب', phone: '0225748811', address: 'المنطقة الصناعية, مدينة السادات' },
  { id: 'supp2', name: 'تجار مواد البناء المتحدة', phone: '034256789', address: 'طريق اسكندرية الصحراوي' },
];

export const initialUsers: User[] = [
  { id: 'user1', name: 'محمد علي', role: 'Admin', password: 'adminpassword' },
  { id: 'user2', name: 'فاطمة السيد', role: 'Cashier', password: 'cashierpassword' },
  { id: 'user3', name: 'حسن إبراهيم', role: 'Storekeeper', password: 'storepassword' },
];

export const initialSettings: AppSettings = {
    companyName: 'شركة الميل للمقاولات',
    address: '123 Main Street, Cairo, Egypt',
    phone: '02-12345678',
    vatRate: 0.14
};

export const initialInvoices: Invoice[] = [
  {
    id: 'inv1', invoiceNumber: 'SALE-001', customerId: 'cust1', customerName: 'شركة النصر للمقاولات', date: '2023-10-15',
    items: [{ productId: 'prod2', productName: 'حديد تسليح 16 مم', quantity: 10, unitPrice: 27000, total: 270000 }],
    subtotal: 270000, vat: 37800, total: 307800, type: 'sale'
  },
];

export const initialPurchases: Invoice[] = [
    {
    id: 'pur1', invoiceNumber: 'PO-001', customerId: 'supp1', customerName: 'مصنع العز للصلب', date: '2023-10-10',
    items: [{ productId: 'prod2', productName: 'حديد تسليح 16 مم', quantity: 50, unitPrice: 25000, total: 1250000 }],
    subtotal: 1250000, vat: 175000, total: 1425000, type: 'purchase'
  },
];