import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import OrderForm from './OrderForm';

const ProductCard = ({ product }) => {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  
  // ✅ MOVE ALL HOOKS BEFORE ANY EARLY RETURN
  
  // ✅ Decode Base64 image with memoization
  const decodedImage = useMemo(() => {
    if (!product) return 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png';
    
    let imageUrl = product.image_base64 || product.image;
    
    // If no image, use fallback
    if (!imageUrl) {
      return 'https://radarofc.onrender.com/IMG_20251106_204751_845-modified.png';
    }
    
    // If already has data:image prefix, return as is
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    // If it's a regular URL (http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Otherwise, assume it's Base64 without prefix - add it
    return `data:image/jpeg;base64,${imageUrl}`;
  }, [product]);

  // ✅ Calculate discount safely
  const discount = useMemo(() => {
    if (!product || !product.original_price || !product.price) return 0;
    if (product.original_price <= product.price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }, [product]);

  // ✅ NOW check for null product AFTER all hooks
  if (!product) {
    return null;
  }

  // ✅ Safe destructure with defaults
  const {
    id,
    name = 'Premium Ghee',
    weight = '250gms',
    price = 0,
    original_price = 0,
    description = 'Premium quality pure ghee made from cow milk',
    benefits = [],
    is_active = true
  } = product;

  const inStock = is_active !== false;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden card-hover"
      >
        {/* Image Container with Base64 Decode */}
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
            <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-playfair font-semibold text-xl mb-2">{name}</h3>
          <p className="text-2xl font-bold text-primary-600 mb-4">{weight}</p>
          
          <p className="text-gray-600 text-sm mb-4">{description}</p>

          {/* Benefits Section - Safe */}
          {benefits && benefits.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Benefits:</h4>
              <div className="flex flex-wrap gap-2">
                {benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                  >
                    <Check size={12} />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">₹{price}</span>
              {original_price > price && (
                <span className="text-lg text-gray-500 line-through">₹{original_price}</span>
              )}
            </div>
            <span className={`text-sm font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOrderFormOpen(true)}
            disabled={!inStock}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            Order Now
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
