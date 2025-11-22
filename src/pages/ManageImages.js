// src/pages/ManageImages.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, X, Image as ImageIcon, Save, Trash2, Eye, EyeOff, 
  ArrowUp, ArrowDown, Home, RefreshCw, CheckCircle, AlertCircle 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ManageImages = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // Fetch images from database
  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('image_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      showNotification('error', 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Convert file to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle multiple file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('error', `${file.name} is not an image`);
        continue;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showNotification('error', `${file.name} is larger than 2MB`);
        continue;
      }

      try {
        const base64 = await convertToBase64(file);
        validFiles.push(file);
        validPreviews.push(base64);
      } catch (error) {
        console.error('Error converting image:', error);
      }
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setPreviewUrls([...previewUrls, ...validPreviews]);
  };

  // Remove preview
  const removePreview = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  // Upload all selected images
  const handleUploadAll = async () => {
    if (previewUrls.length === 0) {
      showNotification('error', 'Please select images first');
      return;
    }

    setUploading(true);
    try {
      const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.image_order)) + 1 : 0;

      const insertData = previewUrls.map((base64, index) => ({
        image_data: base64,
        image_name: selectedFiles[index].name,
        image_order: nextOrder + index,
        is_active: true
      }));

      const { error } = await supabase
        .from('hero_images')
        .insert(insertData);

      if (error) throw error;

      showNotification('success', `${insertData.length} image(s) uploaded! ✅`);
      setSelectedFiles([]);
      setPreviewUrls([]);
      fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      showNotification('error', 'Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Toggle image active status
  const toggleImageStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('hero_images')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      showNotification('success', currentStatus ? 'Image hidden' : 'Image activated');
      fetchImages();
    } catch (error) {
      showNotification('error', 'Failed to update status');
    }
  };

  // Delete image
  const deleteImage = async (id) => {
    if (!window.confirm('Delete this image permanently?')) return;

    try {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showNotification('success', 'Image deleted');
      fetchImages();
    } catch (error) {
      showNotification('error', 'Failed to delete');
    }
  };

  // Change image order
  const changeOrder = async (id, currentOrder, direction) => {
    const targetImage = images.find(img => img.id === id);
    const targetIndex = images.findIndex(img => img.id === id);
    
    let swapIndex;
    if (direction === 'up') {
      swapIndex = targetIndex - 1;
    } else {
      swapIndex = targetIndex + 1;
    }

    if (swapIndex < 0 || swapIndex >= images.length) return;

    const swapImage = images[swapIndex];

    try {
      // Swap orders
      await supabase
        .from('hero_images')
        .update({ image_order: swapImage.image_order })
        .eq('id', targetImage.id);

      await supabase
        .from('hero_images')
        .update({ image_order: targetImage.image_order })
        .eq('id', swapImage.id);

      fetchImages();
    } catch (error) {
      showNotification('error', 'Failed to reorder');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideDown ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                🖼️ Hero Image Manager
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Upload and manage carousel images
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchImages}
                className="p-2.5 sm:p-3 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-700 rounded-xl transition touch-manipulation"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => navigate('/')}
                className="p-2.5 sm:p-3 bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-700 rounded-xl transition touch-manipulation"
                title="Go to Home"
              >
                <Home size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-semibold">{images.filter(img => img.is_active).length} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-700 font-semibold">{images.filter(img => !img.is_active).length} Hidden</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-600" />
              <span className="text-gray-700 font-semibold">{images.length} Total</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Upload size={22} className="text-orange-600" />
            Upload New Images
          </h2>

          <div className="space-y-4">
            {/* File Input */}
            <label className="block w-full cursor-pointer">
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center">
                    <ImageIcon size={32} className="text-orange-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-base sm:text-lg mb-1">
                      Click to select images
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, WEBP • Max 2MB each • Multiple allowed
                    </p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Selected Images ({previewUrls.length})</h3>
                  <button
                    onClick={() => {
                      setPreviewUrls([]);
                      setSelectedFiles([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden aspect-square">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePreview(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-semibold text-white bg-black/70 px-2 py-1 rounded truncate">
                          {selectedFiles[index]?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 text-white py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save size={20} strokeWidth={2.5} />
                      Upload {previewUrls.length} Image{previewUrls.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Images Gallery */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
            Uploaded Images ({images.length})
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ImageIcon size={56} className="mx-auto mb-4 opacity-40" strokeWidth={1.5} />
              <p className="text-lg font-semibold">No images uploaded yet</p>
              <p className="text-sm mt-1">Upload your first image above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    image.is_active 
                      ? 'border-green-500 shadow-lg shadow-green-100' 
                      : 'border-gray-300 opacity-70'
                  }`}
                >
                  {/* Image Display */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={image.image_data}
                      alt={image.image_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/80 text-white px-2.5 py-1 rounded-lg text-xs font-black">
                      #{image.image_order + 1}
                    </div>
                    {image.is_active && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                        <Eye size={12} />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="p-3 bg-gray-50 space-y-2">
                    <p className="text-sm font-bold text-gray-900 truncate" title={image.image_name}>
                      {image.image_name}
                    </p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleImageStatus(image.id, image.is_active)}
                        className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition touch-manipulation ${
                          image.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300 active:bg-gray-400'
                        }`}
                      >
                        {image.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {image.is_active ? 'Active' : 'Hidden'}
                      </button>

                      <button
                        onClick={() => deleteImage(image.id)}
                        className="py-2.5 bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition touch-manipulation"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>

                    {/* Order Controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeOrder(image.id, image.image_order, 'up')}
                        disabled={index === 0}
                        className="flex-1 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition touch-manipulation"
                      >
                        <ArrowUp size={14} />
                        Move Up
                      </button>
                      <button
                        onClick={() => changeOrder(image.id, image.image_order, 'down')}
                        disabled={index === images.length - 1}
                        className="flex-1 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition touch-manipulation"
                      >
                        <ArrowDown size={14} />
                        Move Down
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageImages;
