import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Bell, Globe, Save, UserPlus, Users, Loader2 } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User size={18} /> },
    { id: 'security', name: 'Security', icon: <Shield size={18} /> },
  ];

  if (user?.role === 'Admin') {
    tabs.push({ id: 'team', name: 'Team', icon: <Users size={18} /> });
  }

  tabs.push(
    { id: 'notifications', name: 'Alerts', icon: <Bell size={18} /> },
    { id: 'general', name: 'General', icon: <Globe size={18} /> }
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/register', registerForm);
      setMessage({ type: 'success', text: 'Registered successfully!' });
      setRegisterForm({ name: '', email: '', password: '', role: 'Staff' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 overflow-x-auto">
          <nav className="p-2 md:p-4 flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8">
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center gap-4 md:gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg dark:text-white">{user?.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role} Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
              </div>

              <button className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-xl space-y-6">
              <div className="space-y-4">
                <h4 className="font-bold dark:text-white">Update Password</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                  </div>
                </div>
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'team' && user?.role === 'Admin' && (
            <div className="max-w-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600" size={24} />
                  <h4 className="text-lg font-bold dark:text-white">Register Team Member</h4>
                </div>
                
                {message.text && (
                  <div className={`p-4 rounded-lg text-sm ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                    <input 
                      type="password" 
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                    >
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm active:scale-95"
                    >
                      {loading && <Loader2 className="animate-spin" size={18} />}
                      Register Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'general') && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <Globe size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
