import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Supplier } from '../types';
import { initialSuppliers } from '../data/initialData';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';

interface SuppliersProps {
  t: (key: keyof typeof translations.en) => string;
}

const SupplierModal: React.FC<{
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  t: (key: keyof typeof translations.en) => string;
}> = ({ supplier, onClose, onSave, t }) => {
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>(
    supplier || { name: '', phone: '', address: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: supplier?.id || new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" dir={document.documentElement.dir}>
        <h2 className="text-2xl font-bold mb-4">{supplier ? t('editSupplier') : t('addNewSupplier')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="name" value={formData.name} onChange={handleChange} placeholder={t('supplierName')} className="p-2 border rounded w-full" required />
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


const Suppliers: React.FC<SuppliersProps> = ({ t }) => {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleSaveSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
    } else {
      setSuppliers(prev => [...prev, supplier]);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };


  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.phone.includes(searchTerm)
    );
  }, [suppliers, searchTerm]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('suppliers')}</h1>
        <button onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Icon name="plus" className="w-5 h-5" />
          <span className="mx-2">{t('addNewSupplier')}</span>
        </button>
      </div>
       <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
         <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 rtl:right-0 rtl:left-auto">
                <Icon name="search" className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder={t('searchSuppliers')}
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
              <th scope="col" className="px-6 py-3">{t('supplierName')}</th>
              <th scope="col" className="px-6 py-3">{t('phone')}</th>
              <th scope="col" className="px-6 py-3">{t('address')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4">{supplier.phone}</td>
                  <td className="px-6 py-4">{supplier.address}</td>
                  <td className="px-6 py-4 flex space-x-2 rtl:space-x-reverse">
                      <button onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                      <button onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600 hover:text-red-800"><Icon name="delete" className="w-5 h-5"/></button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <SupplierModal supplier={editingSupplier} onClose={() => setIsModalOpen(false)} onSave={handleSaveSupplier} t={t} />}
    </div>
  );
};

export default Suppliers;
