import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { label: "TOP SPEED", value: "350+", unit: "KM/H", icon: "🚀" },
  { label: "0-100 KM/H", value: "2.8", unit: "SEC", icon: "⚡" },
  { label: "MAX POWER", value: "950", unit: "HP", icon: "🔥" },
  { label: "TORQUE", value: "800", unit: "NM", icon: "💎" }
];

export const PerformanceStats = () => {
  return (
    <section className="py-60 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="text-neon-blue font-bold uppercase tracking-[1em] text-[10px]">Pure Engineering</span>
            <h2 className="text-6xl md:text-8xl font-display font-light tracking-tighter uppercase leading-none">
              THE SCIENCE <br /><span className="font-bold gold-text-gradient italic">OF VELOCITY</span>
            </h2>
            <p className="text-xl text-white/40 font-light italic leading-relaxed max-w-md">
              Pushing the boundaries of aerodynamics and propulsion. Every millisecond calculation matters.
            </p>
          </div>
          
          <div className="space-y-8">
            {STATS.map((stat, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">{stat.label}</span>
                  <div className="flex items-baseline gap-2">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className="text-4xl font-display font-bold gold-text-gradient"
                    >
                      {stat.value}
                    </motion.span>
                    <span className="text-xs font-bold text-white/40">{stat.unit}</span>
                  </div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: "100%" }}
                     transition={{ duration: 2, delay: i * 0.2, ease: "circOut" }}
                     className="h-full bg-gradient-to-r from-neon-blue to-white"
                   />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
           {/* Animated Speedometer Graphic */}
           <div className="relative w-full aspect-square flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[40px] border-white/5 rounded-full border-t-neon-blue/40"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-16 border-[1px] border-dashed border-white/20 rounded-full"
              />
              <div className="text-center space-y-2 relative z-10">
                 <span className="text-[10px] font-bold uppercase tracking-[1em] text-white/40">Real-Time</span>
                 <motion.h4 
                   animate={{ scale: [1, 1.05, 1] }} 
                   transition={{ duration: 1, repeat: Infinity }}
                   className="text-9xl font-display font-black tracking-tighter"
                 >
                   2.8<span className="text-xl font-light tracking-widest text-neon-blue">S</span>
                 </motion.h4>
                 <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">ACCELERATION RECORD</p>
              </div>
              
              {/* Floating Reflection Circles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    x: [0, Math.random() * 50 - 25, 0],
                    y: [0, Math.random() * 50 - 25, 0],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ duration: 5 + i, repeat: Infinity }}
                  className="absolute w-32 h-32 bg-neon-blue/20 blur-3xl rounded-full"
                  style={{ left: `${20 + i * 30}%`, top: `${30 + i * 20}%` }}
                />
              ))}
           </div>
        </div>
      </div>
    </section>
  );
};
