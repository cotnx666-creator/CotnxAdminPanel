import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Bell, Globe, Save, UserPlus, Users, Loader2 } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [team, setTeam] = useState([]);
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
    tabs.push({ id: 'team', name: 'Team Management', icon: <Users size={18} /> });
  }

  tabs.push(
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'general', name: 'General', icon: <Globe size={18} /> }
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/register', registerForm);
      setMessage({ type: 'success', text: 'New member registered successfully!' });
      setRegisterForm({ name: '', email: '', password: '', role: 'Staff' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your account and application preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{user?.name}</h4>
                  <p className="text-sm text-gray-500">{user?.role} Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-xl space-y-6">
              <div className="space-y-4">
                <h4 className="font-bold">Change Password</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'team' && user?.role === 'Admin' && (
            <div className="max-w-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600" size={24} />
                  <h4 className="text-lg font-bold">Register New Team Member</h4>
                </div>
                
                {message.text && (
                  <div className={`p-4 rounded-lg text-sm ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input 
                      type="password" 
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading && <Loader2 className="animate-spin" size={18} />}
                      Register Member
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  * Note: Only Admins can register new staff or admin accounts.
                </p>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'general') && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
