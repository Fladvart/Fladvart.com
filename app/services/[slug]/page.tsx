'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import Footer from '@/app/components/Footer';
import { Loader2 } from 'lucide-react';

interface ServiceDetail {
  id: number;
  title_en: string;
  title_tr: string;
  slug: string;
  image_url?: string;
  middle_title_en: string;
  middle_title_tr: string;
  paragraph_1_en: string;
  paragraph_1_tr: string;
  paragraph_2_en: string;
  paragraph_2_tr: string;
  tags: Array<{
    tag_en: string;
    tag_tr: string;
  }>;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const { locale } = useLanguage();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.slug) {
      fetchServiceBySlug(params.slug as string);
    }
  }, [params?.slug]);

  const fetchServiceBySlug = async (slug: string) => {
    try {
      const response = await fetch(`/api/services/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setService(data);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600">The service you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = locale === 'tr' ? service.title_tr : service.title_en;
  const middleTitle = locale === 'tr' ? service.middle_title_tr : service.middle_title_en;
  const paragraph1 = locale === 'tr' ? service.paragraph_1_tr : service.paragraph_1_en;
  const paragraph2 = locale === 'tr' ? service.paragraph_2_tr : service.paragraph_2_en;

  return (
    <div className="min-h-screen bg-white">
      {/* Service Detail Section */}
      <section className="px-12 py-16 mt-20">
        <div className="mb-16">
          <div className="text-red-500 text-sm font-semibold mb-16">
            {locale === 'tr' ? 'HİZMETLER' : 'SERVICES'}
          </div>
          
          <h1 className="text-7xl font-bold text-black mb-20 text-center">
            {title}
          </h1>

          <div className="grid grid-cols-12 gap-8">
            {/* Left side - Image */}
            <div className="col-span-5 -ml-12">
              {service.image_url ? (
                <img 
                  src={service.image_url} 
                  alt={title} 
                  className="w-5/6 h-auto aspect-3/4 object-cover" 
                />
              ) : (
                <div className="w-5/6 h-auto aspect-3/4 bg-gray-200"></div>
              )}
            </div>

            {/* Right side - Content */}
            <div className="col-span-7 space-y-12">
              {/* Middle Title Section with marquee effect */}
              <div className="mb-16 overflow-hidden relative">
                <div className="marquee-right">
                  <div className="flex">
                    <h3 className="text-6xl font-extrabold leading-none whitespace-nowrap pr-8">
                      {middleTitle.split(' ').map((word, idx) => (
                        <span 
                          key={idx}
                          style={{ color: idx % 2 === 0 ? '#878787' : '#121727' }}
                        >
                          {word}&nbsp;
                        </span>
                      ))}
                    </h3>
                    <h3 className="text-6xl font-extrabold leading-none whitespace-nowrap">
                      {middleTitle.split(' ').map((word, idx) => (
                        <span 
                          key={idx}
                          style={{ color: idx % 2 === 0 ? '#878787' : '#121727' }}
                        >
                          {word}&nbsp;
                        </span>
                      ))}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-8">
                <div className="flex gap-8">
                  <span className="text-2xl font-bold">///</span>
                  <div className="space-y-4">
                    <p className="text-gray-500 text-lg leading-relaxed">
                      {paragraph1}
                    </p>
                    {paragraph2 && (
                      <p className="text-gray-500 text-lg leading-relaxed">
                        {paragraph2}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags/Services List */}
                {service.tags && service.tags.length > 0 && (
                  <div className="space-y-4 pt-12">
                    {service.tags.map((tag, index) => (
                      <h4 key={index} className="text-2xl font-bold text-gray-600">
                        {locale === 'tr' ? tag.tag_tr : tag.tag_en}
                      </h4>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes marquee-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-right {
          animation: marquee-right 20s linear infinite;
        }

        .marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
