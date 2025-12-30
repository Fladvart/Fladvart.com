'use client';

import { useState, useEffect } from 'react';
import { Upload, Save, Loader2, Image as ImageIcon, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/app/admin/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface ImageData {
  file: File | null;
  preview: string | null;
  firebaseUrl: string | null;
  mediaId: number | null;
}

interface ServiceTag {
  id?: number;
  tag_en: string;
  tag_tr: string;
}

interface ServiceContent {
  id?: number;
  service_id?: number;
  order_number: number;
  title_en: string;
  title_tr: string;
  slug: string;
  image_media_id: number | null;
  middle_title_en: string;
  middle_title_tr: string;
  paragraph_1_en: string;
  paragraph_1_tr: string;
  paragraph_2_en: string;
  paragraph_2_tr: string;
  is_active: boolean;
  tags: ServiceTag[];
}

export default function ServiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;
  const isNew = serviceId === 'new';

  const [content, setContent] = useState<ServiceContent>({
    order_number: 1,
    title_en: '',
    title_tr: '',
    slug: '',
    image_media_id: null,
    middle_title_en: '',
    middle_title_tr: '',
    paragraph_1_en: '',
    paragraph_1_tr: '',
    paragraph_2_en: '',
    paragraph_2_tr: '',
    is_active: true,
    tags: [],
  });

  const [image, setImage] = useState<ImageData>({
    file: null,
    preview: null,
    firebaseUrl: null,
    mediaId: null,
  });

  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched service data:', data);
        
        // Set content with proper defaults
        setContent({
          id: data.id,
          order_number: data.order_number || 1,
          title_en: data.title_en || '',
          title_tr: data.title_tr || '',
          slug: data.slug || '',
          image_media_id: data.image_media_id || null,
          middle_title_en: data.middle_title_en || '',
          middle_title_tr: data.middle_title_tr || '',
          paragraph_1_en: data.paragraph_1_en || '',
          paragraph_1_tr: data.paragraph_1_tr || '',
          paragraph_2_en: data.paragraph_2_en || '',
          paragraph_2_tr: data.paragraph_2_tr || '',
          is_active: data.is_active !== undefined ? data.is_active : true,
          tags: data.tags || [],
        });
        
        if (data.image_url) {
          setImage({
            file: null,
            preview: data.image_url,
            firebaseUrl: data.image_url,
            mediaId: data.image_media_id,
          });
        }
      } else {
        console.error('Failed to fetch service:', response.status);
        alert('Servis yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      alert('Servis yüklenirken hata oluştu');
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
      formData.append('context', `service_${content.slug || 'image'}`);

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
    if (image.preview && image.file) {
      URL.revokeObjectURL(image.preview);
    }
    setImage({ file: null, preview: null, firebaseUrl: null, mediaId: null });
  };

  const handleAddTag = () => {
    setContent({
      ...content,
      tags: [...content.tags, { tag_en: '', tag_tr: '' }],
    });
  };

  const handleRemoveTag = (index: number) => {
    setContent({
      ...content,
      tags: content.tags.filter((_, i) => i !== index),
    });
  };

  const handleTagChange = (index: number, field: 'tag_en' | 'tag_tr', value: string) => {
    const newTags = [...content.tags];
    newTags[index] = { ...newTags[index], [field]: value };
    setContent({ ...content, tags: newTags });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async () => {
    // Validation
    if (!content.title_en || !content.title_tr) {
      alert('Lütfen başlıkları doldurun');
      return;
    }

    if (image.file && !image.mediaId) {
      alert('Lütfen önce görseli Firebase\'e yükleyin');
      return;
    }

    // Auto-generate slug if not set
    if (!content.slug && content.title_en) {
      content.slug = generateSlug(content.title_en);
    }

    setSaving(true);

    try {
      const payload = {
        ...content,
        image_media_id: image.mediaId || content.image_media_id,
      };

      const url = isNew 
        ? '/api/admin/services'
        : `/api/admin/services/${serviceId}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Save failed');

      alert(`Servis başarıyla ${isNew ? 'oluşturuldu' : 'güncellendi'}!`);
      router.push('/admin/content/services');
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Service Edit">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? 'Add New Service' : 'Edit Service'}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/content/services"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Hizmetlere Geri Dön
        </Link>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıra Numarası
              </label>
              <input
                type="number"
                min="1"
                value={content.order_number || ''}
                onChange={(e) => setContent({ ...content, order_number: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={content.slug}
                onChange={(e) => setContent({ ...content, slug: e.target.value })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="brand-architecture"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.is_active}
                  onChange={(e) => setContent({ ...content, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık (EN)
              </label>
              <input
                type="text"
                value={content.title_en}
                onChange={(e) => setContent({ ...content, title_en: e.target.value })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="BRAND ARCHITECTURE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık (TR)
              </label>
              <input
                type="text"
                value={content.title_tr}
                onChange={(e) => setContent({ ...content, title_tr: e.target.value })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="MARKA MİMARİSİ"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Sol Görsel</h2>
          
          {image.preview ? (
            <div className="relative">
              <img
                src={image.preview}
                alt="Service"
                className="w-full max-w-2xl h-96 object-cover rounded-lg"
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
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
            <label className="flex flex-col items-center justify-center h-96 max-w-2xl border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
              <span className="text-gray-600">Görsel Seç</span>
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

        {/* Middle Title */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Orta Başlık</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İngilizce
              </label>
              <textarea
                value={content.middle_title_en}
                onChange={(e) => setContent({ ...content, middle_title_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="BRAND STRATEGY VISUAL IDENTITY BRANDING LOGO DESIGN REBRANDING"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Türkçe
              </label>
              <textarea
                value={content.middle_title_tr}
                onChange={(e) => setContent({ ...content, middle_title_tr: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="MARKA STRATEJİSİ GÖRSEL KİMLİK MARKALAŞMA LOGO TASARIM YENİDEN MARKALAŞMA"
              />
            </div>
          </div>
        </div>

        {/* Paragraphs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Paragraflar</h2>
          
          <div className="space-y-6">
            {/* Paragraph 1 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Paragraf 1</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">İngilizce</label>
                  <textarea
                    value={content.paragraph_1_en}
                    onChange={(e) => setContent({ ...content, paragraph_1_en: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Naming, positioning, and identity systems designed to give ideas a pulse."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Türkçe</label>
                  <textarea
                    value={content.paragraph_1_tr}
                    onChange={(e) => setContent({ ...content, paragraph_1_tr: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Fikirlere nabız kazandırmak için tasarlanmış isimlendirme, konumlandırma ve kimlik sistemleri."
                  />
                </div>
              </div>
            </div>

            {/* Paragraph 2 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Paragraf 2</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">İngilizce</label>
                  <textarea
                    value={content.paragraph_2_en}
                    onChange={(e) => setContent({ ...content, paragraph_2_en: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="We build brands that feel alive — strategic at their core, human in their expression."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Türkçe</label>
                  <textarea
                    value={content.paragraph_2_tr}
                    onChange={(e) => setContent({ ...content, paragraph_2_tr: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Canlı hissettiren markalar inşa ediyoruz - özünde stratejik, ifadesinde insani."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Etiketler</h2>
            <button
              onClick={handleAddTag}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
            >
              <Plus className="w-4 h-4" />
              Etiket Ekle
            </button>
          </div>

          {content.tags.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Henüz etiket eklenmemiş (services.brand, services.visual, vb.)
            </p>
          ) : (
            <div className="space-y-3">
              {content.tags.map((tag, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={tag.tag_en}
                      onChange={(e) => handleTagChange(index, 'tag_en', e.target.value)}
                      className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="services.brand"
                    />
                    <input
                      type="text"
                      value={tag.tag_tr}
                      onChange={(e) => handleTagChange(index, 'tag_tr', e.target.value)}
                      className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="hizmetler.marka"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveTag(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Buttons */}
        <div className="flex justify-end gap-3 pb-8">
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
                {isNew ? 'Servisi Oluştur' : 'Değişiklikleri Kaydet'}
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
