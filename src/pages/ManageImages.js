// src/pages/ManageImages.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, X, Image as ImageIcon, Save, Trash2, Eye, EyeOff, 
  ArrowUp, ArrowDown, Home, RefreshCw, CheckCircle, AlertCircle,
  Sparkles, Package, TrendingUp, Zap, Layers, Camera
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

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', `${file.name} is not an image`);
        continue;
      }

      if (file.size > 2 * 1024 * 1024) {
        showNotification('error', `${file.name} exceeds 2MB limit`);
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

  const removePreview = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

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

      showNotification('success', `${insertData.length} image(s) uploaded successfully! 🎉`);
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

  const toggleImageStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('hero_images')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      showNotification('success', currentStatus ? '🔒 Image hidden' : '✅ Image activated');
      fetchImages();
    } catch (error) {
      showNotification('error', 'Failed to update status');
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm('🗑️ Delete this image permanently?')) return;

    try {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showNotification('success', '🗑️ Image deleted successfully');
      fetchImages();
    } catch (error) {
      showNotification('error', 'Failed to delete');
    }
  };

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

  const activeCount = images.filter(img => img.is_active).length;
  const hiddenCount = images.filter(img => !img.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      
      {/* Floating Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown backdrop-blur-lg ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} strokeWidth={2.5} /> : <AlertCircle size={20} strokeWidth={2.5} />}
          <span className="font-bold text-sm flex-1">{notification.message}</span>
        </div>
      )}

      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
        
        {/* Modern Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-orange-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Camera className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-1 flex items-center gap-2">
                  Hero Gallery
                  <Sparkles className="text-orange-500" size={20} />
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Manage carousel images with ease
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchImages}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 rounded-xl transition font-bold text-sm flex items-center justify-center gap-2 touch-manipulation shadow-sm"
                title="Refresh"
              >
                <RefreshCw size={16} strokeWidth={2.5} />
                <span className="sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-700 rounded-xl transition font-bold text-sm flex items-center justify-center gap-2 touch-manipulation shadow-sm"
                title="Home"
              >
                <Home size={16} strokeWidth={2.5} />
                <span className="sm:inline">Home</span>
              </button>
            </div>
          </div>

          {/* Stats Cards - Mobile First */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={14} className="text-green-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-green-700 uppercase">Active</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-green-600">{activeCount}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <EyeOff size={14} className="text-gray-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-gray-700 uppercase">Hidden</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-600">{hiddenCount}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Layers size={14} className="text-blue-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-blue-700 uppercase">Total</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-600">{images.length}</p>
            </div>
          </div>
        </div>

        {/* Upload Zone - Mobile Optimized */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Upload size={18} className="text-orange-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">Upload Images</h2>
          </div>

          <label className="block w-full cursor-pointer group">
            <div className="border-2 border-dashed border-orange-300 group-hover:border-orange-500 group-active:border-orange-600 rounded-2xl p-6 sm:p-10 text-center bg-gradient-to-br from-orange-50/50 to-amber-50/50 group-hover:from-orange-100/50 group-hover:to-amber-100/50 transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ImageIcon size={32} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-base sm:text-lg mb-1">
                    Tap to select images
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    PNG, JPG, WEBP • Max 2MB • Multiple files
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold">
                  <Zap size={14} />
                  <span>Quick upload enabled</span>
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

          {/* Preview Grid - Mobile First */}
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <Package size={16} className="text-orange-500" />
                  Selected ({previewUrls.length})
                </h3>
                <button
                  onClick={() => {
                    setPreviewUrls([]);
                    setSelectedFiles([]);
                  }}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                >
                  <X size={14} />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square border-2 border-orange-200 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removePreview(index)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs font-bold text-white truncate">
                        {selectedFiles[index]?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadAll}
                disabled={uploading}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-3.5 rounded-xl font-black text-sm sm:text-base shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={2.5} />
                    Upload {previewUrls.length} Image{previewUrls.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Image Gallery - Mobile Optimized */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layers size={18} className="text-blue-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              Gallery ({images.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-bold text-sm sm:text-base">Loading gallery...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <ImageIcon size={40} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-700 mb-1">No images yet</p>
              <p className="text-xs sm:text-sm text-gray-500">Upload your first carousel image above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`border-2 rounded-2xl overflow-hidden transition-all ${
                    image.is_active 
                      ? 'border-green-400 shadow-lg shadow-green-100' 
                      : 'border-gray-300 opacity-60'
                  }`}
                >
                  {/* Image Preview */}
                  <div className="relative h-44 sm:h-48 bg-gray-100">
                    <img
                      src={image.image_data}
                      alt={image.image_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5">
                      <TrendingUp size={12} />
                      #{image.image_order + 1}
                    </div>
                    {image.is_active && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg">
                        <Eye size={12} />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="p-3 bg-gradient-to-b from-white to-gray-50 space-y-2">
                    <p className="text-sm font-bold text-gray-900 truncate" title={image.image_name}>
                      {image.image_name}
                    </p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleImageStatus(image.id, image.is_active)}
                        className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all touch-manipulation ${
                          image.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300 active:bg-gray-400'
                        }`}
                      >
                        {image.is_active ? <Eye size={14} strokeWidth={2.5} /> : <EyeOff size={14} strokeWidth={2.5} />}
                        {image.is_active ? 'Active' : 'Hidden'}
                      </button>

                      <button
                        onClick={() => deleteImage(image.id)}
                        className="py-2 bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all touch-manipulation"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                        Delete
                      </button>
                    </div>

                    {/* Order Controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeOrder(image.id, image.image_order, 'up')}
                        disabled={index === 0}
                        className="flex-1 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
                      >
                        <ArrowUp size={14} strokeWidth={2.5} />
                        Up
                      </button>
                      <button
                        onClick={() => changeOrder(image.id, image.image_order, 'down')}
                        disabled={index === images.length - 1}
                        className="flex-1 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
                      >
                        <ArrowDown size={14} strokeWidth={2.5} />
                        Down
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
