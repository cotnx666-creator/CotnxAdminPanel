import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  MoreHorizontal 
} from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', icon: <LayoutDashboard size={24} />, path: '/' },
    { name: 'Orders', icon: <ShoppingCart size={24} />, path: '/orders' },
    { name: 'Products', icon: <Package size={24} />, path: '/products' },
    { name: 'Customers', icon: <Users size={24} />, path: '/customers' },
    { name: 'More', icon: <MoreHorizontal size={24} />, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 md:hidden dark:bg-gray-900 dark:border-gray-800">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
