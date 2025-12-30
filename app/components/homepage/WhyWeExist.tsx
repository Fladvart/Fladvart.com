"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageProvider";
import MotionWrapper from "../MotionWrapper";

interface WhyWeExistData {
  main_title_en: string;
  main_title_tr: string;
  left_title_en: string;
  left_title_tr: string;
  right_paragraph_1_en: string;
  right_paragraph_1_tr: string;
  right_paragraph_2_en: string;
  right_paragraph_2_tr: string;
  bottom_text_en: string;
  bottom_text_tr: string;

  images: {
    image_1: string | null;
    image_2: string | null;
    image_3: string | null;
  };

  // NEW
  videos: {
    video_1: string | null;
    video_2: string | null;
  };
}

export default function WhyWeExist() {
  const [data, setData] = useState<WhyWeExistData | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale } = useLanguage();

  useEffect(() => {
    fetchWhyWeExistData();
  }, []);

  const fetchWhyWeExistData = async () => {
    try {
      const response = await fetch("/api/why-we-exist");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching why we exist data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121727] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#121727] flex items-center justify-center">
        <div className="text-white">No content available</div>
      </div>
    );
  }

  const mainTitle = locale === "tr" ? data.main_title_tr : data.main_title_en;
  const leftTitle = locale === "tr" ? data.left_title_tr : data.left_title_en;
  const rightParagraph1 =
    locale === "tr" ? data.right_paragraph_1_tr : data.right_paragraph_1_en;
  const rightParagraph2 =
    locale === "tr" ? data.right_paragraph_2_tr : data.right_paragraph_2_en;
  const bottomText = locale === "tr" ? data.bottom_text_tr : data.bottom_text_en;

  return (
    <div className="min-h-screen bg-[#121727] flex gap-7">
      <section className="px-4 md:px-12 py-1 mb-15 w-full">
        <div className="mb-2 mt-12">
          <MotionWrapper>
            <a
              href="#why"
              className="text-red-500 text-sm font-semibold pt-10 font-sans hover:text-white transition"
            >
              {locale === "tr" ? "HAKKIMIZDA" : "WHY WE EXIST"}
            </a>

            <h2
              id="why"
              className="text-4xl md:text-7xl font-bold text-white text-center top-0 mb-5 pb-5 mt-25 font-sans"
            >
              {mainTitle}
            </h2>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-0 mt-9">
            <MotionWrapper delay={0.1}>
              <div>
                <h3 className="text-2xl md:text-4xl text-white font-extrabold mb-4 md:pt-24 leading-tight font-sans whitespace-pre-line">
                  {leftTitle}
                </h3>
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <div className="mt-3 space-y-4 text-white text-sm md:text-lg text-left md:text-right font-light font-sans">
                <p className="leading-relaxed whitespace-pre-line">{rightParagraph1}</p>
                <p className="leading-relaxed whitespace-pre-line">{rightParagraph2}</p>
              </div>
            </MotionWrapper>
          </div>

          {/* Media Row: Left Video | Right Video - Mobile Responsive */}
          <div className="flex flex-col md:flex-row mt-6 w-full md:items-end gap-6 md:gap-10">
            {/* VIDEOS */}
            <div className="flex items-start gap-4 md:gap-7">
              {data.videos?.video_1 && (
                <MotionWrapper delay={0.3}>
                  <video
                    src={data.videos.video_1}
                    className="w-full max-w-[150px] md:max-w-[280px] h-auto"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </MotionWrapper>
              )}

              {data.videos?.video_2 && (
                <MotionWrapper delay={0.4}>
                  <video
                    src={data.videos.video_2}
                    className="w-full max-w-[120px] md:max-w-[230px] h-auto md:mt-16"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </MotionWrapper>
              )}
            </div>

            {/* TEXT → SAĞ ALTA OTURUR */}
            <MotionWrapper delay={0.5} className="md:ml-auto">
              <div className="max-w-full md:max-w-[420px] text-white text-base md:text-xl font-light leading-relaxed text-left md:text-right md:self-end">
                <p className="whitespace-pre-line">
                  {bottomText}
                </p>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
