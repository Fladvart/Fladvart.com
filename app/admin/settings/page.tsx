'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../AdminLayout';
import { User, Lock, Check, AlertCircle, Loader2, Edit2, X } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  role: string;
}

type TabType = 'profile' | 'password';

export default function SettingsAdmin() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile states
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    role: ''
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    role: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Profil bilgilerini yükle
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const profile = {
          name: data.name,
          email: data.email,
          role: data.role
        };
        setProfileData(profile);
        setOriginalProfileData(profile);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };


  // Profil güncelleme
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
        setOriginalProfileData(profileData);
        setIsEditingProfile(false);
        // Session'ı yenile
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Bir hata oluştu' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Profil güncellenemedi' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Profil düzenlemeyi iptal et
  const handleCancelProfileEdit = () => {
    setProfileData(originalProfileData);
    setIsEditingProfile(false);
    setProfileMessage(null);
  };

  // Şifre değiştirme
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage(null);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditingPassword(false);
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Bir hata oluştu' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Şifre değiştirilemedi' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Şifre düzenlemeyi iptal et
  const handleCancelPasswordEdit = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditingPassword(false);
    setPasswordMessage(null);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil Bilgileri', icon: User },
    { id: 'password' as TabType, label: 'Şifre Değiştir', icon: Lock }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ayarlar</h3>
          <p className="text-gray-600 mt-1">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Profil Bilgileri</h4>
                  
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Düzenle
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelProfileEdit}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  )}
                </div>
                
                {profileMessage && (
                  <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                    profileMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {profileMessage.type === 'success' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        İsim
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 font-medium ${
                          !isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 font-medium ${
                          !isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Rol
                      </label>
                      <input
                        type="text"
                        value={profileData.role}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Rol bilgisi değiştirilemez</p>
                    </div>

                    {isEditingProfile && (
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Değişiklikleri Kaydet
                          </>
                        )}
                      </button>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h4>
                  
                  {!isEditingPassword ? (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Şifre Değiştir
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelPasswordEdit}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  )}
                </div>
                
                {passwordMessage && (
                  <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                    passwordMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {passwordMessage.type === 'success' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                {!isEditingPassword ? (
                  <div className="max-w-lg">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <h5 className="font-semibold text-gray-900 mb-2">Güvenlik</h5>
                      <p className="text-sm text-gray-600 mb-4">
                        Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirmenizi öneririz.
                      </p>
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Şifre Değiştir
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Mevcut Şifre
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        minLength={6}
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Yeni Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Şifreyi Kaydet
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
