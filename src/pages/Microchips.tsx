import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Cpu, Zap, Shield, Globe, Play, ChevronRight, Activity, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Microchips() {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-mono selection:bg-[#E6FF00] selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#E6FF00] rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(230,255,0,0.2)]">
            <Cpu className="text-black" size={24} strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Microchips</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {['Architecture', 'Nanotech', 'Performance', 'Security', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-[#E6FF00] transition-colors">{item}</a>
          ))}
        </div>

        <button className="px-8 py-3 rounded-lg bg-[#E6FF00] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4EB00] transition-all">
          Initialize
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10 max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(230,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(230,255,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#E6FF00] text-xs font-black uppercase tracking-[0.5em] mb-8"
        >
          Tech Portfolio
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase italic text-center mb-12"
        >
          Microchips<br />Architecture
        </motion.h1>

        {/* Central Animation Container */}
        <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
          {/* Path Labels */}
          <div className="absolute inset-0 pointer-events-none">
            <PathLabel x="20%" y="30%" label="L1 Cache" />
            <PathLabel x="70%" y="20%" label="ALU Core" />
            <PathLabel x="15%" y="70%" label="Memory Bus" />
            <PathLabel x="80%" y="65%" label="I/O Controller" />
          </div>

          {/* Float Walking Animation Chip */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 2, -2, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
            className="relative z-20 w-80 h-80 bg-[#111] rounded-3xl border-2 border-[#E6FF00]/30 flex items-center justify-center overflow-hidden shadow-[0_0_100px_rgba(230,255,0,0.1)]"
          >
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" 
              alt="microchips" 
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#E6FF00]/20 to-transparent" />
            <Cpu className="text-[#E6FF00] relative z-10" size={120} strokeWidth={1} />
            
            {/* Scanning Effect */}
            <motion.div 
              animate={{ y: [-200, 400] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-[#E6FF00] blur-sm z-30"
            />
          </motion.div>

          {/* Floating Data Particles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 600
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2 + Math.random() * 3, 
                delay: Math.random() * 2 
              }}
              className="absolute w-1 h-1 bg-[#E6FF00] rounded-full blur-[1px]"
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 w-full">
          <StatItem label="Process" value="3nm" />
          <StatItem label="Transistors" value="150B" />
          <StatItem label="Clock Speed" value="5.2GHz" />
          <StatItem label="TDP" value="65W" />
        </div>
      </section>

      {/* Tech Details */}
      <section className="py-32 px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5">
        <TechDetail 
          icon={<Activity size={24} />}
          title="Neural Engine"
          desc="Dedicated hardware for machine learning and AI acceleration."
        />
        <TechDetail 
          icon={<Terminal size={24} />}
          title="Instruction Set"
          desc="Optimized RISC architecture for maximum throughput."
        />
        <TechDetail 
          icon={<Zap size={24} />}
          title="Power Efficiency"
          desc="Dynamic voltage scaling for extended battery life."
        />
      </section>

      {/* Back to Portfolio Link */}
      <div className="fixed bottom-10 left-10 z-50">
        <Link 
          to="/" 
          className="bg-white/5 backdrop-blur-xl border border-white/10 text-white/50 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-[#E6FF00] hover:border-[#E6FF00]/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>
    </div>
  );
}

function PathLabel({ x, y, label }: { x: string, y: string, label: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      style={{ left: x, top: y }}
      className="absolute flex flex-col items-center gap-2"
    >
      <div className="w-2 h-2 bg-[#E6FF00] rounded-full shadow-[0_0_10px_#E6FF00]" />
      <div className="h-12 w-[1px] bg-gradient-to-b from-[#E6FF00] to-transparent" />
      <div className="text-[8px] font-bold uppercase tracking-widest text-[#E6FF00] bg-black/50 px-2 py-1 rounded border border-[#E6FF00]/20 backdrop-blur-sm">
        {label}
      </div>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-black italic mb-2 text-[#E6FF00]">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{label}</div>
    </div>
  );
}

function TechDetail({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-6 p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-[#E6FF00]/30 transition-all group">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase italic leading-tight">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
