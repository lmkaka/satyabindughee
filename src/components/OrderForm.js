import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, ShoppingCart, Trash2, Plus, Minus, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ Memoized Product Button Component for Performance
const ProductButton = memo(({ variant, isInCart, onAdd }) => {
  const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
  
  return (
    <button
      type="button"
      onClick={() => onAdd(variant)}
      className={`relative p-3 rounded-lg border-2 transition-colors text-left ${
        isInCart
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 bg-white hover:border-orange-300'
      }`}
    >
      {discount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          -{discount}%
        </div>
      )}
      
      <p className={`font-bold text-sm mb-0.5 ${isInCart ? 'text-orange-600' : 'text-gray-800'}`}>
        {variant.weight}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p className={`text-base font-black ${isInCart ? 'text-orange-600' : 'text-gray-900'}`}>
          ₹{variant.price}
        </p>
        <p className="text-xs text-gray-400 line-through">
          ₹{variant.originalPrice}
        </p>
      </div>
      
      {isInCart && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
          <Plus size={10} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
});

ProductButton.displayName = 'ProductButton';

// ✅ Memoized Cart Item Component
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2.5">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{item.weight}</p>
        <p className="text-xs text-gray-600">₹{item.price} each</p>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-50"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        
        <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
        
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-50"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
      
      <div className="text-right min-w-[55px]">
        <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
      </div>
      
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <Trash2 size={16} />
      </button>
    </div>
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

  // ✅ Memoized callback functions
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
      doc.text('SBGhee - Pure & Natural Ghee', 15, 28);
      doc.text('Lalpur, Ranchi', 15, 34);
      doc.setFontSize(10);
      doc.text(`Invoice No: #${completedOrder.id.toString().slice(-8)}`, pageWidth - 15, 20, { align: 'right' });
      doc.text(`Date: ${new Date(completedOrder.order_date).toLocaleDateString('en-IN')}`, pageWidth - 15, 27, { align: 'right' });

      let yPos = 52;
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos, 90, 40, 'F');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 20, yPos + 8);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(completedOrder.name, 20, yPos + 16);
      doc.text(`Phone: ${completedOrder.phone}`, 20, yPos + 23);
      const addressLines = doc.splitTextToSize(completedOrder.address, 80);
      doc.text(addressLines, 20, yPos + 30);

      doc.setFillColor(245, 245, 245);
      doc.rect(110, yPos, 85, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER STATUS:', 115, yPos + 8);
      doc.setTextColor(255, 165, 0);
      doc.setFontSize(12);
      doc.text('PENDING', 115, yPos + 16);

      yPos = 105;
      doc.setFillColor(255, 140, 0);
      doc.rect(15, yPos, pageWidth - 30, 12, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCT DESCRIPTION', 20, yPos + 8);
      doc.text('QTY', 120, yPos + 8);
      doc.text('UNIT PRICE', 140, yPos + 8);
      doc.text('TOTAL', 170, yPos + 8);

      yPos += 15;
      completedOrder.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, yPos - 4, pageWidth - 30, 12, 'F');
        }
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${item.name} - ${item.weight}`, 20, yPos + 4);
        doc.text(String(item.quantity), 125, yPos + 4);
        doc.text(`Rs. ${item.price}`, 140, yPos + 4);
        doc.text(`Rs. ${item.price * item.quantity}`, 170, yPos + 4);
        yPos += 12;
      });

      yPos += 10;
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(120, yPos, pageWidth - 15, yPos);
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 125, yPos);
      doc.text(`Rs. ${completedOrder.total}`, 170, yPos);
      yPos += 8;
      doc.text('Tax (0%):', 125, yPos);
      doc.text('Rs. 0', 170, yPos);
      yPos += 10;
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(1);
      doc.line(120, yPos, pageWidth - 15, yPos);
      yPos += 10;
      doc.setFontSize(14);
      doc.setTextColor(255, 140, 0);
      doc.text('GRAND TOTAL:', 125, yPos);
      doc.text(`Rs. ${completedOrder.total}`, 170, yPos);

      yPos = 260;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('For any queries, contact: support@sbghee.com', pageWidth / 2, yPos, { align: 'center' });
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, 277);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {!isSuccess ? (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Place Your Order</h3>
                  <p className="text-xs text-white/90">{cart.length > 0 ? `${cart.length} item(s)` : 'Select products'}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white p-1.5">
                <X size={22} />
              </button>
            </div>

            {/* ✅ OPTIMIZED SCROLL CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2.5">Select Products</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

              {cart.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2.5">Your Cart</h4>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3.5 mb-4 border-2 border-orange-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800 text-sm">Total:</span>
                    <span className="text-xl font-black text-orange-600">₹{calculateTotal()}</span>
                  </div>
                  <p className="text-xs text-gray-600">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="text-red-800 font-bold text-xs mb-0.5">Order Failed</p>
                    <p className="text-red-700 text-xs">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                    <User size={13} />Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    minLength={3}
                    className="w-full px-3.5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                    <Phone size={13} />Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    className="w-full px-3.5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="10-digit phone number"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                    <MapPin size={13} />Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    minLength={10}
                    rows={2}
                    className="w-full px-3.5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                    placeholder="Enter your complete delivery address"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart size={18} />
                      {cart.length > 0 ? `Confirm Order - ₹${calculateTotal()}` : 'Add Items'}
                    </span>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={36} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 mb-5 text-sm">Thank you! We'll contact you soon.</p>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 mb-5">
              <p className="text-sm font-bold text-gray-700 mb-3">Order Summary:</p>
              <div className="space-y-1.5 text-left mb-3">
                {completedOrder && completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.weight} × {item.quantity}</span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-green-200 pt-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="text-xl font-black text-green-700">₹{completedOrder && completedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={downloadInvoice}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Download size={16} />Download
              </button>
              
              <button
                onClick={handleClose}
                className="bg-gray-100 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-200"
              >
                <X size={16} />Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderForm;
