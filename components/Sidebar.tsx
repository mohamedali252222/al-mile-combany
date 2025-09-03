
import React from 'react';
import Icon from './Icon';
import type { Page, Language } from '../App';
import type { translations } from '../utils/translations';
import { User } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  t: (key: keyof typeof translations.en) => string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lang: Language;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, t, isOpen, setIsOpen, lang, user, onLogout }) => {
  const allNavItems: { page: Page; icon: React.ComponentProps<typeof Icon>['name']; roles: User['role'][] }[] = [
    { page: 'Dashboard', icon: 'dashboard', roles: ['Admin', 'Cashier', 'Storekeeper'] },
    { page: 'Products', icon: 'box', roles: ['Admin', 'Storekeeper'] },
    { page: 'Invoices', icon: 'invoices', roles: ['Admin', 'Cashier'] },
    { page: 'Purchases', icon: 'truck', roles: ['Admin', 'Storekeeper'] },
    { page: 'Customers', icon: 'user-group', roles: ['Admin', 'Cashier'] },
    { page: 'Suppliers', icon: 'building-office', roles: ['Admin', 'Storekeeper'] },
    { page: 'Reports', icon: 'reports', roles: ['Admin', 'Cashier', 'Storekeeper'] },
    { page: 'Settings', icon: 'settings', roles: ['Admin', 'Cashier', 'Storekeeper'] },
  ];
  
  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  const sidebarClasses = `bg-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`;
  const linkClasses = `flex items-center p-4 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200 ${isOpen ? '' : 'justify-center'}`;
  const activeLinkClasses = 'bg-blue-600';
  
  return (
    <div className={`${sidebarClasses} ${lang === 'ar' ? 'border-l' : 'border-r'} border-slate-700`}>
      <div className={`flex items-center ${isOpen ? 'p-4' : 'p-2 justify-center'} h-20 border-b border-slate-700`}>
        <div className="bg-white p-1 rounded-md">
            <Icon name="box" className="h-8 w-8 text-blue-600" />
        </div>
        {isOpen && (
            <div className={`mx-3`}>
              <h1 className="text-lg font-bold leading-tight">{t('companyName').split(' ')[0]}</h1>
              <p className="text-xs text-slate-400 leading-tight">{t('companyName').split(' ').slice(1).join(' ')}</p>
            </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.page}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(item.page);
            }}
            className={`${linkClasses} ${currentPage === item.page ? activeLinkClasses : ''}`}
            title={!isOpen ? t(item.page.toLowerCase() as keyof typeof translations.en) : ''}
          >
            <Icon name={item.icon} className="h-6 w-6" />
            {isOpen && <span className={`${lang === 'ar' ? 'mr-4' : 'ml-4'}`}>{t(item.page.toLowerCase() as keyof typeof translations.en)}</span>}
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
         <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
            className={`${linkClasses}`}
            title={!isOpen ? t('logout') : ''}
          >
            <Icon name="logout" className="h-6 w-6" />
            {isOpen && <span className={`${lang === 'ar' ? 'mr-4' : 'ml-4'}`}>{t('logout')}</span>}
          </a>
      </div>
    </div>
  );
};

export default Sidebar;
