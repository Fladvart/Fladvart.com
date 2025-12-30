'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageProvider';
import MotionWrapper from '../MotionWrapper';

interface MarqueeItem {
  text_en: string;
  text_tr: string;
}

interface CTASection {
  id: number;
  main_title_en: string;
  main_title_tr: string;
  description_en: string;
  description_tr: string;
  button_text_en: string;
  button_text_tr: string;
  button_link: string;
  background_image_url: string | null;
  marquee_items: MarqueeItem[];
}

export default function CTASection() {
  const { locale } = useLanguage();
  const [ctaData, setCtaData] = useState<CTASection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCTAData();
  }, []);

  const fetchCTAData = async () => {
    try {
      const response = await fetch('/api/cta-section');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Marquee data normalization
          let marqueeItems = data.data.marquee_items;
          if (typeof marqueeItems === 'string') {
            try { marqueeItems = JSON.parse(marqueeItems); } catch (e) { }
          }

          setCtaData({
            ...data.data,
            marquee_items: marqueeItems
          });
        }
      }
    } catch (error) {
      console.error('Error fetching CTA data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ctaData) {
    return null;
  }

  const mainTitle = locale === 'tr' ? ctaData.main_title_tr : ctaData.main_title_en;
  const description = locale === 'tr' ? ctaData.description_tr : ctaData.description_en;
  const buttonText = locale === 'tr' ? ctaData.button_text_tr : ctaData.button_text_en;

  // Helper function to get marquee items text
  const getMarqueeText = (item: any) => {
    if (typeof item === 'string') return item;
    return locale === 'tr' ? (item.text_tr || item.text_en) : item.text_en;
  };

  return (
    <div className="bg-[#121727]">
      {/* CTA Section - Your Vision Deserves - Mobile Responsive */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <MotionWrapper>
          <div
            className="relative overflow-hidden min-h-[400px] md:min-h-[500px] lg:min-h-[700px] flex items-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: ctaData.background_image_url
                ? `url(${ctaData.background_image_url})`
                : "url('/collobrate.png')"
            }}
          >


            {/* Sol Yazı - Mobile Responsive */}
            <div className="absolute top-6 md:top-10 left-4 md:left-10 z-10">
              <MotionWrapper delay={0.2}>
                <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-8 leading-none max-w-3/4 whitespace-pre-line">
                  {mainTitle}
                </h2>
              </MotionWrapper>
            </div>

            {/* Sağ Alt Text + Button - Mobile Responsive */}
            <div className="absolute bottom-6 md:bottom-20 right-4 md:right-20 z-12 flex flex-col items-start text-left">
              <MotionWrapper delay={0.4}>
                <p className="text-white font-bold text-sm md:text-xl leading-relaxed mb-4 md:mb-10 max-w-[200px] md:max-w-md whitespace-pre-line uppercase">
                  {description}
                </p>
              </MotionWrapper>

              <MotionWrapper delay={0.6}>
                <a
                  href={ctaData.button_link}
                  onClick={(e) => {
                    const targetId = ctaData.button_link.startsWith('#')
                      ? ctaData.button_link.substring(1)
                      : ctaData.button_link.includes('contact')
                        ? 'contact'
                        : null;

                    if (targetId) {
                      const element = document.getElementById(targetId);
                      if (element) {
                        e.preventDefault();
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="
      text-white
      px-3 py-1 md:px-6 md:py-2
      text-xs md:text-sm font-semibold
      transition-all duration-300 ease-out
      flex items-center gap-1 md:gap-2
      bg-[#121727]
      backdrop-blur-sm
      uppercase
      hover:bg-[#1a2140]
      hover:scale-[1.04]
      hover:shadow-[0_0_20px_rgba(80,100,255,0.35)]
    "

                >
                  {buttonText}
                  <span className="text-base md:text-xl">+</span>
                </a>
              </MotionWrapper>
            </div>

          </div>
        </MotionWrapper>
      </section>

      {/* Motion Section – Marquees - Mobile Responsive */}
      <section className="w-full overflow-hidden py-10 md:py-20 bg-[#121727]">
        <div className="space-y-1 md:space-y-2">

          {/* ÜST SATIR – SAĞA (Marquee Right) */}
          <MotionWrapper delay={0.2} viewportAmount="some">
            <div className="w-full overflow-hidden">
              <div
                className="flex whitespace-nowrap cta-marquee-right"
              >
                {/* Duplicate items for seamless loop */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex shrink-0">
                    {ctaData.marquee_items.slice(0, Math.ceil(ctaData.marquee_items.length / 2)).map((item, idx) => (
                      <h3 key={idx} className="text-3xl md:text-5xl lg:text-7xl font-extrabold mr-6 md:mr-12" style={{ color: "#F5F5F5" }}>
                        {getMarqueeText(item)}
                      </h3>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </MotionWrapper>

          {/* ALT SATIR – SOLA (Marquee Left) */}
          <MotionWrapper delay={0.4} viewportAmount="some">
            <div className="w-full overflow-hidden mb-15">
              <div
                className="flex whitespace-nowrap cta-marquee-left"
              >
                {/* Duplicate items for seamless loop */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex shrink-0">
                    {ctaData.marquee_items.slice(Math.ceil(ctaData.marquee_items.length / 2)).map((item, idx) => (
                      <h3 key={idx} className="text-3xl md:text-5xl lg:text-7xl font-extrabold mr-6 md:mr-12" style={{ color: "#A3A3A3" }}>
                        {getMarqueeText(item)}
                      </h3>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </MotionWrapper>

        </div>
      </section>
    </div>
  );
}
