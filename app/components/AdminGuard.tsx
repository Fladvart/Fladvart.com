'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (status === 'unauthenticated') {
      console.log('Not authenticated, redirecting to signin');
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    if (session && session.user?.role !== 'admin') {
      console.log('Not admin role, redirecting to signin');
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null; // Redirect happening
  }

  return <>{children}</>;
}
