import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Shield, Award, Sparkles } from 'lucide-react';
import OrderForm from './OrderForm';

const ProductCard = ({ product }) => {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  
  // ✅ Default benefits if none provided
  const defaultBenefits = [
    '100% Pure',
    'No Preservatives',
    'Natural',
    'Traditional Method'
  ];
  
  // ✅ Decode Base64 image
  const decodedImage = useMemo(() => {
    if (!product) return 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png';
    
    let imageUrl = product.image_base64 || product.image;
    
    if (!imageUrl) {
      return 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png';
    }
    
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return `data:image/jpeg;base64,${imageUrl}`;
  }, [product]);

  // ✅ Calculate discount
  const discount = useMemo(() => {
    if (!product || !product.original_price || !product.price) return 0;
    if (product.original_price <= product.price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }, [product]);

  if (!product) {
    return null;
  }

  const {
    id,
    name = 'Premium Ghee',
    weight = '250gms',
    price = 0,
    original_price = 0,
    description = 'Premium quality pure ghee made from cow milk',
    benefits = defaultBenefits, // ✅ Use default if not provided
    is_active = true
  } = product;

  const inStock = is_active !== false;
  
  // ✅ Use product benefits or default
  const displayBenefits = (benefits && benefits.length > 0) ? benefits : defaultBenefits;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden card-hover"
      >
        {/* Image Container */}
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2">
            <img
              src={decodedImage}
              alt={`${name} ${weight}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              onError={(e) => {
                console.log('Image failed to load, using fallback');
                e.target.src = 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png';
              }}
            />
          </div>
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
              🔥 {discount}% OFF
            </div>
          )}
          
          {/* ✅ Quality Badges on Image */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg" title="100% Pure">
              <Shield size={16} strokeWidth={2.5} />
            </div>
            <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg" title="Premium Quality">
              <Award size={16} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-playfair font-semibold text-xl mb-2">{name}</h3>
          <p className="text-2xl font-bold text-primary-600 mb-3">{weight}</p>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

          {/* ✅ BENEFITS BADGES - Always Visible */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <Sparkles size={14} className="text-amber-500" />
              <h4 className="font-bold text-xs text-gray-700 uppercase">Key Features</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayBenefits.slice(0, 4).map((benefit, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 px-2.5 py-1 rounded-full border border-green-200 font-semibold"
                >
                  <Check size={11} strokeWidth={3} />
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border-2 border-orange-200">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-gray-900">₹{price}</span>
              {original_price > price && (
                <>
                  <span className="text-base text-gray-400 line-through font-semibold">₹{original_price}</span>
                  <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
                    Save ₹{original_price - price}
                  </span>
                </>
              )}
            </div>
            
            {/* Stock & Discount Status */}
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                {inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
              
              {discount > 0 && (
                <span className="text-xs font-black text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-300">
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOrderFormOpen(true)}
            disabled={!inStock}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            <span className="font-bold">Order Now</span>
          </motion.button>
        </div>
      </motion.div>

      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        product={{
          ...product,
          image: decodedImage,
          price: price,
          originalPrice: original_price,
          inStock: inStock
        }}
      />
    </>
  );
};

export default ProductCard;
