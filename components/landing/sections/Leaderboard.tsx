'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'SprintKing', territory: '42.8 km²', distance: '2,847 km', city: 'MANHATTAN', team: '#FF4D4D', avatar: '/images/runner-avatar-1.jpg' },
  { rank: 2, name: 'NeonRunner', territory: '38.2 km²', distance: '2,156 km', city: 'BROOKLYN', team: '#00E5FF', avatar: '/images/runner-avatar-2.jpg' },
  { rank: 3, name: 'GridMaster', territory: '31.5 km²', distance: '1,923 km', city: 'QUEENS', team: '#8B5CF6', avatar: '/images/runner-avatar-3.jpg' },
  { rank: 4, name: 'PulseChaser', territory: '27.1 km²', distance: '1,654 km', city: 'MANHATTAN', team: '#C7FF3D', avatar: '/images/runner-avatar-4.jpg' },
  { rank: 5, name: 'StrideBeast', territory: '24.6 km²', distance: '1,432 km', city: 'BRONX', team: '#FFAA00', avatar: '/images/runner-avatar-1.jpg' },
  { rank: 6, name: 'TerritoryHunter', territory: '21.3 km²', distance: '1,287 km', city: 'BROOKLYN', team: '#FF4D4D', avatar: '/images/runner-avatar-2.jpg' },
  { rank: 7, name: 'LoopCloser', territory: '19.7 km²', distance: '1,098 km', city: 'MANHATTAN', team: '#00E5FF', avatar: '/images/runner-avatar-3.jpg' },
  { rank: 8, name: 'ShadowPacer', territory: '16.4 km²', distance: '987 km', city: 'QUEENS', team: '#8B5CF6', avatar: '/images/runner-avatar-4.jpg' },
  { rank: 9, name: 'CitySurge', territory: '14.2 km²', distance: '876 km', city: 'BRONX', team: '#C7FF3D', avatar: '/images/runner-avatar-1.jpg' },
  { rank: 10, name: 'FastForward', territory: '12.8 km²', distance: '754 km', city: 'MANHATTAN', team: '#FFAA00', avatar: '/images/runner-avatar-2.jpg' },
];

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export default function Leaderboard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(INITIAL_LEADERBOARD);
  const [swapping, setSwapping] = useState<number[]>([]);

  // Animated rank swap
  const triggerRankSwap = useCallback(() => {
    const idx1 = Math.floor(Math.random() * data.length);
    let idx2 = Math.floor(Math.random() * data.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * data.length);

    setSwapping([idx1, idx2]);

    setTimeout(() => {
      setData((prev) => {
        const next = [...prev];
        const temp = { ...next[idx1] };
        next[idx1] = { ...next[idx2], rank: next[idx1].rank };
        next[idx2] = { ...temp, rank: next[idx2].rank };
        return next;
      });
      setTimeout(() => setSwapping([]), 300);
    }, 200);
  }, [data.length]);

  useEffect(() => {
    const interval = setInterval(triggerRankSwap, 8000);
    return () => clearInterval(interval);
  }, [triggerRankSwap]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const lbContainer = sectionRef.current?.querySelector('.leaderboard-container');
      if (lbContainer) {
        gsap.fromTo(
          lbContainer,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      const rows = sectionRef.current?.querySelectorAll('.leaderboard-row');
      if (rows) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 15 },
          {
            opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
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
      id="leaderboard"
      className="relative w-full"
      style={{
        backgroundColor: '#0F1115',
        zIndex: 2,
        padding: '120px 0',
      }}
    >
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <span
          className="font-mono uppercase tracking-[0.15em]"
          style={{ fontSize: '0.75rem', color: '#C7FF3D' }}
        >
          CITY RANKINGS
        </span>
        <h2
          className="font-display text-display-l mt-3"
          style={{ color: '#FFFFFF' }}
        >
          THE MOST DANGEROUS RUNNERS
        </h2>
        <p
          className="font-body text-sm mt-2"
          style={{ color: '#6B7280' }}
        >
          Live leaderboard updated every 60 seconds
        </p>

        {/* Leaderboard Table */}
        <div
          className="leaderboard-container mt-12 rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Table Header */}
          <div
            className="hidden lg:grid grid-cols-[80px_1fr_120px_120px_150px] gap-4 px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {['RANK', 'RUNNER', 'TERRITORY', 'DISTANCE', 'CITY'].map((h) => (
              <span
                key={h}
                className="font-mono uppercase"
                style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: '#6B7280' }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Data Rows */}
          {data.map((row, idx) => (
            <div
              key={row.name}
              className={`leaderboard-row grid grid-cols-2 lg:grid-cols-[80px_1fr_120px_120px_150px] gap-4 px-6 py-4 transition-all duration-300 relative ${
                swapping.includes(idx) ? 'brightness-150' : ''
              }`}
              style={{
                backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                borderLeft: '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(199,255,61,0.04)';
                e.currentTarget.style.borderLeftColor = '#C7FF3D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderLeftColor = 'transparent';
              }}
            >
              {/* Rank */}
              <div className="flex items-center gap-2">
                <span
                  className="font-mono font-bold text-lg"
                  style={{ color: RANK_COLORS[row.rank] || '#9CA3AF' }}
                >
                  {row.rank}
                </span>
                {row.rank === 1 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700">
                    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19A1 1 0 0 1 18 20H6A1 1 0 0 1 5 19V18H19V19Z" />
                  </svg>
                )}
              </div>

              {/* Runner */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: `2px solid ${row.team}` }}
                >
                  <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-body text-sm font-medium" style={{ color: '#FFFFFF' }}>
                  {row.name}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: row.team }}
                />
              </div>

              {/* Territory */}
              <div className="flex items-center">
                <span className="font-mono font-bold text-sm" style={{ color: '#FFFFFF' }}>
                  {row.territory}
                </span>
              </div>

              {/* Distance */}
              <div className="flex items-center">
                <span className="font-mono text-xs" style={{ color: '#9CA3AF' }}>
                  {row.distance}
                </span>
              </div>

              {/* City */}
              <div className="flex items-center">
                <span className="font-mono text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                  {row.city}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Link */}
        <div className="text-center mt-8">
          <button
            className="font-mono uppercase text-xs tracking-wider transition-all duration-200 inline-flex items-center gap-2 group"
            style={{ color: '#C7FF3D' }}
          >
            VIEW FULL LEADERBOARD
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}