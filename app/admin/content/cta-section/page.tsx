'use client';

import { useState, useEffect } from 'react';
import { Upload, Save, Loader2, X, Plus, GripVertical, ArrowLeft, Lock, Unlock } from 'lucide-react';
import AdminLayout from '@/app/admin/AdminLayout';
import Link from 'next/link';

interface ImageData {
  file: File | null;
  preview: string | null;
  firebaseUrl: string | null;
  mediaId: number | null;
}

interface MarqueeItem {
  text_en: string;
  text_tr: string;
}

interface CTASection {
  id?: number;
  main_title_en: string;
  main_title_tr: string;
  description_en: string;
  description_tr: string;
  button_text_en: string;
  button_text_tr: string;
  button_link: string;
  background_image_media_id: number | null;
  marquee_items: MarqueeItem[];
}

export default function CTASectionPage() {
  const [ctaData, setCtaData] = useState<CTASection>({
    main_title_en: '',
    main_title_tr: '',
    description_en: '',
    description_tr: '',
    button_text_en: '',
    button_text_tr: '',
    button_link: '#contact',
    background_image_media_id: null,
    marquee_items: []
  });

  const [backgroundImage, setBackgroundImage] = useState<ImageData>({
    file: null,
    preview: null,
    firebaseUrl: null,
    mediaId: null,
  });

  const [newMarqueeItem, setNewMarqueeItem] = useState({ text_en: '', text_tr: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCTAData();
  }, []);

  const fetchCTAData = async () => {
    try {
      const response = await fetch('/api/admin/cta-section');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          
          // JSONB array'i parse et
          let marqueeItems = [];
          if (data.data.marquee_items) {
            if (typeof data.data.marquee_items === 'string') {
              try {
                marqueeItems = JSON.parse(data.data.marquee_items);
              } catch (e) {
                console.error('Error parsing marquee_items:', e);
              }
            } else if (Array.isArray(data.data.marquee_items)) {
              marqueeItems = data.data.marquee_items;
            } else if (typeof data.data.marquee_items === 'object') {
              // JSONB object olarak geliyorsa
              marqueeItems = data.data.marquee_items;
            }
          }
          
          
          setCtaData({
            id: data.data.id,
            main_title_en: data.data.main_title_en || '',
            main_title_tr: data.data.main_title_tr || '',
            description_en: data.data.description_en || '',
            description_tr: data.data.description_tr || '',
            button_text_en: data.data.button_text_en || '',
            button_text_tr: data.data.button_text_tr || '',
            button_link: data.data.button_link || '#contact',
            background_image_media_id: data.data.background_image_media_id || null,
            marquee_items: marqueeItems
          });
          
          console.log('Background image URL:', data.data.background_image_url);
          if (data.data.background_image_url) {
            setBackgroundImage({
              file: null,
              preview: data.data.background_image_url,
              firebaseUrl: data.data.background_image_url,
              mediaId: data.data.background_image_media_id,
            });
          }
        } else {
          console.warn(' No data in response or success=false');
        }
      } else {
        console.error('Response not OK:', response.status);
        const errorText = await response.text();
        console.error('Error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching CTA data:', error);
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
    setBackgroundImage({ file, preview, firebaseUrl: null, mediaId: null });
  };

  const handleUploadImage = async () => {
    if (!backgroundImage.file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', backgroundImage.file);
      formData.append('context', 'cta_background');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      setBackgroundImage(prev => ({
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
    if (backgroundImage.preview) {
      URL.revokeObjectURL(backgroundImage.preview);
    }
    setBackgroundImage({ file: null, preview: null, firebaseUrl: null, mediaId: null });
  };

  const addMarqueeItem = () => {
    if (newMarqueeItem.text_en.trim() && newMarqueeItem.text_tr.trim()) {
      setCtaData(prev => ({
        ...prev,
        marquee_items: [...prev.marquee_items, {
          text_en: newMarqueeItem.text_en.trim(),
          text_tr: newMarqueeItem.text_tr.trim()
        }]
      }));
      setNewMarqueeItem({ text_en: '', text_tr: '' });
    }
  };

  const removeMarqueeItem = (index: number) => {
    setCtaData(prev => ({
      ...prev,
      marquee_items: prev.marquee_items.filter((_, i) => i !== index)
    }));
  };

  const moveMarqueeItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...ctaData.marquee_items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newItems.length) {
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      setCtaData(prev => ({ ...prev, marquee_items: newItems }));
    }
  };

  const handleSave = async () => {
    if (backgroundImage.file && !backgroundImage.mediaId) {
      alert('Lütfen önce arka plan görselini Firebase\'e yükleyin');
      return;
    }

    if (!ctaData.main_title_en || !ctaData.main_title_tr) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...ctaData,
        background_image_media_id: backgroundImage.mediaId || ctaData.background_image_media_id,
      };

      const response = await fetch('/api/admin/cta-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Save failed');

      alert('CTA Section başarıyla kaydedildi!');
      fetchCTAData();
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchCTAData(); // Revert changes
    // Also clear any selected but not uploaded/saved image
    if (backgroundImage.file) {
      handleRemoveImage();
    }
  };

  if (loading) {
    return (
      <AdminLayout title="CTA Section Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="CTA Section - Your Vision Deserves">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header with Edit Toggle */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            İçerik Yönetimine Geri Dön
          </Link>
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

        {/* Main Titles */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Ana Başlık</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İngilizce *
              </label>
              <input
                type="text"
                value={ctaData.main_title_en}
                onChange={(e) => setCtaData({ ...ctaData, main_title_en: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="YOUR VISION DESERVES A TAILORED SOLUTION"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Türkçe *
              </label>
              <input
                type="text"
                value={ctaData.main_title_tr}
                onChange={(e) => setCtaData({ ...ctaData, main_title_tr: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="VİZYONUNUZ ÖZEL BİR ÇÖZÜM HAK EDİYOR"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Açıklama</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İngilizce *
              </label>
              <textarea
                value={ctaData.description_en}
                onChange={(e) => setCtaData({ ...ctaData, description_en: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="SHARE YOUR GOALS AND WE'LL CRAFT A CUSTOM OFFER FOR YOUR BRAND."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Türkçe *
              </label>
              <textarea
                value={ctaData.description_tr}
                onChange={(e) => setCtaData({ ...ctaData, description_tr: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="HEDEFLERİNİZİ PAYLAŞIN, MARKANIZ İÇİN ÖZEL BİR TEKLİF HAZIRLAYALIM."
              />
            </div>
          </div>
        </div>

        {/* Button Settings */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Buton Ayarları</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buton Metni (EN) *
              </label>
              <input
                type="text"
                value={ctaData.button_text_en}
                onChange={(e) => setCtaData({ ...ctaData, button_text_en: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="LET'S COLLABORATE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buton Metni (TR) *
              </label>
              <input
                type="text"
                value={ctaData.button_text_tr}
                onChange={(e) => setCtaData({ ...ctaData, button_text_tr: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="İŞBİRLİĞİ YAPALIM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buton Linki
              </label>
              <input
                type="text"
                value={ctaData.button_link}
                onChange={(e) => setCtaData({ ...ctaData, button_link: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="#contact"
              />
            </div>
          </div>
        </div>

        {/* Background Image */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Arka Plan Görseli</h2>
          
          {backgroundImage.preview ? (
            <div className="relative">
              <img
                src={backgroundImage.preview}
                alt="Background"
                className="w-full h-64 object-cover rounded-lg"
              />
              {isEditing && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {backgroundImage.file && !backgroundImage.mediaId && isEditing && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploading}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Firebase'e Yükle
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${isEditing ? 'cursor-pointer hover:border-blue-500' : 'cursor-not-allowed'}`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                className="hidden"
                id="background-upload"
                disabled={!isEditing}
              />
              <label
                htmlFor="background-upload"
                className={`flex flex-col items-center gap-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Görsel seçmek için tıklayın</span>
              </label>
            </div>
          )}
        </div>

        {/* Marquee Items */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Kayan Metinler (Marquee)</h2>
          
          {/* Existing Items */}
          <div className="space-y-3 mb-6">
            {ctaData.marquee_items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
                  
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">English</label>
                      <div className="text-sm text-gray-900 font-medium">{item.text_en}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Türkçe</label>
                      <div className="text-sm text-gray-900 font-medium">{item.text_tr}</div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveMarqueeItem(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveMarqueeItem(index, 'down')}
                        disabled={index === ctaData.marquee_items.length - 1}
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeMarqueeItem(index)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          {isEditing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English
                  </label>
                  <input
                    type="text"
                    value={newMarqueeItem.text_en}
                    onChange={(e) => setNewMarqueeItem(prev => ({ ...prev, text_en: e.target.value }))}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CREATIVE CONSULTANCY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Türkçe
                  </label>
                  <input
                    type="text"
                    value={newMarqueeItem.text_tr}
                    onChange={(e) => setNewMarqueeItem(prev => ({ ...prev, text_tr: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addMarqueeItem()}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="KREATİF DANIŞMANLIK"
                  />
                </div>
              </div>
              <button
                onClick={addMarqueeItem}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Marquee Item Ekle
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
