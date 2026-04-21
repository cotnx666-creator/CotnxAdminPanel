import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  PieChart,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts';

const StatCard = ({ title, value, icon, color, trend, trendValue, isNegative }) => (
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
    <p className={`text-2xl font-bold mt-1 ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b'];

const FinanceDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/finance/summary');
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  const expenseData = summary?.expenseBreakdown || [];
  const pieData = expenseData.length > 0 
    ? expenseData.map(e => ({ name: e.category, value: e.total }))
    : [{ name: 'No Data', value: 1 }];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
        <p className="text-gray-500">Overview of business finances and partner earnings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`$${summary?.total_sales?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${summary?.total_expenses?.toFixed(2) || '0.00'}`}
          icon={<TrendingDown className="text-red-600" />}
          color="bg-red-50"
          isNegative
        />
        <StatCard 
          title={summary?.is_profit ? 'Net Profit' : 'Net Loss'} 
          value={`$${Math.abs(summary?.net_profit || 0).toFixed(2)}`}
          icon={summary?.is_profit ? <TrendingUp className="text-green-600" /> : <TrendingDown className="text-red-600" />}
          color={summary?.is_profit ? 'bg-green-50' : 'bg-red-50'}
          isNegative={!summary?.is_profit}
        />
        <StatCard 
          title="Total Investment" 
          value={`$${summary?.total_investment?.toFixed(2) || '0.00'}`}
          icon={<Wallet className="text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Profit Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users className="text-gray-400" size={20} />
            Partner Profit Distribution
          </h3>
          <div className="space-y-4">
            {summary?.partners?.map((partner, index) => (
              <div key={partner.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{partner.name}</div>
                    <div className="text-xs text-gray-500">{partner.ownership_percentage}% ownership</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${((partner.pending_profit + partner.total_profit_earned) || 0).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    Earned: ${(partner.total_profit_earned || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {!summary?.partners?.length && (
              <p className="text-center text-gray-500 py-8">No partners found.</p>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChart className="text-gray-400" size={20} />
            Expense Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Partner-wise Detailed Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold">Partner Financial Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4 text-right">Investment</th>
                <th className="px-6 py-4 text-right">Ownership %</th>
                <th className="px-6 py-4 text-right">Profit Earned</th>
                <th className="px-6 py-4 text-right">Pending Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary?.partners?.map((partner, index) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{partner.name}</td>
                  <td className="px-6 py-4 text-right">${(partner.initial_investment || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{partner.ownership_percentage}%</td>
                  <td className="px-6 py-4 text-right text-green-600 font-bold">
                    ${(partner.total_profit_earned || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-yellow-600 font-bold">
                    ${(partner.pending_profit || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
