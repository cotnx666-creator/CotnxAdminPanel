import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Plus, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const segment = path.split('/')[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const showBackButton = location.pathname !== '/';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full md:hidden dark:hover:bg-gray-800"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800">
            <Search size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full relative dark:hover:bg-gray-800">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
