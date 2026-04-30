import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TRANSFORMATIONS = [
  {
    before: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800",
    after: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800",
    name: "Mark T.",
    duration: "12 Weeks"
  }
];

export const TransformationSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = e.clientX - rect.left;
    }
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <section className="py-60 px-6 max-w-5xl mx-auto text-center space-y-24">
      <div className="space-y-4">
        <span className="text-neon-red font-black uppercase tracking-[1em] text-[10px]">Real Evolution</span>
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]">
          FORGED <br /><span className="text-white/10">IN FIRE.</span>
        </h2>
      </div>

      <div 
        className="relative aspect-video rounded-[3rem] overflow-hidden cursor-ew-resize border border-white/10 shadow-2xl select-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        {/* After Image */}
        <div className="absolute inset-0">
          <img 
            src={TRANSFORMATIONS[0].after} 
            className="w-full h-full object-cover" 
            alt="After" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2">
            <span className="text-8xl font-black italic tracking-tighter text-neon-blue opacity-50">AFTER</span>
            <div className="bg-neon-blue h-1 w-20" />
          </div>
        </div>

        {/* Before Image (Clipped) */}
        <div 
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={TRANSFORMATIONS[0].before} 
            className="w-full h-full object-cover grayscale" 
            alt="Before" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-10 left-10 flex flex-col items-start gap-2">
            <span className="text-8xl font-black italic tracking-tighter text-white opacity-50">BEFORE</span>
            <div className="bg-white h-1 w-20" />
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute inset-y-0 z-20 w-1 bg-white flex items-center justify-center cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 8 4 4-4 4M6 8l-4 4 4 4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-2xl font-black italic tracking-tighter uppercase">{TRANSFORMATIONS[0].name}</h4>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">{TRANSFORMATIONS[0].duration} Transformation</p>
      </div>
    </section>
  );
};
