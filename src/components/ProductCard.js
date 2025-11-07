import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react'; // ❌ Removed Star, Heart
import OrderForm from './OrderForm';

const ProductCard = ({ product }) => {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden card-hover"
      >
        {/* ✅ FIXED IMAGE CONTAINER - Full Display Without Cutoff */}
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2">
            <img
              src={product.image}
              alt={`${product.name} ${product.weight}`}
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
                console.log('Product image failed to load, using fallback...');
                e.target.outerHTML = `
                  <div class="w-full h-60 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                    <div class="text-center">
                      <div class="w-32 h-40 mx-auto mb-4 bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-600 rounded-2xl shadow-xl relative overflow-hidden border-2 border-amber-300">
                        <div class="absolute top-0 left-2 right-2 h-6 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-lg shadow-md"></div>
                        <div class="absolute bottom-2 left-2 right-2 top-8 bg-gradient-to-b from-amber-300/90 to-orange-400/90 rounded-xl shadow-inner"></div>
                        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                        <div class="absolute bottom-6 left-2 right-2 h-12 bg-white/15 rounded-md flex items-center justify-center">
                          <div class="text-white font-bold text-xs">SB Ghee</div>
                        </div>
                      </div>
                      <h4 class="text-lg font-bold text-amber-800">${product.name || 'Premium Ghee'}</h4>
                    </div>
                  </div>
                `;
              }}
            />
          </div>
          
          {/* ✅ Only Discount Badge - NO Heart Button */}
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            {discount}% OFF
          </div>
          {/* ❌ REMOVED Heart Button */}
        </div>

        <div className="p-6">
          <h3 className="font-playfair font-semibold text-xl mb-2">{product.name}</h3>
          <p className="text-2xl font-bold text-primary-600 mb-4">{product.weight}</p>
          
          {/* ❌ REMOVED Reviews & Stars Section */}
          
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Benefits:</h4>
            <div className="flex flex-wrap gap-2">
              {product.benefits.map((benefit, index) => (
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

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOrderFormOpen(true)}
            disabled={!product.inStock}
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
        product={product}
      />
    </>
  );
};

export default ProductCard;
