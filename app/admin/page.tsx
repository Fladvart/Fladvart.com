import AdminLayout from './AdminLayout';
import { FileText, Users, Phone, BarChart3, Mail, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { pool } from '@/lib/db';
import Link from 'next/link';

async function getDashboardData() {
  try {
    // Run queries in parallel
    const [servicesCount, unreadMessages, mediaCount, recentMessages] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM services'),
      pool.query('SELECT COUNT(*) FROM contact_messages WHERE is_read = false'),
      pool.query('SELECT COUNT(*) FROM media'),
      pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 3')
    ]);

    return {
      servicesCount: parseInt(servicesCount.rows[0]?.count || '0'),
      unreadMessages: parseInt(unreadMessages.rows[0]?.count || '0'),
      mediaCount: parseInt(mediaCount.rows[0]?.count || '0'),
      recentMessages: recentMessages.rows
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      servicesCount: 0,
      unreadMessages: 0,
      mediaCount: 0,
      recentMessages: []
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      title: 'Unread Messages',
      value: data.unreadMessages.toString(),
      subtitle: 'Messages waiting for reply',
      icon: <Mail size={24} />,
      color: 'orange',
      link: '/admin/messages'
    },
    {
      title: 'Active Services',
      value: data.servicesCount.toString(),
      subtitle: 'Services listed on site',
      icon: <FileText size={24} />,
      color: 'blue',
      link: '/admin/content/services'
    },
    {
      title: 'Media Library',
      value: data.mediaCount.toString(),
      subtitle: 'Images and videos',
      icon: <ImageIcon size={24} />,
      color: 'purple',
      link: '#' // No direct media library page yet
    },
    {
      title: 'Contact Info',
      value: 'Active',
      subtitle: 'Contact details',
      icon: <Phone size={24} />,
      color: 'green',
      link: '/admin/content/contact-info'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatDate = (dateString: Date) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       month: 'short',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     });
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6 font-sans">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to FLADVart Admin Panel
          </h3>
          <p className="text-gray-600">
            Manage your website content, pages, and settings from this dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link 
              href={stat.link}
              key={index}
              className={`p-6 rounded-lg border-2 transition-transform hover:scale-105 ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs opacity-60 mt-1">{stat.subtitle}</p>
                </div>
                <div className="opacity-75">
                  {stat.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900">Recent Messages</h4>
              <Link href="/admin/messages" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="p-6 flex-1">
              {data.recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {data.recentMessages.map((msg: any) => (
                    <div key={msg.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${!msg.is_read ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        !msg.is_read ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {msg.name}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{msg.email}</p>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No messages found.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Quick Actions</h4>
            </div>
            <div className="p-6 space-y-4">
              <Link 
                href="/admin/homepage"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <div>
                  <p className="font-medium text-blue-900">Edit Homepage</p>
                  <p className="text-sm text-blue-700">Manage homepage content</p>
                </div>
                <FileText size={20} className="text-blue-600" />
              </Link>
              
              <Link 
                href="/admin/content/services"
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              >
                <div>
                  <p className="font-medium text-green-900">Manage Services</p>
                  <p className="text-sm text-green-700">Add or edit services</p>
                </div>
                <Users size={20} className="text-green-600" />
              </Link>
              
              <Link 
                href="/admin/content/contact-info"
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
              >
                <div>
                  <p className="font-medium text-purple-900">Contact Settings</p>
                  <p className="text-sm text-purple-700">Update contact details</p>
                </div>
                <Phone size={20} className="text-purple-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
