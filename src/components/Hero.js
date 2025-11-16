import React, { useState, useEffect, memo, useCallback } from 'react';
import { Star, Award, Shield, Truck, ArrowRight, Play, ChevronLeft, ChevronRight, BadgeCheck, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../App'; // Import useAuth hook
import OrderForm from './OrderForm';

// ✅ Memoized Slide Component
const Slide = memo(({ src, alt }) => (
  <div className="absolute inset-0">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
    />
  </div>
));

Slide.displayName = 'Slide';

const Hero = () => {
  const { user } = useAuth(); // Get logged-in user
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
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

  // Get user info from profiles or metadata
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
  const userPhone = user?.user_metadata?.phone || '';
  const userAddress = user?.user_metadata?.address || '';

  // ✅ Optimized Image Preloading
  useEffect(() => {
    const loadImages = async () => {
      let loaded = 0;
      const promises = images.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loaded++;
            setLoadingProgress(Math.round((loaded / images.length) * 100));
            resolve();
          };
          img.onerror = () => {
            loaded++;
            setLoadingProgress(Math.round((loaded / images.length) * 100));
            resolve();
          };
        });
      });

      await Promise.all(promises);
      setTimeout(() => setImagesLoaded(true), 100);
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

  const handleShopNow = useCallback(() => {
    setIsOrderFormOpen(true);
  }, []);

  const handleWatchStory = useCallback(() => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-10 w-72 h-72 bg-amber-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-red-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-12 sm:pb-16">
          
     {/* 🔥 PREMIUM BLINKIT-STYLE USER HEADER - Only if logged in */}
{user && (userName || userPhone || userAddress) && (
  <div className="mb-6 animate-slideDown">
    {/* Main Container - Gradient Background */}
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-white/10 backdrop-blur-xl p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* User Avatar - Large & Prominent */}
          <div className="flex-shrink-0 relative">
            {user.user_metadata?.avatar_url ? (
              <div className="relative">
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="User" 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white/30 shadow-2xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <User className="text-white" size={32} strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* User Info - Rich Content */}
          <div className="flex-1 min-w-0">
            {/* Welcome Text - Large & Bold */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Hey, {userName || 'There'}! 👋
                </h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Ready to order premium ghee
              </p>
            </div>

            {/* Info Cards - Compact & Modern */}
            <div className="space-y-2">
              {/* Phone Number Card */}
              {userPhone && (
                <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/30">
                  <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-white" size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Contact</p>
                    <p className="text-white text-sm font-black">+91 {userPhone}</p>
                  </div>
                </div>
              )}

              {/* Delivery Address Card */}
              {userAddress && (
                <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/30">
                  <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white" size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Delivering to</p>
                    <p className="text-white text-sm font-black line-clamp-1">
                      {userAddress.length > 40 ? userAddress.substring(0, 40) + '...' : userAddress}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-bold transition-all">
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-xs font-bold">Account Active</span>
            </div>
            <div className="h-4 w-px bg-white/30"></div>
            <span className="text-white/70 text-xs font-semibold">Premium Member</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                <Star className="text-yellow-800" size={12} fill="currentColor" />
              </div>
              <div className="w-7 h-7 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <Shield className="text-green-800" size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions - Below Main Card */}
    <div className="grid grid-cols-3 gap-2 mt-3">
      <button className="bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all group">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <Truck className="text-white" size={18} strokeWidth={2.5} />
        </div>
        <p className="text-xs font-black text-gray-800">Track Order</p>
      </button>
      
      <button className="bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all group">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <Star className="text-white" size={18} strokeWidth={2.5} />
        </div>
        <p className="text-xs font-black text-gray-800">Rewards</p>
      </button>
      
      <button className="bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all group">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <Award className="text-white" size={18} strokeWidth={2.5} />
        </div>
        <p className="text-xs font-black text-gray-800">Offers</p>
      </button>
    </div>
  </div>
)}


          {/* Carousel Section */}
          <div className="mb-6 sm:mb-10">
            <div className="relative max-w-5xl mx-auto">
              <div className="relative h-[280px] sm:h-[360px] md:h-[450px] lg:h-[520px] xl:h-[600px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl shadow-xl overflow-hidden">
                {!imagesLoaded ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
                    <div className="flex flex-col items-center gap-4 w-full max-w-sm px-6">
                      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-center">
                        <p className="text-orange-700 font-bold text-lg mb-1">Loading Images...</p>
                        <p className="text-orange-600 text-base font-semibold">{loadingProgress}%</p>
                      </div>
                      <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Slide src={images[currentSlide]} alt={`Premium Ghee ${currentSlide + 1}`} />
                )}

                {/* Navigation */}
                <button
                  onClick={prevSlide}
                  disabled={!imagesLoaded}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white rounded-full shadow-xl flex items-center justify-center transition-all z-10 disabled:opacity-50"
                >
                  <ChevronLeft size={24} className="text-gray-800" strokeWidth={2.5} />
                </button>
                
                <button
                  onClick={nextSlide}
                  disabled={!imagesLoaded}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white rounded-full shadow-xl flex items-center justify-center transition-all z-10 disabled:opacity-50"
                >
                  <ChevronRight size={24} className="text-gray-800" strokeWidth={2.5} />
                </button>

                {imagesLoaded && (
                  <>
                    <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`transition-all rounded-full ${
                            index === currentSlide 
                              ? 'w-8 h-2.5 bg-white' 
                              : 'w-2.5 h-2.5 bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full z-10">
                      {currentSlide + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Guarantee Section */}
          <div className="mb-6 sm:mb-10">
            <div className="max-w-5xl mx-auto">
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-2xl"></div>
                </div>

                <div className="relative p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                          <Shield className="text-green-600" size={28} strokeWidth={2.5} />
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-xs font-black px-1.5 py-0.5 rounded-full shadow text-green-900">
                            100%
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-black text-white mb-1 leading-tight">
                          Money-Back Guarantee
                        </h3>
                        <p className="text-white/95 text-xs sm:text-sm font-semibold leading-snug">
                          <span className="text-yellow-300">Full refund</span> if proven impure. No questions asked.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-center sm:gap-4">
                      {[
                        { icon: BadgeCheck, text: 'Lab Tested' },
                        { icon: Shield, text: 'FSSAI Certified' }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2.5 flex items-center gap-2 sm:min-w-[160px] sm:flex-col sm:text-center sm:py-4"
                        >
                          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <item.icon className="text-white" size={14} strokeWidth={2.5} />
                          </div>
                          <p className="text-white font-bold text-xs sm:text-sm">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsOrderFormOpen(true)}
                      className="w-full bg-white text-green-600 py-3 sm:py-3.5 rounded-xl font-black text-sm sm:text-base hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      Order with Confidence
                      <ArrowRight size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <Truck className="text-white" size={12} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black text-blue-900 text-xs">Free Delivery</h4>
                  </div>
                  <p className="text-blue-700 text-[10px] font-semibold">
                    Same-day in Ranchi
                  </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <Award className="text-white" size={12} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black text-orange-900 text-xs">Premium Quality</h4>
                  </div>
                  <p className="text-orange-700 text-[10px] font-semibold">
                    Traditional methods
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                <Award size={16} />
                #1 Premium Ghee Brand in Ranchi
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span className="block text-gray-900">Premium</span>
                <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Pure Ghee
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed max-w-xl">
                Experience the authentic taste of traditional ghee made with love using 
                <strong className="text-orange-600 font-semibold"> time-honored methods</strong> passed down through generations.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Shield, text: '100% Pure' },
                  { icon: Award, text: 'FSSAI Certified' },
                  { icon: Truck, text: 'Free Delivery' },
                  { icon: Star, text: '4.9★ Rating' }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-sm"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="text-orange-600" size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleShopNow}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center gap-2 group"
                >
                  Shop Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>
                
                <button
                  onClick={handleWatchStory}
                  className="border-2 border-orange-500 text-orange-600 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-base hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-2 bg-white/50"
                >
                  <Play size={20} strokeWidth={2.5} />
                  Watch Story
                </button>
              </div>
            </div>

            {/* Right Column - Product Card */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-5 sm:p-6">
                <div className="relative w-full h-[350px] sm:h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4">
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
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                      SAVE 15%
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setIsOrderFormOpen(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:shadow-xl transition-shadow"
                  >
                    Quick Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-gray-200">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
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
