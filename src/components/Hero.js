import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Shield, Truck, ArrowRight, Play, ChevronLeft, ChevronRight, BadgeCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import OrderForm from './OrderForm';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  
  const images = [
    'https://radarofc.onrender.com/1.jpg',
    'https://radarofc.onrender.com/2.jpg',
    'https://radarofc.onrender.com/3.jpg',
    'https://radarofc.onrender.com/4.jpg',
    'https://radarofc.onrender.com/5.jpg',
    'https://radarofc.onrender.com/6.jpg',
    'https://radarofc.onrender.com/7.jpg',
  ];

  const heroProduct = {
    name: 'Premium Pure Ghee',
    weight: '250gms',
    price: 299,
    originalPrice: 349,
    image: 'https://radarofc.onrender.com/sb1.jpg',
    description: 'Pure and natural ghee made with traditional methods',
    inStock: true
  };

  const stats = [
    { number: '2k+', label: 'Happy Customers' },
    { number: '4.9★', label: 'Rating' },
    { number: '100%', label: 'Pure & Natural' },
    { number: '10+', label: 'Years Experience' }
  ];

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length, imagesLoaded]);

  const handleShopNow = () => {
    setIsOrderFormOpen(true);
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
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 min-h-screen">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
          {/* 🔥 PREMIUM 100% REFUND GUARANTEE BADGE - ULTRA EYE-CATCHING */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
            className="mb-6 sm:mb-10 relative"
          >
            {/* Animated Glow Effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 rounded-3xl blur-2xl opacity-50"
            />

            <div className="relative max-w-5xl mx-auto">
              {/* Main Card with Glass Morphism */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 10px 60px rgba(16, 185, 129, 0.3)',
                    '0 20px 80px rgba(16, 185, 129, 0.5)',
                    '0 10px 60px rgba(16, 185, 129, 0.3)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-3xl p-[3px] shadow-2xl">
                  <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl px-6 py-6 sm:px-10 sm:py-8 backdrop-blur-xl relative overflow-hidden">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                      <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Top Badge */}
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex justify-center mb-4"
                      >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-5 py-2 rounded-full text-xs sm:text-sm font-black shadow-lg">
                          <Sparkles size={16} className="animate-spin-slow" />
                          <span>RISK-FREE PURCHASE</span>
                          <Sparkles size={16} className="animate-spin-slow" />
                        </div>
                      </motion.div>

                      {/* Main Content Grid */}
                      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
                        {/* Shield Icon with Animation */}
                        <motion.div
                          animate={{ 
                            rotate: [0, -5, 5, -5, 0],
                            scale: [1, 1.05, 1, 1.05, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="flex-shrink-0"
                        >
                          <div className="relative">
                            {/* Pulsing Ring */}
                            <motion.div
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [0.7, 0, 0.7]
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                              className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg"
                            />
                            
                            {/* Main Shield */}
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                              <Shield className="text-white" size={48} strokeWidth={2.5} fill="white" />
                              
                              {/* Checkmark Badge */}
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                              >
                                <CheckCircle2 size={20} className="text-white" strokeWidth={3} />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Text Content */}
                        <div className="text-center lg:text-left flex-1">
                          {/* Main Heading */}
                          <motion.h2
                            animate={{ 
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-3 leading-tight"
                            style={{
                              background: 'linear-gradient(90deg, #059669, #10b981, #34d399, #10b981, #059669)',
                              backgroundSize: '200% auto',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            100% MONEY-BACK
                            <br />
                            <span className="text-green-700">GUARANTEE</span>
                          </motion.h2>

                          {/* Subheading */}
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-4">
                            <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full">
                              <BadgeCheck size={20} />
                              Full Refund if Proven Impure
                            </span>
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                            {[
                              { icon: CheckCircle2, text: 'No Questions Asked', color: 'green' },
                              { icon: CheckCircle2, text: 'Lab Tested', color: 'blue' },
                              { icon: CheckCircle2, text: 'FSSAI Certified', color: 'orange' }
                            ].map((item, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + idx * 0.15 }}
                                className={`flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border-2 border-${item.color}-200`}
                              >
                                <item.icon size={18} className={`text-${item.color}-600`} strokeWidth={2.5} />
                                <span className="font-bold text-gray-800 text-sm sm:text-base">{item.text}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Right Side Badge */}
                        <motion.div
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                          }}
                          className="hidden lg:block flex-shrink-0"
                        >
                          <div className="relative w-24 h-24">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-full animate-pulse shadow-2xl"></div>
                            <div className="absolute inset-1 bg-white rounded-full flex flex-col items-center justify-center">
                              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">100%</span>
                              <span className="text-xs font-bold text-gray-700">SAFE</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Bottom Trust Line */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-6 pt-5 border-t-2 border-green-200 text-center"
                      >
                        <p className="text-sm sm:text-base font-bold text-gray-700">
                          <span className="text-green-700">2,000+ Happy Customers</span> Trust Our Purity Promise
                        </p>
                      </motion.div>
                    </div>

                    {/* Decorative Sparkles */}
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute top-4 right-4 text-yellow-400"
                    >
                      <Sparkles size={24} />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        scale: [1, 1.3, 1]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute bottom-4 left-4 text-yellow-400"
                    >
                      <Sparkles size={20} />
                    </motion.div>
                  </div>
                </div>

                {/* Animated Corner Indicators */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-500 rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-500 rounded-full shadow-lg"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Carousel Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="relative h-[300px] sm:h-[380px] md:h-[480px] lg:h-[560px] xl:h-[640px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                {!imagesLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-orange-600 font-semibold">Loading Images...</p>
                    </div>
                  </div>
                )}

                {imagesLoaded && (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.32, 0.72, 0, 1]
                      }}
                      className="absolute inset-0"
                    >
                      <img
                        src={images[currentSlide]}
                        alt={`Ghee product ${currentSlide + 1}`}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </motion.div>
                  </AnimatePresence>
                )}

                <button
                  onClick={prevSlide}
                  disabled={!imagesLoaded}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} className="text-gray-800" />
                </button>
                
                <button
                  onClick={nextSlide}
                  disabled={!imagesLoaded}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} className="text-gray-800" />
                </button>

                {imagesLoaded && (
                  <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all rounded-full ${
                          index === currentSlide 
                            ? 'w-8 sm:w-10 h-2.5 bg-orange-500 shadow-lg' 
                            : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {imagesLoaded && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                    {currentSlide + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
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
                    loading="eager"
                  />
                  
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
                    onClick={() => setIsOrderFormOpen(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Quick Buy Now
                  </motion.button>
                </div>
              </motion.div>

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
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>
      </section>

      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        product={heroProduct}
      />
    </>
  );
};

export default Hero;
