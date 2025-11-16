import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, ShoppingCart, Download, CheckCircle, AlertCircle, Package, Sparkles, Edit2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ Product Card Component (unchanged)
const ProductCard = memo(({ variant, isSelected, quantity, onToggle }) => {
  const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
  
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(variant)}
      whileTap={{ scale: 0.96 }}
      className={`relative w-full rounded-lg overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-orange-500 shadow-md' : 'ring-1 ring-gray-200'
      }`}
    >
      {discount > 0 && (
        <div className="absolute top-1.5 left-1.5 z-10 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {discount}% OFF
        </div>
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle size={12} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-2 ${isSelected ? 'bg-gradient-to-br from-orange-50 to-amber-50' : 'bg-white'}`}>
        <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-md mb-1.5 flex items-center justify-center">
          <Package size={20} className="text-orange-600" strokeWidth={1.5} />
        </div>

        <h3 className={`text-xs font-black mb-0.5 ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
          {variant.weight}
        </h3>
        
        <div className="flex items-baseline gap-1 mb-1">
          <span className={`text-sm font-black ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
            ₹{variant.price}
          </span>
          <span className="text-[9px] text-gray-400 line-through">
            ₹{variant.originalPrice}
          </span>
        </div>

        {isSelected && quantity > 0 && (
          <div className="pt-1 border-t border-orange-200">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-600 font-semibold">Qty: {quantity}</span>
              <span className="text-orange-600 font-black">₹{variant.price * quantity}</span>
            </div>
          </div>
        )}
      </div>

      <div className={`py-1 text-center text-[9px] font-bold ${
        isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {isSelected ? '✓ SELECTED' : 'TAP TO SELECT'}
      </div>
    </motion.button>
  );
});

ProductCard.displayName = 'ProductCard';

// ✅ Cart Item Component (unchanged)
const CartItem = memo(({ item, onUpdateQuantity }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-md p-2 flex items-center gap-1.5 border border-orange-100"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
        <Package className="text-orange-600" size={14} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[11px] text-gray-900 truncate">{item.weight}</p>
        <p className="text-[9px] text-gray-500">₹{item.price} each</p>
      </div>

      <div className="flex items-center gap-0.5 bg-orange-50 rounded-md px-1 py-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateQuantity(item.id, item.quantity - 1);
          }}
          className="w-5 h-5 bg-white rounded flex items-center justify-center text-orange-600 font-black text-sm active:bg-orange-100"
        >
          −
        </button>
        
        <span className="w-5 text-center font-black text-[10px]">{item.quantity}</span>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateQuantity(item.id, item.quantity + 1);
          }}
          className="w-5 h-5 bg-white rounded flex items-center justify-center text-orange-600 font-black text-sm active:bg-orange-100"
        >
          +
        </button>
      </div>

      <div className="text-right min-w-[45px]">
        <p className="font-black text-xs text-gray-900">₹{item.price * item.quantity}</p>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

const OrderForm = ({ isOpen, onClose, product }) => {
  const { user } = useAuth(); // Get logged-in user
  
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const productVariants = [
    { id: 1, name: 'Premium Pure Ghee', weight: '250gms', price: 299, originalPrice: 349 },
    { id: 2, name: 'Premium Pure Ghee', weight: '500gms', price: 549, originalPrice: 649 },
    { id: 3, name: 'Premium Pure Ghee', weight: '1kg', price: 999, originalPrice: 1199 },
    { id: 4, name: 'Premium Pure Ghee', weight: '2kg', price: 1899, originalPrice: 2299 },
    { id: 5, name: 'Premium Pure Ghee', weight: '5kg', price: 4799, originalPrice: 5299 }
  ];

  // Get user data from auth
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Guest';
  const userPhone = user?.user_metadata?.phone || 'N/A';
  const userAddress = user?.user_metadata?.address || 'N/A';

  // ✅ Browser Back Button Handler
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

  const toggleCartItem = useCallback((variant) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === variant.id);
      if (existingItem) {
        return prevCart.filter(item => item.id !== variant.id);
      } else {
        return [...prevCart, { ...variant, quantity: 1 }];
      }
    });
  }, []);

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
      setError('Please select at least one product');
      return;
    }

    // Check if user data is available
    if (!user || !userName || !userPhone || !userAddress || userName === 'Guest' || userPhone === 'N/A' || userAddress === 'N/A') {
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
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-0 sm:items-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          {!isSuccess ? (
            <>
              {/* COMPACT STICKY HEADER */}
              <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 flex items-center justify-between rounded-t-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart size={14} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white leading-tight">Place Order</h3>
                    {cart.length > 0 && (
                      <p className="text-[8px] text-white/90 font-bold leading-tight">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} items • ₹{calculateTotal()}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                  <X size={18} className="text-orange-600" strokeWidth={3} />
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2.5" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* Auto-Filled User Info - Compact Display */}
                {user && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[10px] font-black text-blue-900 flex items-center gap-1">
                        <User size={10} className="text-blue-600" />
                        Delivery Info
                      </h4>
                    </div>
                    <div className="space-y-0.5 text-[9px]">
                      <p className="text-blue-900 font-bold">{userName}</p>
                      <p className="text-blue-700">+91 {userPhone}</p>
                      <p className="text-blue-700 line-clamp-2">{userAddress}</p>
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[11px] font-black text-gray-900 flex items-center gap-1">
                      <Sparkles size={11} className="text-orange-500" />
                      Select Products
                    </h4>
                    {cart.length > 0 && (
                      <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                        {cart.length} selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {productVariants.map((variant) => {
                      const cartItem = cart.find(item => item.id === variant.id);
                      return (
                        <ProductCard
                          key={variant.id}
                          variant={variant}
                          isSelected={!!cartItem}
                          quantity={cartItem?.quantity || 0}
                          onToggle={toggleCartItem}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 mb-1.5 flex items-center gap-1">
                      <ShoppingCart size={11} className="text-orange-500" />
                      Cart ({cart.length})
                    </h4>
                    <div className="space-y-1.5 bg-gray-50 rounded-lg p-1.5">
                      <AnimatePresence>
                        {cart.map((item) => (
                          <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} />
                        ))}
                      </AnimatePresence>
                      
                      {/* Total */}
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-md p-2 mt-1.5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white/80 text-[8px] font-bold">Total</p>
                            <p className="text-white text-base font-black">₹{calculateTotal()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/80 text-[8px] font-bold">Save</p>
                            <p className="text-white text-xs font-black">₹{calculateSavings()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-1.5 flex items-start gap-1.5">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={12} />
                    <p className="text-red-700 text-[10px] font-medium">{error}</p>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-2.5 rounded-lg shadow-md disabled:opacity-50 text-xs active:scale-[0.98] transition-transform"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle size={14} />
                      {cart.length > 0 ? `Confirm Order • ₹${calculateTotal()}` : 'Select Items First'}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="text-white" size={32} />
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-1.5">Order Placed!</h3>
              <p className="text-gray-600 mb-4 text-xs">We'll contact you soon.</p>
              
              <div className="w-full bg-green-50 rounded-xl p-3 border-2 border-green-200 mb-4">
                <p className="text-xs font-bold text-gray-700 mb-2">Summary</p>
                <div className="space-y-1.5 text-left mb-2">
                  {completedOrder?.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span>{item.weight} × {item.quantity}</span>
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-green-300 pt-2 flex justify-between">
                  <span className="font-black text-gray-800 text-sm">Total</span>
                  <span className="text-lg font-black text-green-700">₹{completedOrder?.total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={downloadInvoice}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                >
                  <Download size={14} />
                  Invoice
                </button>
                
                <button
                  onClick={handleClose}
                  className="bg-gray-100 text-gray-700 font-bold py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                >
                  <X size={14} />
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
