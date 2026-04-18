import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Gauge, Zap, Shield, Play, ChevronRight, Key, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME, HYPHENATED_NAME } from '../constants';

export default function GlobalAutos() {
  const [isReady, setIsReady] = useState(false);
  const [showLights, setShowLights] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      const lightsTimer = setTimeout(() => {
        setShowLights(true);
      }, 2000);
      return () => clearTimeout(lightsTimer);
    }
  }, [isReady]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Automobiles</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {['Models', 'Performance', 'Technology', 'Design', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-red-600 transition-colors">{item}</a>
          ))}
        </div>

        <button className="px-8 py-3 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          Configure
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10 max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center">
        {/* Background Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px] -z-10" />
        
        <div className="text-center space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-xs font-black uppercase tracking-[0.5em] mb-4"
          >
            Portfolio
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-[11rem] font-black tracking-tighter leading-[0.8] uppercase italic"
          >
            Automobiles
          </motion.h1>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Key Automobile. Portfolio.</div>
        </div>

        {/* Central Animation Container */}
        <div className="relative mt-24 w-full max-w-6xl h-[400px] flex items-center justify-center">
          {!isReady ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/20 text-sm font-bold uppercase tracking-[0.5em] animate-pulse"
            >
              Initializing Systems...
            </motion.div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Car Parts Opening Horizontally */}
              <motion.div 
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: -300, opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute w-48 h-48 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">Front Chassis</div>
              </motion.div>

              <motion.div 
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 300, opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute w-48 h-48 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">Rear Chassis</div>
              </motion.div>

              {/* Central Engine / Body */}
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative z-20 w-80 h-56 bg-red-600/10 rounded-[3rem] border-2 border-red-600/30 flex items-center justify-center overflow-hidden"
              >
                <img 
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" 
                  alt="automobile engine" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                
                {/* Lights Effect */}
                <AnimatePresence>
                  {showLights && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/10 pointer-events-none"
                    >
                      <div className="absolute top-1/4 left-4 w-4 h-4 bg-white rounded-full blur-md shadow-[0_0_40px_white]" />
                      <div className="absolute top-1/4 right-4 w-4 h-4 bg-white rounded-full blur-md shadow-[0_0_40px_white]" />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Key Attaching */}
              <motion.div 
                initial={{ y: -200, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 1.2, type: 'spring' }}
                className="absolute top-0 z-30 text-[#c7c42a]"
              >
                <Key size={48} strokeWidth={2.5} />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-[#c7c42a]/20 blur-xl rounded-full"
                />
              </motion.div>

              {/* Lights On Indicator */}
              {showLights && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-[-60px] flex items-center gap-2 text-red-600 font-black uppercase italic tracking-widest"
                >
                  <Sun size={20} className="animate-spin-slow" /> Systems Online
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between mt-32 gap-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
              <Play size={24} fill="currentColor" />
            </div>
            <div>
              <div className="text-lg font-black italic uppercase">Watch Commercial</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Experience the sound</div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-12 py-6 rounded-2xl font-black text-xl uppercase italic flex items-center gap-4 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            Pre-Order Now <ChevronRight size={24} strokeWidth={3} />
          </motion.button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-10 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Gauge className="text-red-600" size={32} />}
            title="Precision Engineering"
            desc="Every component is crafted for maximum aerodynamic efficiency and raw power delivery."
          />
          <FeatureCard 
            icon={<Zap className="text-red-600" size={32} />}
            title="Electric Soul"
            desc="Hybrid powertrain technology that combines instant torque with long-range performance."
          />
          <FeatureCard 
            icon={<Shield className="text-red-600" size={32} />}
            title="Advanced Safety"
            desc="Next-generation driver assistance systems that keep you in control at any speed."
          />
        </div>
      </section>

      {/* Back to Portfolio Link */}
      <div className="fixed bottom-10 left-10 z-50">
        <Link 
          to="/" 
          className="bg-white/5 backdrop-blur-xl border border-white/10 text-white/50 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-red-600 hover:border-red-600/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-6xl font-black italic mb-2">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-6 p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-red-600/30 transition-all group">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase italic leading-tight">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
