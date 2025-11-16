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
        <div className="flex justify-between items-center h-20">
          
          {/* Logo with Image */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Logo */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 bg-white">
                <img 
                  src="https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png" 
                  alt="SatyaBindu Ghee Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Active Indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                SatyaBindu Ghee
              </h1>
              <p className="text-xs text-gray-500 font-medium">Pure & Natural</p>
            </div>
          </Link>

          {/* Search Bar - Modern */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for ghee products..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Navigation Links - Modern */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-amber-600 font-medium transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-amber-600 font-medium transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-amber-600 font-medium transition-colors relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Actions - Modern with Auth */}
          <div className="flex items-center space-x-3">
            {/* Call Button */}
            <motion.a 
              href="tel:+918603530133"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Phone size={18} />
              Call Now
            </motion.a>

            {/* Auth Section */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {/* User Info */}
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                  <User size={18} className="text-amber-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none">
                      {user.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <motion.button
                  onClick={signOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={onLoginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <User size={18} />
                Login
              </motion.button>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile User Info Bar */}
      {user && (
        <div className="md:hidden bg-amber-50 border-t border-amber-100 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={16} className="text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user.user_metadata?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user.phone}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
