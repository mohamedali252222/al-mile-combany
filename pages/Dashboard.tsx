
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product, Invoice } from '../types';
import { initialProducts, initialInvoices } from '../data/initialData';
import type { translations } from '../utils/translations';

interface DashboardProps {
  t: (key: keyof typeof translations.en) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ t }) => {
  const [products] = useLocalStorage<Product[]>('products', initialProducts);
  const [invoices] = useLocalStorage<Invoice[]>('invoices', initialInvoices);
  const [purchases] = useLocalStorage<Invoice[]>('purchases', []);

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPurchases = purchases.reduce((sum, pur) => sum + pur.total, 0);
  const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold).length;

  const salesData = [
    { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 4500 }, { name: 'May', sales: 6000 }, { name: 'Jun', sales: 5500 },
    { name: 'Jul', sales: 7000 }, { name: 'Aug', sales: 6500 }, { name: 'Sep', sales: 7500 },
    { name: 'Oct', sales: 8000 }, { name: 'Nov', sales: 9000 }, { name: 'Dec', sales: 8500 },
  ];
  
  const topProductsData = products.slice(0, 5).map(p => ({ name: p.name, value: p.salePrice * (500 - p.quantity) })); // dummy sales data
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title={t('totalSales')} value={`${totalSales.toLocaleString()} ${t('egp')}`} icon="arrow-trending-up" iconColor="bg-green-500" />
        <DashboardCard title={t('totalPurchases')} value={`${totalPurchases.toLocaleString()} ${t('egp')}`} icon="arrow-trending-down" iconColor="bg-red-500" />
        <DashboardCard title={t('totalProducts')} value={products.length.toString()} icon="box" iconColor="bg-blue-500" />
        <DashboardCard title={t('lowStockItems')} value={lowStockProducts.toString()} icon="exclamation-triangle" iconColor="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('salesOverview')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name={t('totalSales')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('topSellingProducts')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={topProductsData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

