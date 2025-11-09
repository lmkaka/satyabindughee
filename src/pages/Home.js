import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Reviews from '../components/Reviews';
import { products } from '../data/products';
import { Truck, Shield, Award, Clock } from 'lucide-react';

const Home = () => {
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
