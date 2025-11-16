import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Download, CheckCircle, AlertCircle, Package, Sparkles, ChevronDown, Plus, Minus, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderForm = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');

  const productVariants = [
    { id: 1, name: 'Premium Pure Ghee', weight: '250gms', price: 299, originalPrice: 349 },
    { id: 2, name: 'Premium Pure Ghee', weight: '500gms', price: 549, originalPrice: 649 },
    { id: 3, name: 'Premium Pure Ghee', weight: '1kg', price: 999, originalPrice: 1199 },
    { id: 4, name: 'Premium Pure Ghee', weight: '2kg', price: 1899, originalPrice: 2299 },
    { id: 5, name: 'Premium Pure Ghee', weight: '5kg', price: 4799, originalPrice: 5299 }
  ];

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Guest';
  const userPhone = user?.user_metadata?.phone || 'N/A';
  const userAddress = user?.user_metadata?.address || 'N/A';

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = (event) => {
        if (event.state?.modalOpen) {
          onClose();
          window.history.pushState({ modalOpen: false }, '');
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isOpen, onClose]);

  const addToCart = () => {
    if (!selectedVariant) {
      setError('Please select a product');
      return;
    }
    
    const variant = productVariants.find(v => v.id === parseInt(selectedVariant));
    if (!variant) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === variant.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...variant, quantity: 1 }];
      }
    });
    setSelectedVariant('');
    setError(null);
  };

  const updateQuantity = useCallback((variantId, newQuantity) => {
    if (newQuantity < 1) {
      setCart(prevCart => prevCart.filter(item => item.id !== variantId));
      return;
    }
    if (newQuantity > 10) return;
    setCart(prevCart => prevCart.map(item =>
      item.id === variantId ? { ...item, quantity: newQuantity } : item
    ));
  }, []);

  const removeFromCart = useCallback((variantId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== variantId));
  }, []);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const calculateSavings = useCallback(() => {
    return cart.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);
  }, [cart]);

  const downloadInvoice = useCallback(() => {
    if (!completedOrder) return;
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(255, 140, 0);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 15, 20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('SBGhee - Premium Pure Ghee', 15, 28);
      doc.text('Lalpur, Ranchi', 15, 34);
      doc.setFontSize(10);
      doc.text(`#${completedOrder.id.toString().slice(-8)}`, pageWidth - 15, 20, { align: 'right' });
      doc.text(new Date(completedOrder.order_date).toLocaleDateString('en-IN'), pageWidth - 15, 27, { align: 'right' });

      let yPos = 52;
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos, 85, 38, 'F');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER', 20, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(completedOrder.name, 20, yPos + 15);
      doc.text(completedOrder.phone, 20, yPos + 21);
      const addr = doc.splitTextToSize(completedOrder.address, 75);
      doc.text(addr, 20, yPos + 27);

      doc.setFillColor(254, 243, 199);
      doc.rect(105, yPos, 90, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('STATUS: PENDING', 110, yPos + 12);

      yPos = 105;
      doc.setFillColor(255, 140, 0);
      doc.rect(15, yPos, pageWidth - 30, 9, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('PRODUCT', 20, yPos + 6);
      doc.text('QTY', 110, yPos + 6);
      doc.text('PRICE', 130, yPos + 6);
      doc.text('TOTAL', 165, yPos + 6);

      yPos += 12;
      doc.setTextColor(0, 0, 0);
      completedOrder.items.forEach((item, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(15, yPos - 3, pageWidth - 30, 9, 'F');
        }
        doc.text(`${item.weight}`, 20, yPos + 3);
        doc.text(String(item.quantity), 115, yPos + 3);
        doc.text(`₹${item.price}`, 130, yPos + 3);
        doc.text(`₹${item.price * item.quantity}`, 165, yPos + 3);
        yPos += 9;
      });

      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 140, 0);
      doc.text('TOTAL:', 120, yPos);
      doc.text(`₹${completedOrder.total}`, 170, yPos);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you!', pageWidth / 2, 270, { align: 'center' });
      
      doc.save(`Invoice_${completedOrder.id.toString().slice(-6)}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
    }
  }, [completedOrder]);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Please add at least one product');
      return;
    }

    if (!user || userName === 'Guest' || userPhone === 'N/A' || userAddress === 'N/A') {
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
        name: 'Premium Pure Ghee',
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

      if (supabaseError) throw new Error(`Database error: ${supabaseError.message}`);

      const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      existingOrders.push({ id: data[0].id, ...order, created_at: new Date().toISOString() });
      localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));

      setCompletedOrder({
        id: data[0].id,
        name: userName,
        phone: userPhone,
        address: userAddress,
        items: cart,
        total: calculateTotal(),
        order_date: new Date().toISOString()
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      const fallbackOrder = { id: Date.now(), ...order, created_at: new Date().toISOString() };
      const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      existingOrders.push(fallbackOrder);
      localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));
      
      setCompletedOrder({
        id: fallbackOrder.id,
        name: userName,
        phone: userPhone,
        address: userAddress,
        items: cart,
        total: calculateTotal(),
        order_date: new Date().toISOString()
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleClose = useCallback(() => {
    setCart([]);
    setIsSuccess(false);
    setCompletedOrder(null);
    setError(null);
    setSelectedVariant('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: '92vh' }}
        >
          {!isSuccess ? (
            <>
              {/* HEADER */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <ShoppingCart className="text-white" size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Place Order</h3>
                    {cart.length > 0 && (
                      <p className="text-[10px] text-white/90 font-semibold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} items • ₹{calculateTotal()}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="w-9 h-9 bg-white rounded-xl hover:bg-gray-100 active:bg-gray-200 transition flex items-center justify-center"
                >
                  <X className="text-orange-600" size={20} strokeWidth={3} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* User Info */}
                {user && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Package className="text-white" size={14} />
                      </div>
                      <h4 className="text-xs font-black text-blue-900">Delivery Details</h4>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <p className="text-blue-900 font-bold">{userName}</p>
                      <p className="text-blue-700">+91 {userPhone}</p>
                      <p className="text-blue-700 line-clamp-2">{userAddress}</p>
                    </div>
                  </div>
                )}

                {/* Product Selector */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="text-orange-500" size={13} />
                    Add Products
                  </h4>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-10 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-500 outline-none text-xs font-semibold text-gray-900"
                      >
                        <option value="">Select Size...</option>
                        {productVariants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.weight} - ₹{variant.price} (Save ₹{variant.originalPrice - variant.price})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    
                    <button
                      onClick={addToCart}
                      disabled={!selectedVariant}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold rounded-xl transition flex items-center gap-1.5 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} strokeWidth={3} />
                      <span className="text-xs">Add</span>
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-2.5 flex items-start gap-2"
                  >
                    <AlertCircle className="text-red-600 flex-shrink-0" size={14} />
                    <p className="text-red-700 text-[10px] font-semibold">{error}</p>
                  </motion.div>
                )}

                {/* Cart */}
                {cart.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-gray-900 mb-2 flex items-center gap-1.5">
                      <ShoppingCart className="text-orange-500" size={13} />
                      Your Cart ({cart.length})
                    </h4>
                    
                    <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                      <AnimatePresence>
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-lg p-2.5 flex items-center gap-2 border border-gray-200"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="text-orange-600" size={16} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-gray-900 truncate">{item.weight}</p>
                              <p className="text-[9px] text-gray-500">₹{item.price} each</p>
                            </div>

                            <div className="flex items-center gap-1 bg-orange-50 rounded-lg px-1 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-orange-600 font-black hover:bg-orange-100 active:scale-95 transition"
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              
                              <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-orange-600 font-black hover:bg-orange-100 active:scale-95 transition"
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-xs text-gray-900">₹{item.price * item.quantity}</p>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-600 active:scale-95 transition"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {/* Total Card */}
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white/80 text-[9px] font-bold mb-0.5">Order Total</p>
                            <p className="text-white text-lg font-black">₹{calculateTotal()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/80 text-[9px] font-bold mb-0.5">You Save</p>
                            <p className="text-white text-sm font-black">₹{calculateSavings()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-3.5 rounded-xl shadow-lg transition text-sm disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={18} strokeWidth={2.5} />
                      {cart.length > 0 ? `Confirm Order • ₹${calculateTotal()}` : 'Add Items to Continue'}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-xl"
              >
                <CheckCircle className="text-white" size={40} strokeWidth={2.5} />
              </motion.div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h3>
              <p className="text-gray-600 mb-5 text-sm">We'll contact you soon to confirm.</p>
              
              <div className="w-full bg-green-50 rounded-2xl p-4 border-2 border-green-200 mb-5">
                <p className="text-xs font-bold text-gray-700 mb-3">Order Summary</p>
                <div className="space-y-2 text-left mb-3">
                  {completedOrder?.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-700">{item.weight} × {item.quantity}</span>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                  <span className="font-black text-gray-800">Total Amount</span>
                  <span className="text-2xl font-black text-green-700">₹{completedOrder?.total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={downloadInvoice}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition active:scale-95"
                >
                  <Download size={16} strokeWidth={2.5} />
                  Download Invoice
                </button>
                
                <button
                  onClick={handleClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition active:scale-95"
                >
                  <X size={16} strokeWidth={2.5} />
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
