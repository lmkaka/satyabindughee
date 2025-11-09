import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '../supabaseClient';

const OrderForm = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Cart state for multiple items
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  // All product variants including 5kg
  const productVariants = [
    {
      id: 1,
      name: 'Premium Pure Ghee',
      weight: '250gms',
      price: 299,
      originalPrice: 349,
      image: 'https://radarofc.onrender.com/sb1.jpg'
    },
    {
      id: 2,
      name: 'Premium Pure Ghee',
      weight: '500gms',
      price: 549,
      originalPrice: 649,
      image: 'https://radarofc.onrender.com/sb2.jpg'
    },
    {
      id: 3,
      name: 'Premium Pure Ghee',
      weight: '1kg',
      price: 999,
      originalPrice: 1199,
      image: 'https://radarofc.onrender.com/sb3.jpg'
    },
    {
      id: 4,
      name: 'Premium Pure Ghee',
      weight: '2kg',
      price: 1899,
      originalPrice: 2299,
      image: 'https://radarofc.onrender.com/sb4.jpg'
    },
    {
      id: 5,
      name: 'Premium Pure Ghee',
      weight: '5kg',
      price: 4499,
      originalPrice: 5499,
      image: 'https://radarofc.onrender.com/sb1.jpg'
    }
  ];

  // Add initial product to cart when modal opens
  useEffect(() => {
    if (isOpen && product && cart.length === 0) {
      addToCart(product);
    }
  }, [isOpen, product]);

  // Add item to cart
  const addToCart = (variant) => {
    const existingItem = cart.find(item => item.id === variant.id);
    
    if (existingItem) {
      // If item exists, increase quantity
      setCart(cart.map(item =>
        item.id === variant.id
          ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
          : item
      ));
    } else {
      // Add new item with quantity 1
      setCart([...cart, { ...variant, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (variantId) => {
    setCart(cart.filter(item => item.id !== variantId));
  };

  // Update quantity
  const updateQuantity = (variantId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(variantId);
      return;
    }
    
    if (newQuantity > 10) return; // Max 10 per item
    
    setCart(cart.map(item =>
      item.id === variantId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setError('Please add at least one item to cart');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Create order object with all cart items
    const order = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      product: cart.map(item => ({
        name: item.name,
        weight: item.weight,
        price: item.price,
        quantity: item.quantity
      })),
      quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: calculateTotal(),
      status: 'pending',
      order_date: new Date().toISOString()
    };

    try {
      // Save to Supabase
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .insert([order])
        .select();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      console.log('Order saved to Supabase!', data);

      // Backup to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      existingOrders.push({ 
        id: data[0].id, 
        ...order, 
        created_at: new Date().toISOString() 
      });
      localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));

      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset and close
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', phone: '', address: '' });
        setCart([]);
        onClose();
      }, 2500);

    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
          >
            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Place Your Order</h3>
                      <p className="text-xs text-white/80">{cart.length} item(s) in cart</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  {/* Product Variants - Simplified Grid */}
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Select Products</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {productVariants.map((variant) => {
                        const isInCart = cart.some(item => item.id === variant.id);
                        const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
                        
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => addToCart(variant)}
                            className={`relative p-3 rounded-lg border-2 transition-all text-left ${
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
                            
                            <p className={`font-bold text-base mb-0.5 ${isInCart ? 'text-orange-600' : 'text-gray-800'}`}>
                              {variant.weight}
                            </p>
                            <div className="flex items-baseline gap-1.5">
                              <p className={`text-lg font-black ${isInCart ? 'text-orange-600' : 'text-gray-900'}`}>
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
                      })}
                    </div>
                  </div>

                  {/* Cart Items */}
                  {cart.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Your Cart</h4>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-sm">{item.weight}</p>
                              <p className="text-xs text-gray-600">₹{item.price} each</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-100"
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-100"
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                            
                            <div className="text-right min-w-[60px]">
                              <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Summary */}
                  {cart.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 mb-5 border-2 border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Total Amount:</span>
                        <span className="text-2xl font-black text-orange-600">
                          ₹{calculateTotal()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} items total
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                        <User size={14} />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        minLength={3}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                        <Phone size={14} />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="10-digit phone number"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                        <MapPin size={14} />
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        minLength={10}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                        placeholder="Enter your complete delivery address"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || cart.length === 0}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <ShoppingCart size={18} />
                          Confirm Order - ₹{calculateTotal()}
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-600 mb-5 text-sm">
                  Thank you! We'll contact you soon for delivery.
                </p>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm font-bold text-gray-700 mb-2">Order Summary:</p>
                  <p className="text-sm text-gray-700">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                  <p className="text-xl font-black text-green-700 mt-2">
                    Total: ₹{calculateTotal()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderForm;
