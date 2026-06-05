'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const NAV_LINKS = ['HOW IT WORKS', 'FEATURES', 'LEADERBOARD', 'DOWNLOAD'];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > window.innerHeight * 0.8);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id.toLowerCase().replace(/\s+/g, '-'));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  const getSectionId = (link: string) => {
    const map: Record<string, string> = {
      'HOW IT WORKS': 'how-it-works',
      'FEATURES': 'features',
      'LEADERBOARD': 'leaderboard',
      'DOWNLOAD': 'download',
    };
    return map[link] || link.toLowerCase();
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: '72px',
          background: scrolled ? 'rgba(15, 17, 21, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        }}
      >
        <div className="h-full max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <div className="flex items-center">
            <span className="font-display text-2xl tracking-[0.15em] text-white">
              STRIDE
            </span>
            <span
              className="ml-0.5 w-2 h-2 rounded-sm"
              style={{ backgroundColor: '#C7FF3D' }}
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollToSection(getSectionId(link))}
                className="relative font-display text-sm tracking-[0.1em] transition-colors duration-200 group"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = '#9CA3AF';
                }}
              >
                {link}
                <span
                  className="absolute bottom-[-4px] left-0 w-full h-[2px] origin-left transition-transform duration-200 scale-x-0 group-hover:scale-x-100"
                  style={{ backgroundColor: '#C7FF3D' }}
                />
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="font-body text-sm cursor-pointer transition-colors duration-200"
              style={{ color: '#9CA3AF' }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#9CA3AF';
              }}
            >
              SIGN IN
            </Link>
            <Link
              href="/login"
              className="font-display text-sm tracking-[0.08em] px-6 py-2.5 rounded-md transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: '#C7FF3D',
                color: '#050505',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#D4FF5C';
                (e.target as HTMLElement).style.boxShadow = '0 0 30px rgba(199,255,61,0.15), 0 0 60px rgba(199,255,61,0.05)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#C7FF3D';
                (e.target as HTMLElement).style.boxShadow = 'none';
              }}
            >
              JOIN BETA
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              className="block w-6 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-6 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: '#050505' }}
        >
          {NAV_LINKS.map((link, i) => (
            <button
              key={link}
              onClick={() => scrollToSection(getSectionId(link))}
              className="font-display text-display-m tracking-[0.02em] transition-opacity duration-300"
              style={{
                color: '#FFFFFF',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {link}
            </button>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-8 font-display text-lg tracking-[0.08em] px-10 py-4 rounded-md"
            style={{
              backgroundColor: '#C7FF3D',
              color: '#050505',
            }}
          >
            JOIN BETA
          </Link>
        </div>
      )}
    </>
  );
}