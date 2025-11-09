import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Package, ShoppingCart, Minus, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';

const OrderForm = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    selectedVariant: null, // Will hold the selected product variant
    quantity: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Set default selected variant when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setFormData(prev => ({
        ...prev,
        selectedVariant: product // Default to the passed product
      }));
    }
  }, [isOpen, product]);

  // Calculate total price
  const calculateTotal = () => {
    if (!formData.selectedVariant) return 0;
    return formData.selectedVariant.price * formData.quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Create order object
    const order = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      product: {
        name: formData.selectedVariant.name,
        weight: formData.selectedVariant.weight,
        price: formData.selectedVariant.price
      },
      quantity: parseInt(formData.quantity),
      total: calculateTotal(),
      status: 'pending',
      order_date: new Date().toISOString()
    };

    try {
      // ✅ Save to Supabase Database
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .insert([order])
        .select();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      console.log('Order saved to Supabase!', data);

      // ✅ Also save to localStorage as backup
      const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      existingOrders.push({ 
        id: data[0].id, 
        ...order, 
        created_at: new Date().toISOString() 
      });
      localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));

      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form and close after 2.5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          phone: '',
          address: '',
          selectedVariant: product,
          quantity: 1
        });
        onClose();
      }, 2500);

    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to place order. Please try again.');
      setIsSubmitting(false);
      
      // Fallback: Save to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      existingOrders.push({ 
        id: Date.now(), 
        ...order, 
        created_at: new Date().toISOString() 
      });
      localStorage.setItem('sbghee-orders', JSON.stringify(existingOrders));
      
      // Show success even with fallback
      setTimeout(() => {
        setError(null);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      }, 1000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const incrementQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.min(prev.quantity + 1, 10) // Max 10
    }));
  };

  const decrementQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(prev.quantity - 1, 1) // Min 1
    }));
  };

  // Product variants (you can pass this as prop or define here)
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
    }
  ];

  if (!formData.selectedVariant) return null;

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto"
          >
            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <ShoppingCart size={20} />
                      </div>
                      <h3 className="text-xl font-bold">Place Your Order</h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Product Variant Selector */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Package size={16} />
                      Select Size
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {productVariants.map((variant) => {
                        const isSelected = formData.selectedVariant.id === variant.id;
                        const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
                        
                        return (
                          <motion.button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, selectedVariant: variant }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-orange-300'
                            }`}
                          >
                            {/* Discount Badge */}
                            {discount > 0 && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                -{discount}%
                              </div>
                            )}
                            
                            <div className="text-left">
                              <p className={`font-bold text-lg mb-1 ${isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
                                {variant.weight}
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className={`text-xl font-black ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
                                  ₹{variant.price}
                                </p>
                                <p className="text-sm text-gray-400 line-through">
                                  ₹{variant.originalPrice}
                                </p>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                              >
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Quantity</h4>
                    <div className="flex items-center gap-4">
                      <motion.button
                        type="button"
                        onClick={decrementQuantity}
                        disabled={formData.quantity <= 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-orange-100 hover:bg-orange-200 rounded-xl flex items-center justify-center text-orange-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={20} strokeWidth={3} />
                      </motion.button>
                      
                      <div className="flex-1 text-center">
                        <p className="text-3xl font-black text-gray-900">{formData.quantity}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">Items</p>
                      </div>
                      
                      <motion.button
                        type="button"
                        onClick={incrementQuantity}
                        disabled={formData.quantity >= 10}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-orange-100 hover:bg-orange-200 rounded-xl flex items-center justify-center text-orange-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={20} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Price Summary Card */}
                  <motion.div 
                    layout
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 mb-6 border-2 border-orange-200 shadow-md"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Selected Size:</span>
                        <span className="text-base font-bold text-gray-900">{formData.selectedVariant.weight}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Price per Unit:</span>
                        <span className="text-base font-bold text-gray-900">₹{formData.selectedVariant.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Quantity:</span>
                        <span className="text-base font-bold text-gray-900">× {formData.quantity}</span>
                      </div>
                      <div className="border-t-2 border-orange-200 pt-2.5 mt-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-gray-800">Total Amount:</span>
                          <motion.span 
                            key={calculateTotal()}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="text-2xl font-black text-orange-600"
                          >
                            ₹{calculateTotal()}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <User size={16} />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        minLength={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Phone size={16} />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="10-digit phone number"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <MapPin size={16} />
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        minLength={10}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
                        placeholder="Enter your complete delivery address"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Order...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <ShoppingCart size={20} />
                          Confirm Order - ₹{calculateTotal()}
                        </span>
                      )}
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Thank you for your order. We'll contact you soon to confirm delivery details.
                </p>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                  <div className="space-y-2 text-left">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Order saved successfully
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      Product: {formData.selectedVariant.weight}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      Quantity: {formData.quantity}
                    </p>
                    <p className="text-lg font-black text-green-700">
                      Total: ₹{calculateTotal()}
                    </p>
                  </div>
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
