import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import OrderForm from './OrderForm';

const ProductCard = ({ product }) => {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  
  // ✅ Decode Base64 image with memoization
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

  // ✅ Calculate discount safely
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
          
          {/* ✅ DISCOUNT BADGE - Always visible if discount > 0 */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
              🔥 {discount}% OFF
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-playfair font-semibold text-xl mb-2">{name}</h3>
          <p className="text-2xl font-bold text-primary-600 mb-4">{weight}</p>
          
          <p className="text-gray-600 text-sm mb-4">{description}</p>

          {/* Benefits Section */}
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

          {/* ✅ PRICE SECTION - Clearly shows both prices */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-gray-900">₹{price}</span>
              {original_price > price && (
                <>
                  <span className="text-lg text-gray-400 line-through font-semibold">₹{original_price}</span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    Save ₹{original_price - price}
                  </span>
                </>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
              
              {/* Show discount percentage again near price */}
              {discount > 0 && (
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
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
