import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  History,
  Loader2,
  ChevronRight
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const fetchCustomerOrders = async (id) => {
    try {
      const { data } = await api.get(`/customers/${id}/orders`);
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <p className="text-gray-500">View and manage your customer database and their history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No customers found.</div>
            ) : filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => { setSelectedCustomer(customer); fetchCustomerOrders(customer.id); }}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                  selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900">{customer.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Phone size={12} /> {customer.phone}
                  </div>
                </div>
                <ChevronRight size={16} className={`text-gray-300 group-hover:text-gray-600 transition-colors ${
                  selectedCustomer?.id === customer.id ? 'text-blue-600' : ''
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Customer Details & History */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer ? (
            <>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Phone size={14} /> {selectedCustomer.phone}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {selectedCustomer.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 font-bold">
                  <History size={18} className="text-gray-400" />
                  Order History
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">No orders found for this customer.</td></tr>
                    ) : orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                        <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold">${order.total_amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-full bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 p-12 text-center">
              <Users size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a customer to view their details and order history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
