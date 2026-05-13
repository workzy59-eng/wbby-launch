import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight, Gauge, Activity, Wind } from 'lucide-react';

interface CarCardProps {
  car: {
    name: string;
    model: string;
    description: string;
    price: string;
    image: string;
    specs: {
      speed: string;
      hp: string;
      acceleration: string;
    };
    accentColor: string;
  };
  index: number;
}

export const CarCard: React.FC<CarCardProps> = ({ car, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

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
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-[600px] rounded-[2.5rem] overflow-hidden bg-charcoal border border-white/5 shadow-2xl perspective-1000 cursor-pointer"
    >
      <div className="absolute inset-0 z-0">
        <motion.img 
          src={car.image} 
          alt={car.name}
          className="w-full h-full object-cover transition-all duration-1000 opacity-60 group-hover:scale-110 group-hover:opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Shine Effect */}
      <motion.div 
        style={{
          left: shineX,
          top: shineY,
        }}
        className="absolute w-64 h-64 bg-white/20 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
      />

      <div 
        style={{
          transform: "translateZ(60px)",
        }}
        className="absolute inset-0 z-20 p-10 flex flex-col justify-end gap-6"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 block">
            {car.model}
          </span>
          <h3 className="text-4xl font-display font-black tracking-tight uppercase gold-text-gradient">
            {car.name}
          </h3>
        </div>

        <p className="text-white/50 text-sm font-medium leading-relaxed max-w-[80%] group-hover:text-white/80 transition-colors">
          {car.description}
        </p>

        <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
          <div className="space-y-1">
            <Gauge size={14} className="text-neon-blue" />
            <p className="text-xs font-bold uppercase tracking-tighter">{car.specs.speed}</p>
            <p className="text-[8px] font-bold uppercase text-white/30 tracking-widest">TOP SPEED</p>
          </div>
          <div className="space-y-1">
            <Activity size={14} className="text-orange-400" />
            <p className="text-xs font-bold uppercase tracking-tighter">{car.specs.hp}</p>
            <p className="text-[8px] font-bold uppercase text-white/30 tracking-widest">HORSEPOWER</p>
          </div>
          <div className="space-y-1">
            <Wind size={14} className="text-teal-400" />
            <p className="text-xs font-bold uppercase tracking-tighter">{car.specs.acceleration}</p>
            <p className="text-[8px] font-bold uppercase text-white/30 tracking-widest">0-100 KM/H</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Investment</span>
            <span className="text-2xl font-display font-medium text-white">{car.price}</span>
          </div>
          <button className="w-14 h-14 rounded-full glass-morphism flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Border Glow */}
      <div 
        className="absolute inset-0 border border-white/10 group-hover:border-white/40 transition-colors duration-500 rounded-[2.5rem] pointer-events-none" 
      />
    </motion.div>
  );
};
