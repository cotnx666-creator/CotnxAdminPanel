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
  const [isDetailView, setIsDetailView] = useState(false);

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

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
    setIsDetailView(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`${isDetailView ? 'hidden md:block' : ''}`}>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage your customer database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className={`md:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-250px)] ${isDetailView ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No customers found.</div>
            ) : filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group ${
                  selectedCustomer?.id === customer.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{customer.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Phone size={12} /> {customer.phone}
                  </div>
                </div>
                <ChevronRight size={16} className={`text-gray-300 group-hover:text-gray-600 transition-colors shrink-0 ${
                  selectedCustomer?.id === customer.id ? 'text-blue-600' : ''
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Customer Details & History */}
        <div className={`md:col-span-2 space-y-6 ${isDetailView ? 'block' : 'hidden md:block'}`}>
          {selectedCustomer ? (
            <>
              <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative">
                <button 
                  onClick={() => setIsDetailView(false)}
                  className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold shrink-0">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="min-w-0 pr-8 md:pr-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{selectedCustomer.name}</h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Phone size={14} /> {selectedCustomer.phone}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 font-bold dark:text-white">
                  <History size={18} className="text-gray-400" />
                  Order History
                </div>
                
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {orders.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">No orders found.</td></tr>
                      ) : orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 font-medium dark:text-white">#{order.id}</td>
                          <td className="px-6 py-4 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold dark:text-white">${order.total_amount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              order.status === 'Delivered' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No orders found.</div>
                  ) : orders.map((order) => (
                    <div key={order.id} className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">#{order.id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600 dark:text-blue-400">${order.total_amount}</div>
                        <span className={`text-[10px] font-bold uppercase ${
                          order.status === 'Delivered' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-500 p-12 text-center">
              <Users size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a customer to view their details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
