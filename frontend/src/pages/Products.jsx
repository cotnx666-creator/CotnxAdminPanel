import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Share2,
  X,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buying_price: '',
    selling_price: '',
    category: '',
    subcategory: '',
    stock: '',
    sku: '',
    discount: '0',
    sizes: [],
    colors: []
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', {
        params: { search, category, page, limit: 10 }
      });
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, [search, category, page]);

  const selectedCategoryData = categories.find(c => c.name === formData.category);
  const subcategories = selectedCategoryData?.subcategories || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    selectedImages.forEach(image => {
      data.append('images', image);
    });

    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id}`, formData);
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchProducts();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      buying_price: '',
      selling_price: '',
      category: 'Men',
      subcategory: '',
      stock: '',
      sku: '',
      discount: '0',
      sizes: [],
      colors: []
    });
    setSelectedImages([]);
    setCurrentProduct(null);
  };

  const handleShare = (product) => {
    const message = `Check out this ${product.name}!\nPrice: $${product.selling_price}\nLink: ${window.location.origin}/product/${product.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500">Manage your inventory and product listings.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Product
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">SKU</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No products found.</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {product.images?.[0] ? (
                        <img src={`http://localhost:5000${product.images[0]}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">${product.selling_price}</div>
                  <div className="text-xs text-green-600 font-medium">Profit: ${product.profit}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.sku}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleShare(product)} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Share on WhatsApp">
                      <Share2 size={18} />
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => { setCurrentProduct(product); setFormData(product); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg border transition-colors ${
                page === i + 1 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">SKU Code</label>
                  <input type="text" name="sku" required value={formData.sku} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subcategory</label>
                  <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Subcategory</option>
                    {subcategories.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Buying Price ($)</label>
                  <input type="number" name="buying_price" required value={formData.buying_price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Selling Price ($)</label>
                  <input type="number" name="selling_price" required value={formData.selling_price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input type="number" name="stock" required value={formData.stock} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Discount (%)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sizes Available</label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.sizes.includes(size)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Colors Available</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.colors.includes(color)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {!currentProduct && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Product Images (up to 5)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg outline-none hover:border-blue-500 transition-colors"
                  />
                  <div className="flex gap-2 mt-2">
                    {selectedImages.map((img, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 relative overflow-hidden">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {currentProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
