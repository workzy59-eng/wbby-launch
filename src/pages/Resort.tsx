import { motion, useScroll, useTransform } from 'motion/react';
import { Palmtree, MapPin, Star, ArrowRight, Instagram, Facebook, Twitter, Phone, Mail, Waves, Wind, Sun, Anchor, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

export default function Resort() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const bgTranslate = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] font-sans selection:bg-[#B89B72] selection:text-white overflow-x-hidden">
      {/* Floating Elements (Dreamy feel) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#B89B72]/5 blur-[200px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#2A4858]/5 blur-[150px] rounded-full" 
        />
      </div>

      {/* Extreme Ethereal Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-10 flex justify-between items-center mix-blend-difference">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-black italic tracking-[-0.1em] uppercase text-white"
        >
          AZURE<span className="text-[#B89B72]">.</span>HAVEN
        </motion.div>
        
        <div className="hidden lg:flex gap-16 text-[8px] font-black uppercase tracking-[0.6em] text-white/40">
          {['The Villas', 'Culinary', 'Sanctuary', 'The Cove'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white hover:tracking-[0.8em] transition-all duration-700 relative group">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">
            Webby Solutions
          </Link>
          <button className="bg-white text-black px-12 py-5 rounded-full font-black uppercase italic text-[10px] tracking-widest hover:bg-[#B89B72] hover:text-white transition-all shadow-2xl">
            Reserved Only
          </button>
        </div>
      </nav>

      {/* Dreamy Cinematic Hero */}
      <section className="relative h-[110vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity, y: bgTranslate }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920" 
            alt="Luxury Resort" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFCF8]" />
        </motion.div>

        <div className="relative z-10 text-center space-y-16 px-10">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "1em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 2 }}
            className="text-white/60 text-sm font-black uppercase tracking-[1em]"
          >
            A Symphony of Silence
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="text-[15vw] font-black text-white italic tracking-tighter leading-[0.7] uppercase drop-shadow-2xl"
          >
            FLUID <br />
            <span className="text-transparent font-outline-2 text-white/20 italic">ETERNITY.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="space-y-12"
          >
            <p className="text-white/80 text-2xl font-light italic max-w-2xl mx-auto leading-relaxed tracking-wide">
              Where the boundaries of time dissipate into the crystal expanse. 
              Experience the definitive standard of atmospheric luxury.
            </p>
            <div className="flex justify-center gap-10">
              <button className="group relative px-20 py-10 bg-white text-black rounded-full overflow-hidden font-black uppercase italic text-xl tracking-tighter transition-all hover:scale-105 shadow-3xl">
                <span className="relative z-10">Begin Departure</span>
                <div className="absolute inset-0 bg-[#B89B72] translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-expo" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Scroll Logic */}
        <div className="absolute bottom-20 left-12 flex items-center gap-8 text-white/40">
           <div className="flex flex-col gap-4">
              <Wind size={20} className="animate-bounce" />
              <div className="w-px h-32 bg-gradient-to-b from-white/40 to-transparent" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] rotate-90 origin-left whitespace-nowrap">Descent into Paradise</span>
        </div>
      </section>

      {/* Silk-Smooth Intro */}
      <section className="py-60 px-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-zinc-200" />
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            className="space-y-20"
          >
            <div className="space-y-10">
              <span className="text-[#B89B72] font-black uppercase tracking-[0.8em] text-xs">Philosophy_01</span>
              <h2 className="text-[clamp(3rem,10vw,8rem)] font-light tracking-tighter uppercase leading-[0.85] text-[#1A1A1A]">
                The <br />
                <span className="font-black italic">Architecture</span> <br />
                of <span className="text-[#B89B72]">Peace.</span>
              </h2>
            </div>
            <p className="text-3xl font-light text-[#1A1A1A]/50 leading-relaxed italic max-w-xl">
              We believe luxury isn't a collection of items, but a frequency of being. Every angle of Azure Haven is calibrated to align with the golden ratio of natural calm.
            </p>
            <div className="flex gap-20">
               {[
                 { label: 'Private Isles', icon: Anchor },
                 { label: 'Heated Salts', icon: Waves },
                 { label: 'Zenith Sun', icon: Sun }
               ].map((item, i) => (
                 <div key={i} className="text-center space-y-4 group cursor-pointer">
                    <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-[#B89B72] group-hover:bg-[#B89B72] group-hover:text-white transition-all duration-700">
                       <item.icon size={28} />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{item.label}</p>
                 </div>
               ))}
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div 
              style={{ rotate: 2 }}
              whileHover={{ rotate: 0 }}
              className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200" 
                alt="Atmosphere" 
                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#B89B72]/5 mix-blend-overlay" />
            </motion.div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white p-12 rounded-[5rem] shadow-4xl hidden lg:block">
               <div className="text-6xl font-black italic tracking-tighter text-[#B89B72]">A01</div>
               <p className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]/30 mt-4 leading-relaxed">
                 Coordinate: 4.1755° N, 73.5093° E <br />
                 Temperature: 28°C Constant
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Horizon Marquee */}
      <div className="py-20 border-y border-zinc-100 overflow-hidden whitespace-nowrap bg-zinc-50/50">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-block text-[15vw] font-black uppercase italic tracking-tighter text-zinc-100 select-none"
        >
          BREATHE • DISCOVER • RESTORE • AZURE HAVEN • BREATHE • DISCOVER • RESTORE • AZURE HAVEN
        </motion.div>
      </div>

      {/* The Residences - Atmospheric Grid */}
      <section id="villas" className="py-60 px-10 bg-zinc-950 text-white relative">
        <div className="max-w-[1400px] mx-auto mb-40 text-center space-y-8">
           <span className="text-[#B89B72] font-black uppercase tracking-[1em] text-xs">The living collection</span>
           <h2 className="text-[12vw] font-black tracking-tighter uppercase italic leading-[0.8] opacity-10">RESIDENCES.</h2>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
           {[
             { name: 'Crystal Lagoon', type: 'Overwater', img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200' },
             { name: 'Zenith Forest', type: 'Panoramic', img: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1200' },
             { name: 'Oceanic Loft', type: 'Floating', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200' }
           ].map((villa, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.2 }}
               className="group cursor-pointer"
             >
               <div className="aspect-[1/1.2] rounded-[4rem] overflow-hidden mb-12 relative">
                  <img 
                    src={villa.img} 
                    alt={villa.name} 
                    className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-10 left-10 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] translate-y-20 group-hover:translate-y-0 transition-transform duration-700">
                     <p className="text-[8px] font-black uppercase tracking-widest text-[#B89B72] mb-2">{villa.type}</p>
                     <h3 className="text-3xl font-black uppercase italic tracking-tighter">{villa.name}</h3>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Signature Experience Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-black">
         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 0.4 }}
           className="absolute inset-0"
         >
            <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920" className="w-full h-full object-cover scale-150 animate-slow-zoom" referrerPolicy="no-referrer" />
         </motion.div>
         <div className="max-w-[1400px] mx-auto px-10 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2">
            <div className="space-y-16">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: "200px" }}
                 className="h-px bg-[#B89B72]" 
               />
               <h2 className="text-9xl font-black tracking-tighter uppercase italic text-white leading-none">
                 PURE <br />
                 <span className="text-transparent font-outline-2 text-[#B89B72]">RESTORE.</span>
               </h2>
               <p className="text-2xl font-light italic text-white/40 max-w-md leading-relaxed">
                 Our proprietary oxygen-balanced sleeping chambers guarantee the deepest neurological rest possible on the planet.
               </p>
               <button className="flex items-center gap-6 group">
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#B89B72] group-hover:border-[#B89B72] transition-all">
                     <Play size={28} className="text-white fill-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-all">Experience the Ritual</span>
               </button>
            </div>
         </div>
      </section>

      {/* Extreme Aesthetic Footer */}
      <footer className="py-60 px-12 bg-white text-black relative">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 mb-40">
            <div className="lg:col-span-6 space-y-16">
              <h4 className="text-6xl font-black italic tracking-tighter uppercase">AZURE<span className="text-[#B89B72]">.</span>HAVEN</h4>
              <p className="text-2xl font-light italic leading-relaxed text-black/40 max-w-xl">
                Redefining the atmospheric state of hospitality. Part of the Webby Premium Collection.
              </p>
              <div className="flex gap-10">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <motion.a 
                    key={i}
                    whileHover={{ scale: 1.1, color: '#B89B72' }}
                    href="#" 
                    className="w-16 h-16 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-300 transition-all shadow-sm"
                  >
                    <Icon size={24} />
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-12">
               <h5 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#B89B72]">Coordinates</h5>
               <ul className="space-y-6 text-xl font-bold italic tracking-tighter opacity-30">
                  <li className="hover:opacity-100 cursor-pointer transition-opacity underline-offset-4 hover:underline">Private Island, Maldives</li>
                  <li className="hover:opacity-100 cursor-pointer transition-opacity underline-offset-4 hover:underline">North Cove, Seychelles</li>
                  <li className="hover:opacity-100 cursor-pointer transition-opacity underline-offset-4 hover:underline">Hidden Bay, Bora Bora</li>
               </ul>
            </div>

            <div className="lg:col-span-3 space-y-12 text-right">
               <h5 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#B89B72]">Join the Order</h5>
               <p className="text-sm font-medium italic opacity-40 leading-relaxed mb-10">Receive first access to new seasonal bookings and secret retreats.</p>
               <input 
                 type="email" 
                 placeholder="SECRET_EMAIL" 
                 className="w-full bg-transparent border-b border-zinc-200 py-6 text-2xl font-black italic uppercase tracking-tighter focus:outline-none focus:border-[#B89B72] transition-colors text-right"
               />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-t border-zinc-50 pt-20">
             <div className="space-y-4">
                <p className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-300 italic">Curated Excellence</p>
                <p className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-200 italic">© 2026 Azure Protocol. ALL ENTITIES SECURED.</p>
             </div>
             <div className="text-[12vw] font-black italic tracking-[-0.05em] uppercase text-zinc-50/50 leading-none select-none">
                REST_ONLY
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
