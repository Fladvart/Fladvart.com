"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import MotionWrapper from "../MotionWrapper";

interface Service {
  id: number;
  order_number: number;
  title_en: string;
  title_tr: string;
  slug: string;
  middle_title_en: string;
  middle_title_tr: string;
  paragraph_1_en: string;
  paragraph_1_tr: string;
  paragraph_2_en: string;
  paragraph_2_tr: string;
  image_url: string | null;
  tags: Array<{
    tag_en: string;
    tag_tr: string;
  }>;
}

interface ServiceCollection {
  id: number;
  main_title_en: string;
  main_title_tr: string;
  main_image_url: string | null;
}

/**
 * Her satırın genişliğine göre animasyon süresini ayarlar.
 * Böylece uzun/kısa fark etmeksizin tüm marquee satırları aynı hızda görünür..
 */
function useMarqueeSpeed(baseSpeedPxPerSec = 80) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // İçerik iki kopya olduğu için gerçek tekrar mesafesi genişliğin yarısı
    const contentWidth = el.scrollWidth / 2; // px cinsinden

    // süre = mesafe / hız (saniye)
    const durationSec = contentWidth / baseSpeedPxPerSec;

    el.style.animationDuration = `${durationSec}s`;
  }, [baseSpeedPxPerSec]);

  return trackRef;
}

interface ServiceMarqueeProps {
  words: string[];
}

/**
 * Orta başlığın iki satırlı, sağ/sola kayan marquee kısmı.
 * Boşluksuz, aynı hızda ve sonsuz döngü şeklinde scroll eder.
 */
function ServiceMarquee({ words }: ServiceMarqueeProps) {
  const rightTrackRef = useMarqueeSpeed(30); // hız ayarını buradan oynatabilirsin
  const leftTrackRef = useMarqueeSpeed(30);

  return (
    <div className="mb-4 md:mb-8 space-y-1 md:space-y-1">
      {/* First line - Scroll right to left */}
      <div className="marquee-right">
        <div className="marquee-track" ref={rightTrackRef}>
          {/* 1. kopya */}
          <h3 className="text-3xl md:text-6xl font-extrabold leading-none whitespace-nowrap">
            {words.map((word, wordIndex) => {
              const groupIndex = Math.floor(wordIndex / 2);
              const color = groupIndex % 2 === 0 ? "#a8a7a7" : "#ffffff";
              return (
                <span key={`r-1-${wordIndex}`} style={{ color }}>
                  {word}&nbsp;
                </span>
              );
            })}
          </h3>
          {/* 2. kopya */}
          <h3 className="text-3xl md:text-6xl font-extrabold leading-none whitespace-nowrap">
            {words.map((word, wordIndex) => {
              const groupIndex = Math.floor(wordIndex / 2);
              const color = groupIndex % 2 === 0 ? "#a8a7a7" : "#ffffff";
              return (
                <span key={`r-2-${wordIndex}`} style={{ color }}>
                  {word}&nbsp;
                </span>
              );
            })}
          </h3>
        </div>
      </div>

      {/* Second line - Scroll left to right */}
      <div className="marquee-left">
        <div className="marquee-track" ref={leftTrackRef}>
          <h3 className="text-3xl md:text-6xl font-extrabold leading-none whitespace-nowrap">
            {words.map((word, wordIndex) => {
              const groupIndex = Math.floor(wordIndex / 2);
              const color = groupIndex % 2 === 0 ? "#a8a7a7" : "#ffffff";
              return (
                <span key={`l-1-${wordIndex}`} style={{ color }}>
                  {word}&nbsp;
                </span>
              );
            })}
          </h3>
          <h3 className="text-3xl md:text-6xl font-extrabold leading-none whitespace-nowrap">
            {words.map((word, wordIndex) => {
              const groupIndex = Math.floor(wordIndex / 2);
              const color = groupIndex % 2 === 0 ? "#a8a7a7" : "#ffffff";
              return (
                <span key={`l-2-${wordIndex}`} style={{ color }}>
                  {word}&nbsp;
                </span>
              );
            })}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [detailedServices, setDetailedServices] = useState<Service[]>([]);
  const [collection, setCollection] = useState<ServiceCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale, t } = useLanguage();

  useEffect(() => {
    fetchServices();
    fetchDetailedServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        setCollection(data.collection || null);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedServices = async () => {
    try {
      const response = await fetch("/api/services/detailed");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDetailedServices(data.services || []);
        }
      }
    } catch (error) {
      console.error("Error fetching detailed services:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121727]">
      {/* Services Section - Mobile Responsive */}
      <section className="px-4 md:px-12 py-1 mb-15">
        <div className="mb-2 mt-8 md:mt-12">
          <MotionWrapper>
            <a
              href="#services"
              className="text-red-500 text-sm font-semibold pt-10 font-sans hover:text-white transition"
            >
              {collection
                ? locale === "tr"
                  ? collection.main_title_tr
                  : collection.main_title_en
                : "SERVICES"}
            </a>
            <h2
              id="services"
              className="text-4xl md:text-7xl font-bold text-white text-center top-0 mb-5 pb-5 mt-12 md:mt-25 font-sans"
            >
              {collection
                ? locale === "tr"
                  ? collection.main_title_tr
                  : collection.main_title_en
                : "SERVICES"}
            </h2>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
            {/* Left side - Image - Hidden on mobile */}
            <div className="hidden md:block md:col-span-4">
              <MotionWrapper delay={0.1}>
                {collection?.main_image_url ? (
                  <img
                    src={collection.main_image_url}
                    alt="Services"
                    className="w-5/6 h-auto mt-20"
                  />
                ) : (
                  <img src="/image4.png" alt="" className="w-5/6 h-auto mt-20" />
                )}
              </MotionWrapper>
            </div>

            {/* Right side - Services List */}
            <div className="md:col-span-8 space-y-2 md:space-y-3 text-white md:ml-2">
              {services.map((service, index) => {
                const title =
                  locale === "tr" ? service.title_tr : service.title_en;
                const number = String(service.order_number).padStart(2, "0");

                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  const sectionId = `service-${service.slug}`;
                  const element = document.getElementById(sectionId);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                };

                return (
                  <MotionWrapper key={service.id} delay={index * 0.05}>
                    <div onClick={handleClick}>
                      {/* Border - always visible, changes opacity on hover */}
                      <div 
                        className={`border-t transition-all duration-300 mb-2 ${
                          hoveredIndex === index 
                            ? "border-gray-300 opacity-100" 
                            : "border-transparent opacity-0"
                        }`}
                      ></div>

                      <div
                        className="flex items-center justify-between py-2 md:py-4 cursor-pointer transition-all duration-300 min-h-20 md:min-h-[100px]"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div className="flex items-center gap-2 md:gap-8 md:ml-16 flex-1">
                          <span className="text-sm text-white shrink-0">
                            {number}
                          </span>
                          <h3
                            className={`
                              font-bold
                              transition-all duration-300
                              ${hoveredIndex === index
                                ? "text-2xl md:text-4xl whitespace-normal max-w-[280px] md:max-w-[420px] leading-tight"
                                : "text-xl md:text-3xl whitespace-nowrap"
                              }
                            `}
                          >
                            {title}
                          </h3>
                        </div>

                        {/* MORE button - always in DOM, opacity controls visibility */}
                        <button 
                          className={`hidden md:flex bg-black text-white rounded-full w-24 h-24 items-center justify-center text-sm font-semibold hover:bg-gray-800 transition-all duration-300 shrink-0 ${
                            hoveredIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
                          }`}
                        >
                          {t("sections.more")}
                        </button>
                      </div>
                    </div>
                  </MotionWrapper>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Service Detail Sections */}
      {detailedServices.map((service, index) => {
        const title =
          locale === "tr" ? service.title_tr : service.title_en;
        const middleTitle =
          locale === "tr"
            ? service.middle_title_tr
            : service.middle_title_en;
        const paragraph1 =
          locale === "tr"
            ? service.paragraph_1_tr
            : service.paragraph_1_en;
        const paragraph2 =
          locale === "tr"
            ? service.paragraph_2_tr
            : service.paragraph_2_en;

        // Split middle title into words for marquee effect
        const words = middleTitle ? middleTitle.split(" ") : [];
        const halfLength = Math.ceil(words.length / 2);
        const firstLine = words.slice(0, halfLength).join(" ");
        const secondLine = words.slice(halfLength).join(" ");

        return (
          <section
            key={service.id}
            id={`service-${service.slug}`}
            className="px-0 py-8 md:py-16"
          >
            <div className="mb-8 md:mb-16">
              <MotionWrapper>
                <div className="px-4 md:px-12">
                  <a
                    href="#services"
                    className="text-red-500 text-sm font-semibold pt-10 font-sans hover:text-white transition mt-10"
                  >
                    {collection
                      ? locale === "tr"
                        ? collection.main_title_tr
                        : collection.main_title_en
                      : locale === "tr"
                        ? "HİZMETLER"
                        : "SERVICES"}
                  </a>

                  <h2 className="text-3xl md:text-7xl font-bold text-white text-center top-0 mb-8 md:mb-18 pb-5 mt-12 md:mt-25 font-sans">
                    {title}
                  </h2>
                </div>
              </MotionWrapper>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-1">
                <div className="md:col-span-5 md:pl-12 md:-ml-12">
                  <MotionWrapper delay={0.1}>
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={title}
                        className="w-full h-[300px] md:h-[600px] object-cover"
                      />
                    ) : (
                      <div className="w-full h-[300px] md:h-[600px] bg-gray-700"></div>
                    )}
                  </MotionWrapper>
                </div>

                {/* Right side - Content */}
                <div className="md:col-span-7 space-y-6 md:space-y-10 p-4 md:p-0 m-0">
                  <MotionWrapper delay={0.15} className="-mx-4 md:mx-0">
                    {middleTitle && <ServiceMarquee words={words} />}
                  </MotionWrapper>

                  {/* Description */}
                  <div className="space-y-4 md:space-y-8">
                    <MotionWrapper delay={0.2}>
                      <div className="flex gap-4 md:gap-8">
                        <span className="text-1xl font-bold ml-0 md:ml-30 mt-3 hidden md:block">
                          {">>>"}
                        </span>
                        <div className="space-y-4 mt-3">
                          {paragraph1 && (
                            <p className="text-gray-500 text-sm md:text-lg leading-relaxed md:ml-20 whitespace-pre-line">
                              {paragraph1}
                            </p>
                          )}
                          {paragraph2 && (
                            <p className="text-gray-500 text-sm md:text-lg leading-relaxed md:ml-20 whitespace-pre-line">
                              {paragraph2}
                            </p>
                          )}
                        </div>
                      </div>
                    </MotionWrapper>

                    {/* Tags/Services List */}
                    {service.tags && service.tags.length > 0 && (
                      <MotionWrapper delay={0.25}>
                        <div className="space-y-3 md:space-y-4 pt-6 md:pt-12 ml-0 md:ml-67">
                          {service.tags.map((tag, tagIndex) => {
                            const tagText =
                              locale === "tr" ? tag.tag_tr : tag.tag_en;
                            return (
                              <h4
                                key={tagIndex}
                                className="text-lg md:text-2xl font-bold text-white"
                              >
                                {tagText}
                              </h4>
                            );
                          })}
                        </div>
                      </MotionWrapper>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
