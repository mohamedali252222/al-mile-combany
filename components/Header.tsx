
import React from 'react';
import Icon from './Icon';
import type { Language } from '../App';
import type { translations } from '../utils/translations';
import { User } from '../types';

interface HeaderProps {
  t: (key: keyof typeof translations.en) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ t, language, setLanguage, toggleSidebar, user }) => {
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
         <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <Icon name="menu" className="w-6 h-6"/>
        </button>
        <div className="relative mx-4 lg:mx-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </span>
          <input
            className="w-32 pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 border border-transparent rounded-md sm:w-64 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:bg-white"
            type="text"
            placeholder={t('searchProducts')}
          />
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            {language === 'en' ? 'ع' : 'En'}
          </button>
        </div>
        <div className="relative flex items-center ml-3">
            <span className="text-right mx-3 hidden sm:block">
                <p className="font-semibold text-sm text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{t('role')}: {user.role}</p>
            </span>
            <img className="object-cover w-10 h-10 rounded-full" src={`https://i.pravatar.cc/100?u=${user.id}`} alt="Avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
