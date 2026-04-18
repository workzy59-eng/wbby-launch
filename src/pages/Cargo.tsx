import { motion } from 'motion/react';
import { Ship, ArrowRight, Globe, Shield, Clock, Phone, Mail, MapPin, Play, Star, Users, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cargo() {
  const primaryColor = '#c7c42a';

  return (
    <div className={`min-h-screen bg-[#0a1a2f] text-white font-sans selection:bg-[${primaryColor}] selection:text-black overflow-x-hidden`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-12 py-10 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 2C4 2 4 0 8 0C12 0 12 2 16 2C20 2 20 0 24 0" stroke={primaryColor} strokeWidth="2"/>
              <path d="M0 7C4 7 4 5 8 5C12 5 12 7 16 7C20 7 20 5 24 5" stroke={primaryColor} strokeWidth="2"/>
              <path d="M0 12C4 12 4 10 8 10C12 10 12 12 16 12C20 12 20 10 24 10" stroke={primaryColor} strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">GFS</span>
        </div>
        
        <div className="hidden lg:flex gap-10 text-[11px] font-bold uppercase tracking-[0.1em] opacity-90">
          <a href="#" className={`hover:text-[${primaryColor}] transition-colors`}>Home</a>
          <div className={`flex items-center gap-1 cursor-pointer hover:text-[${primaryColor}] transition-colors`}>
            <span>Services</span>
            <ChevronDown size={14} />
          </div>
          <a href="#" className={`hover:text-[${primaryColor}] transition-colors`}>Track Your Shipment</a>
          <a href="#" className={`hover:text-[${primaryColor}] transition-colors`}>Reviews</a>
          <a href="#" className={`hover:text-[${primaryColor}] transition-colors`}>Contact</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Back to Webby
          </Link>
          <button 
            style={{ backgroundColor: primaryColor }}
            className="px-8 py-3 text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            Get a Quote
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1920" 
            alt="Ocean Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a2f] via-[#0a1a2f]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-8xl md:text-[8.5rem] font-black tracking-tighter leading-[0.8] uppercase">
                Global<br />
                Freight<br />
                Solutions
              </h1>
              
              <p className="max-w-md text-white/70 text-sm font-medium leading-relaxed">
                Global Freight Solutions is a trusted provider of fast, reliable, and cost-effective container transportation services across international markets.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <button 
                style={{ backgroundColor: primaryColor }}
                className="px-10 py-5 text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
              >
                Get a Quote
              </button>
              <button className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Track Shipment
              </button>
            </motion.div>
          </div>

          <div className="relative">
            {/* Main Ship Image */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200" 
              alt="Cargo Ship" 
              className="w-full h-auto object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.6)]"
              referrerPolicy="no-referrer"
            />

            {/* Floating Review Card */}
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-10 right-10 w-72 bg-white p-8 rounded-2xl text-black shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Leave a Review</button>
              </div>
              <p className="text-[11px] font-bold leading-relaxed text-gray-500 mb-6">
                Trusted by businesses of all sizes. See why businesses trust our unloading services.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-5xl font-black tracking-tighter">4.8</span>
                <Star size={20} fill={primaryColor} className={`text-[${primaryColor}]`} style={{ color: primaryColor }} />
              </div>
            </motion.div>

            {/* Bottom Right Tracking Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -bottom-10 right-0 bg-[#0a1a2f]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-80 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">CN SHG</div>
                  <div className="text-xl font-black tracking-tighter">SHANGHAI</div>
                </div>
                <div 
                  style={{ backgroundColor: primaryColor }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                >
                  <Ship size={20} />
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">US OAK</div>
                  <div className="text-xl font-black tracking-tighter">OAKLAND</div>
                </div>
              </div>
              <div className="relative h-1 bg-white/10 rounded-full mb-6">
                <div className="absolute top-0 left-0 w-3/4 h-full rounded-full" style={{ backgroundColor: primaryColor }} />
                <motion.div 
                  animate={{ left: ['0%', '75%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" 
                  style={{ backgroundColor: primaryColor, boxShadow: `0 0 15px ${primaryColor}` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                <div>ATD: May 3 22:57</div>
                <div>ETA: 09:00 May 5</div>
              </div>
            </motion.div>

            {/* Bottom Left Unloading Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="absolute -bottom-20 -left-10 bg-[#0a1a2f]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-72 overflow-hidden shadow-2xl"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: primaryColor }}>UNLOADING</div>
                <h4 className="text-xl font-black tracking-tighter leading-tight mb-6">Book Container<br />Unloading Today</h4>
                <button className="text-[10px] font-black uppercase tracking-widest hover:underline" style={{ color: primaryColor }}>Book Now</button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 opacity-30 grayscale">
                <img 
                  src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=400" 
                  alt="Cargo Ship"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
