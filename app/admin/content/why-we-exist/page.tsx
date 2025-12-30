'use client';

import { useEffect, useState } from 'react';
import { Upload, Save, Loader2, X, Lock, Unlock, Video as VideoIcon } from 'lucide-react';
import AdminLayout from '@/app/admin/AdminLayout';

interface MediaData {
  file: File | null;
  preview: string | null;
  firebaseUrl: string | null;
  mediaId: number | null;
}

interface WhyWeExistContent {
  id?: number;
  main_title_en: string;
  main_title_tr: string;
  left_title_en: string;
  left_title_tr: string;
  right_paragraph_1_en: string;
  right_paragraph_1_tr: string;
  right_paragraph_2_en: string;
  right_paragraph_2_tr: string;
  bottom_text_en: string;
  bottom_text_tr: string;

  // why_videos table mapping
  video_1_media_id: number | null;
  video_2_media_id: number | null;
}

type VideoKey = 'video1' | 'video2';

export default function WhyWeExistPage() {
  const [content, setContent] = useState<WhyWeExistContent>({
    main_title_en: '',
    main_title_tr: '',
    left_title_en: '',
    left_title_tr: '',
    right_paragraph_1_en: '',
    right_paragraph_1_tr: '',
    right_paragraph_2_en: '',
    right_paragraph_2_tr: '',
    bottom_text_en: '',
    bottom_text_tr: '',
    video_1_media_id: null,
    video_2_media_id: null,
  });

  const [videos, setVideos] = useState<Record<VideoKey, MediaData>>({
    video1: { file: null, preview: null, firebaseUrl: null, mediaId: null },
    video2: { file: null, preview: null, firebaseUrl: null, mediaId: null },
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<VideoKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/why-we-exist');
      if (!response.ok) throw new Error('Fetch failed');

      const result = await response.json();

      // Expected:
      // { success: true, data: { section, videos: [{video_position, url, media_id}] } }
      if (result?.success && result?.data?.section) {
        const section = result.data.section;

        // Reset videos state to avoid stale previews
        setVideos({
          video1: { file: null, preview: null, firebaseUrl: null, mediaId: null },
          video2: { file: null, preview: null, firebaseUrl: null, mediaId: null },
        });

        let v1: number | null = null;
        let v2: number | null = null;

        const list = result?.data?.videos || [];
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((v: any) => {
            if (v.video_position === 1 && v.url) {
              v1 = v.media_id ?? null;
              setVideos(prev => ({
                ...prev,
                video1: {
                  file: null,
                  preview: v.url,
                  firebaseUrl: v.url,
                  mediaId: v.media_id ?? null,
                },
              }));
            } else if (v.video_position === 2 && v.url) {
              v2 = v.media_id ?? null;
              setVideos(prev => ({
                ...prev,
                video2: {
                  file: null,
                  preview: v.url,
                  firebaseUrl: v.url,
                  mediaId: v.media_id ?? null,
                },
              }));
            }
          });
        }

        // Set content (include current video media ids so Save doesn't wipe them)
        setContent({
          id: section.id,
          main_title_en: section.main_title_en || '',
          main_title_tr: section.main_title_tr || '',
          left_title_en: section.left_title_en || '',
          left_title_tr: section.left_title_tr || '',
          right_paragraph_1_en: section.right_paragraph_1_en || '',
          right_paragraph_1_tr: section.right_paragraph_1_tr || '',
          right_paragraph_2_en: section.right_paragraph_2_en || '',
          right_paragraph_2_tr: section.right_paragraph_2_tr || '',
          bottom_text_en: section.bottom_text_en || '',
          bottom_text_tr: section.bottom_text_tr || '',
          video_1_media_id: v1,
          video_2_media_id: v2,
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('İçerik çekilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (videoKey: VideoKey, file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Lütfen bir video dosyası seçin');
      return;
    }

    const preview = URL.createObjectURL(file);

    // Revoke previous blob preview if exists
    const prevPreview = videos[videoKey]?.preview;
    if (prevPreview && prevPreview.startsWith('blob:')) {
      URL.revokeObjectURL(prevPreview);
    }

    setVideos(prev => ({
      ...prev,
      [videoKey]: { file, preview, firebaseUrl: null, mediaId: null },
    }));
  };

  const handleUploadVideo = async (videoKey: VideoKey) => {
    const videoData = videos[videoKey];
    if (!videoData.file) return;

    setUploading(videoKey);

    try {
      const formData = new FormData();
      formData.append('file', videoData.file);
      formData.append('context', `why_we_exist_${videoKey}`); // why_we_exist_video1 / video2

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setVideos(prev => ({
        ...prev,
        [videoKey]: {
          ...prev[videoKey],
          firebaseUrl: data.firebaseUrl,
          mediaId: data.mediaId,
        },
      }));

      alert('Video başarıyla yüklendi!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveVideo = (videoKey: VideoKey) => {
    const prevPreview = videos[videoKey]?.preview;
    if (prevPreview && prevPreview.startsWith('blob:')) {
      URL.revokeObjectURL(prevPreview);
    }

    setVideos(prev => ({
      ...prev,
      [videoKey]: { file: null, preview: null, firebaseUrl: null, mediaId: null },
    }));
  };

  const handleSave = async () => {
    // Validate uploads (if a new file selected, require upload first)
    if (videos.video1.file && !videos.video1.mediaId) {
      alert("Lütfen önce 1. videoyu Firebase'e yükleyin");
      return;
    }
    if (videos.video2.file && !videos.video2.mediaId) {
      alert("Lütfen önce 2. videoyu Firebase'e yükleyin");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...content,
        video_1_media_id: videos.video1.mediaId ?? content.video_1_media_id,
        video_2_media_id: videos.video2.mediaId ?? content.video_2_media_id,
      };

      const response = await fetch('/api/admin/why-we-exist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok || !resJson?.success) {
        throw new Error(resJson?.error || 'Save failed');
      }

      alert('İçerik başarıyla kaydedildi!');
      await fetchContent();
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
    fetchContent();
  };

  if (loading) {
    return (
      <AdminLayout title="Why We Exist">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  const VideoUploadCard = ({
    videoKey,
    title,
    videoData,
  }: {
    videoKey: VideoKey;
    title: string;
    videoData: MediaData;
  }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-opacity ${
        !isEditing ? 'opacity-75 pointer-events-none' : ''
      }`}
    >
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>

      <div className="p-4">
        {videoData.preview ? (
          <div className="relative">
            <video
              src={videoData.preview}
              controls
              muted
              playsInline
              className="w-full h-56 object-cover rounded-lg bg-black"
            />
            {isEditing && (
              <button
                onClick={() => handleRemoveVideo(videoKey)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {videoData.file && !videoData.mediaId && isEditing && (
              <button
                onClick={() => handleUploadVideo(videoKey)}
                disabled={uploading === videoKey}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading === videoKey ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Firebase&apos;e Yükle
                  </>
                )}
              </button>
            )}

            {videoData.mediaId && (
              <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                Yüklendi ✓
              </div>
            )}
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-300 rounded-lg ${
              isEditing ? 'cursor-pointer hover:border-blue-500' : 'cursor-not-allowed'
            } transition-colors`}
          >
            <VideoIcon className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Video Seç</span>
            <span className="text-xs text-gray-500 mt-1">MP4 önerilir</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVideoSelect(videoKey, file);
              }}
              className="hidden"
              disabled={!isEditing}
            />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Why We Exist Content">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Edit Toggle */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">Manage the content and videos for the &quot;Why We Exist&quot; section.</p>
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

        {/* Main Title */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Ana Başlık</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İngilizce</label>
              <input
                type="text"
                value={content.main_title_en}
                onChange={(e) => setContent({ ...content, main_title_en: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="WHY WE EXIST"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Türkçe</label>
              <input
                type="text"
                value={content.main_title_tr}
                onChange={(e) => setContent({ ...content, main_title_tr: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="HAKKIMIZDA"
              />
            </div>
          </div>
        </div>

        {/* Left Title */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Sol Taraf Başlık</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İngilizce</label>
              <textarea
                value={content.left_title_en}
                onChange={(e) => setContent({ ...content, left_title_en: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Türkçe</label>
              <textarea
                value={content.left_title_tr}
                onChange={(e) => setContent({ ...content, left_title_tr: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Right Paragraphs */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Sağ Taraf Paragraflar</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Paragraf 1</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">İngilizce</label>
                  <textarea
                    value={content.right_paragraph_1_en}
                    onChange={(e) => setContent({ ...content, right_paragraph_1_en: e.target.value })}
                    disabled={!isEditing}
                    rows={5}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Türkçe</label>
                  <textarea
                    value={content.right_paragraph_1_tr}
                    onChange={(e) => setContent({ ...content, right_paragraph_1_tr: e.target.value })}
                    disabled={!isEditing}
                    rows={5}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Paragraf 2</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">İngilizce</label>
                  <textarea
                    value={content.right_paragraph_2_en}
                    onChange={(e) => setContent({ ...content, right_paragraph_2_en: e.target.value })}
                    disabled={!isEditing}
                    rows={5}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Türkçe</label>
                  <textarea
                    value={content.right_paragraph_2_tr}
                    onChange={(e) => setContent({ ...content, right_paragraph_2_tr: e.target.value })}
                    disabled={!isEditing}
                    rows={5}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Videolar</h2>
          <div className="grid grid-cols-2 gap-4">
            <VideoUploadCard videoKey="video1" title="Sol Video" videoData={videos.video1} />
            <VideoUploadCard videoKey="video2" title="Sağ Video" videoData={videos.video2} />
          </div>
        </div>

        {/* Bottom Text */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Alt Metin</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İngilizce</label>
              <textarea
                value={content.bottom_text_en}
                onChange={(e) => setContent({ ...content, bottom_text_en: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Türkçe</label>
              <textarea
                value={content.bottom_text_tr}
                onChange={(e) => setContent({ ...content, bottom_text_tr: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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