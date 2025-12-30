'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, MapPin, Phone, Mail, Linkedin, Instagram, Lock, Unlock } from 'lucide-react';
import AdminLayout from '@/app/admin/AdminLayout';

interface ContactInfo {
  id?: number;
  address_en: string;
  address_tr: string;
  phone: string;
  email: string;
  linkedin_url: string;
  instagram_url: string;
}

export default function ContactInfoPage() {
  const [contact, setContact] = useState<ContactInfo>({
    address_en: '',
    address_tr: '',
    phone: '',
    email: '',
    linkedin_url: '',
    instagram_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/contact-info');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setContact(data);
        }
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/admin/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });

      if (!response.ok) throw new Error('Save failed');

      alert('İletişim bilgileri başarıyla kaydedildi!');
      fetchContactInfo();
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
    fetchContactInfo(); // Revert changes
  };

  if (loading) {
    return (
      <AdminLayout title="Contact Info">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contact Information">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Edit Toggle */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">
            Manage your contact details displayed on the website.
          </p>
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

        {/* Address */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Adres</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İngilizce
              </label>
              <textarea
                value={contact.address_en}
                onChange={(e) => setContact({ ...contact, address_en: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="NİŞBETİYE, NİŞBETİYE CD NO:24,&#10;34340 BEŞİKTAŞ/İSTANBUL,&#10;TURKEY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Türkçe
              </label>
              <textarea
                value={contact.address_tr}
                onChange={(e) => setContact({ ...contact, address_tr: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="NİŞBETİYE, NİŞBETİYE CD NO:24,&#10;34340 BEŞİKTAŞ/İSTANBUL,&#10;TÜRKİYE"
              />
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Telefon</h2>
          </div>
          
          <input
            type="text"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="+90 538 9953"
          />
          <p className="text-xs text-gray-500 mt-2">
            Örnek: +90 538 9953 veya +90 555 123 45 67
          </p>
        </div>

        {/* Email */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">E-posta</h2>
          </div>
          
          <input
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="info@flad.art"
          />
        </div>

        {/* Social Media */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-opacity ${!isEditing ? 'opacity-75' : ''}`}>
          <h2 className="text-lg font-semibold mb-6 text-gray-900">Sosyal Medya</h2>
          
          <div className="space-y-4">
            {/* LinkedIn */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-medium text-gray-700">LinkedIn</label>
              </div>
              <input
                type="url"
                value={contact.linkedin_url}
                onChange={(e) => setContact({ ...contact, linkedin_url: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="https://www.linkedin.com/company/fladvart"
              />
            </div>

            {/* Instagram */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-medium text-gray-700">Instagram</label>
              </div>
              <input
                type="url"
                value={contact.instagram_url}
                onChange={(e) => setContact({ ...contact, instagram_url: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="https://www.instagram.com/fladvart"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Önizleme (Türkçe)</h3>
          <div className="space-y-4 text-sm">
            {contact.address_tr && (
              <div>
                <div className="font-medium text-gray-700 mb-1">Adres:</div>
                <div className="text-gray-600 whitespace-pre-line">{contact.address_tr}</div>
              </div>
            )}
            {contact.phone && (
              <div>
                <div className="font-medium text-gray-700 mb-1">Telefon:</div>
                <div className="text-gray-600">{contact.phone}</div>
              </div>
            )}
            {contact.email && (
              <div>
                <div className="font-medium text-gray-700 mb-1">E-posta:</div>
                <div className="text-gray-600">{contact.email}</div>
              </div>
            )}
            {(contact.linkedin_url || contact.instagram_url) && (
              <div>
                <div className="font-medium text-gray-700 mb-2">Sosyal Medya:</div>
                <div className="flex gap-3">
                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {contact.instagram_url && (
                    <a
                      href={contact.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end pb-8">
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
