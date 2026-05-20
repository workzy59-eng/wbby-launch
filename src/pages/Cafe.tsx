import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Coffee, Heart, MapPin, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SPECIALTIES = [
  {
    name: "Artisanal Flat White",
    price: "5.5",
    desc: "Single-origin Ethiopian reserve espresso, creamy micro-foamed organic oat milk."
  },
  {
    name: "AeroPress Cold Brew",
    price: "6.0",
    desc: "Slow drip cold extraction over 18 hours, presenting crisp notes of berry and brown sugar."
  },
  {
    name: "Salted Pistachio Croissant",
    price: "7.0",
    desc: "Flaky twice-baked sourdough pastry with velvety natural pistachio paste filling."
  }
];

export default function Cafe() {
  return (
    <div className="min-h-screen bg-[#11110F] text-[#E5E2D9] font-sans selection:bg-[#C2AF93] selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C2AF93] rounded-full flex items-center justify-center text-[#11110F]">
            <Coffee size={20} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase text-white">THE<span className="text-[#C2AF93]">BREW</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em] text-[#E5E2D9]/60">
          {['Menu', 'Specials', 'Roastery', 'About', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#C2AF93] border-b border-[#C2AF93] pb-1 hover:text-white hover:border-white transition-all">
            BACK_TO_WEBBY
          </Link>
          <button className="px-8 py-3 rounded-full bg-[#C2AF93] text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(194,175,147,0.25)]">
            Order Pickup
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10 max-w-7xl mx-auto min-h-[85vh] flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#C2AF93]/5 rounded-full blur-[140px] -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"
            >
              <Sparkles size={14} className="text-[#C2AF93]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E5E2D9]/60">Artisanal Custom Roasts Only</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] uppercase text-white"
            >
              CRAFTED BY <br />
              <span className="text-[#C2AF93] font-light italic">PURE ENERGY</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#E5E2D9]/70 text-lg max-w-md leading-relaxed"
            >
              Slow bar extraction and handcrafted micro-batch roasting. Taste complex natural flavors as they were intended to be experienced.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex items-center gap-6 pt-4"
            >
               <button className="bg-[#C2AF93] text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                  Browse Menu
               </button>
               <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C2AF93] hover:text-white transition-colors cursor-pointer">
                  Learn Our Method →
               </span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200" 
                alt="Bespoke Coffee Experience" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="absolute -bottom-10 -right-10 bg-black/90 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl max-w-xs">
              <div className="text-xs font-black uppercase italic text-[#C2AF93]">Local Batching</div>
              <div className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-1">Sustainably sourced direct-trade beans</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center space-y-4 mb-20">
            <span className="text-[#C2AF93] font-black uppercase tracking-[0.2em] text-[10px]">Slow Pour specialties</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">The Slow Bar Menu</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {SPECIALTIES.map((s, idx) => (
              <div key={idx} className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black uppercase text-white">{s.name}</h3>
                  <span className="text-xl font-black text-[#C2AF93]">${s.price}</span>
                </div>
                <p className="text-[#E5E2D9]/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-[#C2AF93] mx-auto">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-white">Origin Traced</h3>
            <p className="text-[#E5E2D9]/60 text-sm leading-relaxed">Full transparent footprint tracing from specific high-altitude farms with fair compensation.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-[#C2AF93] mx-auto">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-white">Fresh Roast Cycles</h3>
            <p className="text-[#E5E2D9]/60 text-sm leading-relaxed">Roasting cycles performed every Monday and Thursday morning for peek aroma density.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-[#C2AF93] mx-auto">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-white">True Micro-batches</h3>
            <p className="text-[#E5E2D9]/60 text-sm leading-relaxed">Each batch roasted has a limit of 12kg to ensure supreme quality control profiles.</p>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-white/5 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">© 2026 The Brew. Partnered with WebbyLaunch.</p>
      </footer>
    </div>
  );
}
