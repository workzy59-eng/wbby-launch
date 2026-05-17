import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ShoppingBag, Heart, Search, User, ChevronDown, ArrowRight, Star, Zap, ShoppingCart, Info, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

export default function Clothing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Navigation - Glassmorphism style */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-10 py-8 flex justify-between items-center backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <Zap className="text-black fill-black" size={24} />
          </div>
          <span className="text-3xl font-black tracking-[-0.05em] uppercase italic">URBAN<span className="text-white/40">THREAD</span></span>
        </div>
        
        <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
          {['Collections', 'Drop_24', 'Archive', 'Atelier'].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-all duration-500 relative group">
              {item}
              <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-8 text-white/30 border-r border-white/10 pr-8">
            <Search size={18} className="hover:text-white cursor-pointer transition-colors" />
            <Heart size={18} className="hover:text-white cursor-pointer transition-colors" />
          </div>
          <div className="relative group">
            <button className="bg-white text-black p-4 rounded-xl flex items-center gap-2 hover:scale-105 transition-all">
              <ShoppingCart size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">02 ITEMS</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <motion.section 
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1920" 
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center space-y-12 px-6">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "1em" }}
            animate={{ opacity: 1, letterSpacing: "0.6em" }}
            transition={{ duration: 1.5 }}
            className="text-white/40 text-xs font-black uppercase"
          >
            Spring Summer 2026
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 50, rotateX: 30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="text-[15vw] font-black tracking-tighter leading-[0.75] uppercase italic drop-shadow-2xl"
          >
            RAW <br />
            <span className="text-transparent font-outline-2 text-white/20 italic">VIRTUE.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col items-center gap-12"
          >
            <p className="text-white/40 text-2xl font-light italic max-w-xl leading-relaxed">
              Deconstructed silhouettes for the digital nomad. Engineered in London, refined in Tokyo.
            </p>
            <button className="group relative px-20 py-8 bg-white text-black rounded-full overflow-hidden font-black uppercase italic text-2xl tracking-tighter transition-all hover:scale-105">
              <span className="relative z-10">Shop Collection</span>
              <div className="absolute inset-0 bg-zinc-200 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo" />
            </button>
          </motion.div>
        </div>

        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-0 whitespace-nowrap opacity-5 select-none"
        >
          <span className="text-[20vh] font-black uppercase tracking-tighter">STRUCTURAL_SYMPHONY_SYSTEMS_STRUCTURAL_SYMPHONY_SYSTEMS_</span>
        </motion.div>
      </motion.section>

      {/* Extreme Promotion Marquee */}
      <div className="bg-white text-black py-4 overflow-hidden whitespace-nowrap sticky top-0 z-[90]">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="inline-block font-black uppercase italic tracking-widest text-xs"
        >
          FREE GLOBAL SHIPPING • LIMITED DROP_042 NOW LIVE • AUTHENTICITY GUARANTEED • FREE GLOBAL SHIPPING • LIMITED DROP_042 NOW LIVE • AUTHENTICITY GUARANTEED
        </motion.div>
      </div>

      {/* Collection Grid */}
      <section className="py-40 px-10 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px]">The Archive</span>
            </div>
            <h2 className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter uppercase italic leading-none">
              SELECTED <br />
              <span className="text-white/40">FRAGMENTS.</span>
            </h2>
          </div>
          <div className="flex gap-4">
             <button className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
                <TrendingUp size={24} />
             </button>
             <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                Filter_All
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { id: 'UT_01', name: "Modular Trench", price: "$420", type: "Outerwear", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800" },
            { id: 'UT_02', name: "Kinetic Shell", price: "$250", type: "Tech-wear", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800" },
            { id: 'UT_03', name: "Vortex Cargo", price: "$180", type: "Utility", img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800" },
            { id: 'UT_04', name: "Neural Hoodie", price: "$320", type: "Essentials", img: "https://images.unsplash.com/photo-1544022613-e879a79358a4?q=80&w=800" },
            { id: 'UT_05', name: "Static Scarf", price: "$85", type: "Accessories", img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800" },
            { id: 'UT_06', name: "Cipher Boots", price: "$550", type: "Footwear", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800" },
            { id: 'UT_07', name: "Data Cap", price: "$65", type: "Accessories", img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800" },
            { id: 'UT_08', name: "Flux Pant", price: "$140", type: "Utility", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer space-y-8"
            >
              <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-white/5 border border-white/5">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-8 left-8 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all -translate-y-4 group-hover:translate-y-0">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[#FFC0CB]">{item.id}</p>
                </div>

                <div className="absolute bottom-8 right-8 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-all duration-700">
                    <button className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                       <Heart size={20} />
                    </button>
                    <button className="px-8 bg-white text-black rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">
                       Quick Buy
                    </button>
                </div>
              </div>
              <div className="px-4 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{item.type}</p>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-white transition-colors">{item.name}</h3>
                </div>
                <span className="text-2xl font-black italic text-white group-hover:text-[#FFC0CB] transition-colors">{item.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Full-Width Visual Split */}
      <section className="py-40 bg-white text-black relative">
         <div className="absolute bottom-0 right-10 text-[20vw] font-black opacity-5 italic select-none pointer-events-none">ATELIER</div>
         <div className="max-w-[1400px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
            <div className="relative aspect-square">
               <motion.div 
                 initial={{ scale: 1.1 }}
                 whileInView={{ scale: 1 }}
                 className="w-full h-full rounded-[5rem] overflow-hidden bg-black shadow-4xl"
               >
                  <img src="https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=1200" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
               </motion.div>
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-black p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl">
                  <Info size={32} />
                  <p className="text-xl font-black uppercase italic tracking-tighter leading-none">Limitless Resilience.</p>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Sustainability Protocol v2.5</p>
               </div>
            </div>
            <div className="space-y-16">
               <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
                  FORGING <br />
                  <span className="text-transparent font-outline-2 text-black">A NEW</span> <br />
                  EXISTENCE.
               </h2>
               <p className="text-3xl font-light italic text-black/60 max-w-xl leading-relaxed">
                  We don't just follow trends. We observe cultural entropy and build countermeasures in the form of clothing.
               </p>
               <button className="flex items-center gap-6 group">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all">
                     <ArrowRight size={28} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] group-hover:tracking-[0.8em] transition-all">Read Manifest</span>
               </button>
            </div>
         </div>
      </section>

      {/* Extreme Footer */}
      <footer className="py-40 px-10 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24 relative z-10">
          <div className="lg:col-span-5 space-y-12">
            <div className="text-5xl font-black tracking-[-0.05em] uppercase italic">URBAN<span className="text-white/40">THREAD</span></div>
            <p className="text-white/20 text-xl font-medium italic leading-relaxed max-w-sm">
              The intersection of modern utility and brutalist aesthetics. Designed for the infinite street.
            </p>
            <div className="flex gap-6">
              {['IN', 'FB', 'TW'].map((social) => (
                <a key={social} href="#" className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-xs font-black tracking-widest hover:bg-white hover:text-black transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Nav_System</h4>
            <div className="flex flex-col gap-6 text-xl font-bold italic text-white/20">
              <a href="#" className="hover:text-white transition-all">Store</a>
              <a href="#" className="hover:text-white transition-all">Archives</a>
              <a href="#" className="hover:text-white transition-all">Atelier</a>
              <a href="#" className="hover:text-white transition-all">Contact</a>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Transmission</h4>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="YOUR_EMAIL_ADDRESS" 
                className="w-full bg-white/5 border-b border-white/10 px-0 py-8 text-2xl font-black italic uppercase italic tracking-tighter focus:outline-none focus:border-white transition-all" 
              />
              <button className="absolute right-0 bottom-8 text-white font-black uppercase italic tracking-widest text-xs hover:tracking-[0.4em] transition-all">Subscribe</button>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white/10 uppercase">© 2024 Urban Thread Protocol. Part of Webby Launch.</p>
          </div>
        </div>
      </footer>

      {/* Back to Webby Link */}
      <div className="fixed bottom-10 left-10 z-[101]">
        <Link 
          to="/" 
          className="bg-white text-black px-8 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all flex items-center gap-4 shadow-3xl"
        >
          <ArrowLeft size={16} /> <span className="hidden md:inline">BACK_TO_WEBBY</span>
        </Link>
      </div>
    </div>
  );
}
