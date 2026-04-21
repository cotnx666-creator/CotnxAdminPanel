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
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}</h2>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard 
              title="Total Revenue (Today)" 
              value={`$${stats?.totalSalesToday || 0}`}
              icon={<TrendingUp className="text-blue-600" />}
              color="bg-blue-50"
              trend="up"
              trendValue="12.5"
            />
            <StatCard 
              title="Monthly Revenue" 
              value={`$${stats?.totalSalesMonth || 0}`}
              icon={<BarChart3 className="text-purple-600" />}
              color="bg-purple-50"
              trend="up"
              trendValue="8.2"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Today's Total Orders" 
              value={stats?.totalOrdersToday || 0}
              icon={<ShoppingCart className="text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard 
              title="Pending Orders" 
              value={stats?.pendingOrders || 0}
              icon={<Clock className="text-purple-600" />}
              color="bg-purple-50"
            />
          </>
        )}
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || stats?.totalOrdersToday || 0}
          icon={<ShoppingCart className="text-orange-600" />}
          color="bg-orange-50"
          trend={isAdmin ? "down" : undefined}
          trendValue={isAdmin ? "3.1" : undefined}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats?.lowStock || 0}
          icon={<AlertTriangle className="text-red-600" />}
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Sales Analytics</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${isAdmin ? '' : 'lg:col-span-2'}`}>
          <h3 className="text-lg font-bold mb-6">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm font-medium border-b border-gray-100">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.recentSales?.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-4 font-medium">#{order.id}</td>
                    <td className="py-4 text-gray-600">{order.customer_name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 
                        order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 font-medium">${order.total_amount}</td>
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
