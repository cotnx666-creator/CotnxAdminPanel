import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  FolderTree, 
  Tag, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState({ category_id: '', name: '' });
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      await api.post('/categories', { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubcategory.name.trim() || !newSubcategory.category_id) return;
    setLoading(true);
    try {
      await api.post('/categories/subcategory', newSubcategory);
      setNewSubcategory({ category_id: '', name: '' });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product hierarchy.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Add Category Form */}
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-md font-bold flex items-center gap-2 dark:text-white uppercase tracking-wider text-xs">
            <Plus className="text-blue-600" size={18} />
            New Category
          </h3>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Men"
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            </button>
          </form>
        </div>

        {/* Add Subcategory Form */}
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-md font-bold flex items-center gap-2 dark:text-white uppercase tracking-wider text-xs">
            <Plus className="text-blue-600" size={18} />
            New Subcategory
          </h3>
          <form onSubmit={handleAddSubcategory} className="flex flex-col sm:flex-row gap-2">
            <select
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
              value={newSubcategory.category_id}
              onChange={(e) => setNewSubcategory({...newSubcategory, category_id: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="e.g. T-shirt"
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
              />
              <button
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 font-bold dark:text-white text-sm uppercase tracking-wider">
          <FolderTree size={18} className="text-gray-400" />
          Structure
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {loading && categories.length === 0 ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No categories found.</div>
          ) : categories.map((cat) => (
            <div key={cat.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold">
                    {cat.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{cat.name}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{cat.subcategories.length} Items</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {cat.subcategories.length > 0 && (
                <div className="mt-3 ml-13 flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wide border border-gray-200 dark:border-gray-700"
                    >
                      <Tag size={10} className="text-gray-400" />
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
