import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Download, CheckCircle, AlertCircle, Package, Sparkles, ChevronDown, Plus, Minus, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderForm = ({ isOpen, onClose, product }) => { // ✅ Accept product prop
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

  // ✅ Auto-add product when modal opens with product data
  useEffect(() => {
    if (isOpen && product) {
      console.log('Auto-adding product:', product);
      
      // Find matching variant
      const variant = productVariants.find(v => 
        v.weight === product.weight || 
        v.id === product.id ||
        v.name === product.name
      );
      
      if (variant) {
        setCart([{ ...variant, quantity: 1 }]);
        setError(null);
        console.log('Product added to cart:', variant);
      } else {
        console.log('Product not found in variants');
      }
    }
  }, [isOpen, product]);

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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          {!isSuccess ? (
            <>
              <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-3 py-2.5 rounded-t-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <ShoppingCart className="text-white" size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white leading-tight">Quick Order</h3>
                    {cart.length > 0 && (
                      <p className="text-[9px] text-white/90 font-semibold leading-tight">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} items • ₹{calculateTotal()}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="w-7 h-7 bg-white/90 rounded-lg hover:bg-white active:scale-95 transition flex items-center justify-center"
                >
                  <X className="text-orange-600" size={16} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {user && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                        <Package className="text-white" size={11} />
                      </div>
                      <h4 className="text-[10px] font-black text-blue-900">Delivery</h4>
                    </div>
                    <div className="space-y-0.5 text-[9px]">
                      <p className="text-blue-900 font-bold truncate">{userName}</p>
                      <p className="text-blue-700 truncate">+91 {userPhone}</p>
                      <p className="text-blue-700 line-clamp-1">{userAddress}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-black text-gray-900 mb-1.5 flex items-center gap-1">
                    <Sparkles className="text-orange-500" size={11} />
                    Add Product
                  </h4>
                  
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <select
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                        className="w-full appearance-none px-2.5 py-2 pr-8 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-[11px] font-bold text-gray-900"
                      >
                        <option value="">Select...</option>
                        {productVariants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.weight} - ₹{variant.price} (-₹{variant.originalPrice - variant.price})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                    
                    <button
                      onClick={addToCart}
                      disabled={!selectedVariant}
                      className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-lg transition flex items-center gap-1 disabled:cursor-not-allowed active:scale-95 shadow-md"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span className="text-[10px]">Add</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-1.5"
                  >
                    <AlertCircle className="text-red-600 flex-shrink-0" size={12} />
                    <p className="text-red-700 text-[9px] font-semibold">{error}</p>
                  </motion.div>
                )}

                {cart.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-gray-900 mb-1.5 flex items-center gap-1">
                      <ShoppingCart className="text-orange-500" size={11} />
                      Cart ({cart.length})
                    </h4>
                    
                    <div className="bg-gray-50 rounded-lg p-1.5 space-y-1.5">
                      <AnimatePresence>
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-md p-2 flex items-center gap-1.5 border border-gray-200"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                              <Package className="text-orange-600" size={13} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[10px] text-gray-900 truncate">{item.weight}</p>
                              <p className="text-[8px] text-gray-500">₹{item.price}</p>
                            </div>

                            <div className="flex items-center gap-0.5 bg-orange-50 rounded-md px-0.5 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 bg-white rounded flex items-center justify-center text-orange-600 font-black hover:bg-orange-100 active:scale-90 transition"
                              >
                                <Minus size={10} strokeWidth={3} />
                              </button>
                              
                              <span className="w-5 text-center font-black text-[10px]">{item.quantity}</span>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 bg-white rounded flex items-center justify-center text-orange-600 font-black hover:bg-orange-100 active:scale-90 transition"
                              >
                                <Plus size={10} strokeWidth={3} />
                              </button>
                            </div>

                            <div className="text-right min-w-[40px]">
                              <p className="font-black text-[10px] text-gray-900">₹{item.price * item.quantity}</p>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 bg-red-50 hover:bg-red-100 rounded-md flex items-center justify-center text-red-600 active:scale-90 transition"
                            >
                              <Trash2 size={11} strokeWidth={2.5} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-md p-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white/80 text-[8px] font-bold mb-0.5">Total</p>
                            <p className="text-white text-base font-black">₹{calculateTotal()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/80 text-[8px] font-bold mb-0.5">Saved</p>
                            <p className="text-white text-xs font-black">₹{calculateSavings()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-3 rounded-lg shadow-lg transition text-xs disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle size={16} strokeWidth={2.5} />
                      {cart.length > 0 ? `Confirm • ₹${calculateTotal()}` : 'Add Items First'}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 text-center flex flex-col items-center justify-center min-h-[350px]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-xl"
              >
                <CheckCircle className="text-white" size={32} strokeWidth={2.5} />
              </motion.div>
              
              <h3 className="text-xl font-black text-gray-900 mb-1.5">Order Placed!</h3>
              <p className="text-gray-600 mb-4 text-xs">We'll confirm shortly.</p>
              
              <div className="w-full bg-green-50 rounded-xl p-3 border-2 border-green-200 mb-4">
                <p className="text-[10px] font-bold text-gray-700 mb-2">Summary</p>
                <div className="space-y-1.5 text-left mb-2">
                  {completedOrder?.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="text-gray-700">{item.weight} × {item.quantity}</span>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-green-300 pt-2 flex justify-between items-center">
                  <span className="font-black text-gray-800 text-xs">Total</span>
                  <span className="text-lg font-black text-green-700">₹{completedOrder?.total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={downloadInvoice}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] transition active:scale-95"
                >
                  <Download size={14} strokeWidth={2.5} />
                  Invoice
                </button>
                
                <button
                  onClick={handleClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] transition active:scale-95"
                >
                  <X size={14} strokeWidth={2.5} />
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
