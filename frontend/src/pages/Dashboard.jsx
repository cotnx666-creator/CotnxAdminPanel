import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Loader2,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isAdmin ? (
          <>
            <StatCard 
              title="Revenue (Today)" 
              value={`$${stats?.totalSalesToday || 0}`}
              icon={<TrendingUp className="text-blue-600" />}
              color="bg-blue-50 dark:bg-blue-900/20"
              trend="up"
              trendValue="12.5"
            />
            <StatCard 
              title="Monthly Rev" 
              value={`$${stats?.totalSalesMonth || 0}`}
              icon={<BarChart3 className="text-purple-600" />}
              color="bg-purple-50 dark:bg-purple-900/20"
              trend="up"
              trendValue="8.2"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Today's Orders" 
              value={stats?.totalOrdersToday || 0}
              icon={<ShoppingCart className="text-blue-600" />}
              color="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard 
              title="Pending" 
              value={stats?.pendingOrders || 0}
              icon={<Clock className="text-purple-600" />}
              color="bg-purple-50 dark:bg-purple-900/20"
            />
          </>
        )}
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || stats?.totalOrdersToday || 0}
          icon={<ShoppingCart className="text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
          trend={isAdmin ? "down" : undefined}
          trendValue={isAdmin ? "3.1" : undefined}
        />
        <StatCard 
          title="Low Stock" 
          value={stats?.lowStock || 0}
          icon={<AlertTriangle className="text-red-600" />}
          color="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin && (
          <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 dark:text-white">Sales Analytics</h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="sold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={`bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm ${isAdmin ? '' : 'lg:col-span-2'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold dark:text-white">Recent Orders</h3>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full text-left min-w-[500px] md:min-w-0">
              <thead>
                <tr className="text-gray-400 text-xs font-medium border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 pb-4 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 pb-4 uppercase tracking-wider">Customer</th>
                  <th className="px-4 pb-4 uppercase tracking-wider">Status</th>
                  <th className="px-4 pb-4 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats?.recentSales?.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4 font-medium dark:text-white">#{order.id}</td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{order.customer_name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                        order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-900 dark:text-white text-right">${order.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
