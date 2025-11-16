import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, User, Phone, MapPin, Eye, Download, Trash2, FileText,
  ClipboardList, Clock, CheckCircle, IndianRupee, RefreshCw,
  MessageCircle, Mail, Reply, Lock, LogOut, X, Shield,
  Users, UserPlus, Edit2, Search, Calendar, AlertCircle  // ✅ ADD THESE
} from 'lucide-react';
import jsPDF from 'jspdf';
// Add this import after other imports
import ProductManagement from './ProductManagement';
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
  const [showPassword, setShowPassword] = useState(false);

  // Data States
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
const [users, setUsers] = useState([]);
const [products, setProducts] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [showUsersModal, setShowUsersModal] = useState(false);
const [searchQuery, setSearchQuery] = useState('');


  // Check saved login
  useEffect(() => {
    const savedLogin = localStorage.getItem('sbghee-admin-logged-in');
    if (savedLogin === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data after login - REMOVE LOCAL STORAGE DEPENDENCY
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadMessages();
       loadUsers();     // ✅ ADD THIS
    loadProducts();  // ✅ ADD THIS
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
    // Clear cached data
    localStorage.removeItem('sbghee-orders');
    localStorage.removeItem('sbghee-messages');
    setIsAuthenticated(false);
    setOrders([]);
    setMessages([]);
  };

  // FIXED: Load orders directly from Supabase without localStorage fallback
  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error('Supabase Error:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Loaded orders:', data);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders from database');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Load messages directly from Supabase without localStorage fallback
  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error('Supabase Error:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Loaded messages:', data);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages from database');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };
  // After your loadMessages function, ADD THESE:

// Load users
const loadUsers = async () => {
  try {
    const { data, error: supabaseError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (supabaseError) throw supabaseError;
    setUsers(data || []);
  } catch (err) {
    console.error('Failed to load users:', err);
    setUsers([]);
  }
};

// Load products
const loadProducts = async () => {
  try {
    const { data, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (supabaseError) throw supabaseError;
    setProducts(data || []);
  } catch (err) {
    console.error('Failed to load products:', err);
    setProducts([]);
  }
};


  // FIXED: Update order status with proper reload
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus);
      
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select();

      if (supabaseError) {
        console.error('Update error:', supabaseError);
        throw supabaseError;
      }

      console.log('Update successful:', data);
      
      // Reload fresh data from database
      await loadOrders();
      
      // Show success message
      alert('Order status updated successfully!');
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status: ' + err.message);
    }
  };

  // FIXED: Delete order with proper reload
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('Deleting order:', orderId);
      
      const { error: supabaseError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (supabaseError) {
        console.error('Delete error:', supabaseError);
        throw supabaseError;
      }

      console.log('Delete successful');
      
      // Reload fresh data from database
      await loadOrders();
      
      // Close modal if the deleted order was selected
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      
      // Show success message
      alert('Order deleted successfully!');
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order: ' + err.message);
    }
  };

  // FIXED: Update message status with proper reload
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      console.log('Updating message:', messageId, 'to status:', newStatus);
      
      const { data, error: supabaseError } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', messageId)
        .select();

      if (supabaseError) {
        console.error('Update error:', supabaseError);
        throw supabaseError;
      }

      console.log('Update successful:', data);
      
      // Reload fresh data from database
      await loadMessages();
      
      // Show success message
      alert('Message status updated successfully!');
    } catch (err) {
      console.error('Failed to update message status:', err);
      alert('Failed to update message status: ' + err.message);
    }
  };

  // FIXED: Delete message with proper reload
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('Deleting message:', messageId);
      
      const { error: supabaseError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (supabaseError) {
        console.error('Delete error:', supabaseError);
        throw supabaseError;
      }

      console.log('Delete successful');
      
      // Reload fresh data from database
      await loadMessages();
      
      // Show success message
      alert('Message deleted successfully!');
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message: ' + err.message);
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

  // IMPROVED LOGIN SCREEN with modern UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-10 text-center">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                  SBGhee Admin
                </h1>
                <p className="text-white/90 text-sm font-medium tracking-wide">
                  Secure Access Portal
                </p>
              </motion.div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              {/* Error Alert */}
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-red-700 text-sm font-semibold">{loginError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-orange-500" />
                  Username
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 font-medium"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock size={16} className="text-orange-500" />
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 font-medium pr-12"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoggingIn}
                whileHover={{ scale: isLoggingIn ? 1 : 1.02 }}
                whileTap={{ scale: isLoggingIn ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 relative overflow-hidden ${
                  isLoggingIn
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:shadow-xl hover:shadow-orange-500/50'
                }`}
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-base">Authenticating...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 text-base">
                    <Lock size={18} />
                    Sign In Securely
                  </span>
                )}
              </motion.button>

              {/* Security Notice */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <span className="font-bold">Secure Connection:</span> Your credentials are encrypted and protected. Only authorized personnel can access this portal.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6 text-white/90 text-sm font-medium drop-shadow-lg"
          >
            © 2024 SBGhee. All rights reserved.
          </motion.p>
        </motion.div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // ADMIN PANEL (After Login) - Rest remains same
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
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { 
          loadOrders(); 
          loadMessages(); 
          loadUsers();     // ✅ ADD THIS
  loadProducts();  // ✅ ADD THIS
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-orange-500/50 transition-all"
        title="Refresh Data"
      >
        <RefreshCw className="text-white" size={24} />
      </motion.button>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4 rounded-lg">
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
                : 'text-gray-600 hover:bg-gray-50'
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
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            
            <MessageCircle size={18} className="inline mr-2" />
            Messages ({messages.length})
          </button>
            {/* ✅ ADD THESE TWO NEW BUTTONS: */}
<button
  onClick={() => setActiveTab('users')}
  className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
    activeTab === 'users'
      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
      : 'text-gray-600 hover:bg-gray-50'
  }`}
>
  <Users size={18} className="inline mr-2" />
  Users ({users.length})
</button>

<button
  onClick={() => setActiveTab('products')}
  className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
    activeTab === 'products'
      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
      : 'text-gray-600 hover:bg-gray-50'
  }`}
>
  <Package size={18} className="inline mr-2" />
  Products
</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`text-${stat.color}-600`} size={20} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">{stat.label}</p>
            </motion.div>
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
                className="flex-1 px-4 py-3 border-2 rounded-lg font-medium text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={exportOrdersToPDF}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <Download size={18} />
                <span className="text-sm">Export PDF</span>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Package className="text-gray-300 mx-auto mb-3" size={48} />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers place them</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">#{order.id.toString().slice(-6)}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
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
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => exportSingleOrderPDF(order)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Download size={14} />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
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
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 active:scale-95 hover:shadow-lg transition-all"
            >
              <Download size={16} />
              Export
            </button>
          </div>
       {/* ✅ ADD THIS ENTIRE USERS TAB: */}
{activeTab === 'users' && (
  <div className="px-4 space-y-4">
    {/* Users Header */}
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Users size={24} className="text-purple-600" />
            Registered Users
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: <span className="font-bold text-purple-600">{users.length}</span> users
          </p>
        </div>

        <button
          onClick={() => setShowUsersModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
        >
          <Eye size={16} strokeWidth={2.5} />
          View All ({users.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name, phone, or email..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition text-sm"
        />
      </div>
    </div>

    {/* Users Grid */}
    {isLoading ? (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading users...</p>
      </div>
    ) : users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 ? (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Users className="text-gray-300 mx-auto mb-4" size={64} />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {searchQuery ? 'No users found' : 'No users registered yet'}
        </h3>
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.filter(user =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.includes(searchQuery) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 12).map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-purple-200"
          >
            <div className="flex items-center gap-3 mb-3">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name} 
                  className="w-14 h-14 rounded-full border-2 border-purple-200 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="text-white" size={28} strokeWidth={2.5} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-600 font-semibold">{user.phone}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{user.email || 'No email'}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{user.address || 'No address'}</span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <Calendar size={10} />
                {new Date(user.created_at).toLocaleDateString('en-IN')}
              </div>
              <button
                onClick={() => setSelectedUser(user)}
                className="text-purple-600 hover:text-purple-700 font-black text-xs flex items-center gap-1"
              >
                View
                <Eye size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
)}
{/* ✅ ADD THIS PRODUCTS TAB: */}
{activeTab === 'products' && (
  <div className="px-4">
    <ProductManagement />
  </div>
)}


          
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <MessageCircle className="text-gray-300 mx-auto mb-3" size={48} />
              <p className="text-gray-500 font-medium">No messages found</p>
              <p className="text-gray-400 text-sm mt-1">Customer messages will appear here</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">#{message.id.toString().slice(-6)}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(message.created_at || message.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
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
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm font-medium mb-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.location.href = `mailto:${message.email}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Reply size={14} />
                    Reply
                  </button>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
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
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    <p className="text-xs text-gray-500 font-semibold mb-1">Quantity</p>
                    <p className="font-bold">{selectedOrder.quantity}</p>
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
                    <p className="text-xs text-gray-500 font-semibold mb-2">Change Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className="w-full px-4 py-3 border-2 rounded-lg font-medium focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
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
{/* ✅ ADD THESE TWO MODALS AT THE END: */}

{/* All Users Modal */}
<AnimatePresence>
  {showUsersModal && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-white" size={24} />
            <div>
              <h3 className="text-2xl font-black text-white">All Users</h3>
              <p className="text-sm text-white/90">{users.length} total users</p>
            </div>
          </div>
          <button
            onClick={() => setShowUsersModal(false)}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <X className="text-white" size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-xl p-4 hover:bg-purple-50 transition border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-lg">{user.name}</h4>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate">{user.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2 text-sm">
                      <MapPin size={14} className="text-gray-400 mt-0.5" />
                      <span>{user.address || 'No address'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUsersModal(false);
                    }}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl font-bold text-xs"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

{/* User Details Modal */}
<AnimatePresence>
  {selectedUser && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black text-white">User Details</h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <X className="text-white" size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white">
              <User className="text-white" size={36} />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white">{selectedUser.name}</h4>
              <p className="text-white/90 text-sm">ID: #{selectedUser.id.toString().slice(-8)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Phone</p>
            <p className="font-black text-lg">{selectedUser.phone}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Email</p>
            <p className="font-bold">{selectedUser.email || 'Not provided'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Address</p>
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <p className="text-sm">{selectedUser.address || 'No address'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <a
              href={`tel:${selectedUser.phone}`}
              className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call
            </a>
            <button
              onClick={() => setSelectedUser(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-black text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

  );
};

export default AdminPanel;
