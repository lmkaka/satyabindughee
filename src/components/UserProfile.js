import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const UserProfile = ({ user, onProfileComplete }) => {
  const [formData, setFormData] = useState({
    name: user.user_metadata?.full_name || user.user_metadata?.name || '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const userEmail = user.email;
  const userAvatar = user.user_metadata?.avatar_url;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Get address from geolocation
  const getLocationAddress = async () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData({
              ...formData,
              address: data.display_name
            });
          }
        } catch (error) {
          console.error('Error getting address:', error);
          alert('Could not fetch address. Please enter manually.');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your location. Please enter address manually.');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      // Save to profiles table (PRIMARY STORAGE)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          email: userEmail,
          phone: formData.phone,
          address: formData.address,
          avatar_url: userAvatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Update auth metadata (for quick access)
      await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          profile_completed: true
        }
      });

      console.log('✅ Profile saved to database successfully!');
      onProfileComplete();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 p-6 sm:p-8 rounded-t-3xl">
          <div className="flex items-center gap-4 mb-3">
            {userAvatar && (
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome! 👋
              </h2>
              <p className="text-amber-50 text-sm sm:text-base">
                Let's set up your profile
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Email Display (Read-only) */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-1">📧 Email</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{userEmail}</p>
          </div>

          {/* Name Input (Editable) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-base"
              placeholder="Enter your full name"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              You can change this if needed
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 min-w-[70px]">
                <span className="text-gray-700 font-semibold text-base">+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength="10"
                pattern="[0-9]{10}"
                className="flex-1 px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-base"
                placeholder="9876543210"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              For order updates & delivery
            </p>
          </div>

          {/* Address Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Delivery Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition resize-none text-base"
              placeholder="House no., Street, Area, City, State, PIN"
            />
            
            <button
              type="button"
              onClick={getLocationAddress}
              disabled={gettingLocation}
              className="mt-3 flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm active:scale-95 transition"
            >
              📍 {gettingLocation ? 'Getting location...' : 'Use my current location'}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Continue to SB Ghee 🥛'
            )}
          </motion.button>

          <p className="text-xs text-gray-500 text-center">
            This information helps us deliver your orders
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default UserProfile;
