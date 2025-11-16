import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, User, Phone, MapPin, Eye, Download, Trash2, FileText,
  ClipboardList, Clock, CheckCircle, IndianRupee, RefreshCw,
  MessageCircle, Mail, Reply, Lock, LogOut, X, Shield, Users, UserPlus,
  Edit2, Search, Calendar, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../supabaseClient';
import ProductManagement from './ProductManagement';

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
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = () => {
    loadOrders();
    loadMessages();
    loadUsers();
    loadProducts();
  };

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
    setUsers([]);
    setProducts([]);
  };

  // Load orders
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    }
  };

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

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error: supabaseError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (supabaseError) throw supabaseError;
      await loadOrders();
      alert('✅ Order status updated!');
    } catch (err) {
      alert('❌ Failed to update: ' + err.message);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!window.confirm('⚠️ Delete this order?')) return;

    try {
      const { error: supabaseError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (supabaseError) throw supabaseError;
      await loadOrders();
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      alert('✅ Order deleted!');
    } catch (err) {
      alert('❌ Failed to delete: ' + err.message);
    }
  };

  // Update message status
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const { error: supabaseError } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (supabaseError) throw supabaseError;
      await loadMessages();
    } catch (err) {
      alert('❌ Failed to update: ' + err.message);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('⚠️ Delete this message?')) return;

    try {
      const { error: supabaseError} = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (supabaseError) throw supabaseError;
      await loadMessages();
      alert('✅ Message deleted!');
    } catch (err) {
      alert('❌ Failed to delete: ' + err.message);
    }
  };

  // Export Orders PDF
  const exportOrdersToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('SBGhee - Orders Report', 14, 20);

      const tableData = orders.map(order => [
        sanitizeText(order.id?.toString().slice(-6) || 'N/A'),
        sanitizeText(order.name || 'N/A'),
        sanitizeText(order.phone || 'N/A'),
        sanitizeText(order.status || 'pending'),
        formatCurrency(order.total)
      ]);

      doc.autoTable({
        head: [['Order ID', 'Customer', 'Phone', 'Status', 'Total']],
        body: tableData,
        startY: 30
      });

      doc.save('Orders_Report.pdf');
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to generate PDF');
    }
  };

  // Export Messages PDF
  const exportMessagesToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('SBGhee - Messages Report', 14, 20);

      const tableData = messages.map(msg => [
        sanitizeText(msg.name || 'N/A'),
        sanitizeText(msg.email || 'N/A'),
        sanitizeText(msg.phone || 'N/A'),
        sanitizeText(msg.message?.substring(0, 50) || 'N/A'),
        sanitizeText(msg.status || 'unread')
      ]);

      doc.autoTable({
        head: [['Name', 'Email', 'Phone', 'Message', 'Status']],
        body: tableData,
        startY: 30
      });

      doc.save('Messages_Report.pdf');
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to generate PDF');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="text-white" size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600 font-medium">SBGhee Management Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-700 text-sm font-semibold">{loginError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={20} strokeWidth={2.5} />
                  Login to Admin Panel
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Admin Panel (After Login)
  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminUsername = localStorage.getItem('sbghee-admin-username') || 'Admin';

  // Dashboard Stats
  const dashboardStats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: ClipboardList, 
      color: 'blue',
      subtext: `${orders.filter(o => o.status === 'pending').length} pending`
    },
    { 
      label: 'Total Revenue', 
      value: `₹${orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0).toLocaleString()}`, 
      icon: IndianRupee, 
      color: 'green',
      subtext: 'All time'
    },
    { 
      label: 'Registered Users', 
      value: users.length, 
      icon: Users, 
      color: 'purple',
      subtext: `${users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length} new today`
    },
    { 
      label: 'Active Products', 
      value: products.filter(p => p.is_active).length, 
      icon: Package, 
      color: 'orange',
      subtext: `${products.length} total`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 p-4 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <Shield size={24} />
              SBGhee Admin
            </h1>
            <p className="text-xs text-white/90">Welcome back, {adminUsername}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition text-sm"
          >
            <LogOut size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Floating Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={loadAllData}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-orange-500/50 transition-all"
      >
        <RefreshCw className="text-white" size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Tab Switcher */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg p-1 flex gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
            { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
            { id: 'messages', label: 'Messages', icon: MessageCircle, count: messages.length },
            { id: 'users', label: 'Users', icon: Users, count: users.length },
            { id: 'products', label: 'Products', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] py-3 px-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} className="inline mr-1.5" strokeWidth={2.5} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="px-4 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`text-${stat.color}-600`} size={24} strokeWidth={2.5} />
                </div>
                <p className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm font-bold text-gray-700 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-500" />
              Quick Actions
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 p-4 rounded-xl text-left transition-all group"
              >
                <Package className="text-blue-600 mb-2 group-hover:scale-110 transition" size={24} />
                <p className="font-bold text-blue-900">View Orders</p>
                <p className="text-xs text-blue-600 mt-1">Manage all orders</p>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 p-4 rounded-xl text-left transition-all group"
              >
                <Users className="text-purple-600 mb-2 group-hover:scale-110 transition" size={24} />
                <p className="font-bold text-purple-900">View Users</p>
                <p className="text-xs text-purple-600 mt-1">See all customers</p>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 p-4 rounded-xl text-left transition-all group"
              >
                <Package className="text-orange-600 mb-2 group-hover:scale-110 transition" size={24} />
                <p className="font-bold text-orange-900">Manage Products</p>
                <p className="text-xs text-orange-600 mt-1">Add/Edit products</p>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 p-4 rounded-xl text-left transition-all group"
              >
                <MessageCircle className="text-green-600 mb-2 group-hover:scale-110 transition" size={24} />
                <p className="font-bold text-green-900">View Messages</p>
                <p className="text-xs text-green-600 mt-1">Customer inquiries</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
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

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUsersModal(true)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Eye size={16} strokeWidth={2.5} />
                  View All ({users.length})
                </button>
              </div>
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
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Users className="text-gray-300 mx-auto mb-4" size={64} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchQuery ? 'No users found' : 'No users registered yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try a different search term' : 'Users will appear here when they register'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.slice(0, 12).map((user, index) => (
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

          {filteredUsers.length > 12 && (
            <div className="text-center">
              <button
                onClick={() => setShowUsersModal(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg transition active:scale-95"
              >
                <Users size={18} />
                View All {users.length} Users
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products Tab - Opens ProductManagement Component */}
      {activeTab === 'products' && (
        <div className="px-4">
          <ProductManagement />
        </div>
      )}

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
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 p-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Users className="text-white" size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">All Registered Users</h3>
                    <p className="text-sm text-white/90 font-semibold">{users.length} total users in database</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
                >
                  <X className="text-white" size={22} strokeWidth={3} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:from-purple-50 hover:to-indigo-50 transition-all border-2 border-gray-200 hover:border-purple-300"
                    >
                      <div className="flex items-start gap-4">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.name} 
                            className="w-16 h-16 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <User className="text-white" size={32} strokeWidth={2.5} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-lg text-gray-900 mb-1">{user.name}</h4>
                          <div className="grid sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                              <span className="font-semibold">{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                              <span className="truncate font-medium">{user.email || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 mt-2 text-sm">
                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-gray-700 font-medium">{user.address || 'No address provided'}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs">
                            <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                              <Calendar size={12} />
                              Joined: {new Date(user.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-black text-[10px]">
                              ✓ ACTIVE
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUsersModal(false);
                          }}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Eye size={14} strokeWidth={2.5} />
                          Details
                        </button>
                      </div>
                    </motion.div>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <User size={24} strokeWidth={2.5} />
                    User Details
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
                  >
                    <X className="text-white" size={20} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {selectedUser.avatar_url ? (
                    <img 
                      src={selectedUser.avatar_url} 
                      alt={selectedUser.name} 
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="text-white" size={36} strokeWidth={2.5} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-2xl font-black text-white mb-1">{selectedUser.name}</h4>
                    <p className="text-white/90 text-sm font-semibold">
                      User ID: #{selectedUser.id.toString().slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Phone Number</p>
                    <p className="font-black text-lg text-gray-900">{selectedUser.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Email Address</p>
                    <p className="font-bold text-base text-gray-900">{selectedUser.email || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Delivery Address</p>
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                      <p className="text-sm text-gray-900 font-medium leading-relaxed">
                        {selectedUser.address || 'No address provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Registration Date</p>
                    <p className="font-black text-base text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t-2">
                  <a
                    href={`tel:${selectedUser.phone}`}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <Phone size={18} strokeWidth={2.5} />
                    Call User
                  </a>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-black text-sm transition active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="px-4 space-y-4">
          {/* Filter and Export */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</option>
                <option value="confirmed">Confirmed ({orders.filter(o => o.status === 'confirmed').length})</option>
                <option value="delivered">Delivered ({orders.filter(o => o.status === 'delivered').length})</option>
                <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</option>
              </select>
              <button
                onClick={exportOrdersToPDF}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <Download size={18} strokeWidth={2.5} />
                <span className="text-sm">Export PDF</span>
              </button>
            </div>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Package className="text-gray-300 mx-auto mb-4" size={64} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 text-sm">
                {filterStatus === 'all' 
                  ? 'Orders will appear here once customers place them' 
                  : `No ${filterStatus} orders at the moment`}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all border-2 border-gray-100"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-base text-gray-900">#{order.id.toString().slice(-6)}</h3>
                      <p className="text-xs text-gray-500 font-semibold">
                        {new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="font-bold text-gray-900 truncate">{order.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-gray-700 font-semibold">{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-gray-700 font-medium">{order.product?.weight || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="font-black text-orange-600">₹{order.total}</span>
                      <span className="text-xs text-gray-500">• Qty: {order.quantity}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Eye size={14} strokeWidth={2.5} />
                      View
                    </button>
                    <button
                      onClick={() => exportSingleOrderPDF(order)}
                      className="bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Download size={14} strokeWidth={2.5} />
                      PDF
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="px-4 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex justify-between items-center">
            <h3 className="font-black text-lg text-gray-900">Customer Messages</h3>
            <button
              onClick={exportMessagesToPDF}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition"
            >
              <Download size={16} strokeWidth={2.5} />
              Export PDF
            </button>
          </div>

          {/* Messages List */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <MessageCircle className="text-gray-300 mx-auto mb-4" size={64} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600 text-sm">Customer messages will appear here</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all border-2 border-gray-100"
                >
                  {/* Message Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-sm text-gray-900">#{message.id.toString().slice(-6)}</h3>
                      <p className="text-xs text-gray-500 font-semibold">
                        {new Date(message.created_at || message.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getMessageStatusColor(message.status)}`}>
                      {message.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Message Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="font-bold text-gray-900 truncate">{message.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-gray-700 text-xs truncate">{message.email}</span>
                    </div>
                    {message.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-gray-700 font-semibold">{message.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <span className="font-bold text-gray-900 line-clamp-1">{message.subject}</span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{message.message}</p>
                  </div>

                  {/* Status Selector */}
                  <select
                    value={message.status}
                    onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-bold mb-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`mailto:${message.email}`}
                      className="bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Reply size={14} strokeWidth={2.5} />
                      Reply
                    </a>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 rounded-t-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-2xl font-black text-white">Order Details</h2>
                    <p className="text-sm text-white/90 font-semibold">#{selectedOrder.id.toString().slice(-6)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition"
                  >
                    <X className="text-white" size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Customer</p>
                    <p className="font-black text-lg text-gray-900">{selectedOrder.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Phone</p>
                    <p className="font-bold text-base text-gray-900">{selectedOrder.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Product</p>
                    <p className="font-bold text-base text-gray-900">
                      {selectedOrder.product?.name} - {selectedOrder.product?.weight}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Quantity</p>
                      <p className="font-black text-xl text-gray-900">{selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total</p>
                      <p className="font-black text-2xl text-orange-600">₹{selectedOrder.total}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Delivery Address</p>
                    <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                      <p className="text-sm text-gray-900 font-medium leading-relaxed">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                {/* Status Changer */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-2">Change Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => exportSingleOrderPDF(selectedOrder)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <Download size={18} strokeWidth={2.5} />
                    Download Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-black text-sm transition active:scale-95"
                  >
                    Close
                  </button>
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
