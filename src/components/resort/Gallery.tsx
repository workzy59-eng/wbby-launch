import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800",
  "https://images.unsplash.com/photo-1510626396912-1647a6125000?q=80&w=800",
  "https://images.unsplash.com/photo-1544161515-4ae6b91827d1?q=80&w=800",
  "https://images.unsplash.com/photo-1545208393-596371BA33C9?q=80&w=800",
  "https://images.unsplash.com/photo-1506929113675-b9299d39ca18?q=80&w=800",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800"
];

export const Gallery = () => {
  return (
    <section className="py-60 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-32 space-y-4">
        <span className="text-gold font-bold uppercase tracking-[1em] text-[10px]">The Perspective</span>
        <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase luxury-text-gradient">VISUAL HERITAGE</h2>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {GALLERY_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative group rounded-3xl overflow-hidden cursor-none border border-white/5 shadow-2xl"
          >
            <img 
              src={img} 
              alt={`Gallery ${i}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
               <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center backdrop-blur-md">
                 <Maximize2 size={20} className="text-gold" />
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
