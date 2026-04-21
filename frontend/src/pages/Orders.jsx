import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Download, 
  Eye,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    items: [],
    payment_status: 'Pending'
  });

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
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
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchProducts()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, price: 0 }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      updatedItems[index] = { 
        ...updatedItems[index], 
        product_id: value, 
        price: product ? product.selling_price : 0 
      };
    } else {
      updatedItems[index][field] = value;
    }
    setNewOrder(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', newOrder);
      setIsModalOpen(false);
      fetchOrders();
      setNewOrder({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        items: [],
        payment_status: 'Pending'
      });
    } catch (err) {
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to download invoice');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'Shipped': return <Truck size={16} className="text-blue-500" />;
      case 'Pending': return <Clock size={16} className="text-yellow-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer orders and billing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Create Manual Order</span>
        </button>
      </div>

      {/* Search and Filters for Orders */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium dark:text-white">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer_phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">${order.total_amount}</td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="text-sm border-none bg-transparent font-medium focus:ring-0 cursor-pointer dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    {isAdmin && <option value="Cancelled">Cancelled</option>}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Download Invoice"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found.</div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${order.total_amount}</span>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer_phone}</div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  className="text-xs bg-gray-50 dark:bg-gray-800 border-none rounded-md py-1 px-2 font-medium focus:ring-0 cursor-pointer dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  {isAdmin && <option value="Cancelled">Cancelled</option>}
                </select>
              </div>
              <button 
                onClick={() => handleDownloadInvoice(order.id)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Create New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Customer Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input 
                    type="text" 
                    required 
                    value={newOrder.customer_phone}
                    onChange={(e) => setNewOrder({...newOrder, customer_phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <textarea 
                    rows="2" 
                    required 
                    value={newOrder.customer_address}
                    onChange={(e) => setNewOrder({...newOrder, customer_address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold">Order Items</h4>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                
                {newOrder.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-gray-500">Product</label>
                      <select 
                        required
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.selling_price})</option>
                        ))}
                      </select>
                    </div>
                    {isAdmin && (
                      <div className="w-24 space-y-1">
                        <label className="text-xs text-gray-500">Price</label>
                        <input 
                          type="number" 
                          required
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                    )}
                    <div className="w-24 space-y-1">
                      <label className="text-xs text-gray-500">Qty</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || newOrder.items.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
