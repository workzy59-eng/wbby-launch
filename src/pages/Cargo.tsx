import { motion } from 'motion/react';
import { Ship, ArrowRight, Globe, Shield, Clock, Phone, Mail, MapPin, Play, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cargo() {
  return (
    <div className="min-h-screen bg-[#0a1a2f] text-white font-sans selection:bg-[#0066FF] selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-10 py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0a1a2f]">
            <Globe size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">NX <span className="font-light">Group</span></span>
        </div>
        
        <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
          {['About Us', 'Services', 'Projects', 'Press & News', 'Contacts'].map((item) => (
            <a key={item} href="#" className="hover:text-[#0066FF] transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Phone size={14} />
            </div>
            <span className="text-xs font-bold">+1 (881) 555-7889</span>
          </div>
          <Link to="/" className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
            Back to Hub
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Ocean/Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a] via-[#0a1a2f] to-[#0a1a2f]" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Animated Waves/Particles could go here */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#0066FF]/10 rounded-full blur-[200px]" />
        </div>

        {/* Large Background Text */}
        <div className="absolute inset-0 flex items-center justify-center z-1 overflow-hidden pointer-events-none">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="text-[25vw] font-black uppercase italic tracking-tighter text-white whitespace-nowrap leading-none select-none"
          >
            CARGO DELIVERY
          </motion.h1>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full h-full flex flex-col justify-center items-center">
          {/* Main Ship Image */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-full max-w-5xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=1920" 
              alt="Cargo Ship" 
              className="w-full h-auto object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />

            {/* Floating Badge - Top 5 in World */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -left-10 md:left-0 w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex flex-col items-center justify-center text-center p-4 shadow-2xl"
            >
              <div className="text-[#E6FF00] mb-1">
                <Star size={20} fill="currentColor" />
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest leading-tight">
                TOP - 5 IN WORLD
              </div>
            </motion.div>

            {/* Floating Badge - Watch Video */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-10 md:right-0 w-32 h-32 flex items-center justify-center group cursor-pointer"
            >
              <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                <div className="text-[6px] font-black uppercase tracking-[0.3em] text-white/40">
                  WATCH VIDEO • WATCH VIDEO • 
                </div>
              </div>
              <div className="w-14 h-14 bg-[#0066FF] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                <Play size={20} fill="white" className="ml-1" />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-20 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md space-y-6"
            >
              <p className="text-lg font-bold italic leading-relaxed text-white/80">
                NX Group develops integrated logistics solutions for industrial projects in the countries of the worldwide.
              </p>
              <button className="flex items-center gap-4 text-xs font-black uppercase tracking-widest group">
                <span className="w-12 h-[1px] bg-[#0066FF] group-hover:w-20 transition-all" />
                Explore Services
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]"
            >
              <div className="flex -space-x-4">
                {[
                  'https://i.pravatar.cc/100?u=1',
                  'https://i.pravatar.cc/100?u=2',
                  'https://i.pravatar.cc/100?u=3'
                ].map((url, i) => (
                  <img key={i} src={url} className="w-12 h-12 rounded-full border-2 border-[#0a1a2f] object-cover" />
                ))}
              </div>
              <div>
                <div className="text-2xl font-black italic tracking-tighter">3.5K+</div>
                <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">Total Clients</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 px-10 bg-[#0a1a2f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Globe, title: 'Sea Freight', desc: 'Global shipping solutions for large scale industrial cargo.' },
              { icon: Shield, title: 'Secure Transit', desc: 'Advanced tracking and insurance for high-value shipments.' },
              { icon: Clock, title: 'On-Time Delivery', desc: 'Optimized routes ensuring your cargo arrives exactly when needed.' }
            ].map((s, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#0066FF] transition-all">
                  <s.icon size={32} className="text-[#0066FF] group-hover:text-white transition-all" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{s.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed italic">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 border-t border-white/10 bg-[#0a1a2f]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0a1a2f]">
                <Globe size={18} />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">NX <span className="font-light">Group</span></span>
            </div>
            <p className="text-white/40 text-sm italic leading-relaxed">
              Integrated logistics solutions for industrial projects worldwide.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#0066FF]">Contact</h4>
            <div className="space-y-4 text-sm font-bold text-white/60 italic">
              <div className="flex items-center gap-3"><Mail size={16} /> support@webbylaunch.com</div>
              <div className="flex items-center gap-3"><Phone size={16} /> +1 (555) 000-0000</div>
              <div className="flex items-center gap-3"><MapPin size={16} /> Global HQ, Logistics Park</div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#0066FF]">Quick Links</h4>
            <div className="space-y-2 text-[10px] font-black uppercase tracking-widest text-white/40">
              <a href="#" className="block hover:text-[#0066FF] transition-colors">Sea Freight</a>
              <a href="#" className="block hover:text-[#0066FF] transition-colors">Air Freight</a>
              <a href="#" className="block hover:text-[#0066FF] transition-colors">Road Transport</a>
              <a href="#" className="block hover:text-[#0066FF] transition-colors">Warehousing</a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#0066FF]">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[#0066FF] flex-1" />
              <button className="bg-[#0066FF] text-white px-4 py-2 rounded-lg font-black uppercase italic text-[10px]">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
