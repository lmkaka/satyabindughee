import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Phone, Mail, MapPin, Eye, X, Calendar,
  Package, Plus, Edit2, Trash2, Upload, AlertCircle, Search
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Products = () => {
  // States
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Product Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [formData, setFormData] = useState({
    name: 'Premium Pure Ghee',
    weight: '',
    price: '',
    original_price: '',
    image_base64: '',
    description: 'Made from pure cow milk',
    is_active: true
  });

  // Load Data
  useEffect(() => {
    loadUsers();
    loadProducts();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase Error:', error);
        if (error.code === 'PGRST301' || error.message.includes('policy')) {
          alert('⚠️ Database permission issue. Please check Row Level Security policies.');
        }
        throw error;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} users from database`);
      setUsers(data || []);
      
      if (!data || data.length === 0) {
        console.warn('No users found in database. Check if data exists.');
      }
      
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert Image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const base64String = await convertToBase64(file);
      setFormData({ ...formData, image_base64: base64String });
      setPreviewImage(base64String);
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  // Handle Product Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!formData.weight || !formData.price || !formData.original_price) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        weight: formData.weight,
        price: parseInt(formData.price),
        original_price: parseInt(formData.original_price),
        image_base64: formData.image_base64 || null,
        description: formData.description,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('✅ Product updated!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('✅ Product created!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Deleted!');
      loadProducts();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Edit Product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      weight: product.weight,
      price: product.price,
      original_price: product.original_price,
      image_base64: product.image_base64 || '',
      description: product.description || '',
      is_active: product.is_active
    });
    setPreviewImage(product.image_base64 || '');
    setShowProductModal(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: 'Premium Pure Ghee',
      weight: '',
      price: '',
      original_price: '',
      image_base64: '',
      description: 'Made from pure cow milk',
      is_active: true
    });
    setPreviewImage('');
  };

  // Calculate Discount
  const calculateDiscount = (price, originalPrice) => {
    if (!price || !originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Filter Users
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2">Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Users & Products</p>
        </div>

        {/* Tab Switcher - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-1 mb-4 sm:mb-8 flex gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2.5 sm:py-4 px-2 sm:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all touch-manipulation ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <Users size={16} className="inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Users </span>({users.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 sm:py-4 px-2 sm:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all touch-manipulation ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <Package size={16} className="inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Products </span>({products.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-3 sm:space-y-6">
            {/* Users Header - Mobile Optimized */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">Registered Users</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                    Total: <span className="font-bold text-purple-600">{users.length}</span> users
                  </p>
                </div>
                <button
                  onClick={() => setShowUsersModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition text-xs sm:text-sm touch-manipulation"
                >
                  <Eye size={16} />
                  View All
                </button>
              </div>

              {/* Search - Mobile Optimized */}
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm"
                />
              </div>
            </div>

            {/* Users Grid - Mobile Optimized */}
            {loading ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-gray-600 font-semibold">Loading...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <Users className="text-gray-300 mx-auto mb-3 sm:mb-4" size={48} />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">No users found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                {filteredUsers.slice(0, 12).map((user) => (
                  <div key={user.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition active:scale-95 touch-manipulation">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-white" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs sm:text-sm truncate">{user.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">{user.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs mb-2 sm:mb-3">
                      <p className="text-gray-600 truncate">📧 {user.email || 'N/A'}</p>
                      <p className="text-gray-600 line-clamp-2">📍 {user.address || 'No address'}</p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="w-full bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs transition touch-manipulation"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab - Mobile Optimized */}
        {activeTab === 'products' && (
          <div className="space-y-3 sm:space-y-6">
            {/* Products Header - Mobile Optimized */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">Products</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Manage ghee products</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                  setShowProductModal(true);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition text-xs sm:text-sm touch-manipulation"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>

            {/* Products Grid - Mobile Optimized */}
            {loading ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-gray-600 font-semibold">Loading...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <Package className="text-gray-300 mx-auto mb-3 sm:mb-4" size={48} />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">No products yet</h3>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="mt-3 sm:mt-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold inline-flex items-center gap-2 text-xs sm:text-sm touch-manipulation"
                >
                  <Plus size={18} />
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product) => {
                  const discount = calculateDiscount(product.price, product.original_price);
                  return (
                    <div key={product.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition active:scale-95 touch-manipulation">
                      <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-amber-100">
                        {product.image_base64 ? (
                          <img src={product.image_base64} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-orange-300" />
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-black text-sm sm:text-base mb-0.5 sm:mb-1 truncate">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{product.weight}</p>
                        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          <span className="text-lg sm:text-2xl font-black">₹{product.price}</span>
                          <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.original_price}</span>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition touch-manipulation"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition touch-manipulation"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* User Details Modal - Mobile Optimized */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-2xl font-black text-white">User Details</h3>
                    <button onClick={() => setSelectedUser(null)} className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center touch-manipulation">
                      <X className="text-white" size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center border-2 sm:border-4 border-white flex-shrink-0">
                      <User className="text-white" size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-2xl font-black text-white">{selectedUser.name}</h4>
                      <p className="text-white/90 text-xs sm:text-sm">{selectedUser.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase mb-1">Email</p>
                    <p className="font-bold text-sm sm:text-base break-all">{selectedUser.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase mb-1">Address</p>
                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                      <p className="text-xs sm:text-sm">{selectedUser.address || 'No address'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm touch-manipulation"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Modal - Mobile Optimized */}
        <AnimatePresence>
          {showProductModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl flex justify-between items-center z-10">
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      resetForm();
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center touch-manipulation"
                  >
                    <X className="text-white" size={18} />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">Weight *</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                      placeholder="e.g., 250gms, 1kg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">Sale Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">Original Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  {formData.price && formData.original_price && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                      <p className="text-xs sm:text-sm font-bold text-green-800">
                        Discount: {calculateDiscount(formData.price, formData.original_price)}% OFF
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">Product Image</label>
                    {previewImage && (
                      <div className="relative w-full h-40 sm:h-48 bg-gray-100 rounded-lg sm:rounded-xl mb-2 sm:mb-3 overflow-hidden">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage('');
                            setFormData({ ...formData, image_base64: '' });
                          }}
                          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center touch-manipulation"
                        >
                          <X className="text-white" size={14} />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 touch-manipulation">
                      <Upload size={28} className="text-gray-400 mb-1.5 sm:mb-2" />
                      <span className="text-xs sm:text-sm font-bold text-gray-600">
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-400 outline-none resize-none text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <label htmlFor="is_active" className="text-xs sm:text-sm font-bold">Product is Active</label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 text-white font-black py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg transition disabled:opacity-50 text-sm touch-manipulation"
                  >
                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* All Users Modal - Mobile Optimized */}
        <AnimatePresence>
          {showUsersModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 sm:p-5 flex justify-between items-center">
                  <h3 className="text-lg sm:text-2xl font-black text-white">All Users ({users.length})</h3>
                  <button onClick={() => setShowUsersModal(false)} className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center touch-manipulation">
                    <X className="text-white" size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-purple-50 active:bg-purple-100 transition touch-manipulation">
                        <div className="flex items-start gap-2 sm:gap-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="text-white" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm sm:text-lg">{user.name}</h4>
                            <div className="grid sm:grid-cols-2 gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs sm:text-sm">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Phone size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.email || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Products;
