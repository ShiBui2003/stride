'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

const HEADLINE_PAIRS = [
  ['RUN THE CITY.', 'OWN THE MAP.'],
  ['CONQUER TERRITORY.', 'ONE RUN AT A TIME.'],
];

const STATS = [
  { value: 12483, label: 'TERRITORIES' },
  { value: 7221, label: 'ACTIVE RUNNERS' },
  { value: 1200000, label: 'KM LOGGED', display: '1.2M' },
  { value: 84, label: 'KM² CONTROLLED' },
];

function AnimatedCounter({ target, display }: { target: number; display?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;
    hasAnimated.current = true;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          if (display) {
            ref.current.textContent = display;
          } else if (target >= 1000000) {
            ref.current.textContent = (obj.val / 1000000).toFixed(1) + 'M';
          } else {
            ref.current.textContent = Math.floor(obj.val).toLocaleString();
          }
        }
      },
    });
  }, [target, display]);

  return <span ref={ref}>0</span>;
}

export default function Hero() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Headline rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setHeadlineIndex((prev) => (prev + 1) % HEADLINE_PAIRS.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!contentRef.current) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(
      contentRef.current.querySelectorAll('.hero-animate'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    );
    return () => { tl.kill(); };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const currentHeadline = HEADLINE_PAIRS[headlineIndex];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full"
      style={{ height: '100vh', zIndex: 1 }}
    >
      {/* Hero Content */}
      <div
        ref={contentRef}
        className="absolute"
        style={{
          bottom: '120px',
          left: 'clamp(24px, 5vw, 48px)',
          maxWidth: '600px',
        }}
      >
        {/* Headline */}
        <div className="hero-animate overflow-hidden" style={{ minHeight: 'clamp(7rem, 18vw, 14rem)' }}>
          <div
            className="transition-all duration-500"
            style={{
              transform: isTransitioning ? 'translateY(-100%)' : 'translateY(0)',
              opacity: isTransitioning ? 0 : 1,
            }}
          >
            <h1
              className="font-display text-display-xl"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 40px rgba(0,0,0,0.8)',
                lineHeight: 0.9,
              }}
            >
              {currentHeadline[0]}
              <br />
              {currentHeadline[1]}
            </h1>
          </div>
        </div>

        {/* Subheadline */}
        <p
          className="hero-animate font-body text-lg leading-relaxed mt-6"
          style={{
            color: '#9CA3AF',
            maxWidth: '480px',
            textShadow: '0 1px 20px rgba(0,0,0,0.6)',
          }}
        >
          Turn every run into a strategic battle. Capture real territory by closing GPS loops, defend your land, and climb the city leaderboard.
        </p>

        {/* CTAs */}
        <div className="hero-animate flex flex-wrap items-center gap-4 mt-10">
          <button
            onClick={() => scrollToSection('download')}
            className="font-display text-base tracking-[0.08em] px-10 py-4 rounded-md transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#C7FF3D',
              color: '#050505',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.boxShadow = '0 0 30px rgba(199,255,61,0.15), 0 0 60px rgba(199,255,61,0.05)';
              (e.target as HTMLElement).style.backgroundColor = '#D4FF5C';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.boxShadow = 'none';
              (e.target as HTMLElement).style.backgroundColor = '#C7FF3D';
            }}
          >
            START CONQUERING
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="font-display text-base tracking-[0.08em] px-8 py-4 rounded-md transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = '#C7FF3D';
              (e.target as HTMLElement).style.color = '#C7FF3D';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
              (e.target as HTMLElement).style.color = '#FFFFFF';
            }}
          >
            WATCH DEMO
          </button>
        </div>
      </div>

      {/* Floating Stats Bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-6 lg:gap-12 px-6 py-4 rounded-2xl"
        style={{
          bottom: '32px',
          background: 'rgba(15, 17, 21, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 40px rgba(0,0,0,0.6)',
          zIndex: 10,
        }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div
              className="font-mono font-bold tracking-tight"
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              <AnimatedCounter target={stat.value} display={stat.display} />
            </div>
            <div
              className="font-mono uppercase mt-1"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                color: '#6B7280',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Day/Night Toggle */}
      <div
        className="absolute flex gap-1 p-2 rounded-xl"
        style={{
          top: '96px',
          right: 'clamp(24px, 5vw, 48px)',
          background: 'rgba(15, 17, 21, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 10,
        }}
      >
        <button
          className="p-2 rounded-md transition-all duration-200"
          style={{ backgroundColor: 'rgba(199,255,61,0.1)' }}
          aria-label="Night mode"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C7FF3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </section>
  );
}