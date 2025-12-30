'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleAdminAccess = () => {
    router.push('/admin');
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <h3 className="font-bold text-gray-900 mb-2">🔍 Auth Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            status === 'authenticated' ? 'bg-green-100 text-green-800' :
            status === 'unauthenticated' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
        
        {session?.user && (
          <>
            <div><strong>Email:</strong> {session.user.email}</div>
            <div><strong>Name:</strong> {session.user.name}</div>
            <div><strong>Role:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                session.user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {session.user.role}
              </span>
            </div>
            <div><strong>Expires:</strong> {session.expires}</div>
          </>
        )}
        
        <div className="space-y-1 mt-3">
          {status === 'authenticated' ? (
            <>
              <button
                onClick={handleAdminAccess}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-600"
              >
                Admin Panel
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full bg-red-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-green-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-green-600"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
