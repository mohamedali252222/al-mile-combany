import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Invoice, InvoiceItem, Product, Customer, AppSettings } from '../types';
import { initialInvoices, initialProducts, initialCustomers, initialSettings } from '../data/initialData';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';

interface InvoicesProps {
  t: (key: keyof typeof translations.en) => string;
}

const InvoiceModal: React.FC<{
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (invoice: Invoice, originalItems: InvoiceItem[]) => void;
  t: (key: keyof typeof translations.en) => string;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  settings: AppSettings;
}> = ({ invoice, onClose, onSave, t, products, customers, invoices, settings }) => {
  const [formData, setFormData] = useState<Invoice>(
    invoice || {
      id: '',
      invoiceNumber: '',
      customerId: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      vat: 0,
      total: 0,
      type: 'sale',
    }
  );
  const [originalItems] = useState(invoice?.items || []);

  useEffect(() => {
    if (!invoice) {
        const lastInvoiceNum = invoices
            .filter(i => i.invoiceNumber.startsWith('SALE-'))
            .map(i => parseInt(i.invoiceNumber.split('-')[1]))
            .reduce((max, num) => Math.max(max, num), 0);
        setFormData(f => ({ ...f, invoiceNumber: `SALE-${(lastInvoiceNum + 1).toString().padStart(3, '0')}` }));
    }
  }, [invoice, invoices]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let customerName = formData.customerName;
    if (name === 'customerId') {
        const selectedCustomer = customers.find(c => c.id === value);
        customerName = selectedCustomer ? selectedCustomer.name : '';
    }
    setFormData(prev => ({ ...prev, [name]: value, customerName }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    (item[field] as any) = value;

    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.productName = product.name;
            item.unitPrice = product.salePrice;
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
        alert("Please select a customer and add at least one item.");
        return;
    }
    try {
        onSave({ ...formData, id: formData.id || new Date().toISOString() }, originalItems);
    } catch (error: any) {
        console.error(error);
    }
  };

  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl" dir={document.documentElement.dir}>
        <h2 className="text-2xl font-bold mb-4">{invoice ? t('editInvoice') : t('addNewInvoice')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleHeaderChange} placeholder={t('invoiceNumber')} className="p-2 border rounded w-full bg-gray-100" readOnly />
            <select name="customerId" value={formData.customerId} onChange={handleHeaderChange} className="p-2 border rounded w-full" required>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                    <input type="number" value={item.unitPrice} readOnly className="col-span-2 p-2 border rounded w-full text-sm bg-gray-100" />
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


const Invoices: React.FC<InvoicesProps> = ({ t }) => {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', initialInvoices);
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [customers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [settings] = useLocalStorage<AppSettings>('settings', initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveInvoice = (invoice: Invoice, originalItems: InvoiceItem[]) => {
    let updatedProducts = [...products];
    if (editingInvoice) { // Re-stock items from original invoice if editing
      originalItems.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) updatedProducts[productIndex].quantity += item.quantity;
      });
    }

    let stockError = '';
    invoice.items.forEach(item => { // De-stock items from new/updated invoice
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        if (updatedProducts[productIndex].quantity < item.quantity) {
          stockError = `Not enough stock for ${item.productName}. Only ${updatedProducts[productIndex].quantity} available.`;
        }
        updatedProducts[productIndex].quantity -= item.quantity;
      }
    });

    if (stockError) {
        alert(stockError);
        // Note: In a real app, you'd reverse the partial stock changes before throwing.
        // For this demo, we assume transaction fails before state is set.
        throw new Error(stockError);
    }

    setProducts(updatedProducts);
    if (editingInvoice) {
      setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
    } else {
      setInvoices([...invoices, invoice]);
    }
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action will restock the items and cannot be undone.')) {
        const invoiceToDelete = invoices.find(i => i.id === invoiceId);
        if (!invoiceToDelete) return;

        let updatedProducts = [...products];
        invoiceToDelete.items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if(productIndex !== -1) updatedProducts[productIndex].quantity += item.quantity;
        });
        setProducts(updatedProducts);

        setInvoices(invoices.filter(i => i.id !== invoiceId));
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => 
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('invoices')}</h1>
        <button onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Icon name="plus" className="w-5 h-5" />
          <span className="mx-2">{t('addNewInvoice')}</span>
        </button>
      </div>
       <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
         <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 rtl:right-0 rtl:left-auto">
                <Icon name="search" className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder={t('searchInvoices')}
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
              <th scope="col" className="px-6 py-3">{t('invoiceNumber')}</th>
              <th scope="col" className="px-6 py-3">{t('customer')}</th>
              <th scope="col" className="px-6 py-3">{t('date')}</th>
              <th scope="col" className="px-6 py-3">{t('total')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">{invoice.customerName}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4">{invoice.total.toLocaleString()} {t('egp')}</td>
                  <td className="px-6 py-4 flex space-x-2 rtl:space-x-reverse">
                      <button onClick={() => { setEditingInvoice(invoice); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                      <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600 hover:text-red-800"><Icon name="delete" className="w-5 h-5"/></button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <InvoiceModal invoice={editingInvoice} onClose={() => setIsModalOpen(false)} onSave={handleSaveInvoice} t={t} products={products} customers={customers} invoices={invoices} settings={settings} />}
    </div>
  );
};

export default Invoices;