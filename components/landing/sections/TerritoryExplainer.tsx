'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '01',
    title: 'START RUNNING',
    desc: 'Launch the app and begin your run. GPS tracks every step in real-time.',
  },
  {
    num: '02',
    title: 'ENCIRCLE AREA',
    desc: 'Run around a block, park, or neighborhood to form a closed loop.',
  },
  {
    num: '03',
    title: 'CLOSE THE LOOP',
    desc: 'Cross your own path to complete the capture. The enclosed area is calculated.',
  },
  {
    num: '04',
    title: 'CLAIM TERRITORY',
    desc: 'Your colored polygon appears on the live world map. Defend it from rivals.',
  },
];

export default function TerritoryExplainer() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=50%',
        pin: true,
        pinSpacing: true,
      });

      // Progress line fill
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=50%',
            scrub: true,
            onUpdate: (self) => {
              const prog = self.progress;
              const stepIdx = Math.min(3, Math.floor(prog * 4));
              setActiveStep(stepIdx);
            },
          },
        }
      );

      // Step entrance animations
      const stepEls = sectionRef.current?.querySelectorAll('.step-card');
      if (stepEls) {
        gsap.fromTo(
          stepEls,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
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
      id="how-it-works"
      className="relative w-full"
      style={{
        backgroundColor: '#050505',
        minHeight: '100vh',
        zIndex: 2,
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-[120px] flex flex-col items-center justify-center min-h-screen">
        {/* Section Title */}
        <h2
          className="font-display text-display-l text-center"
          style={{ color: '#FFFFFF' }}
        >
          HOW TERRITORY CAPTURE WORKS
        </h2>
        <div
          className="mt-4"
          style={{
            width: '80px',
            height: '2px',
            backgroundColor: '#C7FF3D',
          }}
        />

        {/* Steps */}
        <div className="w-full mt-20 relative">
          {/* Progress Line Background */}
          <div
            className="absolute top-[23px] left-0 right-0 h-[2px] hidden lg:block"
            style={{ backgroundColor: 'rgba(199,255,61,0.15)' }}
          >
            <div
              ref={progressRef}
              className="h-full origin-left"
              style={{ backgroundColor: '#C7FF3D', transform: 'scaleX(0)' }}
            />
          </div>

          {/* Step Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="step-card flex flex-col items-center text-center relative"
              >
                {/* Number Circle */}
                <div
                  className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500"
                  style={{
                    borderColor: activeStep >= i ? '#C7FF3D' : 'rgba(199,255,61,0.3)',
                    backgroundColor: activeStep >= i ? '#C7FF3D' : 'transparent',
                  }}
                >
                  <span
                    className="font-mono font-bold text-lg transition-colors duration-500"
                    style={{
                      color: activeStep >= i ? '#050505' : '#C7FF3D',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-display text-xl tracking-wide mt-6"
                  style={{ color: '#FFFFFF' }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="font-body text-sm leading-relaxed mt-3 max-w-[240px]"
                  style={{ color: '#9CA3AF' }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}