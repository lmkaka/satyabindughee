import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, User, Phone, Mail, MapPin, Eye, X, Calendar,
  Package, Plus, Edit2, Trash2, Upload, AlertCircle, Search,
  ShoppingBag, Zap, TrendingUp, CheckCircle, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Products = () => {
  const [activeTab, setActiveTab] = useState('products'); // Default to products
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [initialLoad, setInitialLoad] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
    is_active: true,
  });

  // ✅ Instant parallel loading - No sequential blocking
  useEffect(() => {
    const loadData = async () => {
      // Load both simultaneously without blocking
      Promise.all([loadUsers(), loadProducts()]).finally(() => {
        setInitialLoad(false);
      });
    };
    loadData();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Load users error:', error);
      setUsers([]);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Load products error:', error);
      setProducts([]);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ File size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const base64String = await convertToBase64(file);
      setFormData((prev) => ({ ...prev, image_base64: base64String }));
      setPreviewImage(base64String);
    } catch (error) {
      alert('❌ Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weight || !formData.price || !formData.original_price) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    setActionLoading(true);

    const productData = {
      name: formData.name,
      weight: formData.weight,
      price: parseInt(formData.price),
      original_price: parseInt(formData.original_price),
      image_base64: formData.image_base64 || null,
      description: formData.description,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productData } : p))
        );

        alert('✅ Product updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select();

        if (error) throw error;

        setProducts((prev) => [...data, ...prev]);
        alert('✅ Product created successfully!');
      }

      closeAndReset();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('🗑️ Delete this product permanently?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert('✅ Product deleted!');
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      weight: product.weight,
      price: product.price,
      original_price: product.original_price,
      image_base64: product.image_base64 || '',
      description: product.description || '',
      is_active: product.is_active,
    });
    setPreviewImage(product.image_base64 || '');
    setShowProductModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: 'Premium Pure Ghee',
      weight: '',
      price: '',
      original_price: '',
      image_base64: '',
      description: 'Made from pure cow milk',
      is_active: true,
    });
    setPreviewImage('');
    setEditingProduct(null);
  };

  const closeAndReset = () => {
    setShowProductModal(false);
    resetForm();
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!price || !originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Manage everything</p>
            </div>
          </div>
        </div>

        {/* Tabs - Mobile First */}
        <div className="bg-white rounded-2xl shadow-xl p-1 mb-4 sm:mb-6 flex gap-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 px-3 sm:px-6 rounded-xl font-bold text-xs sm:text-sm transition-all touch-manipulation ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
            type="button"
          >
            <Package size={16} className="inline mr-1.5" strokeWidth={2.5} />
            <span className="hidden xs:inline">Products </span>
            <span className="inline xs:hidden">({products.length})</span>
            <span className="hidden xs:inline">({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-3 sm:px-6 rounded-xl font-bold text-xs sm:text-sm transition-all touch-manipulation ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
            type="button"
          >
            <Users size={16} className="inline mr-1.5" strokeWidth={2.5} />
            <span className="hidden xs:inline">Users </span>
            <span className="inline xs:hidden">({users.length})</span>
            <span className="hidden xs:inline">({users.length})</span>
          </button>
        </div>

        {/* ✅ Products Tab - Instant Display */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Package size={20} className="text-orange-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900">Products</h2>
                    <p className="text-xs text-gray-600">
                      <TrendingUp size={12} className="inline mr-1" />
                      {products.length} items total
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setShowProductModal(true);
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition text-sm touch-manipulation"
                  type="button"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Grid - Skeleton on initial load only */}
            {initialLoad ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Package className="text-orange-500" size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products yet</h3>
                <p className="text-sm text-gray-600 mb-4">Create your first product to get started</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowProductModal(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transition touch-manipulation"
                  type="button"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Create First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => {
                  const discount = calculateDiscount(product.price, product.original_price);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all active:scale-95 touch-manipulation"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-amber-100">
                        {product.image_base64 ? (
                          <img src={product.image_base64} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-orange-300" strokeWidth={1.5} />
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Zap size={12} />
                            {discount}% OFF
                          </div>
                        )}
                        {product.is_active && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                            <CheckCircle size={12} className="inline mr-1" />
                            Active
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-black text-sm sm:text-base mb-1 truncate">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold">{product.weight}</p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl sm:text-2xl font-black text-gray-900">₹{product.price}</span>
                          {product.original_price > product.price && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.original_price}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            disabled={actionLoading}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition touch-manipulation disabled:opacity-50"
                            type="button"
                          >
                            <Edit2 size={14} strokeWidth={2.5} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition touch-manipulation disabled:opacity-50"
                            type="button"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-purple-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900">Users</h2>
                    <p className="text-xs text-gray-600">
                      <TrendingUp size={12} className="inline mr-1" />
                      {users.length} registered
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUsersModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition text-sm touch-manipulation"
                  type="button"
                >
                  <Eye size={18} strokeWidth={2.5} />
                  View All
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, email..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm font-medium"
                />
              </div>
            </div>

            {/* Users Grid */}
            {initialLoad ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Users className="text-purple-500" size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
                <p className="text-sm text-gray-600">Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredUsers.slice(0, 12).map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all active:scale-95 touch-manipulation"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="text-white" size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 font-semibold">{user.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs mb-3">
                      <p className="text-gray-600 truncate flex items-center gap-1.5">
                        <Mail size={12} className="flex-shrink-0" />
                        {user.email || 'N/A'}
                      </p>
                      <p className="text-gray-600 line-clamp-2 flex items-start gap-1.5">
                        <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                        {user.address || 'No address'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="w-full bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 py-2 rounded-xl font-bold text-xs transition touch-manipulation"
                      type="button"
                    >
                      View Details
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 rounded-t-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-white">User Details</h3>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition touch-manipulation"
                      type="button"
                    >
                      <X className="text-white" size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-3 border-white flex-shrink-0">
                      <User className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white">{selectedUser.name}</h4>
                      <p className="text-white/90 text-sm font-semibold">{selectedUser.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Email</p>
                    <p className="font-bold text-sm break-all">{selectedUser.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Address</p>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm">{selectedUser.address || 'No address'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 py-3 rounded-xl font-bold text-sm transition touch-manipulation"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Modal */}
        <AnimatePresence>
          {showProductModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-5 rounded-t-2xl flex justify-between items-center z-10">
                  <h3 className="text-xl font-black text-white">
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <button
                    onClick={closeAndReset}
                    className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition touch-manipulation"
                    type="button"
                  >
                    <X className="text-white" size={20} />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Weight *</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium"
                      placeholder="e.g., 250gms, 500gms, 1kg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Sale Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Original Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  {formData.price && formData.original_price && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 flex items-center gap-2">
                      <Zap size={18} className="text-green-600" />
                      <p className="text-sm font-bold text-green-800">
                        Discount: {calculateDiscount(formData.price, formData.original_price)}% OFF
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold mb-2">Product Image</label>
                    {previewImage && (
                      <div className="relative w-full h-48 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage('');
                            setFormData((prev) => ({ ...prev, image_base64: '' }));
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center touch-manipulation"
                        >
                          <X className="text-white" size={16} />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation">
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <span className="text-sm font-bold text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">Max 5MB</span>
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
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none resize-none text-sm font-medium"
                      placeholder="Brief product description..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-orange-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-bold">Product is Active</label>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || uploading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-black py-4 rounded-xl shadow-lg transition disabled:opacity-50 text-sm touch-manipulation"
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingProduct ? 'Updating...' : 'Saving...'}
                      </span>
                    ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* All Users Modal */}
        <AnimatePresence>
          {showUsersModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 flex justify-between items-center">
                  <h3 className="text-xl font-black text-white">All Users ({users.length})</h3>
                  <button
                    onClick={() => setShowUsersModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition touch-manipulation"
                    type="button"
                  >
                    <X className="text-white" size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-purple-50 active:bg-purple-100 transition touch-manipulation"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="text-white" size={24} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base mb-2">{user.name}</h4>
                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate font-semibold">{user.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400 flex-shrink-0" />
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
