import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, ShoppingCart, Trash2, Plus, Minus, Download, CheckCircle, AlertCircle, Package, CreditCard } from 'lucide-react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ Memoized Product Button Component
const ProductButton = memo(({ variant, isInCart, onAdd }) => {
  const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
  
  return (
    <motion.button
      type="button"
      onClick={() => onAdd(variant)}
      whileTap={{ scale: 0.97 }}
      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group ${
        isInCart
          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
      }`}
    >
      {discount > 0 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
          {discount}% OFF
        </div>
      )}
      
      <div className="flex flex-col gap-1">
        <p className={`font-bold text-base ${isInCart ? 'text-orange-600' : 'text-gray-800'}`}>
          {variant.weight}
        </p>
        <div className="flex items-baseline gap-2">
          <p className={`text-lg font-black ${isInCart ? 'text-orange-600' : 'text-gray-900'}`}>
            ₹{variant.price}
          </p>
          <p className="text-xs text-gray-400 line-through">
            ₹{variant.originalPrice}
          </p>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">Premium Pure Ghee</p>
      </div>
      
      {isInCart && (
        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle size={14} className="text-white" strokeWidth={3} />
        </div>
      )}
    </motion.button>
  );
});

ProductButton.displayName = 'ProductButton';

// ✅ Memoized Cart Item Component
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Package className="text-orange-600" size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 truncate">{item.weight}</p>
        <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
      </div>
      
      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        
        <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
        
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
      
      <div className="text-right min-w-[60px]">
        <p className="font-black text-base text-gray-900">₹{item.price * item.quantity}</p>
      </div>
      
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

const OrderForm = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const productVariants = [
    { id: 1, name: 'Premium Pure Ghee', weight: '250gms', price: 299, originalPrice: 349, image: 'https://radarofc.onrender.com/sb1.jpg' },
    { id: 2, name: 'Premium Pure Ghee', weight: '500gms', price: 549, originalPrice: 649, image: 'https://radarofc.onrender.com/sb2.jpg' },
    { id: 3, name: 'Premium Pure Ghee', weight: '1kg', price: 999, originalPrice: 1199, image: 'https://radarofc.onrender.com/sb3.jpg' },
    { id: 4, name: 'Premium Pure Ghee', weight: '2kg', price: 1899, originalPrice: 2299, image: 'https://radarofc.onrender.com/sb4.jpg' },
    { id: 5, name: 'Premium Pure Ghee', weight: '5kg', price: 4799, originalPrice: 5299, image: 'https://radarofc.onrender.com/sb1.jpg' }
  ];

  const addToCart = useCallback((variant) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === variant.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === variant.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
            : item
        );
      } else {
        return [...prevCart, { ...variant, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((variantId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(variantId);
      return;
    }
    
    if (newQuantity > 10) return;
    
    setCart(prevCart => prevCart.map(item =>
      item.id === variantId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }, [removeFromCart]);

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

      // Modern Header with Gradient Effect
      doc.setFillColor(255, 140, 0);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 15, 22);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('SBGhee - Premium Pure Ghee', 15, 32);
      doc.text('Lalpur, Ranchi, Jharkhand', 15, 39);
      
      doc.setFontSize(10);
      doc.text(`Invoice #${completedOrder.id.toString().slice(-8)}`, pageWidth - 15, 22, { align: 'right' });
      doc.text(`Date: ${new Date(completedOrder.order_date).toLocaleDateString('en-IN')}`, pageWidth - 15, 29, { align: 'right' });

      // Customer Details
      let yPos = 58;
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos, 90, 42, 'F');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER DETAILS', 20, yPos + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(completedOrder.name, 20, yPos + 16);
      doc.text(`📞 ${completedOrder.phone}`, 20, yPos + 23);
      const addressLines = doc.splitTextToSize(completedOrder.address, 80);
      doc.text(addressLines, 20, yPos + 30);

      // Order Status
      doc.setFillColor(254, 243, 199);
      doc.rect(110, yPos, 85, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('ORDER STATUS', 115, yPos + 8);
      doc.setFontSize(13);
      doc.text('● PENDING', 115, yPos + 16);

      // Items Table Header
      yPos = 115;
      doc.setFillColor(255, 140, 0);
      doc.rect(15, yPos, pageWidth - 30, 10, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCT', 20, yPos + 7);
      doc.text('QTY', 115, yPos + 7);
      doc.text('PRICE', 135, yPos + 7);
      doc.text('AMOUNT', 165, yPos + 7);

      // Items
      yPos += 13;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      completedOrder.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(15, yPos - 3, pageWidth - 30, 10, 'F');
        }
        doc.text(`${item.name} - ${item.weight}`, 20, yPos + 4);
        doc.text(String(item.quantity), 120, yPos + 4);
        doc.text(`₹${item.price}`, 135, yPos + 4);
        doc.text(`₹${item.price * item.quantity}`, 165, yPos + 4);
        yPos += 10;
      });

      // Total Section
      yPos += 8;
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(110, yPos, pageWidth - 15, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 120, yPos);
      doc.text(`₹${completedOrder.total}`, 170, yPos);
      
      yPos += 7;
      doc.text('Tax (0%):', 120, yPos);
      doc.text('₹0', 170, yPos);
      
      yPos += 10;
      doc.setLineWidth(1);
      doc.line(110, yPos, pageWidth - 15, yPos);
      
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 140, 0);
      doc.text('TOTAL:', 120, yPos);
      doc.text(`₹${completedOrder.total}`, 170, yPos);

      // Footer
      yPos = 270;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for choosing SBGhee!', pageWidth / 2, yPos, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('📧 support@sbghee.com | 📞 +91 86035 30133', pageWidth / 2, yPos + 5, { align: 'center' });

      doc.save(`SBGhee_Invoice_${completedOrder.id.toString().slice(-6)}.pdf`);
    } catch (error) {
      console.error('Invoice generation error:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  }, [completedOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setError('Please add at least one item to cart');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const productSummary = cart.length === 1 
      ? cart[0].weight
      : `${cart.length} items (${cart.map(item => `${item.weight}×${item.quantity}`).join(', ')})`;

    const order = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      product: {
        name: 'Premium Pure Ghee',
        weight: productSummary,
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
      if (!data || data.length === 0) throw new Error('No data returned from database');

      const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      existingOrders.push({ id: data[0].id, ...order, created_at: new Date().toISOString() });
      localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));

      setCompletedOrder({
        id: data[0].id,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        items: cart,
        total: calculateTotal(),
        order_date: new Date().toISOString()
      });

      setIsSubmitting(false);
      setIsSuccess(true);

    } catch (err) {
      setError(err.message || 'Failed to place order');
      
      try {
        const fallbackOrder = { id: Date.now(), ...order, created_at: new Date().toISOString() };
        const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
        existingOrders.push(fallbackOrder);
        localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));
        
        setCompletedOrder({
          id: fallbackOrder.id,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          items: cart,
          total: calculateTotal(),
          order_date: new Date().toISOString()
        });
        
        setTimeout(() => {
          setError(null);
          setIsSuccess(true);
        }, 1500);
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
      }
      
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleClose = useCallback(() => {
    setFormData({ name: '', phone: '', address: '' });
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
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative bg-gradient-to-br from-gray-50 to-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {!isSuccess ? (
            <>
              {/* Modern Header */}
              <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white px-5 py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Place Order</h3>
                    <p className="text-xs text-white/90 font-medium">
                      {cart.length > 0 ? `${cart.reduce((sum, item) => sum + item.quantity, 0)} items selected` : 'Select your products'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* Products Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-black text-gray-800 flex items-center gap-2">
                      <Package size={16} className="text-orange-600" />
                      Select Products
                    </h4>
                    {cart.length > 0 && (
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                        {cart.length} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {productVariants.map((variant) => (
                      <ProductButton
                        key={variant.id}
                        variant={variant}
                        isInCart={cart.some(item => item.id === variant.id)}
                        onAdd={addToCart}
                      />
                    ))}
                  </div>
                </div>

                {/* Cart Items */}
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h4 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                        <ShoppingCart size={16} className="text-orange-600" />
                        Your Cart
                      </h4>
                      <div className="space-y-2.5 bg-gray-50 rounded-2xl p-3">
                        <AnimatePresence>
                          {cart.map((item) => (
                            <CartItem
                              key={item.id}
                              item={item}
                              onUpdateQuantity={updateQuantity}
                              onRemove={removeFromCart}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Order Summary */}
                {cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white/90 text-xs font-bold mb-1">Order Total</p>
                        <p className="text-white text-3xl font-black">₹{calculateTotal()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/90 text-xs font-bold mb-1">You Save</p>
                        <p className="text-white text-lg font-black">₹{calculateSavings()}</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                      <p className="text-white text-xs font-medium">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} items • Free Delivery
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-3.5 flex items-start gap-3"
                    >
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <div className="flex-1">
                        <p className="text-red-900 font-bold text-sm mb-0.5">Error</p>
                        <p className="text-red-700 text-xs">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Customer Details Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-sm font-black text-gray-800 flex items-center gap-2">
                    <CreditCard size={16} className="text-orange-600" />
                    Delivery Details
                  </h4>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                      <User size={14} className="text-orange-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium bg-white transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                      <Phone size={14} className="text-orange-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium bg-white transition-all"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                      <MapPin size={14} className="text-orange-600" />
                      Delivery Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      rows={3}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm font-medium bg-white transition-all"
                      placeholder="House no., Street, Area, City, State, PIN"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Order...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle size={20} strokeWidth={2.5} />
                        {cart.length > 0 ? `Confirm Order • ₹${calculateTotal()}` : 'Add Items to Cart'}
                      </span>
                    )}
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 text-center flex flex-col items-center justify-center min-h-[500px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl"
              >
                <CheckCircle className="text-white" size={44} strokeWidth={2.5} />
              </motion.div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h3>
              <p className="text-gray-600 mb-6 text-sm max-w-sm">Thank you for your order. We'll contact you shortly to confirm delivery.</p>
              
              <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 mb-6 max-w-md">
                <p className="text-sm font-bold text-gray-700 mb-4 text-left">Order Summary</p>
                <div className="space-y-2.5 text-left mb-4">
                  {completedOrder && completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{item.weight} × {item.quantity}</span>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-green-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-800">Total Paid</span>
                    <span className="text-2xl font-black text-green-700">₹{completedOrder && completedOrder.total}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadInvoice}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg"
                >
                  <Download size={18} strokeWidth={2.5} />
                  Download Invoice
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                  Close
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderForm;
