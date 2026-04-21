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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-500">Track stock movements and record adjustments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Record Stock Adjustment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 font-bold">
            <History size={18} className="text-gray-400" />
            Stock Movement History
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No stock movements recorded yet.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {log.product_name}
                      <div className="text-xs text-gray-400">{log.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-medium ${
                        log.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        Stock {log.type === 'in' ? 'In' : 'Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{log.quantity}</td>
                    <td className="px-6 py-4 text-gray-600">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold mb-4">Stock Overview</h3>
            <div className="space-y-4">
              {products.slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
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
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Record Stock Adjustment</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                >
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'in'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                        formData.type === 'in' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      <PackagePlus size={16} /> Stock In
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'out'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                        formData.type === 'out' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      <PackageMinus size={16} /> Stock Out
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Note</label>
                <textarea 
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Restock from supplier, Damage, Correction"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Save Adjustment
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
