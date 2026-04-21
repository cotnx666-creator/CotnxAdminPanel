import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Loader2,
  X,
  Trash2,
  Edit2,
  Receipt,
  Calendar
} from 'lucide-react';

const CATEGORIES = ['Product Purchase', 'Shipping', 'Packaging', 'Marketing', 'Miscellaneous'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({ category: '', start_date: '', end_date: '' });
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Product Purchase',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses', { params: filters });
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setIsModalOpen(false);
      setEditingExpense(null);
      resetForm();
      fetchExpenses();
    } catch (err) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'Product Purchase',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openNewModal = () => {
    resetForm();
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Management</h2>
          <p className="text-gray-500">Track and manage business expenses.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Receipt className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">{expenses.length} records</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            value={filters.start_date}
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            value={filters.end_date}
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No expenses found.</td></tr>
            ) : expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600">{expense.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{expense.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">${expense.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{expense.notes || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(expense)} className="p-2 text-gray-400 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingExpense(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingExpense(null); }}
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
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
