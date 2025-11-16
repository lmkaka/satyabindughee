import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Phone, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../App';

const Navbar = ({ onMenuClick, onLoginClick }) => {
  const { user, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-amber-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo Section - Compact on Mobile */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 bg-white">
                <img 
                  src="https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png" 
                  alt="SatyaBindu Ghee Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent whitespace-nowrap">
                SatyaBindu Ghee
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Pure & Natural</p>
            </div>
          </Link>

          {/* Search Bar - Desktop Only */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for ghee products..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Section - Responsive */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            
            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors relative group whitespace-nowrap">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors relative group whitespace-nowrap">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors relative group whitespace-nowrap">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Divider - Desktop Only */}
            <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

            {/* Call Button - Tablet & Desktop */}
            <motion.a 
              href="tel:+918603530133"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
            >
              <Phone size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              <span className="hidden md:inline">Call Now</span>
              <span className="md:hidden">Call</span>
            </motion.a>

            {/* Auth Section - Desktop Only (md:flex) */}
            {user ? (
              <>
                {/* User Profile - Desktop Only */}
                <div className="hidden md:flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 rounded-xl border-2 border-amber-200 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {user.user_metadata?.name || user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      {user.user_metadata?.phone || 'Member'}
                    </p>
                  </div>
                </div>

                {/* Logout Button - Desktop Only */}
                <motion.button
                  onClick={signOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all min-w-[120px]"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              /* Login Button - Desktop Only */
              <motion.button
                onClick={onLoginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all min-w-[120px]"
              >
                <User size={18} strokeWidth={2.5} />
                <span>Login</span>
              </motion.button>
            )}
            
            {/* Mobile Menu Button - Always Visible on Mobile */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 sm:p-2.5 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg sm:rounded-xl transition-all touch-manipulation"
            >
              <Menu size={22} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ❌ REMOVED: Mobile User Info Bar - No longer shows on mobile */}
    </motion.nav>
  );
};

export default Navbar;
