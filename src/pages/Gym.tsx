import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Activity, 
  ArrowRight, 
  Check, 
  Instagram, 
  Phone, 
  Mail, 
  Menu, 
  X, 
  Play,
  Clock,
  User,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmoothScroll } from '../components/resort/SmoothScroll';
import { GymHero3D } from '../components/gym/GymHero3D';
import { GymCard } from '../components/gym/GymCard';
import { TransformationSlider } from '../components/gym/TransformationSlider';

const TRAINING_PROGRAMS = [
  {
    title: "IRON GENESIS",
    category: "Hypertrophy",
    description: "Pure strength building with high-volume industrial training methods.",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200",
    accentColor: "#ff3e3e"
  },
  {
    title: "NEON FLOW",
    category: "Metabolic HIIT",
    description: "High-intensity metabolic conditioning in a neon-lit atmosphere.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200",
    accentColor: "#00f2ff"
  },
  {
    title: "TITAN CORE",
    category: "Stability",
    description: "Elite core stabilization and functional movement optimization.",
    image: "https://images.unsplash.com/photo-1599058917233-35835ea394ca?q=80&w=1200",
    accentColor: "#ffffff"
  }
];

const PRICING = [
  {
    name: "STRENGTH",
    price: "49",
    features: ["24/7 Access", "All Functional Areas", "Basic Nutrition App", "Group Classes"],
    popular: false
  },
  {
    name: "ELITE",
    price: "89",
    features: ["Everything in Strength", "Personal Coach (Monthly)", "Custom Nutrition Plan", "Recovery Zone Access", "Body Composition Scan"],
    popular: true
  },
  {
    name: "WORLD-CLASS",
    price: "199",
    features: ["Everything in Elite", "Unlimited 1-on-1 PT", "Biometric Tracking", "DNA Analysis", "VIP Lounge & Spa"],
    popular: false
  }
];

export default function Gym() {
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
      <div className="bg-black text-white font-sans selection:bg-neon-red selection:text-white overflow-x-hidden">
        
        {/* Neon Cursor Glow */}
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] opacity-30 mix-blend-screen"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 62, 62, 0.15), transparent 80%)`
          }}
        />

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-500 ${scrollY > 50 ? 'backdrop-blur-xl bg-black/80 border-b border-white/5' : ''}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase group">
              IRON<span className="text-neon-red group-hover:animate-pulse">NEON</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-10">
              <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#ff3e3e] border-b border-[#ff3e3e] pb-1 hover:text-white hover:border-white transition-all">
                BACK_TO_WEBBY
              </Link>
              <button className="px-8 py-3 bg-neon-red text-white font-black italic text-[11px] uppercase tracking-widest rounded-full hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,62,62,0.4)]">
                JOIN NOW
              </button>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <GymHero3D />
          
          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2 glass-morphism rounded-full border border-white/10"
            >
              <Zap size={14} className="text-neon-red" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">NO LIMITS. ONLY RESULTS.</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-7xl md:text-[12vw] font-black italic leading-[0.8] tracking-tighter uppercase"
            >
              BUILD YOUR <br /> 
              <span className="text-transparent font-outline-2 text-white/10">STRONGEST</span> SELF
            </motion.h1>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
               className="flex flex-col md:flex-row gap-6 justify-center pt-8"
            >
               <button className="px-14 py-6 bg-white text-black font-black italic uppercase tracking-widest text-xs rounded-full hover:bg-neon-red hover:text-white transition-all shadow-2xl">
                  Start Your Trial
               </button>
               <button className="px-14 py-6 glass-morphism border border-white/10 text-white font-black italic uppercase tracking-widest text-xs rounded-full hover:bg-white/10 transition-all">
                  View Programs
               </button>
            </motion.div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20">
            <div className="w-px h-24 bg-gradient-to-b from-white to-transparent" />
          </div>
        </section>

        {/* Stats Grid */}
        <section className="relative z-20 -mt-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Members", val: "5K+", icon: User },
              { label: "Elite Coaches", val: "40+", icon: Trophy },
              { label: "Workout Hours", val: "24/7", icon: Clock },
              { label: "Satisfaction", val: "99%", icon: Star }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-morphism p-8 md:p-12 rounded-[2rem] text-center space-y-2 border border-white/5"
              >
                <stat.icon size={24} className="mx-auto text-neon-blue mb-4" />
                <h3 className="text-4xl font-black italic tracking-tighter">{stat.val}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Training Programs */}
        <section className="py-60 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
            <div className="space-y-6">
              <span className="text-neon-red font-black uppercase tracking-[1em] text-[10px] block">Atmospheric Training</span>
              <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">
                CHOOSE YOUR <br /><span className="text-white/10">BATTLEFIELD.</span>
              </h2>
            </div>
            <p className="text-xl text-white/40 font-medium italic max-w-md leading-relaxed">
              Every program is a protocol designed to push your biological limits through science and intensity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {TRAINING_PROGRAMS.map((prog, i) => (
              <GymCard key={i} item={prog} index={i} />
            ))}
          </div>
        </section>

        {/* Membership Plans */}
        <section className="py-60 bg-charcoal border-y border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center space-y-8 mb-40">
              <span className="text-neon-blue font-black uppercase tracking-[1em] text-[10px]">Access Protocols</span>
              <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">MEMBERSHIPS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PRICING.map((plan, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className={`relative p-12 md:p-16 rounded-[4rem] border transition-all duration-500 overflow-hidden ${plan.popular ? 'bg-neon-red border-neon-red text-white scale-105 z-10 shadow-[0_0_80px_rgba(255,62,62,0.3)]' : 'bg-black border-white/10 hover:border-neon-blue'}`}
                >
                  {plan.popular && (
                    <div className="absolute top-10 right-10 bg-white text-neon-red px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="space-y-12">
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase">{plan.name}</h4>
                       <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black italic tracking-tighter">${plan.price}</span>
                          <span className="text-xs font-black uppercase tracking-widest opacity-40">/ MONTH</span>
                       </div>
                    </div>
                    
                    <ul className="space-y-6">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-start gap-4 text-sm font-medium italic opacity-70">
                          <Check size={18} className={plan.popular ? 'text-white' : 'text-neon-blue'} />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <button className={`w-full py-6 rounded-3xl font-black italic uppercase tracking-[0.2em] text-xs transition-all ${plan.popular ? 'bg-white text-neon-red hover:bg-black hover:text-white' : 'bg-white text-black hover:bg-neon-blue hover:text-white'}`}>
                       Select Protocol
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black uppercase text-white/[0.02] tracking-tighter pointer-events-none select-none">
            ELITE
          </div>
        </section>

        <TransformationSlider />

        {/* Global Footer */}
        <footer className="bg-black py-40 px-10 border-t border-white/5">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
              <div className="lg:col-span-5 space-y-12">
                 <h2 className="text-6xl font-black italic tracking-tighter uppercase">IRON<span className="text-neon-red">NEON</span></h2>
                 <p className="text-xl font-medium italic text-white/30 max-w-sm leading-relaxed">
                   The world's most aggressive training environment. Forge your destiny in the dark.
                 </p>
                 <div className="flex gap-6">
                    {[Instagram, Phone, Mail].map((Icon, i) => (
                      <button key={i} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-neon-red hover:border-neon-red transition-all">
                        <Icon size={20} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-8">
                 <h6 className="text-neon-red text-[10px] uppercase font-black tracking-[0.4em]">Protocols</h6>
                 <ul className="space-y-4 text-2xl font-black italic text-white/20">
                    {['Programs', 'Memberships', 'Privacy', 'Legal'].map(item => (
                      <li key={item} className="hover:text-white transition-colors cursor-pointer tracking-tighter">
                         {item}
                      </li>
                    ))}
                 </ul>
              </div>

              <div className="lg:col-span-4 space-y-10">
                 <h6 className="text-neon-red text-[10px] uppercase font-black tracking-[0.4em]">The Transmission</h6>
                 <p className="text-sm font-medium text-white/30 italic">Receive high-performance training logs and event invites.</p>
                 <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="IDENTIFIER@EMAIL.COM" 
                      className="w-full bg-transparent border-b border-white/10 py-6 text-lg font-black italic tracking-tighter focus:outline-none focus:border-neon-red transition-all placeholder:text-white/5" 
                    />
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-neon-red group-hover:translate-x-4 transition-transform">
                       <ArrowRight size={32} />
                    </button>
                 </div>
              </div>
           </div>
        </footer>

        {/* Floating CTA (Mobile) */}
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
           <button className="w-full py-5 bg-neon-red text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-[0_10px_30px_rgba(255,62,62,0.5)]">
              JOIN THE ELITE
           </button>
        </div>

      </div>
    </SmoothScroll>
  );
}
