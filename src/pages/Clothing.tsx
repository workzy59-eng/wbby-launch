import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag, Heart, Search, User, ChevronDown, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Clothing() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-8 max-w-7xl mx-auto relative z-50 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Wearism</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
          {['New In', 'Coats', 'Tops', 'Knitwear', 'Sale'].map((item) => (
            <a key={item} href="#" className="hover:text-black transition-colors flex items-center gap-1">
              {item} {item === 'New In' && <ChevronDown size={12} />}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button className="text-black/40 hover:text-black transition-all">
            <Search size={20} />
          </button>
          <button className="text-black/40 hover:text-black transition-all">
            <Heart size={20} />
          </button>
          <div className="relative">
            <button className="text-black/40 hover:text-black transition-all">
              <ShoppingBag size={20} />
            </button>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              0
            </div>
          </div>
          <button className="text-black/40 hover:text-black transition-all">
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="px-10 py-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[400px] rounded-[3rem] overflow-hidden bg-[#FFC0CB] flex items-center justify-center text-center p-12"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-black rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-black rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              $20 OFF $100 PLUS, <br />
              GET FREE NEXT-DAY DELIVERY
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-black/60">With code: 20100</p>
            <button className="bg-black text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
              OK
            </button>
          </div>
        </motion.div>
      </section>

      {/* Product Section */}
      <section className="px-10 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="space-y-10 lg:col-span-1">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/20">Category</h3>
            <div className="space-y-2">
              {['Home', 'New In', 'Coats', 'Tops', 'Knitwear'].map((cat) => (
                <button 
                  key={cat} 
                  className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-between ${
                    cat === 'Coats' ? 'bg-black text-white' : 'hover:bg-black/5 text-black/60'
                  }`}
                >
                  {cat}
                  {cat === 'Coats' && <ArrowRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-5xl font-black tracking-tighter uppercase italic">Coats</h2>
              <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">View more</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all">Sort</button>
              <button className="px-6 py-3 border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all">Filter</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Oversized Trench", price: "$120", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800" },
              { name: "Leather Biker", price: "$250", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800" },
              { name: "Puffer Jacket", price: "$180", img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800" },
              { name: "Wool Overcoat", price: "$320", img: "https://images.unsplash.com/photo-1544022613-e879a79358a4?q=80&w=800" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer space-y-4"
              >
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-black/5 relative">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <Heart size={18} />
                  </button>
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black uppercase italic leading-tight">{item.name}</h4>
                    <span className="text-sm font-bold">{item.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill={s <= 4 ? "black" : "none"} />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Webby Link */}
      <div className="fixed bottom-10 left-10 z-50">
        <Link 
          to="/" 
          className="bg-black/5 backdrop-blur-xl border border-black/10 text-black/50 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-black hover:border-black/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Webby
        </Link>
      </div>
    </div>
  );
}
