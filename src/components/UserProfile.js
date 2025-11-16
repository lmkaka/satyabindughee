import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const UserProfile = ({ user, onProfileComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: user.phone || '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

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
          // Using OpenStreetMap's Nominatim API (free, no API key needed)
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

    try {
      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
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
          name: formData.name,
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
          Tell us a bit about yourself
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

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
              placeholder="Enter your delivery address"
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
