'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileEdit, MessageSquare, Settings, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });
    router.push('/');
  };

  const navItems = [
    {
      href: '/admin',
      icon: <Home size={20} />,
      label: 'Dashboard',
      id: 'dashboard'
    },
    {
      href: '/admin/content',
      icon: <FileEdit size={20} />,
      label: 'Content Editor',
      id: 'content',
      subItems: [
        { href: '/admin/content/hero', label: 'Hero Video' },
        { href: '/admin/content/why-we-exist', label: 'Why We Exist' },
        { href: '/admin/content/services', label: 'Services' },
        { href: '/admin/content/cta-section', label: 'CTA Section' },
        { href: '/admin/content/contact-info', label: 'Contact Info' }
      ]
    },
    {
      href: '/admin/messages',
      icon: <MessageSquare size={20} />,
      label: 'Messages',
      id: 'messages'
    },
    {
      href: '/admin/settings',
      icon: <Settings size={20} />,
      label: 'Settings',
      id: 'settings'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col fixed h-screen">
      {/* Logo & Title */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="block">
          <h1 className="text-xl font-bold text-gray-900">FLADVart</h1>
          <p className="text-sm text-gray-600 mt-1">Admin Panel</p>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {session?.user?.email || 'admin@fladvart.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={isActive(item.href) ? 'text-white' : 'text-gray-500'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>

              {/* Sub Items */}
              {item.subItems && isActive(item.href) && (
                <ul className="mt-2 ml-8 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                          pathname === subItem.href
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
