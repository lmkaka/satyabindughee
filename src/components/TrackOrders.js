import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Clock, CheckCircle, Truck, XCircle, RefreshCw, MapPin, Phone, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';

const TrackOrders = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status configurations
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Pending',
      description: 'Order received, awaiting confirmation'
    },
    confirmed: {
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Confirmed',
      description: 'Order confirmed, preparing for dispatch'
    },
    processing: {
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      label: 'Processing',
      description: 'Order is being prepared'
    },
    shipped: {
      icon: Truck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      label: 'Shipped',
      description: 'Order is on the way'
    },
    delivered: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Delivered',
      description: 'Order delivered successfully'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Cancelled',
      description: 'Order has been cancelled'
    }
  };

  // Fetch orders for current user
  const fetchOrders = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      const userPhone = user.user_metadata?.phone;
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('phone', userPhone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Fallback to localStorage
      const localOrders = JSON.parse(localStorage.getItem('sbghee-orders') || '[]');
      const userOrders = localOrders.filter(order => 
        order.phone === user.user_metadata?.phone
      );
      setOrders(userOrders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  // Real-time subscription for status updates
  useEffect(() => {
    if (!isOpen || !user) return;

    const userPhone = user.user_metadata?.phone;
    
    const subscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `phone=eq.${userPhone}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          fetchOrders(); // Refresh orders on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-4 py-3 rounded-t-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Package className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">My Orders</h3>
                <p className="text-xs text-white/90 font-semibold">{orders.length} orders found</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchOrders}
                disabled={refreshing}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCw className={`text-white ${refreshing ? 'animate-spin' : ''}`} size={16} strokeWidth={2.5} />
              </button>
              
              <button
                onClick={onClose}
                className="w-9 h-9 bg-white/90 rounded-lg hover:bg-white active:scale-95 transition flex items-center justify-center"
              >
                <X className="text-orange-600" size={18} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="text-gray-400" size={40} strokeWidth={1.5} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h4>
                <p className="text-gray-600 text-sm text-center">
                  Start ordering delicious pure ghee!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${status.bg} ${status.border} border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 ${status.bg} rounded-lg flex items-center justify-center border-2 ${status.border}`}>
                            <StatusIcon className={status.color} size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Order #{order.id?.toString().slice(-6)}</p>
                            <h4 className={`text-sm font-black ${status.color}`}>{status.label}</h4>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-base font-black text-gray-900">₹{order.total}</p>
                          <p className="text-xs text-gray-600">{order.quantity} items</p>
                        </div>
                      </div>

                      {/* Status Description */}
                      <p className="text-xs text-gray-600 mb-3">{status.description}</p>

                      {/* Order Details */}
                      <div className="bg-white/50 rounded-lg p-2.5 space-y-2 mb-3">
                        <div className="flex items-start gap-2 text-xs">
                          <Package className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-700">Products:</p>
                            <p className="text-gray-600">{order.product?.weight || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2 text-xs">
                          <MapPin className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-700">Delivery Address:</p>
                            <p className="text-gray-600 line-clamp-2">{order.address}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="text-gray-500 flex-shrink-0" size={14} />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-700">Ordered On:</p>
                            <p className="text-gray-600">{formatDate(order.order_date || order.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className={order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? status.color : 'text-gray-400'}>
                          Pending
                        </span>
                        <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                          <div 
                            className={`h-full ${status.color.replace('text-', 'bg-')} rounded transition-all`}
                            style={{
                              width: 
                                order.status === 'pending' ? '20%' :
                                order.status === 'confirmed' ? '40%' :
                                order.status === 'processing' ? '60%' :
                                order.status === 'shipped' ? '80%' :
                                order.status === 'delivered' ? '100%' :
                                order.status === 'cancelled' ? '0%' : '0%'
                            }}
                          />
                        </div>
                        <span className={order.status === 'delivered' ? status.color : 'text-gray-400'}>
                          Delivered
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackOrders;
