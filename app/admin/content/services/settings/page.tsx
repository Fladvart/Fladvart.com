'use client';

import { useState, useEffect } from 'react';
import { Upload, Save, Loader2, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import AdminLayout from '@/app/admin/AdminLayout';
import Link from 'next/link';

interface ImageData {
  file: File | null;
  preview: string | null;
  firebaseUrl: string | null;
  mediaId: number | null;
}

interface ServiceCollection {
  id?: number;
  main_title_en: string;
  main_title_tr: string;
  main_image_media_id: number | null;
}

export default function ServicesSettingsPage() {
  const [collection, setCollection] = useState<ServiceCollection>({
    main_title_en: '',
    main_title_tr: '',
    main_image_media_id: null,
  });

  const [image, setImage] = useState<ImageData>({
    file: null,
    preview: null,
    firebaseUrl: null,
    mediaId: null,
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        if (data.collection) {
          setCollection(data.collection);
          if (data.collection.main_image_url) {
            setImage({
              file: null,
              preview: data.collection.main_image_url,
              firebaseUrl: data.collection.main_image_url,
              mediaId: data.collection.main_image_media_id,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin');
      return;
    }

    const preview = URL.createObjectURL(file);
    setImage({ file, preview, firebaseUrl: null, mediaId: null });
  };

  const handleUploadImage = async () => {
    if (!image.file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', image.file);
      formData.append('context', 'services_main_image');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      setImage(prev => ({
        ...prev,
        firebaseUrl: data.firebaseUrl,
        mediaId: data.mediaId,
      }));

      alert('Görsel başarıyla yüklendi!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setImage({ file: null, preview: null, firebaseUrl: null, mediaId: null });
  };

  const handleSave = async () => {
    if (image.file && !image.mediaId) {
      alert('Lütfen önce görseli Firebase\'e yükleyin');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        main_title_en: collection.main_title_en,
        main_title_tr: collection.main_title_tr,
        main_image_media_id: image.mediaId || collection.main_image_media_id,
      };

      const response = await fetch('/api/admin/services/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Save failed');

      alert('Ayarlar başarıyla kaydedildi!');
      fetchSettings();
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Services Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Services - Ana Ayarlar">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/content/services"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Hizmetlere Geri Dön
        </Link>

        {/* Main Title */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Ana Başlık</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İngilizce
              </label>
              <input
                type="text"
                value={collection.main_title_en}
                onChange={(e) => setCollection({ ...collection, main_title_en: e.target.value })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SERVICES"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Türkçe
              </label>
              <input
                type="text"
                value={collection.main_title_tr}
                onChange={(e) => setCollection({ ...collection, main_title_tr: e.target.value })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="HİZMETLER"
              />
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Ana Görsel</h2>
          <p className="text-sm text-gray-600 mb-4">Sol tarafta görünecek görsel (Önerilen: 600x800px)</p>
          
          {image.preview ? (
            <div className="relative max-w-md mx-auto">
              <img
                src={image.preview}
                alt="Services main"
                className="w-full h-auto max-h-96 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
              
              {image.file && !image.mediaId && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploading}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Firebase'e Yükle
                    </>
                  )}
                </button>
              )}
              
              {image.mediaId && (
                <div className="mt-4 text-sm text-green-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  Firebase'e yüklendi
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-64 max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-gray-600 mb-1">Ana Görsel Seç</span>
              <span className="text-sm text-gray-500">Sol tarafta görünecek büyük görsel</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/content/services"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            İptal
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
