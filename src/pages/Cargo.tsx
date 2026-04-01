import { motion } from 'motion/react';
import { Ship, ArrowRight, Globe, Shield, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cargo() {
  return (
    <div className="min-h-screen bg-[#0a1a2f] text-white font-sans selection:bg-[#0066FF] selection:text-white overflow-x-hidden">
      {/* Banner */}
      <div className="bg-[#0066FF] text-white py-2 text-center overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="inline-block font-black uppercase italic tracking-widest text-xs"
        >
          THE CARGO EXPRESS • GLOBAL LOGISTICS SOLUTIONS • NX GROUP • THE CARGO EXPRESS • GLOBAL LOGISTICS SOLUTIONS • NX GROUP • THE CARGO EXPRESS • GLOBAL LOGISTICS SOLUTIONS • NX GROUP
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="px-10 py-8 flex justify-between items-center border-b border-white/10 relative z-50">
        <div className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <Ship className="text-[#0066FF]" size={32} />
          <span>CARGO<span className="text-[#0066FF]">EXPRESS</span></span>
        </div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-60">
          <a href="#" className="hover:text-[#0066FF] transition-colors">Solutions</a>
          <a href="#" className="hover:text-[#0066FF] transition-colors">Network</a>
          <a href="#" className="hover:text-[#0066FF] transition-colors">Tracking</a>
          <a href="#" className="hover:text-[#0066FF] transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Back to Hub
          </Link>
          <button className="bg-white text-black px-8 py-3 rounded-full font-black uppercase italic text-xs hover:scale-105 transition-all">Track Shipment</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-10">
        {/* Background Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0066FF]/20 rounded-full blur-[150px] z-0" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-[2px] bg-[#0066FF]"></div>
                <span className="text-[#0066FF] font-black uppercase tracking-[0.3em] text-xs">Global Logistics Leader</span>
              </div>
              <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
                CARGO <br />
                <span className="text-[#0066FF]">DELIVERY</span>
              </h1>
              <p className="text-white/60 text-lg italic leading-relaxed max-w-lg">
                NX Group develops integrated logistics solutions for industrial projects in the countries of the worldwide.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8"
            >
              <button className="bg-[#0066FF] text-white px-12 py-6 rounded-full font-black uppercase italic text-xl flex items-center gap-4 hover:scale-105 transition-all shadow-[0_0_50px_rgba(0,102,255,0.3)]">
                Get Started <ArrowRight size={24} />
              </button>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black italic">3.5K+</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Clients <br /> Worldwide</div>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
              <div className="space-y-2">
                <Globe className="text-[#0066FF]" size={24} />
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Global Network</div>
              </div>
              <div className="space-y-2">
                <Shield className="text-[#0066FF]" size={24} />
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Delivery</div>
              </div>
              <div className="space-y-2">
                <Clock className="text-[#0066FF]" size={24} />
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">On-Time Service</div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 50 }}
            className="relative"
          >
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=1920" 
                alt="Cargo Ship" 
                className="w-full rounded-[3rem] shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
              {/* 3D-like Overlay */}
              <div className="absolute -bottom-10 -left-10 bg-[#0066FF] p-8 rounded-3xl shadow-2xl border border-white/20">
                <div className="text-4xl font-black italic uppercase">100%</div>
                <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Reliability Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 border-t border-white/10 bg-[#0a1a2f]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <Ship className="text-[#0066FF]" size={24} />
              <span>CARGO<span className="text-[#0066FF]">EXPRESS</span></span>
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
