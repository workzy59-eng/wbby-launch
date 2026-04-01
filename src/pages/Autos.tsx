import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ChevronRight, 
  Star, 
  Shield, 
  Zap, 
  Cpu,
  Gauge,
  Wind,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Autos() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="text-2xl font-black tracking-tighter uppercase italic">
          MERCEDES-<span className="text-[#E6FF00]">BENZ</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
          {['Models', 'Electric', 'Configure', 'Owners', 'Discover'].map((item) => (
            <a key={item} href="#" className="hover:text-[#E6FF00] transition-colors">{item}</a>
          ))}
        </div>
        <Link to="/" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          Back to Hub
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920" 
            alt="Mercedes AMG" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[1px] bg-[#E6FF00]" />
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#E6FF00]">AMG Performance</span>
            </div>
            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase italic mb-8">
              THE ART OF <span className="text-[#E6FF00]">SPEED</span>
            </h1>
            <p className="text-xl text-white/60 max-w-xl mb-12 font-medium leading-relaxed italic">
              Experience the pinnacle of automotive engineering. Handcrafted performance that pushes the boundaries of what's possible on four wheels.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="px-12 py-6 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(230,255,0,0.3)]">
                Configure Yours
              </button>
              <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase italic text-xl hover:bg-white/10 transition-all">
                Test Drive
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-20 right-10 flex flex-col gap-4">
          {[
            { label: '0-60 MPH', value: '3.1s' },
            { label: 'TOP SPEED', value: '190 MPH' },
            { label: 'HORSEPOWER', value: '503 HP' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-64"
            >
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-3xl font-black italic tracking-tighter">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Gauge, title: 'Precision Control', desc: 'Advanced suspension systems that adapt to every curve in real-time.' },
              { icon: Wind, title: 'Aerodynamics', desc: 'Sculpted by the wind to minimize drag and maximize downforce.' },
              { icon: Cpu, title: 'Smart Tech', desc: 'MBUX infotainment system with AI-driven voice control and navigation.' }
            ].map((f, i) => (
              <div key={i} className="p-12 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 hover:border-[#E6FF00]/40 transition-all group">
                <div className="w-16 h-16 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00] group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{f.title}</h3>
                <p className="text-white/40 font-bold uppercase italic text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
              ENGINEERED TO <span className="text-[#E6FF00]">EXCITE</span>
            </h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed italic">
              Every AMG engine is handcrafted by a single master technician. This "One Man, One Engine" philosophy ensures unparalleled quality and performance.
            </p>
            <div className="space-y-6">
              {[
                'Handcrafted 4.0L V8 Biturbo Engine',
                'AMG Performance 4MATIC+ All-Wheel Drive',
                'AMG RIDE CONTROL+ Air Suspension',
                'High-Performance Composite Braking System'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#E6FF00] flex items-center justify-center text-black">
                    <ChevronRight size={16} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest italic">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[4rem] overflow-hidden border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200" 
                alt="AMG Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-[#E6FF00] p-12 rounded-[3rem] text-black shadow-2xl">
              <div className="text-6xl font-black tracking-tighter italic">V8</div>
              <div className="text-[10px] font-black uppercase tracking-widest">Biturbo Power</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/10 text-center">
        <div className="text-sm font-black text-white/20 uppercase tracking-[0.5em] mb-8 italic">
          © 2026 MERCEDES-BENZ AMG PERFORMANCE
        </div>
        <div className="flex justify-center gap-10 opacity-40">
          {['Instagram', 'Twitter', 'YouTube', 'LinkedIn'].map(s => (
            <a key={s} href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-[#E6FF00] transition-all">{s}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
