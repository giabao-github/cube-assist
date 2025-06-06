"use client";

import { useEffect, useState } from "react";

import CapabilitiesSection from "@/components/home/capabilities-section";
import CTASection from "@/components/home/cta-section";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import HeroSection from "@/components/home/hero-section";
import InteractiveCarousel from "@/components/home/interactive-carousel";
import RunningBanner from "@/components/home/running-banner";
import TestimonialsSection from "@/components/home/testimonials-section";

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
