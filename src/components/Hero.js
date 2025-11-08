import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Shield, Truck, ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const images = [
    'https://radarofc.onrender.com/1.jpg',
    'https://radarofc.onrender.com/2.jpg',
    'https://radarofc.onrender.com/3.jpg',
    'https://radarofc.onrender.com/4.jpg',
    'https://radarofc.onrender.com/5.jpg',
    'https://radarofc.onrender.com/6.jpg',
    'https://radarofc.onrender.com/7.jpg',
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '4.9★', label: 'Rating' },
    { number: '100%', label: 'Pure & Natural' },
    { number: '10+', label: 'Years Experience' }
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleShopNow = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const handleWatchStory = () => {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 min-h-screen">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
        {/* Image Carousel - Moved to Top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Carousel Container */}
            <div className="relative h-[180px] sm:h-[220px] md:h-[260px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ 
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1]
                  }}
                  className="absolute inset-0"
                >
                  <img
                    src={images[currentSlide]}
                    alt={`Ghee product ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} className="text-gray-800" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-10"
                aria-label="Next slide"
              >
                <ChevronRight size={20} className="text-gray-800" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all rounded-full ${
                      index === currentSlide 
                        ? 'w-8 h-2 bg-orange-500' 
                        : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
                {currentSlide + 1} / {images.length}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Badge - Moved closer to title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-5 shadow-lg"
            >
              <Award size={16} />
              #1 Premium Ghee Brand in Ranchi
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-5">
              <span className="block text-gray-900">Premium</span>
              <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Pure Ghee
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed max-w-xl">
              Experience the authentic taste of traditional ghee made with love using 
              <strong className="text-orange-600 font-semibold"> time-honored methods</strong> passed down through generations.
            </p>
            
            {/* Features - Compact Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-7">
              {[
                { icon: Shield, text: '100% Pure' },
                { icon: Award, text: 'FSSAI Certified' },
                { icon: Truck, text: 'Free Delivery' },
                { icon: Star, text: '4.9★ Rating' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-sm"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="text-orange-600" size={18} strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShopNow}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2.5 group"
              >
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWatchStory}
                className="border-2 border-orange-500 text-orange-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2.5 bg-white/50 backdrop-blur-sm"
              >
                <Play size={20} strokeWidth={2.5} />
                Watch Story
              </motion.button>
            </div>
          </motion.div>

          {/* Right Content - Product Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-5 sm:p-6 relative z-10"
            >
              <div className="relative w-full h-[380px] sm:h-[420px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-5">
                <img
                  src="https://radarofc.onrender.com/sb1.jpg"
                  alt="Premium SBGhee Jar"
                  className="w-full h-full object-contain p-4"
                />
                
                {/* Badge on Product */}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  BESTSELLER
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Premium Pure Ghee</h3>
                <div className="flex items-center justify-center gap-2 text-gray-600 font-medium mb-3">
                  <span className="text-sm">250 grams</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm">4.9</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                  <span className="text-3xl font-bold text-gray-900">₹299</span>
                  <span className="text-lg text-gray-500 line-through">₹349</span>
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                    SAVE 15%
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShopNow}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Quick Buy Now
                </motion.button>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 blur-xl"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-20 blur-xl"
            />
          </motion.div>
        </div>

        {/* Stats Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <div className="text-gray-700 font-medium text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

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
    </section>
  );
};

export default Hero;
