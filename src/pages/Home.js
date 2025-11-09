import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Reviews from '../components/Reviews';
import { products } from '../data/products';
import { Truck, Shield, Award, Clock } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

const Home = () => {
  const [isDragging, setIsDragging] = useState(false);
  
  const features = [
    {
      icon: Shield,
      title: '100% Pure & Natural',
      description: 'Made from the finest quality milk with no artificial additives'
    },
    {
      icon: Award,
      title: 'FSSAI Certified',
      description: 'Quality certified by Food Safety and Standards Authority of India'
    },
    {
      icon: Truck,
      title: 'Superfast Delivery',
      description: 'Quick and safe delivery to your doorstep within the same day'
    },
    {
      icon: Clock,
      title: 'Traditional Method',
      description: 'Made using time-tested traditional methods for authentic taste'
    }
  ];

  const handleWhatsAppClick = () => {
    // Only open WhatsApp if not dragging
    if (!isDragging) {
      window.open('https://wa.me/918603530133', '_blank');
    }
  };

  return (
    <div className="relative">
      {/* ✅ Logo Watermark Background - Fixed Position */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png"
            alt="SBGhee Watermark"
            className="w-[600px] h-[600px] opacity-5 object-contain"
            style={{ 
              mixBlendMode: 'multiply',
              filter: 'grayscale(100%)'
            }}
          />
        </div>
      </div>

      {/* ✅ Draggable Floating WhatsApp Button */}
      <motion.div
        drag
        dragMomemtum={false}
        dragElastic={0}
        dragConstraints={{
          top: 0,
          left: 0,
          right: window.innerWidth - 70,
          bottom: window.innerHeight - 70,
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        onClick={handleWhatsAppClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className="relative">
          {/* WhatsApp Button */}
          <div className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl transition-colors">
            <svg
              viewBox="0 0 32 32"
              className="w-10 h-10 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-5.247 1.408 1.417-5.267-0.315-0.533c-1.318-2.204-2.011-4.695-2.011-7.245 0-7.72 6.28-14 14-14s14 6.28 14 14-6.28 14-14 14zM21.803 18.56c-0.213-0.107-1.265-0.623-1.46-0.695s-0.338-0.107-0.481 0.107c-0.142 0.213-0.551 0.695-0.676 0.838s-0.249 0.16-0.462 0.053c-0.213-0.107-0.899-0.331-1.713-1.057-0.633-0.565-1.061-1.263-1.185-1.476s-0.013-0.329 0.094-0.436c0.096-0.095 0.213-0.249 0.32-0.374s0.142-0.213 0.213-0.356c0.071-0.142 0.036-0.267-0.018-0.374s-0.481-1.16-0.659-1.587c-0.174-0.418-0.351-0.361-0.481-0.368-0.124-0.006-0.267-0.008-0.409-0.008s-0.374 0.053-0.57 0.267c-0.196 0.213-0.748 0.731-0.748 1.782s0.765 2.067 0.872 2.209c0.107 0.142 1.508 2.304 3.655 3.229 0.511 0.221 0.91 0.353 1.22 0.451 0.513 0.163 0.98 0.14 1.349 0.085 0.411-0.061 1.265-0.518 1.444-1.018s0.178-0.929 0.125-1.018c-0.053-0.089-0.196-0.142-0.409-0.249z" />
            </svg>
          </div>
          
          {/* Pulse Animation Ring */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1.3, 1],
              opacity: [0.7, 0, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-green-400 rounded-full -z-10"
          />
        </div>
      </motion.div>

      {/* Main Content - Relative to watermark */}
      <div className="relative z-10">
        <Hero />
        
        {/* Features Section */}
        <section className="py-16 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
                Why Choose SBGhee?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the difference with our premium quality ghee, made with love and tradition
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 gradient-bg relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
                Our Premium Products
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from our range of pure ghee products, available in different sizes to suit your needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ Reviews Section - Integrated */}
        <Reviews />
      </div>
    </div>
  );
};

export default Home;
