'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-16 w-16 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Giriş Hatası
        </h1>
        
        <p className="text-gray-600 mb-6">
          Giriş sırasında bir hata oluştu. Lütfen email ve şifrenizi kontrol edip tekrar deneyin.
        </p>
        
        <Link
          href="/auth/signin"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Giriş Sayfasına Dön</span>
        </Link>
      </div>
    </div>
  );
}
