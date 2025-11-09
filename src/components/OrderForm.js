import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, ShoppingCart, Trash2, Download, CheckCircle, AlertCircle, Package, Sparkles, TrendingDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ Memoized Product Card with Toggle Selection
const ProductCard = memo(({ variant, isSelected, quantity, onToggle }) => {
  const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
  const totalPrice = variant.price * (quantity || 1);
  
  return (
    <motion.div
      onClick={() => onToggle(variant)}
      whileTap={{ scale: 0.96 }}
      className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-4 ring-orange-500 shadow-2xl'
          : 'ring-2 ring-gray-200 hover:ring-orange-300 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <TrendingDown size={12} strokeWidth={3} />
            {discount}% OFF
          </div>
        </div>
      )}

      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <CheckCircle size={18} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Image Area */}
      <div className={`p-6 transition-colors ${isSelected ? 'bg-gradient-to-br from-orange-50 to-amber-50' : 'bg-white'}`}>
        <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl mb-4 flex items-center justify-center">
          <Package size={48} className="text-orange-600" strokeWidth={1.5} />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className={`text-lg font-black ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
            {variant.weight}
          </h3>
          
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
              ₹{variant.price}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹{variant.originalPrice}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium">Premium Pure Ghee</p>

          {/* Quantity Display for Selected Items */}
          {isSelected && quantity > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2 border-t border-orange-200"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Quantity: {quantity}</span>
                <span className="text-orange-600 font-black">₹{totalPrice}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Click to Select/Deselect Hint */}
      <div className={`py-2 text-center text-xs font-bold transition-colors ${
        isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {isSelected ? '✓ SELECTED - Click to Remove' : 'Click to Select'}
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

// ✅ Cart Summary Component
const CartSummary = memo(({ cart, onUpdateQuantity }) => {
  return (
    <div className="space-y-3">
      {cart.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="bg-white rounded-xl p-4 flex items-center gap-3 border-2 border-orange-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="text-orange-600" size={20} />
          </div>
          
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-900">{item.weight}</p>
            <p className="text-xs text-gray-500">₹{item.price} each</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-2 py-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, item.quantity - 1);
              }}
              className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors font-black text-lg"
            >
              −
            </button>
            
            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, item.quantity + 1);
              }}
              className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors font-black text-lg"
            >
              +
            </button>
          </div>

          <div className="text-right min-w-[60px]">
            <p className="font-black text-base text-gray-900">₹{item.price * item.quantity}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

CartSummary.displayName = 'CartSummary';

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

  // ✅ Toggle Selection - Click again to deselect
  const toggleCartItem = useCallback((variant) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === variant.id);
      
      if (existingItem) {
        // If already in cart, remove it (deselect)
        return prevCart.filter(item => item.id !== variant.id);
      } else {
        // If not in cart, add it with quantity 1
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
      item.id === variantId
        ? { ...item, quantity: newQuantity }
        : item
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

      doc.setFillColor(254, 243, 199);
      doc.rect(110, yPos, 85, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('ORDER STATUS', 115, yPos + 8);
      doc.setFontSize(13);
      doc.text('● PENDING', 115, yPos + 16);

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
      setError('Please select at least one product');
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
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-black/80 via-orange-900/20 to-black/80 backdrop-blur-md"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <ShoppingCart size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      Place Your Order
                      {cart.length > 0 && (
                        <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-white/90 font-medium">
                      Select products by clicking on them
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all flex items-center justify-center"
                >
                  <X size={22} className="text-white" strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="grid lg:grid-cols-2 gap-6 p-6">
                  
                  {/* LEFT: Product Selection */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-orange-500" />
                        Select Products
                      </h4>
                      {cart.length > 0 && (
                        <button
                          onClick={() => setCart([])}
                          className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

                  {/* RIGHT: Cart & Form */}
                  <div className="space-y-5">
                    
                    {/* Cart Summary */}
                    {cart.length > 0 ? (
                      <div>
                        <h4 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                          <ShoppingCart size={20} className="text-orange-500" />
                          Your Cart ({cart.length} items)
                        </h4>
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                          <CartSummary cart={cart} onUpdateQuantity={updateQuantity} />
                          
                          {/* Total Summary */}
                          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white/90 text-sm font-bold">Order Total</span>
                              <span className="text-white text-2xl font-black">₹{calculateTotal()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white/90 text-xs font-medium">You Save</span>
                              <span className="text-white text-lg font-black">₹{calculateSavings()}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/20">
                              <p className="text-white/90 text-xs font-medium">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)} items • Free Delivery
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center border-2 border-orange-200">
                        <ShoppingCart size={48} className="text-orange-300 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-600 font-bold">No items selected</p>
                        <p className="text-sm text-gray-500 mt-1">Click on products to add them</p>
                      </div>
                    )}

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2"
                        >
                          <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                          <p className="text-red-700 text-sm font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Delivery Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <MapPin size={20} className="text-orange-500" />
                        Delivery Details
                      </h4>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <User size={16} className="text-orange-500" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          minLength={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-sm font-medium transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <Phone size={16} className="text-orange-500" />
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-sm font-medium transition-all"
                          placeholder="10-digit mobile number"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <MapPin size={16} className="text-orange-500" />
                          Delivery Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          minLength={10}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 resize-none text-sm font-medium transition-all"
                          placeholder="House no., Street, Area, City, PIN"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting || cart.length === 0}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            Processing Order...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle size={20} strokeWidth={2.5} />
                            {cart.length > 0 ? `Confirm Order • ₹${calculateTotal()}` : 'Select Items First'}
                          </span>
                        )}
                      </motion.button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center flex flex-col items-center justify-center min-h-[500px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
              >
                <CheckCircle className="text-white" size={52} strokeWidth={2.5} />
              </motion.div>
              
              <h3 className="text-3xl font-black text-gray-900 mb-3">Order Confirmed!</h3>
              <p className="text-gray-600 mb-8 text-base max-w-md">
                Thank you for your order. We'll contact you shortly to confirm delivery details.
              </p>
              
              <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 mb-6 max-w-lg">
                <p className="text-base font-bold text-gray-800 mb-4 text-left">Order Summary</p>
                <div className="space-y-3 text-left mb-4">
                  {completedOrder && completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">{item.weight} × {item.quantity}</span>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-green-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-800 text-lg">Total Paid</span>
                    <span className="text-3xl font-black text-green-700">₹{completedOrder && completedOrder.total}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadInvoice}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download size={20} strokeWidth={2.5} />
                  Download Invoice
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="bg-gray-100 text-gray-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
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
