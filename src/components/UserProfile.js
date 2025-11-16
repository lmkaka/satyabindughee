import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const UserProfile = ({ user, onProfileComplete }) => {
  const [formData, setFormData] = useState({
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Google already provides name and email
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
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
          // Using OpenStreetMap's Nominatim API (free)
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
      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          phone: formData.phone,
          address: formData.address,
          profile_completed: true
        }
      });

      if (updateError) throw updateError;

      // Optionally, store in a separate profiles table
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: userName,
          email: userEmail,
          phone: formData.phone,
          address: formData.address,
          created_at: new Date().toISOString()
        });

      if (insertError) console.log('Profile table error:', insertError);

      onProfileComplete();
    } catch (error) {
      alert('Error saving profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-amber-800 mb-2 text-center">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Add your contact details for order delivery
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Google Info (Read-only) */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
            <div className="flex items-center gap-3 mb-2">
              {userAvatar && (
                <img 
                  src={userAvatar} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{userName}</p>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
            <p className="text-xs text-amber-700">
              ✓ Info from your Google account
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-3 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-gray-700 font-medium">+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength="10"
                pattern="[0-9]{10}"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="9876543210"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter 10-digit mobile number (for order updates)
            </p>
          </div>

          {/* Address Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Delivery Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="House no., Street, Area, City, State, PIN"
            />
            
            <button
              type="button"
              onClick={getLocationAddress}
              disabled={gettingLocation}
              className="mt-2 flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              📍 {gettingLocation ? 'Getting location...' : 'Use my current location'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to SB Ghee'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
