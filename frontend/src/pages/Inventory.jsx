import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PackagePlus, 
  PackageMinus, 
  History, 
  Search, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';

const Inventory = () => {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in',
    quantity: '',
    reason: ''
  });

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/inventory/logs');
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', { params: { limit: 100 } });
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inventory/update', formData);
      setIsModalOpen(false);
      fetchLogs();
      fetchProducts();
      setFormData({ product_id: '', type: 'in', quantity: '', reason: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Inventory</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track stock movements and record adjustments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Record Adjustment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 font-bold dark:text-white">
            <History size={18} className="text-gray-400" />
            Stock Movement History
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No logs found.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-white">
                      {log.product_name}
                      <div className="text-xs text-gray-400 font-mono">{log.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-bold uppercase text-[10px] ${
                        log.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        Stock {log.type === 'in' ? 'In' : 'Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold dark:text-white">{log.quantity}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No logs found.</div>
            ) : logs.map((log) => (
              <div key={log.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{log.product_name}</div>
                    <div className="text-xs text-gray-400 font-mono">{log.sku}</div>
                  </div>
                  <span className={`flex items-center gap-1 font-bold uppercase text-[10px] ${
                    log.type === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {log.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {log.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleDateString()}</span>
                  <span className="text-gray-600 dark:text-gray-400 italic">{log.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold mb-4 dark:text-white">Stock Overview</h3>
            <div className="space-y-4">
              {products.slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.sku}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    product.stock <= 5 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stock Adjustment</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                <select 
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                >
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adjustment Type</label>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'in'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${
                      formData.type === 'in' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <PackagePlus size={16} /> In
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'out'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${
                      formData.type === 'out' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <PackageMinus size={16} /> Out
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea 
                  rows="2"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g. Restock, Damage, Sale"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
