import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Boxes,
  FolderTree,
  Wallet,
  Receipt,
  PieChart,
  UsersRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const isAdmin = user?.role === 'Admin';

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Categories', icon: <FolderTree size={20} />, path: '/categories' });
  }

  menuItems.push(
    { name: 'Inventory', icon: <Boxes size={20} />, path: '/inventory' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers' }
  );

  if (isAdmin) {
    menuItems.push({ name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' });
    menuItems.push({ name: 'Settings', icon: <Settings size={20} />, path: '/settings' });
  }

  const financeItems = [
    { name: 'Overview', icon: <Wallet size={20} />, path: '/finance' },
    { name: 'Partners', icon: <UsersRound size={20} />, path: '/finance/partners' },
    { name: 'Expenses', icon: <Receipt size={20} />, path: '/finance/expenses' },
    { name: 'Reports', icon: <PieChart size={20} />, path: '/finance/reports' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          AdminPanel
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {item.name}
            </div>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="px-6 py-3 pt-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Finance</span>
            </div>
            {financeItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </div>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
