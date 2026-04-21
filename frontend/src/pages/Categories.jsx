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
    if (!window.confirm('Delete this category and all its subcategories?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <p className="text-gray-500">Manage your product categories and subcategories.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Plus className="text-blue-600" size={20} />
            Add New Category
          </h3>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Men, Women, Kids"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Add
            </button>
          </form>
        </div>

        {/* Add Subcategory Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Plus className="text-blue-600" size={20} />
            Add New Subcategory
          </h3>
          <form onSubmit={handleAddSubcategory} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={newSubcategory.category_id}
              onChange={(e) => setNewSubcategory({...newSubcategory, category_id: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. T-shirt, Kurti"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
              />
              <button
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Add
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 font-bold">
          <FolderTree size={18} className="text-gray-400" />
          Category Structure
        </div>
        <div className="divide-y divide-gray-50">
          {loading && categories.length === 0 ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No categories found. Start by adding one above.</div>
          ) : categories.map((cat) => (
            <div key={cat.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                    {cat.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-500">{cat.subcategories.length} subcategories</div>
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
                <div className="mt-4 ml-12 flex flex-wrap gap-2">
                  {cat.subcategories.map((sub, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full flex items-center gap-1"
                    >
                      <Tag size={12} className="text-gray-400" />
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
