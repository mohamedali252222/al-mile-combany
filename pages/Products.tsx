
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product } from '../types';
import { initialProducts } from '../data/initialData';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';

interface ProductsProps {
  t: (key: keyof typeof translations.en) => string;
}

const ProductModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  t: (key: keyof typeof translations.en) => string;
}> = ({ product, onClose, onSave, t }) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: '', name: '', sku: '', barcode: '', category: '',
      purchasePrice: 0, salePrice: 0, quantity: 0, lowStockThreshold: 10,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" dir={document.documentElement.dir}>
        <h2 className="text-2xl font-bold mb-4">{product ? t('editProduct') : t('addNewProduct')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder={t('productName')} className="p-2 border rounded w-full" required />
            <input name="sku" value={formData.sku} onChange={handleChange} placeholder={t('sku')} className="p-2 border rounded w-full" />
            <input name="barcode" value={formData.barcode} onChange={handleChange} placeholder={t('barcode')} className="p-2 border rounded w-full" />
            <input name="category" value={formData.category} onChange={handleChange} placeholder={t('category')} className="p-2 border rounded w-full" />
            <input name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} placeholder={t('purchasePrice')} className="p-2 border rounded w-full" required />
            <input name="salePrice" type="number" value={formData.salePrice} onChange={handleChange} placeholder={t('salePrice')} className="p-2 border rounded w-full" required />
            <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder={t('quantityInStock')} className="p-2 border rounded w-full" required />
            <input name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} placeholder={t('lowStockThreshold')} className="p-2 border rounded w-full" required />
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


const Products: React.FC<ProductsProps> = ({ t }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, product]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))
      .filter(p => {
        if (stockFilter === 'all') return true;
        if (stockFilter === 'inStock') return p.quantity > p.lowStockThreshold;
        if (stockFilter === 'lowStock') return p.quantity > 0 && p.quantity <= p.lowStockThreshold;
        if (stockFilter === 'outOfStock') return p.quantity === 0;
        return true;
      });
  }, [products, searchTerm, stockFilter]);

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
        return { text: t('outOfStock'), color: 'bg-red-100 text-red-800' };
    }
    if (product.quantity <= product.lowStockThreshold) {
        return { text: t('lowStock'), color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: t('inStock'), color: 'bg-green-100 text-green-800' };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('products')}</h1>
        <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Icon name="plus" className="w-5 h-5" />
          <span className="mx-2">{t('addNewProduct')}</span>
        </button>
      </div>
      
      <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 rtl:right-0 rtl:left-auto">
                    <Icon name="search" className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder={t('searchProducts')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 rtl:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <select 
                    value={stockFilter}
                    onChange={e => setStockFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">{t('all')} {t('stockStatus')}</option>
                    <option value="inStock">{t('inStock')}</option>
                    <option value="lowStock">{t('lowStock')}</option>
                    <option value="outOfStock">{t('outOfStock')}</option>
                </select>
            </div>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">{t('productName')}</th>
              <th scope="col" className="px-6 py-3">{t('sku')}</th>
              <th scope="col" className="px-6 py-3">{t('category')}</th>
              <th scope="col" className="px-6 py-3">{t('salePrice')}</th>
              <th scope="col" className="px-6 py-3">{t('quantityInStock')}</th>
              <th scope="col" className="px-6 py-3">{t('stockStatus')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const status = getStockStatus(product);
              return (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4">{product.sku}</td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">{product.salePrice.toLocaleString()} {t('egp')}</td>
                <td className="px-6 py-4 font-bold">{product.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    {status.text}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-2 rtl:space-x-reverse">
                  <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800"><Icon name="delete" className="w-5 h-5"/></button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      {isModalOpen && <ProductModal product={editingProduct} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} t={t} />}
    </div>
  );
};

export default Products;
