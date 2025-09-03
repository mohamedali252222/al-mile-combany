
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Login from './components/Login';
import { translations } from './utils/translations';
import { User } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { initialUsers } from './data/initialData';

export type Page = 'Dashboard' | 'Products' | 'Invoices' | 'Purchases' | 'Customers' | 'Suppliers' | 'Reports' | 'Settings';
export type Language = 'en' | 'ar';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [language, setLanguage] = useState<Language>('ar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('Dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const renderPage = () => {
    if (!currentUser) return <Dashboard t={t} />; // Should not happen

    const userRoles: Record<User['role'], Page[]> = {
        Admin: ['Dashboard', 'Products', 'Invoices', 'Purchases', 'Customers', 'Suppliers', 'Reports', 'Settings'],
        Cashier: ['Dashboard', 'Invoices', 'Customers', 'Reports'],
        Storekeeper: ['Dashboard', 'Products', 'Purchases', 'Suppliers', 'Reports'],
    };

    if (!userRoles[currentUser.role].includes(currentPage)) {
        // Fallback to dashboard if user tries to access a restricted page
        return <Dashboard t={t} />;
    }

    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard t={t} />;
      case 'Products':
        return <Products t={t} />;
      case 'Invoices':
        return <Invoices t={t} />;
      case 'Purchases':
        return <Purchases t={t} />;
      case 'Customers':
        return <Customers t={t} />;
      case 'Suppliers':
        return <Suppliers t={t} />;
      case 'Reports':
        return <Reports t={t} />;
      case 'Settings':
        return <Settings t={t} currentUser={currentUser} setUsers={setUsers} users={users} />;
      default:
        return <Dashboard t={t} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} t={t} users={users} />;
  }

  return (
    <div className={`flex h-screen bg-gray-100 font-sans ${language === 'ar' ? 'font-cairo' : ''}`}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        t={t} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        lang={language}
        user={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          t={t} 
          language={language} 
          setLanguage={setLanguage} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={currentUser}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
