"use client";
import Footer from "./components/Footer";
import HeroSection from "./components/homepage/HeroSection";
import WhyWeExist from "./components/homepage/WhyWeExist";
import ServicesSection from "./components/homepage/ServicesSection";
import CTASection from "./components/homepage/CTASection";
import MotionWrapper from "./components/MotionWrapper";
import { useState } from "react";

export default function Home() {
  const [contentLoaded, setContentLoaded] = useState(false);

  return (
    <>
      {/* Loading Screen */}
      {!contentLoaded && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            {/* Logo Animasyonu */}
            <div className="animate-pulse-scale">
              <img
                src="/logofladvart.png"
                alt="Fladvart Logo"
                className="w-64 md:w-80 h-auto mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-[#121727]">
        <HeroSection onContentLoaded={() => setContentLoaded(true)} />

        {/* WhyWeExist now handles its own internal animations, but we can keep a wrapper for the container if desired. 
            However, to prevent double-animation confusion, let's let the component handle it. 
            Actually, WhyWeExist has granular animations now, so removing the outer wrapper prevents the whole block from fading in at once.
        */}
        <WhyWeExist />
        
        {/* ServicesSection handles its own internal animations */}
        <ServicesSection />

        <MotionWrapper delay={0.1}>
          <CTASection />
        </MotionWrapper>
   
        <MotionWrapper delay={0.1}>
          <Footer />
        </MotionWrapper>
      </div>
    </>
  );
}
