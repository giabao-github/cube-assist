"use client";

import { useEffect, useState } from "react";

import CTASection from "@/components/home/CTASection";
import CapabilitiesSection from "@/components/home/CapabilitiesSection";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import HeroSection from "@/components/home/HeroSection";
import InteractiveCarousel from "@/components/home/InteractiveCarousel";
import RunningBanner from "@/components/home/RunningBanner";
import TestimonialsSection from "@/components/home/TestimonialsSection";

const HomeView = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <RunningBanner />
      <HeroSection />
      <InteractiveCarousel />
      <CapabilitiesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomeView;
