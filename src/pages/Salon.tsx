import React from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, Clock, MapPin, Sparkles, Scissors, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    name: "Luxury Haircut & Styling",
    price: "85",
    desc: "Custom cut, signature shampoo, intensive treatment, scalp massage, and blowout."
  },
  {
    name: "Balayage & Couture Color",
    price: "190+",
    desc: "Hand-painted bespoke highlights designed to complement your skin tone and hair flow."
  },
  {
    name: "Advanced Skin Therapy",
    price: "120",
    desc: "Customized botanical facial, lymphatic drainage massage, and LED light activation."
  }
];

export default function Salon() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C2520] font-sans selection:bg-[#E9DCC9] selection:text-[#2C2520] overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2C2520] rounded-full flex items-center justify-center text-[#FAF6F0]">
            <Scissors size={20} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">AURA<span className="font-light text-[#8C7A6B]">SALON</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em] text-[#2C2520]/60">
          {['Services', 'Specials', 'Stylists', 'About', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-[#2C2520] transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#8C7A6B] border-b border-[#8C7A6B] pb-1 hover:text-[#2C2520] hover:border-[#2C2520] transition-all">
            BACK_TO_WEBBY
          </Link>
          <button className="px-8 py-3 rounded-full bg-[#2C2520] text-[#FAF6F0] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_32px_rgba(44,37,32,0.15)]">
            Book Appointment
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10 max-w-7xl mx-auto min-h-[85vh] flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#E9DCC9]/40 rounded-full blur-[120px] -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#2C2520]/10 shadow-sm"
            >
              <Sparkles size={14} className="text-[#8C7A6B]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2C2520]/60">Voted Best Luxury Salon 2026</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] uppercase"
            >
              REVEAL YOUR <br />
              <span className="text-[#8C7A6B] font-light italic">NATURAL GLOW</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#2C2520]/70 text-lg max-w-md leading-relaxed"
            >
              Bespoke organic hair and skin rituals curated by master specialists to restore balance and elevate your signature aesthetic.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex items-center gap-6 pt-4"
            >
               <button className="bg-[#2C2520] text-[#FAF6F0] px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                  Reserve Ritual
               </button>
               <div className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7A6B] hover:text-[#2C2520] transition-colors cursor-pointer">
                  Explore Services →
               </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200" 
                alt="Luxury Salon Experience" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#2C2520]/10 shadow-xl max-w-xs">
              <div className="text-xs font-black uppercase italic text-[#2C2520]">Natural Botanicals</div>
              <div className="text-[10px] text-[#2C2520]/50 font-black uppercase tracking-widest mt-1">100% Organic certified formulas</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 bg-white/50 border-y border-[#2C2520]/5">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center space-y-4 mb-20">
            <span className="text-[#8C7A6B] font-black uppercase tracking-[0.2em] text-[10px]">Exceptional Rituals</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Our Signature Menu</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {SERVICES.map((s, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-[#2C2520]/5 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black uppercase text-[#2C2520]">{s.name}</h3>
                  <span className="text-xl font-black text-[#8C7A6B]">${s.price}</span>
                </div>
                <p className="text-[#2C2520]/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#2C2520]/5 rounded-full flex items-center justify-center text-[#2C2520] mx-auto">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-black uppercase">Pure Comfort</h3>
            <p className="text-[#2C2520]/60 text-sm leading-relaxed">Relax in custom-designed treatment suites with ambient climate and acoustics.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#2C2520]/5 rounded-full flex items-center justify-center text-[#2C2520] mx-auto">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-black uppercase">Flexible Booking</h3>
            <p className="text-[#2C2520]/60 text-sm leading-relaxed">Easy digital rescheduling up to 4 hours prior to scheduled master rituals.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#2C2520]/5 rounded-full flex items-center justify-center text-[#2C2520] mx-auto">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-black uppercase">Master Stylists</h3>
            <p className="text-[#2C2520]/60 text-sm leading-relaxed">Artistic colorists and consultants with continuous advanced worldwide training.</p>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-[#2C2520]/5 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">© 2026 Aura Salon. Partnered with WebbyLaunch.</p>
      </footer>
    </div>
  );
}
