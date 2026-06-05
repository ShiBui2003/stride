'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DownloadCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll('.cta-animate');
      if (elements) {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
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
      id="download"
      className="relative w-full overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(199,255,61,0.08) 0%, #050505 70%)',
        zIndex: 2,
        padding: '160px 0',
      }}
    >
      {/* Background Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.03 }}
      >
        <span
          className="font-display whitespace-nowrap"
          style={{
            fontSize: '20vw',
            color: '#C7FF3D',
            lineHeight: 1,
          }}
        >
          CONQUER
        </span>
      </div>

      <div className="relative max-w-[800px] mx-auto px-6 lg:px-12 text-center">
        {/* Eyebrow */}
        <span
          className="cta-animate font-mono uppercase tracking-[0.15em]"
          style={{ fontSize: '0.75rem', color: '#C7FF3D' }}
        >
          THE CITY IS WAITING
        </span>

        {/* Headline */}
        <h2
          className="cta-animate font-display text-display-xl mt-6"
          style={{ color: '#FFFFFF' }}
        >
          YOUR CITY IS UNCLAIMED.
        </h2>
        <h2
          className="cta-animate font-display text-display-xl"
          style={{ color: '#C7FF3D' }}
        >
          GO TAKE IT.
        </h2>

        {/* Subtext */}
        <p
          className="cta-animate font-body text-lg leading-relaxed mt-6"
          style={{ color: '#9CA3AF' }}
        >
          Download STRIDE and start capturing territory today. Available on iOS and Android.
        </p>

        {/* Buttons */}
        <div className="cta-animate flex flex-wrap items-center justify-center gap-4 mt-12">
          {/* App Store */}
          <button
            className="flex items-center gap-3 font-display text-base tracking-wider px-8 py-4 rounded-md transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#050505',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.92.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            APP STORE
          </button>

          {/* Google Play */}
          <button
            className="flex items-center gap-3 font-display text-base tracking-wider px-8 py-4 rounded-md transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#050505',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h.37L20.7 11.52c.37.27.37.69.01.97L4.5 22h-.37c-.83 0-1.5-.67-1.5-1.5zM16.5 14.2L5.5 21.1l10.5-7.6-.5.7zM5.5 2.9l11 6.9-3.8 2.8L5.5 2.9z" />
            </svg>
            GOOGLE PLAY
          </button>

          {/* Join Beta */}
          <Link
            href="/login"
            className="flex items-center gap-3 font-display text-base tracking-wider px-8 py-4 rounded-md transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #C7FF3D',
              color: '#C7FF3D',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(199,255,61,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            JOIN BETA
          </Link>
        </div>
      </div>
    </section>
  );
}