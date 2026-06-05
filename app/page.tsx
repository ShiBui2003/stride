// Public landing page — ported from the STRIDE landing design (3D city map, GSAP scroll, sections)
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CityMap from '@/components/landing/CityMap';
import Navigation from '@/components/landing/sections/Navigation';
import Hero from '@/components/landing/sections/Hero';
import TerritoryExplainer from '@/components/landing/sections/TerritoryExplainer';
import Features from '@/components/landing/sections/Features';
import Leaderboard from '@/components/landing/sections/Leaderboard';
import MapShowcase from '@/components/landing/sections/MapShowcase';
import Testimonials from '@/components/landing/sections/Testimonials';
import DownloadCTA from '@/components/landing/sections/DownloadCTA';
import Footer from '@/components/landing/sections/Footer';

import './landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback);
    };
  }, []);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#050505' }}>
      {/* Fixed 3D City Map Background */}
      <CityMap />

      {/* HTML Content Layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Navigation */}
        <Navigation />

        {/* Hero Section - transparent to show map */}
        <Hero />

        {/* Content Sections - opaque backgrounds */}
        <TerritoryExplainer />
        <Features />
        <Leaderboard />
        <MapShowcase />
        <Testimonials />
        <DownloadCTA />
        <Footer />
      </div>
    </div>
  );
}
