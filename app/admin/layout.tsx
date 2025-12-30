import { ReactNode } from 'react';
import AdminGuard from '../components/AdminGuard';

export const metadata = {
  title: 'FLADVart Admin Panel',
  description: 'Content Management System',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AdminGuard>
  );
}
