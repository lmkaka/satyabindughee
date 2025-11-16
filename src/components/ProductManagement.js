import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const [formData, setFormData] = useState({
    name: 'Premium Pure Ghee',
    weight: '',
    price: '',
    original_price: '',
    image_base64: '',
    description: 'Made from pure cow milk using traditional methods',
    is_active: true
  });

  // ✅ Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Convert image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // ✅ Handle image upload and convert to Base64
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB for base64)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      // Convert to Base64
      const base64String = await convertToBase64(file);
      
      // Set form data and preview
      setFormData({ ...formData, image_base64: base64String });
      setPreviewImage(base64String);
      
      console.log('Image converted to Base64');
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle form submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.weight || !formData.price || !formData.original_price) {
      alert('Please fill all required fields');
      return;
    }

    // Validate price
    if (parseInt(formData.price) >= parseInt(formData.original_price)) {
      alert('Sale price must be less than original price');
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
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('✅ Product updated successfully!');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('✅ Product created successfully!');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('❌ Error saving product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error deleting product: ' + error.message);
    }
  };

  // ✅ Handle edit
  const handleEdit = (product) => {
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
    setShowModal(true);
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      name: 'Premium Pure Ghee',
      weight: '',
      price: '',
      original_price: '',
      image_base64: '',
      description: 'Made from pure cow milk using traditional methods',
      is_active: true
    });
    setPreviewImage('');
  };

  // ✅ Calculate discount percentage
  const calculateDiscount = (price, originalPrice) => {
    if (!price || !originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your ghee products inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
          <ImageIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first ghee product</p>
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-3 rounded-xl transition active:scale-95"
          >
            <Plus size={20} />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const discount = calculateDiscount(product.price, product.original_price);
            
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-amber-100">
                  {product.image_base64 ? (
                    <img
                      src={product.image_base64}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-20 h-20 text-orange-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black shadow-lg ${
                    product.is_active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {product.is_active ? '● ACTIVE' : '● INACTIVE'}
                  </div>

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                      {discount}% OFF
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 font-semibold mb-3">{product.weight}</p>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                    <span className="text-xs font-bold text-green-600">Save ₹{product.original_price - product.price}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-bold py-2.5 rounded-lg transition"
                    >
                      <Edit2 size={16} strokeWidth={2.5} />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 font-bold py-2.5 rounded-lg transition"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="text-xl font-black text-white">
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
                >
                  <X className="text-white" size={22} strokeWidth={3} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition text-sm font-semibold"
                    placeholder="e.g., Premium Pure Ghee"
                    required
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Weight/Size *</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition text-sm font-semibold"
                    placeholder="e.g., 250gms, 500gms, 1kg, 2kg, 5kg"
                    required
                  />
                </div>

                {/* Price & Original Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sale Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition text-sm font-bold"
                      placeholder="299"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Original Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition text-sm font-bold"
                      placeholder="349"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Discount Display */}
                {formData.price && formData.original_price && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase mb-1">Discount Calculated</p>
                        <p className="text-2xl font-black text-green-800">
                          {calculateDiscount(formData.price, formData.original_price)}% OFF
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-green-700 uppercase mb-1">Customer Saves</p>
                        <p className="text-2xl font-black text-green-800">
                          ₹{formData.original_price - formData.price}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {previewImage && (
                      <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage('');
                            setFormData({ ...formData, image_base64: '' });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center transition"
                        >
                          <X className="text-white" size={16} />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center w-full h-32 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition cursor-pointer group">
                      <Upload size={32} className="text-gray-400 group-hover:text-orange-500 mb-2" />
                      <span className="text-sm font-bold text-gray-600 group-hover:text-orange-600">
                        {uploading ? 'Uploading...' : previewImage ? 'Change Image' : 'Click to Upload Image'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none resize-none transition text-sm"
                    placeholder="Brief description about the product quality and features"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-6 h-6 text-orange-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-400 cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">
                    ✅ Product is Active (Visible to customers on website)
                  </label>
                </div>

                {/* Warning */}
                {!formData.is_active && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-bold text-yellow-800 mb-1">⚠️ Product Inactive</p>
                      <p className="text-xs text-yellow-700">This product will not be visible to customers until you activate it.</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-4 rounded-xl shadow-lg transition active:scale-95 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    <span>{editingProduct ? '💾 Update Product' : '➕ Create Product'}</span>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;
