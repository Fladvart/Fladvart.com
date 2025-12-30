import AdminLayout from '../AdminLayout';
import Link from 'next/link';
import { Video, Image, FileText, Mail, Sparkles } from 'lucide-react';

export default function ContentEditorPage() {
  const contentSections = [
    {
      title: 'Hero Video',
      description: 'Manage homepage hero section video and text',
      icon: <Video size={32} />,
      href: '/admin/content/hero',
      color: 'blue',
      stats: { items: 1, lastUpdated: '2 days ago' }
    },
    {
      title: 'Why We Exist',
      description: 'Edit why we exist section with images and paragraphs',
      icon: <Image size={32} />,
      href: '/admin/content/why-we-exist',
      color: 'green',
      stats: { items: 7, lastUpdated: '1 week ago' }
    },
    {
      title: 'Services',
      description: 'Manage all services content and details',
      icon: <FileText size={32} />,
      href: '/admin/content/services',
      color: 'purple',
      stats: { items: 5, lastUpdated: '3 days ago' }
    },
    {
      title: 'CTA Section',
      description: 'Edit "Your Vision Deserves" section and marquee text',
      icon: <Sparkles size={32} />,
      href: '/admin/content/cta-section',
      color: 'red',
      stats: { items: 1, lastUpdated: 'Just now' }
    },
    {
      title: 'Contact Info',
      description: 'Update contact information and social links',
      icon: <Mail size={32} />,
      href: '/admin/content/contact-info',
      color: 'orange',
      stats: { items: 1, lastUpdated: '1 month ago' }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AdminLayout title="Content Editor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Content Management
          </h2>
          <p className="text-gray-600">
            Select a section below to edit your website content.
          </p>
        </div>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className={`block p-6 rounded-lg border-2 transition-all duration-200 ${getColorClasses(section.color)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-white shadow-sm">
                  {section.icon}
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-white rounded-full shadow-sm">
                  {section.stats.items} items
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {section.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {section.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Last updated: {section.stats.lastUpdated}
                </span>
                <span className="text-sm font-medium">
                  Edit →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Changes are saved automatically</li>
            <li>• Upload images/videos using the upload button in each section</li>
            <li>• All content supports both Turkish and English</li>
            <li>• Preview changes before publishing</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
