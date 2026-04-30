import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export const Contact = () => {
  return (
    <section className="py-60 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="text-gold font-bold uppercase tracking-[1em] text-[10px]">Transmission</span>
            <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase luxury-text-gradient">CONNECT</h2>
            <p className="text-xl text-white/40 font-light italic leading-relaxed max-w-md">
              Secure your sanctuary. Our concierge is ready to orchestrate your arrival.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: MapPin, label: "Latitude", val: "4.1755° N, 73.5093° E" },
              { icon: Phone, label: "Direct", val: "+960 444 000 88" },
              { icon: Mail, label: "Envelope", val: "concierge@lumiere.private" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-8 group cursor-pointer">
                <div className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all">
                  <item.icon size={20} />
                </div>
                <div>
                  <h6 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">{item.label}</h6>
                  <p className="text-xl font-display font-medium gold-text-gradient">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass-morphism p-12 md:p-16 rounded-[4rem] space-y-10 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</label>
              <input type="text" className="w-full bg-transparent border-b border-white/10 py-4 font-bold tracking-tight focus:outline-none focus:border-gold transition-all" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email Protocol</label>
              <input type="email" className="w-full bg-transparent border-b border-white/10 py-4 font-bold tracking-tight focus:outline-none focus:border-gold transition-all" />
            </div>
          </div>
          
          <div className="space-y-4">
             <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Inquiry Essence</label>
             <textarea rows={4} className="w-full bg-transparent border-b border-white/10 py-4 font-bold tracking-tight focus:outline-none focus:border-gold transition-all resize-none" />
          </div>

          <button className="w-full py-6 bg-white text-black font-bold uppercase tracking-[0.5em] text-sm rounded-3xl hover:bg-gold transition-all flex items-center justify-center gap-4 group">
            Send Transmission <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
