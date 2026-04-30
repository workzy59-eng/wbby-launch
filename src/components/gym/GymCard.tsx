import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GymCardProps {
  item: {
    title: string;
    category: string;
    description: string;
    image: string;
    accentColor: string;
  };
  index: number;
}

export const GymCard: React.FC<GymCardProps> = ({ item, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

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
      transition={{ delay: index * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-charcoal shadow-2xl perspective-1000"
    >
      <div 
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-700 opacity-60 group-hover:opacity-80 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>
      
      <div 
        style={{
          transform: "translateZ(80px)",
        }}
        className="absolute inset-0 z-10 p-8 flex flex-col justify-end gap-4 pointer-events-none"
      >
        <div className="space-y-1">
          <span 
            className="text-[10px] font-black uppercase tracking-[0.3em]"
            style={{ color: item.accentColor }}
          >
            {item.category}
          </span>
          <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            {item.title}
          </h3>
        </div>
        
        <p className="text-white/40 text-sm font-medium leading-relaxed group-hover:text-white/80 transition-colors">
          {item.description}
        </p>

        <div className="pt-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white group-hover:text-neon-red transition-colors">
          View Program <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
        </div>
      </div>

      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-700 blur-3xl animate-pulse" 
        style={{ background: `radial-gradient(circle at 50% 50%, ${item.accentColor}, transparent)` }}
      />
    </motion.div>
  );
};
