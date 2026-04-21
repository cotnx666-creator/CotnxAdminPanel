import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  Calendar, 
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const FinanceReports = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [partnerData, setPartnerData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, expensesRes, monthlyRes, partnersRes] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/expenses/summary'),
        api.get('/expenses/monthly', { params: { year: new Date().getFullYear() } }),
        api.get('/finance/partners')
      ]);
      
      setSummary(summaryRes.data);
      setExpenseData(expensesRes.data.categories || []);
      setPartnerData(partnersRes.data);
      
      const monthlyMap = {};
      monthlyRes.data.forEach(item => {
        if (!monthlyMap[item.month]) {
          monthlyMap[item.month] = { month: item.month, total: 0 };
        }
        monthlyMap[item.month].total += item.total;
      });
      setMonthlyData(Object.values(monthlyMap));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Category', 'Amount', 'Percentage'];
    const rows = expenseData.map(e => [e.category, e.total.toFixed(2), `${e.percentage}%`]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense-report-${dateRange.end_date}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const pieData = expenseData.length > 0 
    ? expenseData.map(e => ({ name: e.category, value: e.total }))
    : [{ name: 'No Data', value: 1 }];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analyze business performance and generation.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95 font-bold text-sm"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="text-blue-600" size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sales</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">${(summary?.total_sales || 0).toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="text-red-600" size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expenses</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-600">${(summary?.total_expenses || 0).toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="text-green-600" size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Profit</span>
          </div>
          <div className={`text-xl md:text-2xl font-bold ${summary?.is_profit ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(summary?.net_profit || 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FileText className="text-purple-600" size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investment</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-purple-600">${(summary?.total_investment || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Monthly Expense Trend */}
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold mb-6 dark:text-white">Monthly Expense Trend</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie */}
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Category Breakdown</h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner-wise Summary */}
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Partner Investment</h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full text-left text-sm min-w-[400px] md:min-w-0">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3 text-right">Investment</th>
                  <th className="px-4 py-3 text-right">Owner %</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {partnerData.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-bold dark:text-white">{partner.name}</td>
                    <td className="px-4 py-3 text-right dark:text-gray-300">${(partner.initial_investment || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right dark:text-gray-300">{partner.ownership_percentage}%</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">${(partner.net_investment || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Details Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold dark:text-white">Category Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[500px] md:min-w-0">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Count</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {expenseData.map((expense, index) => (
                <tr key={expense.category} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-bold dark:text-white">{expense.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right dark:text-gray-300">{expense.count}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">${expense.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right dark:text-gray-300">{expense.percentage}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800/50 font-bold dark:text-white border-t border-gray-100 dark:border-gray-800">
              <tr>
                <td className="px-6 py-4 uppercase text-[10px] tracking-wider">Total</td>
                <td className="px-6 py-4 text-right">{expenseData.reduce((s, e) => s + e.count, 0)}</td>
                <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">${(expenseData.reduce((s, e) => s + e.total, 0)).toFixed(2)}</td>
                <td className="px-6 py-4 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceReports;
