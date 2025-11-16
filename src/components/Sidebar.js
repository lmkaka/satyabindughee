import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, Info, Phone, MapPin, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../App';

const Sidebar = ({ isOpen, onClose, onLoginClick }) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Info, label: 'About Us', path: '/about' },
    { icon: Phone, label: 'Contact', path: '/contact' },
  ];

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const handleLoginClick = () => {
    onClose(); // Close sidebar first
    if (onLoginClick) {
      onLoginClick(); // Open login modal
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - GPU Accelerated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            style={{
              willChange: 'opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
          
          {/* Sidebar - 60 FPS Optimized */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
              maxWidth: '85vw',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Header - Fixed (No Scroll) */}
            <div 
              className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-white"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  SBGhee
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Pure & Natural Ghee
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                aria-label="Close sidebar"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }}
              >
                <X size={20} className="text-gray-600" strokeWidth={2} />
              </motion.button>
            </div>

            {/* User Info Section - Only if Logged In */}
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 px-4 sm:px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100"
              >
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="User" 
                      className="w-12 h-12 rounded-full border-2 border-amber-300 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <User size={20} className="text-white" strokeWidth={2.5} />
                    </div>
                  )}
                  
                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {user.user_metadata?.name || user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {user.user_metadata?.phone || user.email || 'Member'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Scrollable Content Area */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden"
              style={{
                overflowScrolling: 'touch',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#f59e0b #fef3c7',
              }}
            >
              {/* Navigation */}
              <nav className="px-3 sm:px-4 py-4 sm:py-6">
                <ul className="space-y-1.5 sm:space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.05, 
                        duration: 0.2,
                        ease: 'easeOut'
                      }}
                      style={{
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)',
                      }}
                    >
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className="flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50/80 active:bg-orange-100 transition-colors duration-150 group touch-manipulation min-h-[48px]"
                        style={{
                          willChange: 'background-color',
                          transform: 'translateZ(0)',
                        }}
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-orange-100 group-active:bg-orange-200 transition-colors duration-150">
                          <item.icon 
                            size={18} 
                            className="text-gray-500 group-hover:text-orange-600 transition-colors duration-150" 
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className="font-medium text-[15px] sm:text-base">
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />

              {/* Info Section */}
              <div className="px-4 sm:px-5 py-3 sm:py-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" strokeWidth={2} />
                    <span className="leading-relaxed">Lalpur, Ranchi, Jharkhand</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Clock size={16} className="flex-shrink-0 text-gray-400" strokeWidth={2} />
                    <span>Mon - Sat, 9 AM - 7 PM</span>
                  </div>
                </div>
              </div>

              {/* User Address (if logged in and available) */}
              {user?.user_metadata?.address && (
                <div className="px-4 sm:px-5 pb-3">
                  <div className="px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase mb-1">
                      Delivery Address
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {user.user_metadata.address}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions - Fixed */}
            <div 
              className="flex-shrink-0 px-4 sm:px-5 pb-5 sm:pb-6 pt-3 space-y-2 bg-white border-t border-gray-100"
              style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              {user ? (
                /* Logout Button - If User Logged In */
                <motion.button
                  onClick={handleSignOut}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white font-semibold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-red-500/25 transition-all duration-150 touch-manipulation min-h-[48px]"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                  }}
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  <span className="text-[15px] sm:text-base">Logout</span>
                </motion.button>
              ) : (
                /* Login Button - If User NOT Logged In */
                <motion.button
                  onClick={handleLoginClick}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white font-semibold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-green-500/25 transition-all duration-150 touch-manipulation min-h-[48px]"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                  }}
                >
                  <User size={18} strokeWidth={2.5} />
                  <span className="text-[15px] sm:text-base">Login to Continue</span>
                </motion.button>
              )}

              {/* Call Button - Always Visible */}
              <motion.a
                href="tel:+918603530133"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-semibold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-150 touch-manipulation min-h-[48px]"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }}
              >
                <Phone size={18} strokeWidth={2.5} />
                <span className="text-[15px] sm:text-base">Call: +91 8603530133</span>
              </motion.a>
            </div>

            {/* Safe Area for iOS */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white flex-shrink-0" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
