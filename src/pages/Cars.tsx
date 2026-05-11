import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  SlidersHorizontal, 
  Instagram, 
  Phone, 
  Mail, 
  Menu, 
  X,
  Wind,
  Zap as ZapIcon,
  Gauge,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmoothScroll } from '../components/resort/SmoothScroll';
import { CarHero3D } from '../components/cars/CarHero3D';
import { CarCard } from '../components/cars/CarCard';
import { PerformanceStats } from '../components/cars/PerformanceStats';

const CARS_COLLECTION = [
  {
    name: "AERO SPRINT",
    model: "V12 ELECTRA",
    description: "The pinnacle of aerodynamic efficiency combined with a twin-turbo hybrid V12 power unit.",
    price: "$2,450,000",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200",
    specs: { speed: "355 KM/H", hp: "980 HP", acceleration: "2.5s" },
    accentColor: "#00f2ff"
  },
  {
    name: "CARBON PHANTOM",
    model: "BLACK EDITION",
    description: "A full carbon exoskeleton designed for weightless performance and menacing aesthetics.",
    price: "$3,120,000",
    image: "https://images.unsplash.com/photo-1544636331-e268592033c2?q=80&w=1200",
    specs: { speed: "340 KM/H", hp: "920 HP", acceleration: "2.7s" },
    accentColor: "#ff3e3e"
  },
  {
    name: "SOLARIS GT",
    model: "OPEN TOP",
    description: "Experience the elements with the world's most powerful open-top grand tourer.",
    price: "$1,890,000",
    image: "https://images.unsplash.com/photo-1592193666082-c56093930702?q=80&w=1200",
    specs: { speed: "330 KM/H", hp: "860 HP", acceleration: "2.9s" },
    accentColor: "#ffffff"
  }
];

export default function CarsPortfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <SmoothScroll>
      <div className="bg-black text-white font-sans selection:bg-neon-blue selection:text-white overflow-x-hidden">
        
        {/* Cinematic Light Reflection */}
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] opacity-20 mix-blend-screen"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.1), transparent 80%)`
          }}
        />

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-500 ${scrollY > 50 ? 'backdrop-blur-xl bg-black/60 border-b border-white/5' : ''}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-3xl font-display font-black tracking-tighter uppercase group italic">
              VELO<span className="text-neon-blue gold-text-gradient">CIT</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-12">
              {['Collection', 'Engineering', 'Heritage', 'Experience'].map((item) => (
                <button key={item} className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-white transition-all">
                  {item}
                </button>
              ))}
              <div className="flex items-center gap-4 border-l border-white/10 pl-12">
                <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-[#c7c42a] border-b border-[#c7c42a] pb-1 hover:text-white hover:border-white transition-all mr-4">
                  BACK_TO_WEBBY
                </Link>
                <button className="text-white/40 hover:text-white"><Search size={18} /></button>
                <button className="px-8 py-3 glass-morphism border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all">
                  TEST DRIVE
                </button>
              </div>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
          <CarHero3D />
          
          <div className="relative z-10 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2 glass-morphism rounded-full border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">GEN 3 HYBRID PERFORMANCE</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-7xl md:text-9xl font-display font-black tracking-tighter uppercase leading-[0.85]"
              >
                DRIVE THE <br /> <span className="gold-text-gradient italic">FUTURE</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl font-light italic text-white/30 tracking-tight"
              >
                Where high performance meets avant-garde design.
              </motion.p>
            </div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
               className="flex flex-col md:flex-row gap-6 justify-center pt-8"
            >
               <button className="px-14 py-6 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-neon-blue hover:text-white transition-all shadow-2xl flex items-center gap-4">
                  Explore Collection <ChevronRight size={16} />
               </button>
               <button className="px-14 py-6 glass-morphism border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-white/10 transition-all">
                  Watch Film
               </button>
            </motion.div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-30">
             <div className="flex flex-col items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-widest">Aero</span>
                <div className="w-px h-12 bg-white" />
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-widest">Vision</span>
                <div className="w-px h-12 bg-white" />
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-widest">Power</span>
                <div className="w-px h-12 bg-white" />
             </div>
          </div>
        </section>

        {/* Filter / Search Bar */}
        <section className="py-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-y border-white/5">
           <div className="flex items-center gap-12 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              {['ALL MODELS', 'ELECTRIC', 'HYBRID', 'HYPERCARS', 'GRAND TOURERS'].map((cat, i) => (
                <button key={i} className={`text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap ${i === 0 ? 'text-white border-b border-white' : 'text-white/30 hover:text-white'} pb-2 transition-all`}>
                  {cat}
                </button>
              ))}
           </div>
           <button className="flex items-center gap-4 px-8 py-4 glass-morphism rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-white/50">
              <SlidersHorizontal size={14} /> FILTER BY SPECS
           </button>
        </section>

        {/* Featured Collection */}
        <section className="py-60 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
            <div className="space-y-6">
              <span className="text-neon-blue font-bold uppercase tracking-[1em] text-[10px] block">Curated Selection</span>
              <h2 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase leading-none italic">
                FEATURED <br /><span className="text-white/10 uppercase font-display not-italic">MACHINES</span>
              </h2>
            </div>
            <p className="text-xl text-white/40 font-light italic max-w-sm leading-relaxed">
              Every vehicle in our collection is a masterpiece of precision engineering and aesthetic soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {CARS_COLLECTION.map((car, i) => (
              <CarCard key={i} car={car} index={i} />
            ))}
          </div>
        </section>

        <PerformanceStats />

        {/* Brand Showcase - Wide Video/Image Section */}
        <section className="py-60 relative overflow-hidden">
           <div className="h-screen w-full relative">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000"
                className="w-full h-full object-cover grayscale opacity-40 fixed top-0 left-0 -z-10"
                alt="Brand Heritage"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-12">
                 <span className="text-neon-blue font-bold uppercase tracking-[1.5em] text-[10px]">The Heritage</span>
                 <motion.h2 
                   initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   className="text-7xl md:text-[15vw] font-display font-black tracking-tighter uppercase text-white/5"
                 >
                   PRECISION
                 </motion.h2>
                 <div className="max-w-2xl space-y-8">
                    <p className="text-2xl md:text-4xl font-light italic text-white/80 leading-relaxed tracking-tight">
                      "We don't just build cars. We sculpt time and speed into visceral experiences."
                    </p>
                    <div className="w-24 h-px bg-white/20 mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">MARCO VALENTI, FOUNDER</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Boutique / Showroom Gallery */}
        <section className="py-60 px-6 max-w-7xl mx-auto space-y-32">
           <div className="text-center space-y-6">
              <span className="text-neon-blue font-bold uppercase tracking-[1em] text-[10px]">Showroom Experience</span>
              <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase luxury-text-gradient">THE BOUTIQUE</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                "https://images.unsplash.com/photo-1603584173870-7f37fe4e19d7?q=80&w=800",
                "https://images.unsplash.com/photo-1617469767053-d3b508a0d84d?q=80&w=800",
                "https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=800",
                "https://images.unsplash.com/photo-1583271804245-847240c1d683?q=80&w=800"
              ].map((img, i) => (
                <motion.div 
                   key={i} 
                   whileHover={{ y: -20 }}
                   className={`h-[400px] rounded-3xl overflow-hidden border border-white/5 ${i % 2 !== 0 ? 'mt-0 md:mt-20' : ''}`}
                >
                   <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Gallery" />
                </motion.div>
              ))}
           </div>
        </section>

        {/* Global Footer */}
        <footer className="bg-black py-40 px-10 border-t border-white/5">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
              <div className="lg:col-span-5 space-y-12">
                 <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic">VELO<span className="text-neon-blue gold-text-gradient">CIT</span></h2>
                 <p className="text-xl font-light italic text-white/30 max-w-sm leading-relaxed">
                   Redefining the boundaries of high-performance automotive art. Join the elite.
                 </p>
                 <div className="flex gap-6">
                    {[Instagram, Phone, Mail].map((Icon, i) => (
                      <button key={i} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-neon-blue hover:border-neon-blue transition-all">
                        <Icon size={20} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-8">
                 <h6 className="text-neon-blue text-[10px] uppercase font-bold tracking-[0.5em]">The Archive</h6>
                 <ul className="space-y-4 text-2xl font-display font-bold italic text-white/20">
                    {['COLLECTION', 'HERITAGE', 'ATELIER', 'LEGALS'].map(item => (
                      <li key={item} className="hover:text-white transition-colors cursor-pointer tracking-tighter">
                         {item}
                      </li>
                    ))}
                 </ul>
              </div>

              <div className="lg:col-span-4 space-y-10">
                 <h6 className="text-neon-blue text-[10px] uppercase font-bold tracking-[0.5em]">The Transmission</h6>
                 <p className="text-sm font-medium text-white/30 italic">Secure your invitation for private unveilings and track events.</p>
                 <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="PROTOCOLS@IDENTITY.COM" 
                      className="w-full bg-transparent border-b border-white/10 py-6 text-lg font-display font-bold italic tracking-tighter focus:outline-none focus:border-neon-blue transition-all placeholder:text-white/5" 
                    />
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-neon-blue group-hover:translate-x-4 transition-transform">
                       <ChevronRight size={32} />
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="max-w-7xl mx-auto pt-40 flex flex-col md:flex-row justify-between items-center gap-8 text-[8px] font-bold uppercase tracking-[0.5em] text-white/10">
              <p>© 2026 VELOCIT ATELIER. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-12">
                 <span>Privacy Policy</span>
                 <span>Cookie Settings</span>
              </div>
           </div>
        </footer>

        {/* Floating CTA (Mobile) */}
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
           <button className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
              RESERVE YOURS
           </button>
        </div>

      </div>
    </SmoothScroll>
  );
}
