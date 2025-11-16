import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { supabase } from '../supabaseClient';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Reviews from '../components/Reviews';
import TrackOrders from '../components/TrackOrders';
import { Truck, Shield, Award, Clock, Package } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const [isTrackOrdersOpen, setIsTrackOrdersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Load products from Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Transform data safely
      const transformedProducts = (data || []).map(product => {
        try {
          return {
            id: product.id,
            name: product.name || 'Premium Ghee',
            weight: product.weight || '250gms',
            price: product.price || 0,
            originalPrice: product.original_price || product.price || 0,
            image: product.image_base64 || 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png',
            description: product.description || 'Premium quality pure ghee',
            discount: product.original_price ? 
              Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
          };
        } catch (err) {
          console.error('Error transforming product:', err);
          return null;
        }
      }).filter(Boolean); // Remove null values
      
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error in loadProducts:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Update constraints dynamically
  useEffect(() => {
    const updateConstraints = () => {
      setConstraints({
        top: 0,
        left: 0,
        right: window.innerWidth - 70,
        bottom: window.innerHeight - 70,
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const handleWhatsAppClick = () => {
    if (!isDragging) {
      window.open('https://wa.me/918603530133', '_blank');
    }
  };

  return (
    <div className="relative">
      {/* Logo Watermark Background */}
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

      {/* Draggable WhatsApp Button */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraints}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        onClick={handleWhatsAppClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className="relative">
          <div className="w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center shadow-2xl transition-colors">
            <svg viewBox="0 0 175.216 175.552" className="w-10 h-10 fill-white" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="whatsappGradient" x1="85.915" y1="32.567" x2="85.915" y2="137.092" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#57d163"/>
                  <stop offset="1" stopColor="#23b33a"/>
                </linearGradient>
              </defs>
              <path fill="#fff" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"/>
              <path fill="url(#whatsappGradient)" d="M87.184 29.164c30.843 0 55.936 25.068 55.949 55.88a55.88 55.88 0 0 1-16.735 39.867 55.88 55.88 0 0 1-39.194 16.27h-.018c-10.029-.005-19.909-2.694-28.651-7.806l-3.346-1.994-19.488 5.11 5.2-19.002-2.194-3.486c-5.805-9.224-8.872-19.868-8.863-30.798.011-30.843 25.11-55.91 55.954-55.91l.018.001z"/>
              <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
            </svg>
          </div>
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
            className="absolute inset-0 bg-[#25D366] rounded-full -z-10"
          />
        </div>
      </motion.div>

      {/* Track Orders Button */}
      {user && (
        <motion.button
          onClick={() => setIsTrackOrdersOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-28 right-6 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 text-sm transition-all"
        >
          <Package size={20} strokeWidth={2.5} />
          <span className="hidden sm:inline">Track Orders</span>
        </motion.button>
      )}

      <TrackOrders isOpen={isTrackOrdersOpen} onClose={() => setIsTrackOrdersOpen(false)} />

      {/* Main Content */}
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
              <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-4">Why Choose SBGhee?</h2>
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
              <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-4">Our Premium Products</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from our range of pure ghee products, available in different sizes to suit your needs
              </p>
              
              {!user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 inline-block bg-amber-50 border-2 border-amber-200 rounded-xl px-6 py-3"
                >
                  <p className="text-amber-800 font-medium">
                    🔒 <span className="font-semibold">Login</span> to place orders and enjoy faster checkout!
                  </p>
                </motion.div>
              )}
            </motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-semibold text-lg">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600">Products will appear here once added by admin.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} user={user} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Reviews />
      </div>
    </div>
  );
};

export default Home;
