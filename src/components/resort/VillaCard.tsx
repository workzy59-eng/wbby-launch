import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface VillaCardProps {
  villa: {
    id: number;
    name: string;
    type: string;
    price: string;
    description: string;
    image: string;
    features: string[];
  };
  index: number;
}

export const VillaCard: React.FC<VillaCardProps> = ({ villa, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-[700px] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl perspective-2000 cursor-none"
    >
      <div 
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-0 z-0 bg-luxury-black"
      >
        <motion.img 
          src={villa.image} 
          alt={villa.name}
          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/20 to-transparent" />
      </div>
      
      <div 
        style={{
          transform: "translateZ(100px)",
        }}
        className="absolute inset-0 z-10 p-12 flex flex-col justify-end gap-6 text-left pointer-events-none"
      >
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{villa.type}</span>
          <h3 className="text-4xl font-display font-bold tracking-tighter leading-none">
            {villa.name}
          </h3>
        </div>
        
        <p className="text-white/40 text-sm font-light italic leading-relaxed">
          {villa.description}
        </p>

        <div className="flex justify-between items-center pt-8 border-t border-white/10 mt-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">From</span>
            <span className="text-2xl font-display font-bold gold-text-gradient">{villa.price}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">/ Night</span>
          </div>
          <button className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center pointer-events-auto hover:bg-gold hover:text-black transition-all">
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-700 bg-gradient-to-br from-gold/50 to-transparent blur-3xl animate-pulse" />
    </motion.div>
  );
};
