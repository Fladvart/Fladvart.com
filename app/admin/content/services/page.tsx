'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/app/admin/AdminLayout';
import Link from 'next/link';

interface Service {
  id: number;
  collection_id: number;
  order_number: number;
  title_en: string;
  title_tr: string;
  slug: string;
  is_active: boolean;
}

interface ServiceCollection {
  id: number;
  main_title_en: string;
  main_title_tr: string;
  main_image_url?: string;
  main_image_media_id?: number;
}

export default function ServicesPage() {
  const [collection, setCollection] = useState<ServiceCollection | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm('Bu servisi silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeleting(serviceId);
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Servis başarıyla silindi!');
        fetchServices();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında bir hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Services">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Services Management">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Main Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ana Ayarlar</h2>
            <Link
              href="/admin/content/services/settings"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Başlık & Görsel Düzenle
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Başlık (EN)
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                {collection?.main_title_en || 'SERVICES'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Başlık (TR)
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                {collection?.main_title_tr || 'HİZMETLER'}
              </div>
            </div>
          </div>

          {collection?.main_image_url && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Görsel
              </label>
              <img
                src={collection.main_image_url}
                alt="Services main"
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Services List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Hizmetler ({services.length})
            </h2>
            <Link
              href="/admin/content/services/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Hizmet Ekle
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz hizmet eklenmemiş</p>
              <Link
                href="/admin/content/services/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                İlk Hizmetii Ekle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">
                          {String(service.order_number).padStart(2, '0')}
                        </span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {service.title_en}
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    {service.title_tr}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/content/services/${service.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={deleting === service.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 text-sm"
                    >
                      {deleting === service.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Bilgi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Her servis için ayrı detay sayfası oluşturulacak</li>
            <li>• Hizmetler sıra numarasına göre görüntülenir</li>
            <li>• Her serviste: Başlık, Görsel, Orta Başlık, 2 Paragraf, Etiketler bulunur</li>
            <li>• Ana ayarlardan başlık ve ana görseli düzenleyebilirsiniz</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
