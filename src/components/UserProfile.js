import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocationAddress = async () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
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
          if (data?.display_name) {
            setFormData({ ...formData, address: data.display_name });
          }
        } catch (error) {
          alert('Could not fetch address');
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        alert('Location access denied');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert('Enter valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          email: userEmail,
          phone: formData.phone,
          address: formData.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          profile_completed: true
        }
      });

      onProfileComplete();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[95vh] overflow-y-auto"
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {userAvatar && (
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-white">Complete Profile</h2>
              <p className="text-xs text-amber-50">Quick setup</p>
            </div>
          </div>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Email - Compact */}
          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <p className="text-[10px] font-bold text-amber-800 uppercase">Email</p>
            <p className="text-xs font-semibold text-gray-800 truncate">{userEmail}</p>
          </div>

          {/* Name - Compact */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Phone - Compact */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-2.5 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50">
                <span className="text-xs font-bold text-gray-700">+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength="10"
                pattern="[0-9]{10}"
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Address - Compact */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Delivery Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="2"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm"
              placeholder="Full address with PIN"
            />
            
            {/* Location Button - Ultra Compact */}
            <button
              type="button"
              onClick={getLocationAddress}
              disabled={gettingLocation}
              className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition border border-blue-200 disabled:opacity-50"
            >
              {gettingLocation ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Getting...</span>
                </>
              ) : (
                <>
                  <MapPin size={14} strokeWidth={2.5} />
                  <span>Use Current Location</span>
                </>
              )}
            </button>
          </div>

          {/* Submit - Compact */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              'Continue 🥛'
            )}
          </button>

          {/* Footer Text - Compact */}
          <p className="text-[10px] text-gray-500 text-center">
            Required for order delivery
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default UserProfile;
