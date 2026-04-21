import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
              className="p-2 hover:bg-gray-100 rounded-full md:hidden dark:hover:bg-gray-800 dark:text-gray-400"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun size={20} className="text-gray-600 dark:text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
          
          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

          <div className="flex items-center gap-2 md:ml-2">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                {user?.name}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {user?.role}
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors md:hidden"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
