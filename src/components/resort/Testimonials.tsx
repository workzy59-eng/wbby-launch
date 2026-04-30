import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "ALEXANDER VOROS",
    role: "Global Explorer",
    content: "Lumiére redefined my understanding of space. It’s not just a stay; it’s an atmospheric recalibration that I’ve never found anywhere else.",
    rating: 5
  },
  {
    name: "ELENA ROSSI",
    role: "Architectural Critic",
    content: "The way the light interacts with the volcanic stone and the water is pure poetry. Every corner of the villas is a study in cinematic luxury.",
    rating: 5
  },
  {
    name: "JONATHAN KEYES",
    role: "Venture Partner",
    content: "The level of privacy and the bespoke service ratio is unrivaled. It is the definitive retreat for those who build worlds.",
    rating: 5
  }
];

export const Testimonials = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-60 px-6 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto text-center space-y-24 relative">
        <div className="space-y-4">
          <span className="text-gold font-bold uppercase tracking-[1em] text-[10px]">The Echo</span>
          <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase luxury-text-gradient">TESTIMONIES</h2>
        </div>

        <div className="relative min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              className="glass-morphism-dark p-12 md:p-20 rounded-[4rem] text-center space-y-12 shadow-3xl"
            >
              <div className="flex justify-center gap-1 text-gold">
                {[...Array(TESTIMONIALS[index].rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              
              <p className="text-2xl md:text-4xl font-light italic text-white/80 leading-relaxed tracking-tight group">
                "{TESTIMONIALS[index].content}"
              </p>

              <div className="space-y-2 pt-8">
                <h4 className="text-xl font-display font-bold tracking-[0.2em] italic uppercase gold-text-gradient">{TESTIMONIALS[index].name}</h4>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">{TESTIMONIALS[index].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-1/2 -left-4 md:-left-20 -translate-y-1/2">
             <button 
               onClick={() => setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
               className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center hover:bg-gold hover:text-black transition-all"
             >
                <ChevronLeft size={24} />
             </button>
          </div>
          <div className="absolute top-1/2 -right-4 md:-right-20 -translate-y-1/2">
             <button 
               onClick={() => setIndex((prev) => (prev + 1) % TESTIMONIALS.length)}
               className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center hover:bg-gold hover:text-black transition-all"
             >
                <ChevronRight size={24} />
             </button>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {TESTIMONIALS.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${index === i ? 'bg-gold w-12' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};
