'use client';

import { useLanguage } from '../LanguageProvider';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface HeroVideoData {
  video_url: string;
  mobile_video_url?: string;
  title_en?: string;
  title_tr?: string;
  description_en?: string;
  description_tr?: string;
}

interface HeroSectionProps {
  onContentLoaded?: () => void;
}

export default function HeroSection({ onContentLoaded }: HeroSectionProps) {
  const { locale, setLocale, t } = useLanguage();
  const [heroVideo, setHeroVideo] = useState<HeroVideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchHeroVideo();
  }, []);

  useEffect(() => {
    // Video yüklenip loading bittiğinde parent'a bildir
    if (!loading && videoLoaded && onContentLoaded) {
      onContentLoaded();
    }
  }, [loading, videoLoaded, onContentLoaded]);

  // Video elementini manuel olarak oynatmayı dene
  useEffect(() => {
    if (!loading && heroVideo) {
      const attemptPlay = async () => {
        try {
          if (desktopVideoRef.current) {
            await desktopVideoRef.current.play();
          }
          if (mobileVideoRef.current) {
            await mobileVideoRef.current.play();
          }
        } catch (error) {
          console.log('Auto-play prevented:', error);
          // Kullanıcı etkileşimi gerekebilir
        }
      };
      
      // Biraz gecikme ile dene
      setTimeout(attemptPlay, 100);
    }
  }, [loading, heroVideo]);

  const fetchHeroVideo = async () => {
    try {
      const response = await fetch('/api/admin/hero-video');
      const data = await response.json();

      if (data.success && data.data) {
        console.log('Hero video data loaded:', data.data);
        setHeroVideo(data.data);
      }
    } catch (error) {
      console.error('Error fetching hero video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoLoaded = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error:', e);
    const video = e.currentTarget;
    console.error('Video error details:', {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
      src: video.currentSrc
    });
    setVideoError(true);
  };

  // Video otomatik oynatmayı zorla (mobil cihazlar için)
  const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log('Video can play');
    const video = e.currentTarget;
    video.play().catch((error) => {
      console.log('Autoplay failed, user interaction may be required:', error);
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black">
        {/* Desktop Video - Hidden on mobile if mobile video exists */}
        {!loading && heroVideo?.video_url && (
          <video
            ref={desktopVideoRef}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            preload="auto"
            onLoadedData={handleVideoLoaded}
            onCanPlay={handleCanPlay}
            onError={handleVideoError}
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              heroVideo.mobile_video_url ? 'hidden md:block' : ''
            }`}
          >
            <source src={heroVideo.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Mobile Video - Only shown on mobile if it exists */}
        {!loading && heroVideo?.mobile_video_url && (
          <video
            ref={mobileVideoRef}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            preload="auto"
            onLoadedData={handleVideoLoaded}
            onCanPlay={handleCanPlay}
            onError={handleVideoError}
            className="absolute top-0 left-0 w-full h-full object-cover md:hidden"
          >
            <source src={heroVideo.mobile_video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Loading state gösterme - artık ana sayfada gösteriliyor */}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center">
            <div className="text-white/60 text-sm">Preparing content...</div>
          </div>
        )}

        {/* Video Error State */}
        {videoError && (
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-white/60 text-sm text-center px-4">
              <p>Video could not be loaded.</p>
              <p className="text-xs mt-2">Please check your connection and refresh.</p>
            </div>
          </div>
        )}

        {/* Navigation - Mobile Responsive */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute top-4 md:top-8 left-4 md:left-1/2 md:-translate-x-1/2 z-10"
        >
          <div className="flex md:flex-col gap-4 md:gap-1 text-gray-100 text-xs font-light">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="
              text-white/60 
              transition-all 
              duration-200 
              hover:text-white 
            "
            >
              {t('nav.why')}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="
              text-white/60 
              transition-all 
              duration-200 
              hover:text-white 
            "            >
              {t('nav.services')}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="
              text-white/60 
              transition-all 
              duration-200 
              hover:text-white 
            "            >
              {t('nav.contact')}
            </a>
          </div>
        </motion.nav>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute top-4 md:top-8 right-4 md:right-8 z-10 text-white text-xs font-light"
        >
          <button
            className={`  hover:text-white 
              ${locale === 'tr' ? 'font-semibold' : ''}`}
            onClick={() => setLocale('tr')}
          >
            TR
          </button>
          <span className="mx-1">|</span>
          <button
            className={`  hover:text-white 
               ${locale === 'en' ? 'font-semibold' : ''}`}
            onClick={() => setLocale('en')}
          >
            EN
          </button>
        </motion.div>

        {/* Hero Text */}
        {/* {heroVideo && (heroVideo.title_tr || heroVideo.title_en) && (
          <div className="relative z-10 text-center px-8">
            <h1 className="text-5xl md:text-6xl font-light text-white italic">
              {locale === 'tr' ? heroVideo.title_tr : heroVideo.title_en}
            </h1>
            {(heroVideo.description_tr || heroVideo.description_en) && (
              <p className="mt-4 text-xl text-white/90">
                {locale === 'tr' ? heroVideo.description_tr : heroVideo.description_en}
              </p>
            )}
          </div>
        )} */}

        {/* Logo - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="absolute bottom-0 left-0 w-full z-10"
        >
          {/* Siyah Şerit */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-xs h-24 md:h-36"></div>

          {/* Logo */}
          <div className="relative flex items-center h-24 md:h-36 pl-0">
            <img
              src="/logofladvart.png"
              alt="Logo"
              className="w-56 md:w-88 h-auto"
            />
          </div>

        </motion.div>
      </section>
    </div>
  );
}
