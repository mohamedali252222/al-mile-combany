import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Customer } from '../types';
import { initialCustomers } from '../data/initialData';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';

interface CustomersProps {
  t: (key: keyof typeof translations.en) => string;
}

const CustomerModal: React.FC<{
  customer: Customer | null;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  t: (key: keyof typeof translations.en) => string;
}> = ({ customer, onClose, onSave, t }) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>(
    customer || { name: '', phone: '', address: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: customer?.id || new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" dir={document.documentElement.dir}>
        <h2 className="text-2xl font-bold mb-4">{customer ? t('editCustomer') : t('addNewCustomer')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="name" value={formData.name} onChange={handleChange} placeholder={t('customerName')} className="p-2 border rounded w-full" required />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder={t('phone')} className="p-2 border rounded w-full" />
            <input name="address" value={formData.address} onChange={handleChange} placeholder={t('address')} className="p-2 border rounded w-full" />
          </div>
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Customers: React.FC<CustomersProps> = ({ t }) => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleSaveCustomer = (customer: Customer) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers(prev => [...prev, customer]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('customers')}</h1>
        <button onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Icon name="plus" className="w-5 h-5" />
          <span className="mx-2">{t('addNewCustomer')}</span>
        </button>
      </div>
       <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
         <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 rtl:right-0 rtl:left-auto">
                <Icon name="search" className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder={t('searchCustomers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 p-2 pl-10 rtl:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>
       <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">{t('customerName')}</th>
              <th scope="col" className="px-6 py-3">{t('phone')}</th>
              <th scope="col" className="px-6 py-3">{t('address')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.address}</td>
                  <td className="px-6 py-4 flex space-x-2 rtl:space-x-reverse">
                      <button onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                      <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-600 hover:text-red-800"><Icon name="delete" className="w-5 h-5"/></button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <CustomerModal customer={editingCustomer} onClose={() => setIsModalOpen(false)} onSave={handleSaveCustomer} t={t} />}
    </div>
  );
};

export default Customers;
