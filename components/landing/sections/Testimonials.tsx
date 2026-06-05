'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "I went for a casual run and accidentally became mayor of my neighborhood.",
    name: 'Sarah K.',
    handle: '@sarahruns',
    gradient: 'from-purple-500 to-cyan-500',
  },
  {
    quote: "My morning route is now a military operation. I plan invasions over coffee.",
    name: 'Marcus T.',
    handle: '@marcusstride',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    quote: "I've run more in 3 weeks of STRIDE than 3 years of traditional apps.",
    name: 'Jen L.',
    handle: '@jenlruns',
    gradient: 'from-lime-500 to-teal-500',
  },
  {
    quote: "The feeling when someone tries to steal your territory and you outrun them is unmatched.",
    name: 'David R.',
    handle: '@davidrunsdaily',
    gradient: 'from-magenta-500 to-purple-500',
  },
  {
    quote: "Our squad controls all of Brooklyn. Don't even try.",
    name: 'The Bridge Runners',
    handle: '@bridgerunners',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    quote: "I used to hate running. Now I wake up at 5am to defend my borders.",
    name: 'Aiko M.',
    handle: '@aikostrides',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    quote: "The leaderboard is addictive. I've gone from rank 847 to rank 12 in two months.",
    name: 'Tom B.',
    handle: '@tombreaksrecords',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    quote: "This is what Pokemon Go should have been. Real stakes. Real sweat. Real territory.",
    name: 'Lena K.',
    handle: '@lenathelegend',
    gradient: 'from-green-500 to-emerald-500',
  },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[380px] p-8 rounded-2xl"
      style={{
        backgroundColor: '#050505',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start gap-2">
        <span style={{ fontSize: '2rem', color: '#C7FF3D', lineHeight: 1 }}>&ldquo;</span>
        <p
          className="font-body text-sm leading-relaxed italic mt-1"
          style={{ color: '#FFFFFF' }}
        >
          {t.quote}
        </p>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center`}
        >
          <span className="font-display text-sm text-white">
            {t.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-body text-sm font-medium" style={{ color: '#FFFFFF' }}>
            {t.name}
          </p>
          <p className="font-mono text-xs" style={{ color: '#6B7280' }}>
            {t.handle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const testimonialsHeader = sectionRef.current?.querySelector('.testimonials-header');
      if (testimonialsHeader) {
        gsap.fromTo(
          testimonialsHeader,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
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

  // Double the testimonials for seamless loop
  const allCards = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: '#0F1115',
        zIndex: 2,
        padding: '80px 0',
      }}
    >
      {/* Section Header */}
      <div className="testimonials-header max-w-[1280px] mx-auto px-6 lg:px-12 text-center mb-12">
        <span
          className="font-mono uppercase tracking-[0.15em]"
          style={{ fontSize: '0.75rem', color: '#C7FF3D' }}
        >
          FIELD REPORTS
        </span>
        <h2
          className="font-display text-display-l mt-3"
          style={{ color: '#FFFFFF' }}
        >
          WHAT RUNNERS ARE SAYING
        </h2>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex gap-6 animate-marquee hover:animation-paused"
          style={{ width: 'max-content' }}
        >
          {allCards.map((t, i) => (
            <TestimonialCard key={`${t.handle}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}