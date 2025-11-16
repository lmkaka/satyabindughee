import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Download, CheckCircle, AlertCircle, Package, LogIn, Plus, Minus, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';
import GoogleAuth from './GoogleAuth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderForm = ({ isOpen, onClose, product }) => {
  const { user } = useAuth();
  
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
  const userPhone = user?.user_metadata?.phone || '';
  const userAddress = user?.user_metadata?.address || '';

  // ✅ Fetch all products from Supabase
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Decode Base64 images
      const productsWithImages = (data || []).map(p => ({
        ...p,
        image: p.image_base64?.startsWith('data:image') 
          ? p.image_base64 
          : p.image_base64 
            ? `data:image/jpeg;base64,${p.image_base64}`
            : 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png'
      }));
      
      setAllProducts(productsWithImages);
      
      // If a product was passed, add it to cart
      if (product) {
        const matchedProduct = productsWithImages.find(p => 
          p.id === product.id || p.weight === product.weight
        );
        if (matchedProduct) {
          setCart([{ ...matchedProduct, quantity: 1 }]);
        }
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check login
  useEffect(() => {
    if (isOpen && !user) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [isOpen, user]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }
    setCart(prevCart => prevCart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSavings = () => {
    return cart.reduce((total, item) => {
      const original = item.original_price || item.price;
      return total + ((original - item.price) * item.quantity);
    }, 0);
  };

  const downloadInvoice = useCallback(() => {
    if (!completedOrder) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Invoice', 20, 20);
      doc.setFontSize(12);
      doc.text(`Order ID: ${completedOrder.id}`, 20, 30);
      doc.text(`Name: ${completedOrder.name}`, 20, 40);
      doc.text(`Phone: ${completedOrder.phone}`, 20, 50);
      doc.text(`Total: ₹${completedOrder.total}`, 20, 60);
      doc.save(`Invoice_${completedOrder.id}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
    }
  }, [completedOrder]);

  const handleSubmit = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (cart.length === 0) {
      setError('Please add at least one product');
      return;
    }

    if (!userName || !userPhone || !userAddress) {
      setError('Please complete your profile first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const order = {
      name: userName,
      phone: userPhone,
      address: userAddress,
      product: {
        name: cart.map(item => `${item.name} (${item.weight})`).join(', '),
        weight: cart.map(item => `${item.weight}×${item.quantity}`).join(', '),
        price: Math.round(calculateTotal() / cart.reduce((sum, item) => sum + item.quantity, 0))
      },
      quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: calculateTotal(),
      status: 'pending',
      order_date: new Date().toISOString()
    };

    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .insert([order])
        .select();

      if (supabaseError) throw supabaseError;

      setCompletedOrder({ id: data[0].id, ...order, items: cart });
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      const fallbackOrder = { id: Date.now(), ...order, items: cart };
      setCompletedOrder(fallbackOrder);
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleClose = useCallback(() => {
    setCart([]);
    setIsSuccess(false);
    setCompletedOrder(null);
    setError(null);
    setShowAuth(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        >
          {showAuth && !user ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="text-amber-600" size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">Please login to place your order</p>
              
              <GoogleAuth 
                isOpen={true} 
                onClose={() => {
                  setShowAuth(false);
                  handleClose();
                }} 
              />
              
              <button
                onClick={handleClose}
                className="mt-4 text-gray-500 hover:text-gray-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : !isSuccess ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-white" size={20} />
                  <div>
                    <h3 className="text-sm font-black text-white">Order Form</h3>
                    {cart.length > 0 && (
                      <p className="text-xs text-white/90">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} items • ₹{calculateTotal()}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 bg-white/90 rounded-lg hover:bg-white transition flex items-center justify-center">
                  <X className="text-orange-600" size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Available Products */}
                <div>
                  <h4 className="text-sm font-black text-gray-900 mb-3">Available Products</h4>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Loading products...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {allProducts.map((prod) => (
                        <motion.div
                          key={prod.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white border-2 border-gray-200 rounded-xl p-3 cursor-pointer hover:border-orange-400 transition"
                          onClick={() => addToCart(prod)}
                        >
                          <img 
                            src={prod.image} 
                            alt={prod.name}
                            className="w-full h-24 object-contain rounded-lg bg-gray-50 mb-2"
                          />
                          <h5 className="font-bold text-xs text-gray-900 mb-1 truncate">{prod.name}</h5>
                          <p className="text-sm font-black text-orange-600 mb-1">{prod.weight}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">₹{prod.price}</span>
                            {prod.original_price > prod.price && (
                              <span className="text-xs text-gray-400 line-through">₹{prod.original_price}</span>
                            )}
                          </div>
                          <button className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition">
                            <Plus size={14} strokeWidth={3} />
                            Add
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-3">Your Cart ({cart.length})</h4>
                    
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-contain rounded-lg bg-white"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-gray-900 truncate">{item.name}</h5>
                            <p className="text-xs text-gray-600">{item.weight}</p>
                            <p className="text-sm font-black text-gray-900">₹{item.price}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 font-black hover:bg-orange-50 transition"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            
                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 font-black hover:bg-orange-50 transition"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>

                          <div className="text-right min-w-[50px]">
                            <p className="font-black text-sm">₹{item.price * item.quantity}</p>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-600 transition"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3 mt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white/80 text-xs mb-1">Total Amount</p>
                          <p className="text-white text-2xl font-black">₹{calculateTotal()}</p>
                        </div>
                        {calculateSavings() > 0 && (
                          <div className="text-right">
                            <p className="text-white/80 text-xs mb-1">You Saved</p>
                            <p className="text-white text-lg font-black">₹{calculateSavings()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* User Info */}
                {user && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="text-blue-600" size={16} />
                      <h4 className="text-xs font-black text-blue-900">Delivery To</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="text-blue-900 font-bold">{userName}</p>
                      <p className="text-blue-700">+91 {userPhone}</p>
                      <p className="text-blue-700">{userAddress}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                    <p className="text-red-700 text-xs font-semibold">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-3 rounded-xl shadow-lg transition disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={20} strokeWidth={2.5} />
                      {cart.length > 0 ? `Place Order • ₹${calculateTotal()}` : 'Add Items First'}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
              >
                <CheckCircle className="text-white" size={40} strokeWidth={2.5} />
              </motion.div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h3>
              <p className="text-gray-600 mb-6">We'll confirm shortly.</p>
              
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 mb-6 text-left max-h-60 overflow-y-auto">
                {completedOrder?.items.map((item, i) => (
                  <div key={i} className="flex justify-between mb-2 text-sm">
                    <span>{item.weight} × {item.quantity}</span>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t-2 border-green-300 pt-2 flex justify-between mt-2">
                  <span className="font-black">Total</span>
                  <span className="text-xl font-black text-green-700">₹{completedOrder?.total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadInvoice}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download size={18} strokeWidth={2.5} />
                  Invoice
                </button>
                
                <button
                  onClick={handleClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <X size={18} strokeWidth={2.5} />
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderForm;
