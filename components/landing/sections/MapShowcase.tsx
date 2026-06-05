'use client';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TIME_FILTERS = ['TODAY', 'WEEK', 'MONTH', 'ALL TIME'];
const CITIES = ['NEW YORK', 'LONDON', 'TOKYO', 'BERLIN', 'SYDNEY'];

export default function MapShowcase() {
  const [activeFilter, setActiveFilter] = useState('TODAY');
  const [activeCity, setActiveCity] = useState('NEW YORK');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mapContainer = sectionRef.current?.querySelector('.map-container');
      if (mapContainer) {
        gsap.fromTo(
          mapContainer,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="map-showcase"
      className="relative w-full"
      style={{
        backgroundColor: '#050505',
        zIndex: 2,
        padding: '120px 0',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <span
          className="font-mono uppercase tracking-[0.15em]"
          style={{ fontSize: '0.75rem', color: '#C7FF3D' }}
        >
          THE BATTLEFIELD
        </span>
        <h2
          className="font-display text-display-l mt-3"
          style={{ color: '#FFFFFF' }}
        >
          YOUR CITY. YOUR RULES.
        </h2>
        <p
          className="font-body text-base mt-2"
          style={{ color: '#9CA3AF' }}
        >
          Explore live territory maps from cities around the world.
        </p>

        {/* Map Container */}
        <div
          className="map-container relative mt-12 rounded-2xl overflow-hidden"
          style={{
            aspectRatio: '16/9',
            backgroundColor: '#0F1115',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Map Image */}
          <img
            src="/images/map-showcase.jpg"
            alt="City territory map"
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.8) contrast(1.1)' }}
          />

          {/* Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(199,255,61,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(199,255,61,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Time Filter Pills */}
          <div
            className="absolute top-4 right-4 flex gap-1 p-1.5 rounded-xl"
            style={{
              background: 'rgba(15, 17, 21, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {TIME_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="font-mono text-[0.65rem] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: activeFilter === f ? '#C7FF3D' : 'transparent',
                  color: activeFilter === f ? '#050505' : '#9CA3AF',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Location Badge */}
          <div
            className="absolute bottom-4 left-4 flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{
              background: 'rgba(15, 17, 21, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="relative">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#C7FF3D' }}
              />
              <div
                className="absolute inset-0 w-2 h-2 rounded-full animate-pulse-dot"
                style={{ backgroundColor: '#C7FF3D' }}
              />
            </div>
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
              {activeCity}, {activeFilter === 'TODAY' ? 'LIVE' : activeFilter}
            </span>
          </div>
        </div>

        {/* City Selector */}
        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className="font-body text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: activeCity === city ? 'transparent' : '#0F1115',
                border: `1px solid ${activeCity === city ? 'rgba(199,255,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: activeCity === city ? '#C7FF3D' : '#9CA3AF',
              }}
              onMouseEnter={(e) => {
                if (activeCity !== city) {
                  e.currentTarget.style.backgroundColor = '#1A1D24';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCity !== city) {
                  e.currentTarget.style.backgroundColor = '#0F1115';
                }
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}