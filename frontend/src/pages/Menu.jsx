import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FolderTree, 
  Boxes, 
  BarChart3, 
  Settings, 
  Wallet, 
  UsersRound, 
  Receipt, 
  PieChart,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const menuSections = [
    {
      title: 'Management',
      items: [
        { name: 'Inventory', icon: <Boxes size={20} />, path: '/inventory', color: 'text-orange-500' },
      ]
    }
  ];

  if (isAdmin) {
    menuSections[0].items.unshift({ name: 'Categories', icon: <FolderTree size={20} />, path: '/categories', color: 'text-green-500' });
    
    menuSections.push({
      title: 'Reports & Analytics',
      items: [
        { name: 'General Reports', icon: <BarChart3 size={20} />, path: '/reports', color: 'text-blue-500' },
      ]
    });

    menuSections.push({
      title: 'Finance Module',
      items: [
        { name: 'Finance Overview', icon: <Wallet size={20} />, path: '/finance', color: 'text-emerald-500' },
        { name: 'Partners', icon: <UsersRound size={20} />, path: '/finance/partners', color: 'text-indigo-500' },
        { name: 'Expenses', icon: <Receipt size={20} />, path: '/finance/expenses', color: 'text-rose-500' },
        { name: 'Finance Reports', icon: <PieChart size={20} />, path: '/finance/reports', color: 'text-amber-500' },
      ]
    });

    menuSections.push({
      title: 'System',
      items: [
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', color: 'text-gray-500' },
      ]
    });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="pb-20">
      {/* User Profile Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6 flex items-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
          {user?.name?.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role} Account</p>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {section.title}
            </h4>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {section.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${item.color} bg-gray-50 dark:bg-gray-800 p-2 rounded-lg`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/20"
          >
            <LogOut size={20} />
            <span>Logout from Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
