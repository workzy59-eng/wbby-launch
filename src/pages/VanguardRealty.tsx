import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Home, MapPin, Maximize, Bed, Bath, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VanguardRealty() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-all">
          <ArrowLeft size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Back to WebbyLaunch</span>
        </Link>
        <div className="text-2xl font-bold tracking-tighter">VANGUARD</div>
        <button className="bg-blue-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">Contact Agent</button>
      </header>

      {/* Hero */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">Portfolio</span>
            </div>
            <h1 className="text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">Real Estate</h1>
            <p className="text-white/60 text-lg mb-10 max-w-md">Vanguard Realty: High-end property listings with immersive virtual tours. Experience luxury like never before.</p>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">$12.5M</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Price</div>
              </div>
              <div className="text-center border-l border-white/10 pl-8">
                <div className="text-2xl font-bold">8,500</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sq Ft</div>
              </div>
              <div className="text-center border-l border-white/10 pl-8">
                <div className="text-2xl font-bold">6</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Beds</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/5] rounded-[3rem] overflow-hidden relative group"
          >
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6199f74009?auto=format&fit=crop&q=80&w=1200" 
              alt="Obsidian Manor" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
              <div>
                <div className="text-sm font-bold uppercase tracking-widest mb-2">Beverly Hills, CA</div>
                <div className="flex items-center gap-2 text-white/60">
                  <MapPin size={14} />
                  <span className="text-xs">90210 Sunset Blvd</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
                <Home size={20} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { icon: Maximize, label: 'Living Space', value: '12,000 sqft' },
            { icon: Bed, label: 'Bedrooms', value: '8 Master Suites' },
            { icon: Bath, label: 'Bathrooms', value: '12 Luxury Baths' },
            { icon: Phone, label: 'Concierge', value: '24/7 Support' },
          ].map((feature, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <feature.icon size={24} className="text-blue-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{feature.label}</div>
                <div className="text-lg font-bold">{feature.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
