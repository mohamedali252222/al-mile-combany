
import React, { useState, useRef, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { User, AppSettings } from '../types';
import { initialUsers, initialSettings } from '../data/initialData';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';

interface SettingsProps {
  t: (key: keyof typeof translations.en) => string;
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserModal: React.FC<{
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
  t: (key: keyof typeof translations.en) => string;
}> = ({ user, onClose, onSave, t }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: '',
    role: 'Cashier',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, role: user.role, password: user.password || '' });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("User name is required.");
      return;
    }
    onSave({ ...formData, id: user?.id || new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" dir={document.documentElement.dir}>
        <h2 className="text-2xl font-bold mb-4">{user ? t('editUser') : t('addNewUser')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="name" value={formData.name} onChange={handleChange} placeholder={t('userName')} className="p-2 border rounded w-full" required />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={t('password')} className="p-2 border rounded w-full" />
            <select name="role" value={formData.role} onChange={handleChange} className="p-2 border rounded w-full bg-white">
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Storekeeper">Storekeeper</option>
            </select>
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

const Settings: React.FC<SettingsProps> = ({ t, currentUser, users, setUsers }) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', initialSettings);
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [accountForm, setAccountForm] = useState({ name: currentUser.name, password: '', confirmPassword: '' });

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    setAccountForm({ name: currentUser.name, password: '', confirmPassword: '' });
  }, [currentUser]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setTempSettings(prev => ({
        ...prev,
        [name]: name === 'vatRate' ? parseFloat(value) / 100 : value
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
      e.preventDefault();
      setSettings(tempSettings);
      alert(t('settingsSaved'));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({...prev, [name]: value}));
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountForm.password && accountForm.password !== accountForm.confirmPassword) {
      alert(t('passwordNoMatch'));
      return;
    }
    setUsers(users.map(u => u.id === currentUser.id ? {
      ...u,
      name: accountForm.name,
      password: accountForm.password ? accountForm.password : u.password
    } : u));
    alert(t('userUpdated'));
    setAccountForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers(prev => [...prev, user]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
        alert("Cannot delete the last user.");
        return;
    }
    if (id === currentUser.id) {
        alert("You cannot delete your own account.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
        setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleBackup = () => {
      const dataToBackup = {
          products: JSON.parse(localStorage.getItem('products') || '[]'),
          invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
          purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
          customers: JSON.parse(localStorage.getItem('customers') || '[]'),
          suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
          users: JSON.parse(localStorage.getItem('users') || '[]'),
          settings: JSON.parse(localStorage.getItem('settings') || '{}'),
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToBackup, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `al-mail-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      alert(t('backupSuccessful'));
  };
  
  const handleRestoreClick = () => {
    restoreInputRef.current?.click();
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.confirm(t('restoreWarning'))) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                });
                alert(t('restoreSuccessful'));
                window.location.reload();
            } catch (error) {
                alert("Error reading restore file. Please make sure it's a valid backup file.");
            }
        };
        reader.readAsText(file);
    }
    event.target.value = ''; // Reset input
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('settings')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Account Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
           <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <Icon name="users" className="w-6 h-6 me-3" />
                {t('accountSettings')}
            </h2>
            <form onSubmit={handleSaveAccount}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <input name="name" value={accountForm.name} onChange={handleAccountChange} placeholder={t('userName')} className="p-2 border rounded w-full" required />
                     <input name="password" type="password" value={accountForm.password} onChange={handleAccountChange} placeholder={t('changePassword')} className="p-2 border rounded w-full" />
                     <input name="confirmPassword" type="password" value={accountForm.confirmPassword} onChange={handleAccountChange} placeholder={t('confirmPassword')} className="p-2 border rounded w-full" />
                </div>
                <div className="flex justify-end mt-4">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('saveChanges')}</button>
                </div>
            </form>
        </div>


        {currentUser.role === 'Admin' && (
          <>
            {/* User Management */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                  <Icon name="user-group" className="w-6 h-6 me-3" />
                  {t('userManagement')}
                </h2>
                <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="flex items-center text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Icon name="plus" className="w-4 h-4" />
                    <span className="mx-1">{t('addNewUser')}</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2">{t('userName')}</th>
                      <th scope="col" className="px-4 py-2">{t('role')}</th>
                      <th scope="col" className="px-4 py-2">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-2">{user.role}</td>
                        <td className="px-4 py-2 flex space-x-2 rtl:space-x-reverse">
                          <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-5 h-5"/></button>
                          <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><Icon name="delete" className="w-5 h-5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application Settings */}
            <div className="bg-white p-6 rounded-lg shadow-md">
               <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <Icon name="settings" className="w-6 h-6 me-3" />
                    {t('applicationSettings')}
                </h2>
                <form onSubmit={handleSaveSettings}>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-600 mb-2">{t('companyInfo')}</h3>
                            <div className="space-y-2">
                                <input name="companyName" value={tempSettings.companyName} onChange={handleSettingsChange} placeholder={t('companyName')} className="p-2 border rounded w-full" />
                                <input name="address" value={tempSettings.address} onChange={handleSettingsChange} placeholder={t('address')} className="p-2 border rounded w-full" />
                                <input name="phone" value={tempSettings.phone} onChange={handleSettingsChange} placeholder={t('phone')} className="p-2 border rounded w-full" />
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-600 mb-2">{t('taxSettings')}</h3>
                             <div className="flex items-center">
                                <label htmlFor="vatRate" className="text-sm me-2">{t('vatRate')}</label>
                                <input id="vatRate" name="vatRate" type="number" value={tempSettings.vatRate * 100} onChange={handleSettingsChange} className="p-2 border rounded w-24" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 border-t pt-4">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('saveSettings')}</button>
                    </div>
                </form>
            </div>
            
            {/* Database */}
            <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <Icon name="database" className="w-6 h-6 me-3" />
                {t('database')}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">Manage your application data. It's recommended to take regular backups.</p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
                    <button 
                      onClick={handleBackup} 
                      className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Icon name="document-arrow-down" className="w-5 h-5 me-2" />
                        {t('backupDatabase')}
                    </button>
                    <button 
                      onClick={handleRestoreClick}
                      className="flex-1 flex justify-center items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        <Icon name="database" className="w-5 h-5 me-2" />
                        {t('restoreDatabase')}
                    </button>
                    <input type="file" accept=".json" ref={restoreInputRef} onChange={handleRestore} className="hidden" />
                </div>
              </div>
            </div>
          </>
        )}

      </div>
      {isModalOpen && <UserModal user={editingUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} t={t} />}
    </div>
  );
};

export default Settings;
