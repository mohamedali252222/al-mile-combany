import React, { useState } from 'react';
import { User } from '../types';
import Icon from './Icon';
import type { translations } from '../utils/translations';

interface LoginProps {
  onLogin: (user: User) => void;
  t: (key: keyof typeof translations.en) => string;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, t, users }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const userToLogin = users.find(u => u.id === selectedUserId);
    if (userToLogin) {
      if (userToLogin.password === password) {
        onLogin(userToLogin);
      } else {
        setError(t('incorrectPassword'));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <div className="bg-slate-800 p-3 rounded-full">
                <Icon name="box" className="h-10 w-10 text-white" />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('welcome')}</h1>
        <p className="text-center text-gray-500 mb-8">{t('companyName')}</p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">{t('selectUser')}</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 text-center text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!selectedUserId}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;