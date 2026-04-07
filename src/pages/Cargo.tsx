import { motion } from 'motion/react';
import { Ship, ArrowRight, Globe, Shield, Clock, Phone, Mail, MapPin, Play, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cargo() {
  return (
    <div className="min-h-screen bg-[#0a1a2f] text-white font-sans selection:bg-[#E6FF00] selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="w-6 h-0.5 bg-[#E6FF00]" />
            <div className="w-6 h-0.5 bg-[#E6FF00]" />
            <div className="w-6 h-0.5 bg-[#E6FF00]" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">GFS</span>
        </div>
        
        <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
          {['Home', 'Services', 'Track Your Shipment', 'Reviews', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-[#E6FF00] transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button className="px-8 py-3 bg-[#E6FF00] text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">
            Get a Quote
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=1920" 
            alt="Ocean" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a2f] via-[#0a1a2f]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-8xl md:text-[9rem] font-black tracking-tighter leading-[0.85] uppercase"
            >
              Global<br />
              Freight<br />
              Solutions
            </motion.h1>
            
            <p className="max-w-md text-white/60 font-medium leading-relaxed">
              Global Freight Solutions is a trusted provider of fast, reliable, and cost-effective container transportation services across international markets.
            </p>

            <div className="flex gap-4">
              <button className="px-10 py-5 bg-[#E6FF00] text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                Get a Quote
              </button>
              <button className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Track Shipment
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Main Ship Image (Cutout feel) */}
            <motion.img 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200" 
              alt="Cargo Ship" 
              className="w-full h-auto object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />

            {/* Floating Review Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-20 right-0 w-64 bg-white p-8 rounded-2xl text-black shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <button className="text-[8px] font-black uppercase tracking-widest text-blue-600 underline">Leave a Review</button>
              </div>
              <p className="text-[10px] font-bold leading-relaxed text-gray-500 mb-4">
                Trusted by businesses of all sizes. See why businesses trust our unloading services.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black tracking-tighter">4.8</span>
                <Star size={16} fill="#E6FF00" className="text-[#E6FF00]" />
              </div>
            </motion.div>

            {/* Bottom Right Tracking Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-10 right-0 bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-80"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Origin</div>
                  <div className="text-xl font-black tracking-tighter">CN SHG</div>
                </div>
                <div className="w-8 h-8 bg-[#E6FF00] rounded-full flex items-center justify-center text-black">
                  <Globe size={16} />
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Destination</div>
                  <div className="text-xl font-black tracking-tighter">US OAK</div>
                </div>
              </div>
              <div className="relative h-1 bg-white/10 rounded-full mb-6">
                <div className="absolute top-0 left-0 w-3/4 h-full bg-[#E6FF00] rounded-full" />
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#E6FF00] rounded-full shadow-[0_0_10px_#E6FF00]" />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40">
                <div>ATD: May 3 22:57</div>
                <div>ETA: May 5 09:00</div>
              </div>
            </motion.div>

            {/* Bottom Left Unloading Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-20 -left-10 bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-64 overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-[8px] font-black uppercase tracking-widest text-[#E6FF00] mb-2">Unloading</div>
                <h4 className="text-lg font-black tracking-tighter leading-tight mb-4">Book Container<br />Unloading Today</h4>
                <button className="text-[8px] font-black uppercase tracking-widest text-[#E6FF00] underline">Book Now</button>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400" 
                className="absolute -right-10 -bottom-10 w-32 h-32 object-contain opacity-40 grayscale" 
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
