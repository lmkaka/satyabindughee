import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Shield, Truck, ArrowRight, Play, ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import OrderForm from './OrderForm';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState([]);
  
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

  // ✅ COMPLETELY FIXED: Proper image preloading with caching
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = images.map((src, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          
          img.onload = () => {
            setLoadingProgress(Math.round(((index + 1) / images.length) * 100));
            resolve(img);
          };
          
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            setLoadingProgress(Math.round(((index + 1) / images.length) * 100));
            resolve(null);
          };
        });
      });

      try {
        const loadedImgs = await Promise.all(imagePromises);
        setPreloadedImages(loadedImgs.filter(img => img !== null));
        
        // Small delay to ensure smooth transition
        setTimeout(() => {
          setImagesLoaded(true);
        }, 200);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true);
      }
    };

    loadImages();
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
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
          {/* Carousel Section - FIXED PRELOADING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="relative h-[300px] sm:h-[380px] md:h-[480px] lg:h-[560px] xl:h-[640px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl shadow-xl overflow-hidden">
                {/* ✅ FIXED LOADING STATE - No white screen */}
                {!imagesLoaded && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100"
                  >
                    <div className="flex flex-col items-center gap-5 w-full max-w-md px-8">
                      {/* Animated Logo/Icon */}
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl"
                      >
                        <Sparkles className="text-white" size={36} strokeWidth={2.5} />
                      </motion.div>
                      
                      {/* Loading Text */}
                      <div className="text-center">
                        <motion.p 
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-orange-700 font-black text-xl sm:text-2xl mb-2"
                        >
                          Loading Premium Images...
                        </motion.p>
                        <p className="text-orange-600 text-lg font-bold mb-4">{loadingProgress}%</p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-orange-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${loadingProgress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>

                      {/* Loading Dots */}
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                            className="w-3 h-3 bg-orange-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ✅ Carousel Images - Using preloaded images */}
                {imagesLoaded && (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"
                    >
                      <img
                        src={images[currentSlide]}
                        alt={`Premium Ghee Product ${currentSlide + 1}`}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  disabled={!imagesLoaded}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 hover:bg-white rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={26} className="text-gray-800" strokeWidth={2.5} />
                </button>
                
                <button
                  onClick={nextSlide}
                  disabled={!imagesLoaded}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 hover:bg-white rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next slide"
                >
                  <ChevronRight size={26} className="text-gray-800" strokeWidth={2.5} />
                </button>

                {/* Pagination Dots */}
                {imagesLoaded && (
                  <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-full">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all rounded-full ${
                          index === currentSlide 
                            ? 'w-10 h-3 bg-white shadow-lg' 
                            : 'w-3 h-3 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Slide Counter */}
                {imagesLoaded && (
                  <div className="absolute top-4 sm:top-5 right-4 sm:right-5 bg-black/60 backdrop-blur-md text-white text-sm sm:text-base font-bold px-4 py-2 rounded-full z-10 shadow-lg">
                    {currentSlide + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 🔥 IMPROVED 100% REFUND GUARANTEE BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 sm:mb-12"
          >
            <div className="max-w-5xl mx-auto">
              {/* Outer Glow Container */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 10px 40px rgba(34, 197, 94, 0.2)',
                    '0 15px 60px rgba(34, 197, 94, 0.4)',
                    '0 10px 40px rgba(34, 197, 94, 0.2)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Gradient Border */}
                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-2xl p-[2px] shadow-2xl">
                  <div className="bg-white rounded-2xl p-5 sm:p-7 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden space-y-4">
                        {/* Icon + Title */}
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                          >
                            <Shield className="text-white" size={28} strokeWidth={2.5} fill="white" fillOpacity={0.3} />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 leading-tight">
                              100% Money-Back
                            </h3>
                            <p className="text-lg font-black text-gray-800">GUARANTEE</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                          <p className="text-sm font-bold text-red-700 text-center">
                            Full Refund if Proven Impure - No Questions Asked!
                          </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            { icon: CheckCircle, text: 'Lab Tested', color: 'green' },
                            { icon: CheckCircle, text: 'Certified', color: 'blue' },
                            { icon: CheckCircle, text: '2k+ Trust', color: 'orange' }
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-1.5 bg-${item.color}-50 px-3 py-2 rounded-full border-2 border-${item.color}-200 shadow-sm`}
                            >
                              <item.icon size={14} className={`text-${item.color}-600`} strokeWidth={3} />
                              <span className={`text-xs font-bold text-${item.color}-700`}>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between gap-6">
                        {/* Left: Icon + Text */}
                        <div className="flex items-center gap-5">
                          <motion.div
                            animate={{ 
                              rotate: [0, -5, 5, -5, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative"
                          >
                            <Shield className="text-white" size={36} strokeWidth={2.5} fill="white" fillOpacity={0.3} />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-green-400 rounded-2xl blur-md"
                            />
                          </motion.div>
                          
                          <div>
                            <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black mb-1">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                                100% Money-Back
                              </span>
                              <br />
                              <span className="text-gray-800">GUARANTEE</span>
                            </h3>
                            <div className="inline-flex items-center gap-2 bg-red-50 border-2 border-red-200 px-4 py-1.5 rounded-full mt-2">
                              <CheckCircle size={16} className="text-red-600" strokeWidth={3} />
                              <p className="text-sm font-bold text-red-700">
                                Full Refund if Proven Impure - No Questions Asked!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Trust Badges */}
                        <div className="flex flex-col gap-2.5 flex-shrink-0">
                          {[
                            { icon: CheckCircle, text: 'Lab Tested & Verified', color: 'green' },
                            { icon: CheckCircle, text: 'FSSAI Certified', color: 'blue' },
                            { icon: CheckCircle, text: '2,000+ Happy Customers', color: 'orange' }
                          ].map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              className={`flex items-center gap-2 bg-${item.color}-50 px-4 py-2 rounded-full border-2 border-${item.color}-200 shadow-md`}
                            >
                              <item.icon size={16} className={`text-${item.color}-600`} strokeWidth={3} />
                              <span className={`text-sm font-bold text-${item.color}-700 whitespace-nowrap`}>{item.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner Sparkles */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-3 -right-3 text-yellow-500"
                >
                  <Sparkles size={28} strokeWidth={2.5} />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-3 -left-3 text-green-500"
                >
                  <Sparkles size={24} strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
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
              
              {/* Feature Grid */}
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

              {/* CTA Buttons */}
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

            {/* Right Column - Product Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
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

              {/* Decorative Animated Elements */}
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

          {/* Stats Section */}
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

        {/* Custom Animations CSS */}
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

      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        product={heroProduct}
      />
    </>
  );
};

export default Hero;
