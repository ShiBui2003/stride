'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    title: 'GPS TERRITORY CAPTURE',
    desc: 'Convert your running routes into owned territory. Every closed loop becomes a colored polygon on the live city map.',
    span: 'col-span-1 lg:col-span-2',
    illustration: 'gps-path',
  },
  {
    title: 'LIVE CITY WARFARE',
    desc: 'Compete against nearby runners in real-time. Watch as territory changes hands while you run.',
    span: 'col-span-1',
    illustration: 'warfare',
  },
  {
    title: 'TERRITORY DEFENSE',
    desc: 'Protect your land before rivals steal it. Set defense routes and get alerted when invaders approach your borders.',
    span: 'col-span-1',
    illustration: 'shield',
  },
  {
    title: 'LEADERBOARDS',
    desc: 'Dominate your neighborhood and city rankings. Climb from local runner to city conqueror.',
    span: 'col-span-1',
    illustration: 'podium',
  },
  {
    title: 'HEATMAP ANALYTICS',
    desc: 'Track your movement patterns and growth. Visualize where you run most and where you should expand next.',
    span: 'col-span-1',
    illustration: 'heatmap',
  },
  {
    title: 'SQUADS',
    desc: 'Form alliances and conquer cities together. Combine territory with your squadmates to control entire districts.',
    span: 'col-span-1 lg:col-span-2',
    illustration: 'network',
  },
];

function Illustration({ type }: { type: string }) {
  switch (type) {
    case 'gps-path':
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="180" height="100" rx="8" fill="#0A0A0C" stroke="rgba(255,255,255,0.06)" />
          {/* Grid */}
          {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
              <line x1={20 + i * 40} y1="20" x2={20 + i * 40} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <line x1="20" y1={20 + i * 20} x2="180" y2={20 + i * 20} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </g>
          ))}
          {/* GPS Path */}
          <path
            d="M 40 80 L 50 70 L 70 65 L 90 50 L 110 55 L 130 45 L 150 50 L 160 40"
            stroke="#C7FF3D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 2"
          >
            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1.5s" repeatCount="indefinite" />
          </path>
          {/* Enclosed area */}
          <path
            d="M 40 80 L 50 70 L 70 65 L 90 50 L 110 55 L 130 45 L 150 50 L 160 40 L 160 85 L 40 85 Z"
            fill="rgba(199,255,61,0.15)"
            stroke="#C7FF3D"
            strokeWidth="1"
            strokeDasharray="200"
            strokeDashoffset="200"
          >
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite" />
          </path>
          {/* Runner dot */}
          <circle r="4" fill="#C7FF3D">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 40 80 L 50 70 L 70 65 L 90 50 L 110 55 L 130 45 L 150 50 L 160 40" />
          </circle>
        </svg>
      );
    case 'warfare':
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="180" height="100" rx="8" fill="#0A0A0C" stroke="rgba(255,255,255,0.06)" />
          {/* Territory polygons */}
          <polygon points="30,30 80,25 90,60 35,65" fill="rgba(255,77,77,0.25)" stroke="#FF4D4D" strokeWidth="1">
            <animate attributeName="opacity" values="0.25;0.4;0.25" dur="3s" repeatCount="indefinite" />
          </polygon>
          <polygon points="90,40 150,35 160,70 95,75" fill="rgba(0,229,255,0.25)" stroke="#00E5FF" strokeWidth="1">
            <animate attributeName="opacity" values="0.25;0.4;0.25" dur="4s" repeatCount="indefinite" />
          </polygon>
          <polygon points="60,70 120,65 130,95 65,100" fill="rgba(139,92,246,0.25)" stroke="#8B5CF6" strokeWidth="1">
            <animate attributeName="opacity" values="0.25;0.4;0.25" dur="3.5s" repeatCount="indefinite" />
          </polygon>
          {/* Animated runner dots */}
          <circle r="3" fill="#FF4D4D">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 30 30 L 80 25 L 90 60 L 35 65 Z" />
          </circle>
          <circle r="3" fill="#00E5FF">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 90 40 L 150 35 L 160 70 L 95 75 Z" />
          </circle>
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="180" height="100" rx="8" fill="#0A0A0C" stroke="rgba(255,255,255,0.06)" />
          {/* Shield outline */}
          <path
            d="M 100 25 L 130 35 L 130 65 Q 130 90 100 100 Q 70 90 70 65 L 70 35 Z"
            stroke="#00E5FF"
            strokeWidth="2"
            fill="rgba(0,229,255,0.08)"
          />
          {/* Pulse rings */}
          <circle cx="100" cy="65" r="20" stroke="#00E5FF" strokeWidth="1" fill="none" opacity="0.5">
            <animate attributeName="r" values="20;40;20" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="65" r="30" stroke="#00E5FF" strokeWidth="0.5" fill="none" opacity="0.3">
            <animate attributeName="r" values="30;55;30" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Lock icon */}
          <rect x="93" y="58" width="14" height="12" rx="2" fill="#00E5FF" />
          <path d="M 96 58 L 96 54 Q 96 50 100 50 Q 104 50 104 54 L 104 58" stroke="#00E5FF" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'podium':
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="180" height="100" rx="8" fill="#0A0A0C" stroke="rgba(255,255,255,0.06)" />
          {/* Podium bars */}
          <rect x="40" y="70" width="30" height="30" rx="3" fill="rgba(192,192,192,0.15)" stroke="#C0C0C0" strokeWidth="1" />
          <rect x="85" y="45" width="30" height="55" rx="3" fill="rgba(255,215,0,0.15)" stroke="#FFD700" strokeWidth="1" />
          <rect x="130" y="80" width="30" height="20" rx="3" fill="rgba(205,127,50,0.15)" stroke="#CD7F32" strokeWidth="1" />
          {/* Sparkle on gold */}
          <circle cx="100" cy="40" r="2" fill="#FFD700">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="108" cy="35" r="1.5" fill="#FFD700">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Numbers */}
          <text x="55" y="90" fill="#C0C0C0" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle">2</text>
          <text x="100" y="75" fill="#FFD700" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">1</text>
          <text x="145" y="94" fill="#CD7F32" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">3</text>
        </svg>
      );
    case 'heatmap':
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="180" height="100" rx="8" fill="#0A0A0C" stroke="rgba(255,255,255,0.06)" />
          {/* Heatmap grid */}
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 12 }).map((_, col) => {
              const intensity = Math.sin(row * 0.8 + col * 0.5) * 0.5 + 0.5;
              const alpha = intensity * 0.6;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={20 + col * 14}
                  y={20 + row * 11}
                  width="12"
                  height="9"
                  rx="1"
                  fill={`rgba(199,255,61,${alpha})`}
                >
                  <animate
                    attributeName="opacity"
                    values={`${alpha};${alpha * 0.5};${alpha}`}
                    dur={`${2 + Math.random() * 2}s`}
                    repeatCount="indefinite"
                  />
                </rect>
              );
            })
          )}
        </svg>
      );
    case 'network':
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="180" height="100" rx="8" fill="#0A0A0C" stroke="rgba(255,255,255,0.06)" />
          {/* Network nodes */}
          <circle cx="60" cy="40" r="6" fill="#8B5CF6">
            <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="35" r="6" fill="#8B5CF6">
            <animate attributeName="r" values="6;8;6" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="70" r="6" fill="#8B5CF6">
            <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="45" cy="80" r="5" fill="#8B5CF6" opacity="0.7" />
          <circle cx="155" cy="75" r="5" fill="#8B5CF6" opacity="0.7" />
          {/* Connections */}
          <line x1="60" y1="40" x2="140" y2="35" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" />
          <line x1="60" y1="40" x2="100" y2="70" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" />
          <line x1="140" y1="35" x2="100" y2="70" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" />
          <line x1="45" y1="80" x2="100" y2="70" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
          <line x1="155" y1="75" x2="100" y2="70" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
          {/* Enclosed area */}
          <polygon points="60,40 140,35 100,70" fill="rgba(139,92,246,0.1)" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="4 2">
            <animate attributeName="stroke-dashoffset" from="0" to="12" dur="2s" repeatCount="indefinite" />
          </polygon>
        </svg>
      );
    default:
      return null;
  }
}

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
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
      id="features"
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
          THE ARSENAL
        </span>
        <h2
          className="font-display text-display-l mt-3"
          style={{ color: '#FFFFFF' }}
        >
          EVERYTHING YOU NEED TO DOMINATE
        </h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`feature-card ${feature.span} group relative rounded-2xl p-8 transition-all duration-400 hover:-translate-y-1`}
              style={{
                backgroundColor: '#0F1115',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(199,255,61,0.3)';
                el.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(199,255,61,0.05)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.boxShadow = 'none';
              }}
            >
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                <div className="flex-1">
                  <h3
                    className="font-display text-xl tracking-wide"
                    style={{ color: '#FFFFFF' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="font-body text-sm leading-relaxed mt-3"
                    style={{ color: '#9CA3AF' }}
                  >
                    {feature.desc}
                  </p>
                </div>
                <div className="w-full lg:w-[140px] h-[100px] lg:h-auto flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Illustration type={feature.illustration} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}