import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, Info, Phone, MapPin, Clock } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Info, label: 'About Us', path: '/about' },
    { icon: Phone, label: 'Contact', path: '/contact' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Optimized for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />
          
          {/* Sidebar - Fully Responsive */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'tween', 
              duration: 0.3, 
              ease: [0.32, 0.72, 0, 1] // Custom easing for smooth feel
            }}
            className="fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 flex flex-col"
            style={{
              maxWidth: '85vw', // Prevents sidebar from being too wide on small screens
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Header - Clean & Minimal */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
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
              >
                <X size={20} className="text-gray-600" strokeWidth={2} />
              </motion.button>
            </div>

            {/* Navigation - Touch Optimized */}
            <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
              <ul className="space-y-1.5 sm:space-y-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.06, 
                      duration: 0.25,
                      ease: 'easeOut'
                    }}
                  >
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50/80 active:bg-orange-100 transition-all duration-200 group touch-manipulation min-h-[48px]"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-orange-100 group-active:bg-orange-200 transition-colors">
                        <item.icon 
                          size={18} 
                          className="text-gray-500 group-hover:text-orange-600 transition-colors" 
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

            {/* Info Section - Responsive */}
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

            {/* CTA Button - Touch Optimized */}
            <div className="px-4 sm:px-5 pb-5 sm:pb-6 pt-2">
              <motion.a
                href="tel:+918603530133"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-semibold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 touch-manipulation min-h-[48px]"
              >
                <Phone size={18} strokeWidth={2.5} />
                <span className="text-[15px] sm:text-base">Call: +91 8603530133</span>
              </motion.a>
            </div>

            {/* Safe Area for iOS devices */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
