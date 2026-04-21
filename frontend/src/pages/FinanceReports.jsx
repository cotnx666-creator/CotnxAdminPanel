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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-500">Analyze business performance and generate reports.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={20} />
            <span className="text-sm text-gray-500">Total Sales</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(summary?.total_sales || 0).toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-red-600" size={20} />
            <span className="text-sm text-gray-500">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-red-600">${(summary?.total_expenses || 0).toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-sm text-gray-500">Net Profit/Loss</span>
          </div>
          <div className={`text-2xl font-bold ${summary?.is_profit ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(summary?.net_profit || 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-purple-600" size={20} />
            <span className="text-sm text-gray-500">Total Investment</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">${(summary?.total_investment || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Monthly Expense Trend */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Monthly Expense Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Expense Category Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner-wise Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Partner Investment Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3 text-right">Investment</th>
                  <th className="px-4 py-3 text-right">Ownership %</th>
                  <th className="px-4 py-3 text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {partnerData.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{partner.name}</td>
                    <td className="px-4 py-3 text-right">${(partner.initial_investment || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{partner.ownership_percentage}%</td>
                    <td className="px-4 py-3 text-right font-bold">${(partner.net_investment || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Details Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold">Expense Category Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Count</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenseData.map((expense, index) => (
                <tr key={expense.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium">{expense.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">{expense.count}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">${expense.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{expense.percentage}%</td>
                </tr>
              ))}
              {expenseData.length === 0 && (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No expense data available.</td></tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td className="px-6 py-4">Total</td>
                <td className="px-6 py-4 text-right">{expenseData.reduce((s, e) => s + e.count, 0)}</td>
                <td className="px-6 py-4 text-right text-red-600">${(expenseData.reduce((s, e) => s + e.total, 0)).toFixed(2)}</td>
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
