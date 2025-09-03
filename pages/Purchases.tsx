import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Invoice, InvoiceItem, Product, Supplier, AppSettings } from '../types';
import { initialPurchases, initialProducts, initialSuppliers, initialSettings } from '../data/initialData';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';

interface PurchasesProps {
  t: (key: keyof typeof translations.en) => string;
}

const PurchaseModal: React.FC<{
  purchase: Invoice | null;
  onClose: () => void;
  onSave: (purchase: Invoice, originalItems: InvoiceItem[]) => void;
  t: (key: keyof typeof translations.en) => string;
  products: Product[];
  suppliers: Supplier[];
  purchases: Invoice[];
  settings: AppSettings;
}> = ({ purchase, onClose, onSave, t, products, suppliers, purchases, settings }) => {
  const [formData, setFormData] = useState<Invoice>(
    purchase || {
      id: '',
      invoiceNumber: '',
      customerId: '', // Here it means supplierId
      customerName: '', // Here it means supplierName
      date: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      vat: 0,
      total: 0,
      type: 'purchase',
    }
  );
  const [originalItems] = useState(purchase?.items || []);

  useEffect(() => {
    if (!purchase) {
        const lastPurchaseNum = purchases
            .filter(p => p.invoiceNumber.startsWith('PO-'))
            .map(p => parseInt(p.invoiceNumber.split('-')[1]))
            .reduce((max, num) => Math.max(max, num), 0);
        setFormData(f => ({ ...f, invoiceNumber: `PO-${(lastPurchaseNum + 1).toString().padStart(3, '0')}` }));
    }
  }, [purchase, purchases]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let supplierName = formData.customerName;
    if (name === 'customerId') { // supplierId
        const selectedSupplier = suppliers.find(s => s.id === value);
        supplierName = selectedSupplier ? selectedSupplier.name : '';
    }
    setFormData(prev => ({ ...prev, [name]: value, customerName: supplierName }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    (item[field] as any) = value;

    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.productName = product.name;
            item.unitPrice = product.purchasePrice;
        }
    }

    if (item.quantity && item.unitPrice) {
        item.total = item.quantity * item.unitPrice;
    }
    
    newItems[index] = item;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
        ...prev,
        items: [...prev.items, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}));
  };

  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * settings.vatRate;
    const total = subtotal + vat;
    setFormData(prev => ({ ...prev, subtotal, vat, total }));
  }, [formData.items, settings.vatRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0 || !formData.customerId) {
        alert("Please select a supplier and add at least one item.");
        return;
    }
    onSave({ ...formData, id: formData.id || new Date().toISOString() }, originalItems);
  };

  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl" dir={document.documentElement.dir}>
        <h2 className="text-2xl font-bold mb-4">{purchase ? t('editPurchase') : t('addNewPurchase')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleHeaderChange} placeholder={t('purchaseNumber')} className="p-2 border rounded w-full bg-gray-100" readOnly />
            <select name="customerId" value={formData.customerId} onChange={handleHeaderChange} className="p-2 border rounded w-full" required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input name="date" type="date" value={formData.date} onChange={handleHeaderChange} className="p-2 border rounded w-full" required />
          </div>

          <div className="flex-grow overflow-y-auto border-t border-b py-4 my-2">
            <h3 className="font-bold mb-2">{t('items')}</h3>
            {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="col-span-4 p-2 border rounded w-full text-sm" required>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className="col-span-2 p-2 border rounded w-full text-sm" />
                    <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} placeholder={t('purchasePrice')} className="col-span-2 p-2 border rounded w-full text-sm" />
                    <input type="number" value={item.total} readOnly className="col-span-3 p-2 border rounded w-full text-sm bg-gray-100" />
                    <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-500 hover:text-red-700"><Icon name="delete" className="w-5 h-5"/></button>
                </div>
            ))}
            <button type="button" onClick={addItem} className="mt-2 px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300">{t('addItem')}</button>
          </div>
          
          <div className="flex justify-end mt-4 space-x-6 rtl:space-x-reverse font-semibold">
              <span>{t('subtotal')}: {formData.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {t('egp')}</span>
              <span>{t('vat')} ({settings.vatRate * 100}%): {formData.vat.toLocaleString(undefined, {minimumFractionDigits: 2})} {t('egp')}</span>
              <span className="text-xl">{t('total')}: {formData.total.toLocaleString(undefined, {minimumFractionDigits: 2})} {t('egp')}</span>
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Purchases: React.FC<PurchasesProps> = ({ t }) => {
  const [purchases, setPurchases] = useLocalStorage<Invoice[]>('purchases', initialPurchases);
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [suppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
  const [settings] = useLocalStorage<AppSettings>('settings', initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSavePurchase = (purchase: Invoice, originalItems: InvoiceItem[]) => {
    let updatedProducts = [...products];

    if (editingPurchase) { // De-stock items from original purchase if editing
        originalItems.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) updatedProducts[productIndex].quantity -= item.quantity;
        });
    }

    purchase.items.forEach(item => { // Re-stock items from new/updated purchase
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) updatedProducts[productIndex].quantity += item.quantity;
    });

    setProducts(updatedProducts);

    if (editingPurchase) {
      setPurchases(purchases.map(p => p.id === purchase.id ? purchase : p));
    } else {
      setPurchases([...purchases, purchase]);
    }

    setIsModalOpen(false);
    setEditingPurchase(null);
  };
  
  const handleDeletePurchase = (purchaseId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase? This will remove the items from stock.')) {
        const purchaseToDelete = purchases.find(p => p.id === purchaseId);
        if (!purchaseToDelete) return;

        let updatedProducts = [...products];
        purchaseToDelete.items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if(productIndex !== -1) updatedProducts[productIndex].quantity -= item.quantity;
        });
        setProducts(updatedProducts);

        setPurchases(purchases.filter(p => p.id !== purchaseId));
    }
  };
  
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('purchases')}</h1>
        <button onClick={() => { setEditingPurchase(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Icon name="plus" className="w-5 h-5" />
          <span className="mx-2">{t('addNewPurchase')}</span>
        </button>
      </div>
       <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
         <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 rtl:right-0 rtl:left-auto">
                <Icon name="search" className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder={t('searchPurchases')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 p-2 pl-10 rtl:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>
       <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">{t('purchaseNumber')}</th>
              <th scope="col" className="px-6 py-3">{t('supplier')}</th>
              <th scope="col" className="px-6 py-3">{t('date')}</th>
              <th scope="col" className="px-6 py-3">{t('total')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map(purchase => (
              <tr key={purchase.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{purchase.invoiceNumber}</td>
                  <td className="px-6 py-4">{purchase.customerName}</td>
                  <td className="px-6 py-4">{purchase.date}</td>
                  <td className="px-6 py-4">{purchase.total.toLocaleString()} {t('egp')}</td>
                  <td className="px-6 py-4 flex space-x-2 rtl:space-x-reverse">
                      <button onClick={() => { setEditingPurchase(purchase); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                      <button onClick={() => handleDeletePurchase(purchase.id)} className="text-red-600 hover:text-red-800"><Icon name="delete" className="w-5 h-5"/></button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <PurchaseModal purchase={editingPurchase} onClose={() => setIsModalOpen(false)} onSave={handleSavePurchase} t={t} products={products} suppliers={suppliers} purchases={purchases} settings={settings} />}
    </div>
  );
};

export default Purchases;