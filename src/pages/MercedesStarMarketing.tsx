import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Shield, Zap, Globe, Cpu, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MercedesStarMarketing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#00ADEF] selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Star className="text-black" size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Mercedes Star</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {['Strategy', 'Creative', 'Digital', 'Performance', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-[#00ADEF] transition-colors">{item}</a>
          ))}
        </div>

        <button className="px-8 py-3 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10 max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center text-center">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#00ADEF]/5 rounded-full blur-[150px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#00ADEF] text-xs font-black uppercase tracking-[0.5em] mb-8"
        >
          Paid Portfolio
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase italic mb-12"
        >
          Mercedes Star<br />Marketing
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-white/40 text-lg font-medium leading-relaxed mb-16"
        >
          Elevating luxury brands through precision marketing and digital excellence. 
          Where engineering meets emotion.
        </motion.p>

        {/* Featured Image */}
        <div className="relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden border border-white/10 group">
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1600" 
            alt="microchips" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-widest text-[#00ADEF] mb-2">Campaign 2024</div>
              <div className="text-3xl font-black uppercase italic">The Future of Luxury</div>
            </div>
            <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <Play size={32} fill="currentColor" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <ServiceCard 
          icon={<Globe size={24} />}
          title="Global Reach"
          desc="Expanding your brand's presence across international markets."
        />
        <ServiceCard 
          icon={<Cpu size={24} />}
          title="Tech Driven"
          desc="Leveraging AI and data for precision targeting."
        />
        <ServiceCard 
          icon={<Shield size={24} />}
          title="Brand Safety"
          desc="Protecting your reputation in the digital landscape."
        />
        <ServiceCard 
          icon={<Zap size={24} />}
          title="High Impact"
          desc="Creating memorable experiences that convert."
        />
      </section>

      {/* Back to Portfolio Link */}
      <div className="fixed bottom-10 left-10 z-50">
        <Link 
          to="/" 
          className="bg-white/5 backdrop-blur-xl border border-white/10 text-white/50 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-[#00ADEF] hover:border-[#00ADEF]/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-[#00ADEF]/30 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#00ADEF] group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase italic mb-4">{title}</h3>
      <p className="text-white/30 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
