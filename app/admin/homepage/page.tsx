import AdminLayout from '../AdminLayout';
import { Video, HelpCircle, Megaphone, Layout } from 'lucide-react';
import Link from 'next/link';

export default function HomepageAdmin() {
  const sections = [
    {
      title: 'Hero Section',
      description: 'Manage the main video and text at the top of the homepage.',
      icon: <Video size={24} />,
      href: '/admin/content/hero',
      color: 'blue'
    },
    {
      title: 'Why We Exist',
      description: 'Update the "Why We Exist" section content and images.',
      icon: <HelpCircle size={24} />,
      href: '/admin/content/why-we-exist',
      color: 'green'
    },
    {
      title: 'Services Preview',
      description: 'Manage which services appear on the homepage.',
      icon: <Layout size={24} />,
      href: '/admin/content/homepage-services', // Note: Check if this route exists or needs to be created
      color: 'purple'
    },
    {
      title: 'CTA Section',
      description: 'Edit the Call to Action section at the bottom.',
      icon: <Megaphone size={24} />,
      href: '/admin/content/cta-section',
      color: 'orange'
    }
  ];

  // Check if homepage-services exists, if not redirect to main services page
  // Actually, based on file structure, we have app/admin/content/services/page.tsx
  // We might want to just link there or create a specific homepage config if needed.
  // For now, let's link to the main services admin.
  const correctedSections = sections.map(s => 
    s.title === 'Services Preview' ? { ...s, href: '/admin/content/services' } : s
  );

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AdminLayout title="Homepage Management">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Homepage Sections
          </h3>
          <p className="text-gray-600">
            Select a section below to edit its content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {correctedSections.map((section, index) => (
            <Link 
              key={index} 
              href={section.href}
              className={`p-6 rounded-lg border-2 transition-all ${getColorClasses(section.color)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">{section.title}</h4>
                  <p className="text-sm opacity-80">{section.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
