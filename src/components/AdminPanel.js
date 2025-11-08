import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, User, Phone, MapPin, Eye, Download, Trash2, FileText,
  ClipboardList, Clock, CheckCircle, IndianRupee, RefreshCw,
  MessageCircle, Mail, Reply, Lock, LogOut, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../supabaseClient';

// Helper Functions
const sanitizeText = (text = '') => {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[°º™®©]/g, '')
    .replace(/₹/g, 'Rs.')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatCurrency = (amount) => {
  return `Rs. ${parseFloat(amount || 0).toLocaleString('en-IN', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

const getStatusColorRGB = (status) => {
  const statusMap = {
    'PENDING': [255, 193, 7],
    'CONFIRMED': [30, 144, 255],
    'DELIVERED': [46, 201, 113],
    'CANCELLED': [232, 64, 64]
  };
  return statusMap[String(status || '').toUpperCase()] || [150, 150, 150];
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getMessageStatusColor = (status) => {
  const colors = {
    unread: 'bg-red-100 text-red-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const AdminPanel = () => {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data States
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check saved login
  useEffect(() => {
    const savedLogin = localStorage.getItem('sbghee-admin-logged-in');
    if (savedLogin === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data after login
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadMessages();
    }
  }, [isAuthenticated]);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const { data, error: supabaseError } = await supabase
        .from('admin_login')
        .select('*')
        .eq('username', loginUsername.trim())
        .eq('password', loginPassword)
        .single();

      if (supabaseError || !data) {
        setLoginError('Invalid username or password');
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem('sbghee-admin-logged-in', 'true');
      localStorage.setItem('sbghee-admin-username', loginUsername);
      setIsAuthenticated(true);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('sbghee-admin-logged-in');
    localStorage.removeItem('sbghee-admin-username');
    setIsAuthenticated(false);
    setOrders([]);
    setMessages([]);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('orders').select('*').order('created_at', { ascending: false });
      if (supabaseError) throw supabaseError;
      setOrders(data || []);
      localStorage.setItem('sbghee-orders', JSON.stringify(data || []));
    } catch (err) {
      setError('Failed to load orders');
      const savedOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      setOrders(savedOrders);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('messages').select('*').order('created_at', { ascending: false });
      if (supabaseError) throw supabaseError;
      setMessages(data || []);
      localStorage.setItem('sbghee-messages', JSON.stringify(data || []));
    } catch (err) {
      setError('Failed to load messages');
      const savedMessages = JSON.parse(localStorage.getItem('sbghee-messages') || '[]');
      setMessages(savedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error: supabaseError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (supabaseError) throw supabaseError;

      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('sbghee-orders', JSON.stringify(updatedOrders));
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const { error: supabaseError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (supabaseError) throw supabaseError;

      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('sbghee-orders', JSON.stringify(updatedOrders));
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const { error: supabaseError } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (supabaseError) throw supabaseError;

      const updatedMessages = messages.map(message =>
        message.id === messageId ? { ...message, status: newStatus } : message
      );
      setMessages(updatedMessages);
      localStorage.setItem('sbghee-messages', JSON.stringify(updatedMessages));
    } catch (err) {
      alert('Failed to update message status');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error: supabaseError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (supabaseError) throw supabaseError;

      const updatedMessages = messages.filter(message => message.id !== messageId);
      setMessages(updatedMessages);
      localStorage.setItem('sbghee-messages', JSON.stringify(updatedMessages));
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const exportOrdersToPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 140, 0);
      doc.rect(0, 0, pageWidth, 35, 'F');

      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('SBGhee', 15, 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Pure & Natural Ghee Products', 15, 22);
      doc.text('Lalpur, Ranchi, Jharkhand', 15, 28);

      doc.setFontSize(9);
      doc.text('ORDERS REPORT', pageWidth - 15, 12, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 15, 18, { align: 'right' });
      doc.text(`Total Orders: ${orders.length}`, pageWidth - 15, 24, { align: 'right' });

      let yPos = 45;
      const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const deliveredCount = orders.filter(o => o.status === 'delivered').length;

      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos - 5, pageWidth - 30, 22, 'F');

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, yPos + 2);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 20, yPos + 9);
      doc.text(`Pending: ${pendingCount}`, 80, yPos + 9);
      doc.text(`Delivered: ${deliveredCount}`, 120, yPos + 9);

      yPos += 28;

      doc.setFillColor(255, 140, 0);
      doc.rect(15, yPos, pageWidth - 30, 10, 'F');

      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Order ID', 18, yPos + 6);
      doc.text('Customer', 40, yPos + 6);
      doc.text('Product', 75, yPos + 6);
      doc.text('Qty', 115, yPos + 6);
      doc.text('Amount', 130, yPos + 6);
      doc.text('Status', 160, yPos + 6);
      doc.text('Date', 180, yPos + 6);

      yPos += 12;

      orders.forEach((order, index) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 20;

          doc.setFillColor(255, 140, 0);
          doc.rect(15, yPos, pageWidth - 30, 10, 'F');
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text('Order ID', 18, yPos + 6);
          doc.text('Customer', 40, yPos + 6);
          doc.text('Product', 75, yPos + 6);
          doc.text('Qty', 115, yPos + 6);
          doc.text('Amount', 130, yPos + 6);
          doc.text('Status', 160, yPos + 6);
          doc.text('Date', 180, yPos + 6);
          yPos += 12;
        }

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, yPos - 4, pageWidth - 30, 8, 'F');
        }

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        const orderId = sanitizeText(order.id.toString().slice(-6));
        const customerName = sanitizeText(order.name).slice(0, 15);
        const productName = sanitizeText(order.product?.weight || 'N/A');
        const orderDate = new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short' 
        });

        doc.text(orderId, 18, yPos + 2);
        doc.text(customerName, 40, yPos + 2);
        doc.text(productName, 75, yPos + 2);
        doc.text(String(order.quantity || 0), 118, yPos + 2);
        doc.text(formatCurrency(order.total), 130, yPos + 2);

        const statusText = sanitizeText(order.status).toUpperCase();
        const [r, g, b] = getStatusColorRGB(statusText);
        doc.setTextColor(r, g, b);
        doc.setFont('helvetica', 'bold');
        doc.text(statusText, 160, yPos + 2);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(orderDate, 180, yPos + 2);

        yPos += 9;
      });

      yPos += 5;
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, pageWidth - 15, yPos);

      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 140, 0);
      doc.text(`GRAND TOTAL: ${formatCurrency(totalRevenue)}`, pageWidth - 15, yPos, { align: 'right' });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `SBGhee Admin Panel | Generated on ${new Date().toLocaleString('en-IN')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      }

      doc.save(`SBGhee_Orders_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const exportSingleOrderPDF = (order) => {
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
      doc.text(`Invoice No: #${sanitizeText(order.id.toString().slice(-8))}`, pageWidth - 15, 20, { align: 'right' });
      doc.text(`Date: ${new Date(order.order_date || order.created_at).toLocaleDateString('en-IN')}`, 
        pageWidth - 15, 27, { align: 'right' });

      let yPos = 52;
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos, 90, 40, 'F');

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 20, yPos + 8);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(sanitizeText(order.name), 20, yPos + 16);
      doc.text(`Phone: ${sanitizeText(order.phone)}`, 20, yPos + 23);
      
      const addressLines = doc.splitTextToSize(sanitizeText(order.address), 80);
      doc.text(addressLines, 20, yPos + 30);

      doc.setFillColor(245, 245, 245);
      doc.rect(110, yPos, 85, 20, 'F');

      doc.setFont('helvetica', 'bold');
      doc.text('ORDER STATUS:', 115, yPos + 8);

      const statusText = sanitizeText(order.status).toUpperCase();
      const [r, g, b] = getStatusColorRGB(statusText);
      doc.setTextColor(r, g, b);
      doc.setFontSize(12);
      doc.text(statusText, 115, yPos + 16);

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

      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos, pageWidth - 30, 12, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const productName = sanitizeText(order.product?.name || 'Ghee');
      const productWeight = sanitizeText(order.product?.weight || '');
      doc.text(`${productName} - ${productWeight}`, 20, yPos + 8);
      doc.text(String(order.quantity || 1), 125, yPos + 8);
      doc.text(formatCurrency(order.product?.price || 0), 140, yPos + 8);
      doc.text(formatCurrency(order.total), 170, yPos + 8);

      yPos += 25;
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(120, yPos, pageWidth - 15, yPos);

      yPos += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 125, yPos);
      doc.text(formatCurrency(order.total), 170, yPos);

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
      doc.text(formatCurrency(order.total), 170, yPos);

      yPos = 260;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('For any queries, contact: +91-XXXXXXXXXX | email@sbghee.com', pageWidth / 2, yPos, { align: 'center' });

      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, 277);

      doc.save(`SBGhee_Invoice_${order.id.toString().slice(-6)}.pdf`);
    } catch (error) {
      console.error('Invoice Export Error:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const exportMessagesToPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 140, 0);
      doc.rect(0, 0, pageWidth, 30, 'F');

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('MESSAGES LOG', 15, 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Messages: ${messages.length}`, 15, 23);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 15, 15, { align: 'right' });

      let yPos = 40;

      messages.forEach((msg, index) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, pageWidth - 30, 35, 'F');

        doc.setDrawColor(255, 140, 0);
        doc.setLineWidth(0.3);
        doc.rect(15, yPos, pageWidth - 30, 35);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`#${sanitizeText(msg.id.toString().slice(-6))}`, 18, yPos + 6);

        const statusText = sanitizeText(msg.status).toUpperCase();
        doc.setFontSize(8);
        doc.text(statusText, pageWidth - 35, yPos + 6);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`From: ${sanitizeText(msg.name)}`, 18, yPos + 12);
        doc.text(`Email: ${sanitizeText(msg.email)}`, 18, yPos + 18);

        if (msg.phone) {
          doc.text(`Phone: ${sanitizeText(msg.phone)}`, 18, yPos + 24);
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`Subject: ${sanitizeText(msg.subject).slice(0, 40)}`, 18, yPos + 30);

        yPos += 40;
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`SBGhee Messages | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`SBGhee_Messages_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Messages Export Error:', error);
      alert('Failed to generate messages PDF. Please try again.');
    }
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center">
              <Lock className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">SBGhee Admin</h1>
              <p className="text-white/90 text-sm">Secure Admin Panel Login</p>
            </div>

            <form onSubmit={handleLogin} className="p-8">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
                >
                  <p className="text-red-700 text-sm font-medium">{loginError}</p>
                </motion.div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User size={16} className="inline mr-2 text-orange-500" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2 text-orange-500" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoggingIn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all ${
                    isLoggingIn
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-xl'
                  }`}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">Default: admin / admin123</p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ADMIN PANEL (After Login)
  const filteredOrders = orders.filter(order => filterStatus === 'all' || order.status === filterStatus);
  const adminUsername = localStorage.getItem('sbghee-admin-username') || 'Admin';

  const stats = activeTab === 'orders' ? [
    { label: 'Orders', value: orders.length, icon: ClipboardList, color: 'blue' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'yellow' },
    { label: 'Completed', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'green' },
    { label: 'Revenue', value: `₹${orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)}`, icon: IndianRupee, color: 'purple' }
  ] : [
    { label: 'Messages', value: messages.length, icon: MessageCircle, color: 'blue' },
    { label: 'Unread', value: messages.filter(m => m.status === 'unread').length, icon: Mail, color: 'red' },
    { label: 'Read', value: messages.filter(m => m.status === 'read').length, icon: Eye, color: 'blue' },
    { label: 'Replied', value: messages.filter(m => m.status === 'replied').length, icon: Reply, color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header with Logout */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-xl font-bold">SBGhee Admin</h1>
            <p className="text-xs text-white/90">Welcome, {adminUsername}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Floating Refresh FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { loadOrders(); loadMessages(); }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-orange-500/50 transition-all"
        title="Refresh Data"
      >
        <RefreshCw className="text-white" size={24} />
      </motion.button>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-600'
            }`}
          >
            <Package size={18} className="inline mr-2" />
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-600'
            }`}
          >
            <MessageCircle size={18} className="inline mr-2" />
            Messages ({messages.length})
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white rounded-xl p-4 shadow-md`}>
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`text-${stat.color}-600`} size={20} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border-2 rounded-lg font-medium text-sm"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={exportOrdersToPDF}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Download size={18} />
                <span className="text-sm">Export PDF</span>
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Package className="text-gray-300 mx-auto mb-3" size={48} />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">#{order.id.toString().slice(-6)}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.order_date || order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium">{order.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={16} className="text-gray-400" />
                    <span>{order.product.name} - {order.product.weight}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee size={16} className="text-gray-400" />
                    <span className="font-bold">₹{order.total} (Qty: {order.quantity})</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => exportSingleOrderPDF(order)}
                    className="bg-green-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Download size={14} />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="bg-red-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4 flex justify-between items-center">
            <h3 className="font-bold">Customer Messages</h3>
            <button
              onClick={exportMessagesToPDF}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 active:scale-95"
            >
              <Download size={16} />
              Export
            </button>
          </div>
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <MessageCircle className="text-gray-300 mx-auto mb-3" size={48} />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">#{message.id.toString().slice(-6)}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(message.created_at || message.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMessageStatusColor(message.status)}`}>
                    {message.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium">{message.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-xs">{message.email}</span>
                  </div>
                  {message.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-400" />
                      <span>{message.phone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <FileText size={16} className="text-gray-400 mt-1" />
                    <span className="font-medium">{message.subject}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                </div>
                <select
                  value={message.status}
                  onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm font-medium mb-2"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.location.href = `mailto:${message.email}`}
                    className="bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Reply size={14} />
                    Reply
                  </button>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="bg-red-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Order Details */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <p className="text-sm text-gray-500">#{selectedOrder.id.toString().slice(-6)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Customer</p>
                    <p className="font-bold">{selectedOrder.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Phone</p>
                    <p className="font-bold">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Product</p>
                    <p className="font-bold">{selectedOrder.product.name} - {selectedOrder.product.weight}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Total</p>
                    <p className="text-2xl font-bold text-orange-600">₹{selectedOrder.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Address</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{selectedOrder.address}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className="w-full px-4 py-3 border-2 rounded-lg font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => exportSingleOrderPDF(selectedOrder)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Download size={20} />
                      Download Invoice
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
