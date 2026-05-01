import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Palmtree, 
  Waves, 
  MapPin, 
  Star, 
  ArrowRight, 
  Wind, 
  Sun, 
  Compass, 
  Phone, 
  Mail, 
  Instagram, 
  Check, 
  Calendar,
  Users,
  ChevronRight,
  Menu,
  X,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SmoothScroll } from '../components/resort/SmoothScroll';
import { Hero3D } from '../components/resort/Hero3D';
import { VillaCard } from '../components/resort/VillaCard';
import { Gallery } from '../components/resort/Gallery';
import { Testimonials } from '../components/resort/Testimonials';
import { Contact } from '../components/resort/Contact';

// --- Assets ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000",
  villas: [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1200"
  ],
  amenities: "https://images.unsplash.com/photo-1510626396912-1647a6125000?q=80&w=1200",
  about: "https://images.unsplash.com/photo-1506929113675-b9299d39ca18?q=80&w=1200"
};

const VILLAS = [
  {
    id: 1,
    name: "The Azure Sanctuary",
    type: "Overwater Pool Villa",
    price: "$2,450",
    description: "Suspended above the turquoise lagoon, featuring a private infinity pool and seamless ocean horizons.",
    image: IMAGES.villas[0],
    features: ["450 sqm", "Infinity Pool", "Glass Floor"]
  },
  {
    id: 2,
    name: "Cliffside Majesty",
    type: "Panoramic Ocean Suite",
    price: "$1,890",
    description: "Perched high on the volcanic cliffs, offering the most dramatic sunset views in the Indian Ocean.",
    image: IMAGES.villas[1],
    features: ["320 sqm", "Outdoor Spa", "270° Views"]
  },
  {
    id: 3,
    name: "Jungle Immersion",
    type: "Tropical Garden Retreat",
    price: "$1,560",
    description: "A private cocoon surrounded by ancient banyan trees and lush tropical flora, for total seclusion.",
    image: IMAGES.villas[2],
    features: ["280 sqm", "Private Garden", "Rain Shower"]
  }
];

export default function Resort() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <SmoothScroll>
      <div ref={containerRef} className="relative bg-luxury-black text-white font-sans overflow-x-hidden selection:bg-gold selection:text-white">
        
        {/* Mouse follow light glow */}
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] opacity-30 blur-[120px]"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.15), transparent 80%)`
          }}
        />

        {/* Floating Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-700 ${isMenuOpen ? 'bg-luxury-black' : 'backdrop-blur-xl bg-black/20 border-b border-white/5'}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-display font-bold tracking-tighter elite-logo">
              LUMIÉRE<span className="text-gold">.</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-10">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-[1em] text-gold border-b border-gold/30 pb-0.5 hover:text-white hover:border-white transition-all">
                BACK_TO_WEBBY
              </Link>
              <button className="px-8 py-3 bg-gold text-black font-bold text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-all">
                Reserve Stay
              </button>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-40 bg-luxury-black pt-32 px-10 flex flex-col gap-8 md:hidden"
            >
              {['Home', 'Villas', 'Experiences', 'Dining', 'Wellness', 'Booking'].map((item) => (
                <button key={item} className="text-4xl font-display font-bold text-left tracking-tighter">
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
          <Hero3D />
          
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 space-y-8"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] font-bold uppercase tracking-[1em] text-gold block"
            >
              Architecture of Silence
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-7xl md:text-[10vw] font-display font-bold leading-[0.8] tracking-tighter luxury-text-gradient"
            >
              ESCAPE TO <br /> LUXURY
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-lg md:text-2xl font-light italic text-white/40 max-w-2xl mx-auto"
            >
              Experience paradise like never before in a sanctuary designed for the soul.
            </motion.p>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.2 }}
               className="flex flex-col md:flex-row gap-4 justify-center pt-8"
            >
               <button className="px-12 py-5 bg-gold text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white transition-all shadow-xl shadow-gold/10">
                  Book Your Escape
               </button>
               <button className="px-12 py-5 glass-morphism text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all">
                  Explore Villas
               </button>
            </motion.div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30"
          >
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] vertical-text">Scroll Down</span>
            <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
          </motion.div>
        </section>

        {/* Booking System (Quick Access) */}
        <section className="relative z-20 -mt-20 px-6 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-morphism p-8 md:p-12 rounded-[3rem] shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-8 items-center"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <Calendar size={12} /> Check In
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                placeholderText="Select Date"
                className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <Calendar size={12} /> Check Out
              </label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                placeholderText="Select Date"
                className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <Users size={12} /> Guests
              </label>
              <select className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none text-lg font-bold appearance-none">
                <option className="bg-luxury-black">2 Adults, 0 Children</option>
                <option className="bg-luxury-black">2 Adults, 1 Child</option>
                <option className="bg-luxury-black">4 Adults</option>
              </select>
            </div>
            <button className="h-full w-full bg-white text-black font-bold uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-gold transition-all py-6">
              Check Availability
            </button>
          </motion.div>
        </section>

        {/* Luxury Villas Section */}
        <section className="py-40 md:py-60 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
            <div className="space-y-6">
              <span className="text-gold font-bold uppercase tracking-[1em] text-[10px] block">The Gallery of Sleep</span>
              <h2 className="text-5xl md:text-8xl font-display font-bold leading-none tracking-tighter luxury-text-gradient">
                CURATED <br /> RESIDENCES
              </h2>
            </div>
            <p className="text-xl text-white/30 font-light italic max-w-md leading-relaxed">
              Every sanctuary is a bespoke masterpiece designed to synchronize with your biological rhythm and the ocean's breath.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {VILLAS.map((villa, i) => (
              <VillaCard key={villa.id} villa={villa} index={i} />
            ))}
          </div>
        </section>

        {/* 3D Amenities Overlay */}
        <section className="relative py-60 bg-white/5 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center space-y-8 mb-40">
              <span className="text-gold font-bold uppercase tracking-[1em] text-[10px]">Pure Rituals</span>
              <h2 className="text-6xl md:text-9xl font-display font-bold tracking-tighter uppercase luxury-text-gradient leading-none">
                BEYOND <br /> SERVICE
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { icon: Waves, label: "Infinity Pools", desc: "Thermal regulation" },
                { icon: Wind, label: "Ocean Spa", desc: "Sensory flotation" },
                { icon: Sun, label: "Solar Terrace", desc: "Vitamin D optimization" },
                { icon: Compass, label: "Private Atoll", desc: "Exclusive discovery" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="space-y-6 group cursor-pointer"
                >
                  <div className="w-32 h-32 mx-auto rounded-full glass-morphism flex items-center justify-center group-hover:gold-glow group-hover:border-gold transition-all duration-500 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                    <item.icon size={40} className="text-white group-hover:text-gold transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold uppercase tracking-widest">{item.label}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Background Text Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black uppercase text-white/[0.02] tracking-tighter pointer-events-none select-none">
            RITUALS
          </div>
        </section>

        <Gallery />

        {/* About Section - Cinematic Reveal */}
        <section className="py-60 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative group overflow-hidden rounded-[4rem] aspect-[4/5] shadow-2xl">
              <motion.img 
                initial={{ scale: 1.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                src={IMAGES.about} 
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gold/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <button className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full glass-morphism flex items-center justify-center hover:scale-110 transition-transform">
                  <Play className="fill-white ml-1" />
                </div>
              </button>
            </div>

            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <span className="text-gold font-bold uppercase tracking-[1em] text-[10px]">The Lineage</span>
                <h2 className="text-6xl font-display font-bold tracking-tighter leading-[0.9]">
                  WHERE HORIZONS <br /> BECOME <span className="italic text-white hover:text-gold transition-colors cursor-pointer">HOME.</span>
                </h2>
                <p className="text-2xl text-white/40 font-light leading-relaxed italic">
                  "Lumiére is not just a destination; it's the frequency where your soul and the ocean's depth become a single vibration."
                </p>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-2">
                  <h5 className="text-5xl font-display font-bold gold-text-gradient tracking-tighter">0.01%</h5>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Atmospheric Purity</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-5xl font-display font-bold gold-text-gradient tracking-tighter">12:1</h5>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Ambassador Ratio</p>
                </div>
              </div>

              <button className="group flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.5em] text-white hover:text-gold transition-all">
                The Heritage Protocol <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        <Testimonials />

        <Contact />

        {/* Global Footer */}
        <footer className="bg-black py-40 px-10 border-t border-white/5">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
              <div className="lg:col-span-5 space-y-12">
                 <h2 className="text-6xl font-display font-bold tracking-tighter">LUMIÉRE<span className="text-gold">.</span></h2>
                 <p className="text-xl font-light italic text-white/30 max-w-sm leading-relaxed">
                   A strictly limited access sanctuary for the world's most discerning creators.
                 </p>
                 <div className="flex gap-6">
                    {[Instagram, Phone, Mail].map((Icon, i) => (
                      <button key={i} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold transition-all">
                        <Icon size={20} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-8">
                 <h6 className="text-gold text-[10px] uppercase font-bold tracking-[0.4em]">Protocol</h6>
                 <ul className="space-y-4 text-2xl font-display font-semibold text-white/20">
                    <li className="hover:text-white transition-colors cursor-pointer tracking-tighter italic">Villas</li>
                    <li className="hover:text-white transition-colors cursor-pointer tracking-tighter italic">Rituals</li>
                    <li className="hover:text-white transition-colors cursor-pointer tracking-tighter italic">Wellness</li>
                    <li className="hover:text-white transition-colors cursor-pointer tracking-tighter italic">Contact</li>
                 </ul>
              </div>

              <div className="lg:col-span-4 space-y-10">
                 <h6 className="text-gold text-[10px] uppercase font-bold tracking-[0.4em]">The Beacon</h6>
                 <p className="text-sm font-light text-white/30 italic">Registration for the 2026 Winter Solstice is now open via invitation.</p>
                 <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="YOUR@IDENTITY.COM" 
                      className="w-full bg-transparent border-b border-white/10 py-6 text-lg font-bold tracking-tighter focus:outline-none focus:border-gold transition-all placeholder:text-white/5" 
                    />
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gold group-hover:translate-x-2 transition-transform">
                       <ArrowRight />
                    </button>
                 </div>
              </div>
           </div>

           <div className="max-w-7xl mx-auto mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/10 italic">
                 © 2024 Lumiére Private Residencies. Produced by WebbyLaunch Protocol.
              </p>
              <div className="flex gap-10">
                 <Link to="/" className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/10 hover:text-white transition-all">Privacy</Link>
                 <Link to="/" className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/10 hover:text-white transition-all">Terms</Link>
                 <Link to="/" className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/10 hover:text-white transition-all">Press</Link>
              </div>
           </div>
        </footer>

        {/* Floating CTA (Mobile) */}
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
           <button className="w-full py-5 bg-gold text-black font-bold uppercase tracking-widest text-xs rounded-2xl shadow-2xl flex items-center justify-center gap-4">
              Book Sanctuary <Compass size={16} />
           </button>
        </div>

      </div>
    </SmoothScroll>
  );
}
