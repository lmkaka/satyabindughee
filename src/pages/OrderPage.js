import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Download, CheckCircle, AlertCircle, Package, Plus, Minus, Trash2, LogIn } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
  const userPhone = user?.user_metadata?.phone || '';
  const userAddress = user?.user_metadata?.address || '';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const productsWithImages = (data || []).map(p => ({
        ...p,
        image: p.image_base64?.startsWith('data:image') 
          ? p.image_base64 
          : p.image_base64 
            ? `data:image/jpeg;base64,${p.image_base64}`
            : 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png'
      }));
      
      setAllProducts(productsWithImages);
    } catch (err) {
      console.error('Error loading products:', err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ Professional Invoice Generator
  const downloadInvoice = () => {
    if (!completedOrder) return;
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header - Orange gradient background
      doc.setFillColor(255, 140, 0);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Company name
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('SBGhee', 15, 25);
      
      // Invoice title
      doc.setFontSize(18);
      doc.text('TAX INVOICE', pageWidth - 15, 25, { align: 'right' });
      
      // Company details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Premium Pure Ghee', 15, 35);
      doc.text('Lalpur, Ranchi, Jharkhand', 15, 41);
      doc.text('Phone: +91 8603530133', 15, 47);
      
      // Invoice number and date
      doc.setTextColor(255, 255, 255);
      const invoiceNum = completedOrder.id.toString().padStart(6, '0');
      doc.text(`Invoice #: ${invoiceNum}`, pageWidth - 15, 35, { align: 'right' });
      doc.text(`Date: ${new Date(completedOrder.order_date).toLocaleDateString('en-IN')}`, pageWidth - 15, 41, { align: 'right' });
      doc.text(`Status: PENDING`, pageWidth - 15, 47, { align: 'right' });
      
      // Customer details box
      let yPos = 65;
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos, 180, 35, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('BILL TO:', 20, yPos + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(completedOrder.name, 20, yPos + 15);
      doc.text(`Phone: +91 ${completedOrder.phone}`, 20, yPos + 21);
      
      const addressLines = doc.splitTextToSize(completedOrder.address, 160);
      doc.text(addressLines, 20, yPos + 27);
      
      // Table header
      yPos = 115;
      doc.setFillColor(255, 140, 0);
      doc.rect(15, yPos, pageWidth - 30, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('PRODUCT', 20, yPos + 7);
      doc.text('QTY', 105, yPos + 7);
      doc.text('PRICE', 125, yPos + 7);
      doc.text('AMOUNT', 165, yPos + 7);
      
      // Table rows
      yPos += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      let subtotal = 0;
      
      completedOrder.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(15, yPos - 2, pageWidth - 30, 10, 'F');
        }
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        doc.text(`${item.name} (${item.weight})`, 20, yPos + 5);
        doc.text(item.quantity.toString(), 110, yPos + 5);
        doc.text(`₹${item.price}`, 125, yPos + 5);
        doc.text(`₹${itemTotal}`, 165, yPos + 5);
        
        yPos += 10;
      });
      
      // Totals section
      yPos += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos, pageWidth - 15, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      
      // Subtotal
      doc.text('Subtotal:', 135, yPos);
      doc.text(`₹${subtotal}`, 165, yPos);
      
      yPos += 8;
      
      // Savings
      if (calculateSavings() > 0) {
        doc.setTextColor(34, 197, 94);
        doc.text('You Saved:', 135, yPos);
        doc.text(`- ₹${calculateSavings()}`, 165, yPos);
        yPos += 8;
      }
      
      // Total
      doc.setFillColor(255, 237, 213);
      doc.rect(125, yPos - 5, 70, 12, 'F');
      
      doc.setTextColor(255, 140, 0);
      doc.setFontSize(14);
      doc.text('TOTAL:', 135, yPos + 3);
      doc.text(`₹${completedOrder.total}`, 165, yPos + 3);
      
      // Footer
      yPos = 270;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' });
      doc.text('For any queries, contact: +91 8603530133', pageWidth / 2, yPos + 5, { align: 'center' });
      
      // Terms
      doc.setFontSize(7);
      doc.text('Terms & Conditions Apply | Subject to Ranchi Jurisdiction', pageWidth / 2, yPos + 12, { align: 'center' });
      
      // Save PDF
      doc.save(`SBGhee_Invoice_${invoiceNum}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please login first');
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/order',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue with your order</p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 px-4 flex items-center justify-center gap-3 transition mb-4"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-bold text-gray-700">Continue with Google</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 font-semibold"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white" size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Your order has been confirmed. We'll contact you shortly.</p>
          
          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 mb-6 text-left max-h-60 overflow-y-auto">
            <p className="font-bold text-xs text-green-800 mb-3 uppercase">Order Summary</p>
            {completedOrder?.items.map((item, i) => (
              <div key={i} className="flex justify-between mb-2 text-sm">
                <span className="text-gray-700">{item.weight} × {item.quantity}</span>
                <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t-2 border-green-300 pt-3 mt-3 flex justify-between">
              <span className="font-black text-gray-800">Total Amount</span>
              <span className="text-xl font-black text-green-700">₹{completedOrder?.total}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={downloadInvoice}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Download size={18} strokeWidth={2.5} />
              Invoice
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <X size={18} strokeWidth={2.5} />
              Close
            </button>
          </div>

          <p className="text-xs text-gray-500">Invoice #: {completedOrder?.id.toString().padStart(6, '0')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">Quick Order</h1>
              {cart.length > 0 && (
                <p className="text-xs text-gray-600">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items • ₹{calculateTotal()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
          >
            <X className="text-gray-700" size={20} />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-lg font-black text-gray-900 mb-4">Available Products</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allProducts.map((prod) => (
                    <motion.div
                      key={prod.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => addToCart(prod)}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 cursor-pointer hover:border-orange-400 transition"
                    >
                      <img 
                        src={prod.image} 
                        alt={prod.name}
                        className="w-full h-28 object-contain rounded-lg bg-white mb-2"
                      />
                      <h3 className="font-bold text-xs text-gray-900 mb-1 truncate">{prod.name}</h3>
                      <p className="text-sm font-black text-orange-600 mb-2">{prod.weight}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-black">₹{prod.price}</span>
                        {prod.original_price > prod.price && (
                          <span className="text-xs text-gray-400 line-through">₹{prod.original_price}</span>
                        )}
                      </div>
                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition">
                        <Plus size={14} strokeWidth={3} />
                        Add to Cart
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="lg:col-span-1 space-y-4">
            {/* Cart */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <h2 className="text-lg font-black text-gray-900 mb-4">Cart ({cart.length})</h2>
                
                <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded bg-white" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">{item.weight}</p>
                        <p className="text-xs text-gray-600">₹{item.price}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-white rounded flex items-center justify-center text-orange-600 hover:bg-orange-50"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-white rounded flex items-center justify-center text-orange-600 hover:bg-orange-50"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      <p className="font-bold text-sm w-12 text-right">₹{item.price * item.quantity}</p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded flex items-center justify-center text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center text-white">
                    <div>
                      <p className="text-xs opacity-90 mb-1">Total</p>
                      <p className="text-2xl font-black">₹{calculateTotal()}</p>
                    </div>
                    {calculateSavings() > 0 && (
                      <div className="text-right">
                        <p className="text-xs opacity-90 mb-1">Saved</p>
                        <p className="text-lg font-black">₹{calculateSavings()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="text-blue-600" size={18} />
                <h3 className="text-sm font-black text-blue-900">Delivery To</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-900 font-bold">{userName}</p>
                <p className="text-gray-700">+91 {userPhone}</p>
                <p className="text-gray-700 text-xs">{userAddress}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-4 rounded-xl shadow-lg transition disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={22} strokeWidth={2.5} />
                  {cart.length > 0 ? `Place Order • ₹${calculateTotal()}` : 'Add Items First'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
