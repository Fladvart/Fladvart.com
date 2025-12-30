'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../AdminLayout';
import { Upload, Video, X, Save, Eye, Loader2, Lock, Unlock } from 'lucide-react';

export default function HeroVideoPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [previewMobileVideo, setPreviewMobileVideo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_tr: '',
    title_en: '',
    description_tr: '',
    description_en: '',
    media_id: null as number | null,
    mobile_media_id: null as number | null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMobileFile, setSelectedMobileFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [mobileFileError, setMobileFileError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Mevcut hero video'yu yükle
  useEffect(() => {
    fetchHeroVideo();
  }, []);

  const fetchHeroVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/hero-video');
      const data = await response.json();
      
      if (data.success && data.data) {
        setCurrentVideo(data.data);
        setFormData({
          title_tr: data.data.title_tr || '',
          title_en: data.data.title_en || '',
          description_tr: data.data.description_tr || '',
          description_en: data.data.description_en || '',
          media_id: data.data.media_id,
          mobile_media_id: data.data.mobile_media_id || null
        });
        setPreviewVideo(data.data.video_url);
        setPreviewMobileVideo(data.data.mobile_video_url || null);
      }
    } catch (error) {
      console.error('Error fetching hero video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear previous errors
      setFileError('');

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setFileError('Please select a video file');
        return;
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError('File size must be less than 500MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewVideo(previewUrl);
    }
  };

  const handleMobileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear previous errors
      setMobileFileError('');

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setMobileFileError('Please select a video file');
        return;
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setMobileFileError('File size must be less than 500MB');
        return;
      }

      setSelectedMobileFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewMobileVideo(previewUrl);
    }
  };

  const handleUploadVideo = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setFileError('');
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('context', 'hero_video');

      // Add timeout for fetch request (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        setFormData(prev => ({ ...prev, media_id: uploadData.mediaId }));
        setPreviewVideo(uploadData.firebaseUrl);
        setSelectedFile(null);
        alert('Desktop video uploaded successfully!');
      } else {
        throw new Error(uploadData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setFileError('Upload timed out. The video file may be too large. Please try a smaller file or compress the video.');
        } else {
          setFileError(error.message || 'Upload failed. Please try again.');
        }
      } else {
        setFileError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUploadMobileVideo = async () => {
    if (!selectedMobileFile) return;

    setUploadingMobile(true);
    setMobileFileError('');
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedMobileFile);
      uploadFormData.append('context', 'hero_video_mobile');

      // Add timeout for fetch request (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        setFormData(prev => ({ ...prev, mobile_media_id: uploadData.mediaId }));
        setPreviewMobileVideo(uploadData.firebaseUrl);
        setSelectedMobileFile(null);
        alert('Mobile video uploaded successfully!');
      } else {
        throw new Error(uploadData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setMobileFileError('Upload timed out. The video file may be too large. Please try a smaller file or compress the video.');
        } else {
          setMobileFileError(error.message || 'Upload failed. Please try again.');
        }
      } else {
        setMobileFileError('Upload failed. Please try again.');
      }
    } finally {
      setUploadingMobile(false);
    }
  };

  const handleSave = async () => {
    if (!formData.media_id) {
      alert('Please upload a video first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/hero-video', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Hero video updated successfully!');
        fetchHeroVideo();
        setIsEditing(false); // Lock after save
      } else {
        alert('Update failed: ' + data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setFileError('');
    setPreviewVideo(currentVideo?.video_url || null);
    setFormData(prev => ({ ...prev, media_id: currentVideo?.media_id || null }));
  };

  const handleRemoveMobilePreview = () => {
    setSelectedMobileFile(null);
    setMobileFileError('');
    setPreviewMobileVideo(currentVideo?.mobile_video_url || null);
    setFormData(prev => ({ ...prev, mobile_media_id: currentVideo?.mobile_media_id || null }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchHeroVideo(); // Revert changes
    setSelectedFile(null);
    setSelectedMobileFile(null);
    setFileError('');
    setMobileFileError('');
  };

  if (loading && !currentVideo) {
    return (
      <AdminLayout title="Hero Video">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hero Video">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Hero Section Video
            </h2>
            <p className="text-gray-600">
              Upload and manage the hero section background video
            </p>
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Unlock size={18} className="mr-2" />
                Enable Editing
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Lock size={18} className="mr-2" />
                Cancel Editing
              </button>
            )}
          </div>
        </div>

        {/* Video Upload Section */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-opacity ${!isEditing ? 'opacity-75 pointer-events-none' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Video size={20} className="mr-2" />
              Desktop Video Upload
            </h3>
            <p className="text-sm text-gray-600 mt-1">This video will be displayed on desktop and tablet devices</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Current/Preview Video */}
            {previewVideo && (
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  src={previewVideo}
                  controls
                  className="w-full h-64 object-cover"
                >
                  Your browser does not support the video tag.
                </video>
                
                {isEditing && selectedFile && (
                  <button
                    onClick={handleRemovePreview}
                    className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                
                {selectedFile && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
                    New video selected: {selectedFile.name}
                  </div>
                )}
              </div>
            )}

            {/* Upload Input */}
            {isEditing && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={!isEditing}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    MP4, WebM, MOV or AVI (max. 500MB)
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {fileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                    <p className="text-sm text-red-700 mt-1">{fileError}</p>
                  </div>
                  <button
                    onClick={() => setFileError('')}
                    className="ml-auto shrink-0 text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploading && isEditing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">File size:</span>
                  <span className="text-sm font-medium text-gray-900">{formatFileSize(selectedFile.size)}</span>
                </div>
                <button
                  onClick={handleUploadVideo}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Video to Firebase
                </button>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-medium flex items-center justify-center">
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Uploading... This may take several minutes for large files.
                </div>
                <p className="text-xs text-center text-gray-500">
                  Please don&apos;t close this page. Large videos may take 2-5 minutes to upload.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Video Upload Section */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-opacity ${!isEditing ? 'opacity-75 pointer-events-none' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Video size={20} className="mr-2" />
              Mobile Video Upload (Optional)
            </h3>
            <p className="text-sm text-gray-600 mt-1">This video will be displayed on mobile devices. If not set, desktop video will be used.</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Current/Preview Mobile Video */}
            {previewMobileVideo && (
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  src={previewMobileVideo}
                  controls
                  className="w-full h-64 object-cover"
                >
                  Your browser does not support the video tag.
                </video>
                
                {isEditing && selectedMobileFile && (
                  <button
                    onClick={handleRemoveMobilePreview}
                    className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                
                {selectedMobileFile && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
                    New mobile video selected: {selectedMobileFile.name}
                  </div>
                )}
              </div>
            )}

            {/* Upload Input */}
            {isEditing && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload mobile video
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMobileFileSelect}
                      className="hidden"
                      disabled={!isEditing}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    MP4, WebM, MOV or AVI (max. 500MB) - Portrait orientation recommended
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {mobileFileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                    <p className="text-sm text-red-700 mt-1">{mobileFileError}</p>
                  </div>
                  <button
                    onClick={() => setMobileFileError('')}
                    className="ml-auto shrink-0 text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedMobileFile && !uploadingMobile && isEditing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">File size:</span>
                  <span className="text-sm font-medium text-gray-900">{formatFileSize(selectedMobileFile.size)}</span>
                </div>
                <button
                  onClick={handleUploadMobileVideo}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Mobile Video to Firebase
                </button>
              </div>
            )}

            {uploadingMobile && (
              <div className="space-y-2">
                <div className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-medium flex items-center justify-center">
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Uploading... This may take several minutes for large files.
                </div>
                <p className="text-xs text-center text-gray-500">
                  Please don&apos;t close this page. Large videos may take 2-5 minutes to upload.
                </p>
              </div>
            )}

            {/* Remove Mobile Video Button */}
            {previewMobileVideo && isEditing && (
              <button
                onClick={() => {
                  setPreviewMobileVideo(null);
                  setFormData(prev => ({ ...prev, mobile_media_id: null }));
                  setSelectedMobileFile(null);
                }}
                className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
              >
                <X size={20} className="mr-2" />
                Remove Mobile Video (Use Desktop Video)
              </button>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Video Text Content
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Turkish Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Turkish)
              </label>
              <input
                type="text"
                value={formData.title_tr}
                onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
                disabled={!isEditing}
                placeholder="Markaları süslemek için burada değiliz."
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* English Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (English)
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                disabled={!isEditing}
                placeholder="We are not here to decorate brands."
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Turkish Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Turkish) - Optional
              </label>
              <textarea
                value={formData.description_tr}
                onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                disabled={!isEditing}
                placeholder="Kısa açıklama..."
                rows={3}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* English Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English) - Optional
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                disabled={!isEditing}
                placeholder="Short description..."
                rows={3}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye size={20} className="mr-2" />
            Preview Site
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={loading || uploading || uploadingMobile || !formData.media_id}
              className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">
            ⚠️ Important Notes
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Enable editing to make changes</li>
            <li>• First upload the video(s) to Firebase, then save changes</li>
            <li>• Desktop video is required, mobile video is optional</li>
            <li>• If no mobile video is set, desktop video will be used on mobile</li>
            <li>• Videos will be visible on the homepage hero section</li>
            <li>• Recommended format: MP4 (H.264 codec)</li>
            <li>• Desktop: 1920x1080 or higher (landscape)</li>
            <li>• Mobile: 1080x1920 recommended (portrait)</li>
            <li>• Maximum file size: 500MB per video</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
