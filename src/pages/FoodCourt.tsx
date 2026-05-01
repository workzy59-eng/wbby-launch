import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Utensils, Clock, MapPin, Star, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FoodCourt() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#c7c42a] selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#c7c42a] rounded-full flex items-center justify-center">
            <Utensils size={20} className="text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">FoodCourt</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {['Menu', 'Specials', 'Locations', 'About', 'Contact'].map((item) => (
            <a key={item} href="#" className="hover:text-[#c7c42a] transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-[#c7c42a] border-b border-[#c7c42a] pb-1 hover:text-white hover:border-white transition-all">
            BACK_TO_WEBBY
          </Link>
          <button className="px-8 py-3 rounded-full bg-[#c7c42a] text-black text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(199, 196, 42,0.2)]">
            Order Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10 max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c7c42a]/5 rounded-full blur-[150px] -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"
            >
              <Star size={14} className="text-[#c7c42a]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Top Rated Dining Experience</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic"
            >
              Fresh and Healthy <br />
              <span className="text-[#c7c42a]">Food Specialties</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-lg max-w-md leading-relaxed"
            >
              Variety of fresh and fresh food served just for you, your solution when hungry in the middle of the night with super fast delivery.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <button className="bg-[#c7c42a] text-black px-10 py-5 rounded-2xl font-black text-lg uppercase italic flex items-center gap-3 hover:scale-105 transition-all">
                Explore Menu <ChevronRight size={20} />
              </button>
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0A0A0A] bg-[#5E7162] overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-[#0A0A0A] bg-[#c7c42a] flex items-center justify-center text-black font-bold text-xs">
                  +2k
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 aspect-square rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200" 
                alt="Fresh Salad" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl z-20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#c7c42a] rounded-2xl flex items-center justify-center text-black">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase italic">Fast Delivery</div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Under 30 mins</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-10 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
              <Clock size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase italic">24/7 Service</h3>
            <p className="text-white/40 text-sm leading-relaxed">Craving something at 3 AM? We've got you covered with our round-the-clock kitchen.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
              <MapPin size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase italic">Live Tracking</h3>
            <p className="text-white/40 text-sm leading-relaxed">Watch your meal's journey from our kitchen to your doorstep in real-time.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
              <Utensils size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase italic">Quality First</h3>
            <p className="text-white/40 text-sm leading-relaxed">We only use the freshest organic ingredients sourced from local farmers.</p>
          </div>
        </div>
      </section>

      {/* Back to Portfolio Link */}
      <div className="fixed bottom-10 left-10 z-50">
        <Link 
          to="/" 
          className="bg-white/5 backdrop-blur-xl border border-white/10 text-white/50 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-[#c7c42a] hover:border-[#c7c42a]/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} /> BACK_TO_WEBBY
        </Link>
      </div>
      <footer className="py-10 text-center border-t border-white/5 opacity-20">
         <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed italic">© 2024 WebbyLaunch. Premium Mobile-First Web Solutions.</p>
      </footer>
    </div>
  );
}
