import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Download, Calendar, Loader2 } from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [salesRes, productSalesRes] = await Promise.all([
        api.get('/reports/sales', { params: dateRange }),
        api.get('/reports/product-sales', { params: dateRange })
      ]);
      setData(salesRes.data);
      setProductSales(productSalesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export', {
        params: dateRange,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${dateRange.start_date}-to-${dateRange.end_date}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Reports</h2>
          <p className="text-gray-500">Analyze your business performance over time.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <Calendar size={18} className="text-gray-400" />
            <input 
              type="date" 
              value={dateRange.start_date}
              onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
              className="outline-none text-sm"
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              value={dateRange.end_date}
              onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
              className="outline-none text-sm"
            />
          </div>
          <button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* ... existing charts ... */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
          <div className="h-96">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Orders Count</h3>
          <div className="h-96">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* New Product-wise Sales Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold">Product-wise Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-center">Qty Sold</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                  <th className="px-6 py-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : productSales.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No sales data for this period.</td></tr>
                ) : productSales.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono">{item.sku}</td>
                    <td className="px-6 py-4 text-center">{item.total_quantity}</td>
                    <td className="px-6 py-4 text-right font-bold">${item.total_revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-bold">${item.total_profit.toFixed(2)}</td>
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

export default Reports;
