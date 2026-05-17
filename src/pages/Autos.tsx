import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronRight, 
  Star, 
  Shield, 
  Zap, 
  Cpu,
  Gauge,
  Wind,
  Settings,
  Users,
  Activity,
  Compass,
  Crosshair,
  Wifi,
  Battery
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CARS = [
  {
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920",
    name: "AMG GT COUPE",
    stats: { zeroToSixty: "3.1s", topSpeed: "196 MPH", horsepower: "577 HP", torque: "590 lb-ft" }
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920",
    name: "911 TURBO S",
    stats: { zeroToSixty: "2.6s", topSpeed: "205 MPH", horsepower: "640 HP", torque: "590 lb-ft" }
  },
  {
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1920",
    name: "FERRARI F8",
    stats: { zeroToSixty: "2.9s", topSpeed: "211 MPH", horsepower: "710 HP", torque: "568 lb-ft" }
  }
];

export default function Autos() {
  const [currentCar, setCurrentCar] = useState(0);
  const [engineStarted, setEngineStarted] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  useEffect(() => {
    const carInterval = setInterval(() => {
      if (!engineStarted) setCurrentCar((prev) => (prev + 1) % CARS.length);
    }, 5000);
    return () => clearInterval(carInterval);
  }, [engineStarted]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#c7c42a] selection:text-black overflow-x-hidden">
      {/* Dynamic HUD Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute top-10 left-10 p-6 border-l-2 border-t-2 border-[#c7c42a]/30 space-y-4">
           <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">
              <div className="w-2 h-2 bg-[#c7c42a] animate-pulse" />
              SYSTEM_ACTIVE
           </div>
           <div className="text-[10px] font-mono text-white/20">
              CORE_TEMP: 88°C <br />
              FUEL_FLOW: OPTIMAL
           </div>
        </div>
        <div className="absolute top-10 right-10 p-6 border-r-2 border-t-2 border-[#c7c42a]/30 flex flex-col items-end gap-4">
           <div className="flex gap-4">
              <Wifi size={12} className="text-[#c7c42a]" />
              <Battery size={12} className="text-[#c7c42a]" />
           </div>
           <div className="text-[10px] font-mono text-white/20 text-right uppercase">
              LAT: 48.7758° N <br />
              LNG: 9.1829° E
           </div>
        </div>
        
        {/* Scanning Line */}
        <motion.div 
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c7c42a]/10 to-transparent z-50"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[60] px-12 py-10 flex justify-between items-center mix-blend-difference">
        <div className="text-4xl font-black tracking-[-0.1em] uppercase italic">
          VECTOR<span className="text-[#c7c42a]">X</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-16 text-[9px] font-black uppercase tracking-[0.5em] text-white/40">
          {['Registry', 'Dynamics', 'Atelier', 'Telemetry'].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-all cursor-pointer relative group">
              {item}
              <div className="absolute -bottom-2 left-0 w-0 h-px bg-[#c7c42a] group-hover:w-full transition-all" />
            </a>
          ))}
        </div>

        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] border-b border-[#c7c42a] pb-1 hover:text-white hover:border-white transition-all">
          BACK_TO_WEBBY
        </Link>
      </nav>

      {/* Aggressive Technical Hero */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <motion.div 
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0 z-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCar}
              initial={{ x: 100, opacity: 0, filter: "blur(20px)" }}
              animate={{ x: 0, opacity: 0.4, filter: "blur(0px)" }}
              exit={{ x: -100, opacity: 0, filter: "blur(20px)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={CARS[currentCar].image} 
                alt={CARS[currentCar].name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-12 w-full">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-end">
              <div className="lg:col-span-8 space-y-12">
                 <motion.div 
                   initial={{ opacity: 0, scaleX: 0 }}
                   animate={{ opacity: 1, scaleX: 1 }}
                   className="flex items-center gap-6"
                 >
                    <div className="h-px w-24 bg-[#c7c42a]" />
                    <span className="text-xs font-black uppercase tracking-[1em] text-[#c7c42a]">Aerodynamics of Desire</span>
                 </motion.div>

                 <h1 className="text-[14vw] font-extrabold tracking-[-0.05em] uppercase italic leading-[0.75] select-none">
                    <span className="block">{CARS[currentCar].name.split(' ')[0]}</span>
                    <span className="block text-transparent font-outline-4 text-white/10">{CARS[currentCar].name.split(' ').slice(1).join(' ')}</span>
                 </h1>

                 <div className="flex flex-wrap gap-12 pt-10">
                    <button 
                      onClick={() => setEngineStarted(!engineStarted)}
                      className="group relative px-20 py-10 bg-[#c7c42a] text-black rounded-none font-black uppercase italic text-2xl tracking-tighter overflow-hidden transition-all hover:skew-x-[-10deg]"
                    >
                       <span className="relative z-10">{engineStarted ? 'ENGINE_RUNNING' : 'START_IGNITION'}</span>
                       <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-expo" />
                    </button>
                    <div className="flex items-center gap-6">
                       <div className="w-px h-24 bg-white/10" />
                       <div className="space-y-2">
                          <Activity className="text-[#c7c42a] animate-pulse" size={20} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Biometric link established</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-4 pb-12">
                 <div className="space-y-16 border-l border-white/5 pl-12">
                    {[
                      { label: 'VELOCITY', value: CARS[currentCar].stats.topSpeed, icon: Gauge },
                      { label: 'THRUST', value: CARS[currentCar].stats.torque, icon: Zap },
                      { label: 'FORCE', value: CARS[currentCar].stats.horsepower, icon: Shield }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="space-y-4 group"
                      >
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-[#c7c42a] transition-all">{stat.label}</span>
                            <stat.icon size={12} className="text-[#c7c42a]/40" />
                         </div>
                         <div className="text-6xl font-black italic tracking-tighter group-hover:translate-x-4 transition-transform duration-500">{stat.value}</div>
                         <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: "100%" }}
                               transition={{ duration: 2, delay: i * 0.2 }}
                               className="h-full bg-[#c7c42a]" 
                            />
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Horizontal Select */}
        <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center">
           <div className="flex gap-4">
              {CARS.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentCar(i)}
                  className={`w-16 h-1 transition-all duration-700 ${i === currentCar ? 'bg-[#c7c42a] w-32' : 'bg-white/10 hover:bg-white/30'}`}
                />
              ))}
           </div>
           <div className="flex items-center gap-10">
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mb-1">CURRENT_LOC</p>
                 <p className="text-xs font-black italic tracking-tighter">NÜRBURGRING_NORDSCHLEIFE</p>
              </div>
              <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center relative">
                 <Compass size={24} className="text-[#c7c42a] animate-spin-slow" />
                 <div className="absolute inset-x-0 top-1/2 h-px bg-[#c7c42a]/20" />
              </div>
           </div>
        </div>
      </section>

      {/* Technical Breakdown */}
      <section className="py-60 px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[30vw] font-black italic text-white/[0.02] tracking-tighter select-none -translate-y-1/2 translate-x-1/2">TECH</div>
        
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="space-y-20"
           >
              <div className="space-y-8">
                 <h2 className="text-9xl font-black italic tracking-tighter uppercase leading-none">
                    ENGINEERED <br />
                    <span className="text-[#c7c42a]">ANOMALY.</span>
                 </h2>
                 <p className="text-3xl font-light italic text-white/40 leading-relaxed max-w-xl">
                    Breaking the laws of thermal dynamics. Our proprietary cooling architecture allows for sustained peak performance under extreme g-force loads.
                 </p>
              </div>
              
              <div className="grid grid-cols-2 gap-12">
                 {[
                   { title: 'Carbon Core', val: '74kg Reduc' },
                   { title: 'Active Aero', val: '400kg Down' },
                   { title: 'Neural Shift', val: '50ms React' },
                   { title: 'Apex Matrix', val: 'Full Sense' }
                 ].map((item, i) => (
                   <div key={i} className="p-10 border border-white/5 hover:border-[#c7c42a]/20 transition-all bg-zinc-950/50">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a] mb-2">{item.title}</p>
                      <p className="text-2xl font-black italic tracking-tighter">{item.val}</p>
                   </div>
                 ))}
              </div>
           </motion.div>

           <div className="relative group perspective-1000">
              <motion.div 
                whileHover={{ rotateY: 15, rotateX: -5 }}
                className="aspect-square bg-gradient-to-br from-zinc-900 to-black rounded-none border border-white/5 p-1 relative overflow-hidden"
              >
                 <img 
                   src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" 
                   alt="Tech" 
                   className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-80 transition-all duration-1000"
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />
                 
                 {/* Reticle UI */}
                 <div className="absolute inset-20 border border-[#c7c42a]/20 flex items-center justify-center pointer-events-none">
                    <Crosshair size={40} className="text-[#c7c42a] opacity-40" />
                    <div className="absolute -top-10 -left-10 text-[8px] font-mono text-[#c7c42a]">O_SCANNING...</div>
                 </div>
              </motion.div>
              
              <div className="absolute -bottom-20 -right-20 p-12 bg-[#c7c42a] text-black skew-x-[-10deg]">
                 <p className="text-7xl font-black italic tracking-tighter leading-none mb-4">V12_EVO</p>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">MASTER_TECH_SIGNED</p>
              </div>
           </div>
        </div>
      </section>

      {/* Extreme Footer */}
      <footer className="py-40 px-12 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-32 relative z-10">
          <div className="lg:col-span-2 space-y-16">
            <h4 className="text-6xl font-black italic tracking-tight uppercase">VECTOR<span className="text-[#c7c42a]">X</span></h4>
            <div className="flex gap-16">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">HEADQUARTERS</p>
                  <p className="text-sm font-bold italic opacity-60">
                     Daimlerstraße 1 <br />
                     71563 Affalterbach <br />
                     Germany
                  </p>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">CONTACT_SECURE</p>
                  <p className="text-sm font-bold italic opacity-60 underline lg:no-underline hover:underline cursor-pointer">
                     ops@vectorx.tech <br />
                     +49 (0) 7144-302-0
                  </p>
               </div>
            </div>
          </div>
          
          <div className="space-y-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">REGISTRY_MODELS</p>
            <ul className="space-y-6 text-2xl font-black italic tracking-tighter uppercase opacity-30">
               {['GT_ULTIMA', 'PROTOTYPE_01', 'TRACK_EDITION'].map(m => (
                 <li key={m} className="hover:opacity-100 hover:translate-x-4 transition-all cursor-pointer underline-offset-8 hover:underline text-[#c7c42a]">{m}</li>
               ))}
            </ul>
          </div>

          <div className="space-y-10 text-right">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">NEWS_TELEMETRY</p>
             <div className="relative group">
                <input 
                  type="email" 
                  placeholder="ENCRYPTED_EMAIL" 
                  className="w-full bg-transparent border-b border-white/10 py-6 text-2xl font-black italic uppercase tracking-tighter focus:outline-none focus:border-[#c7c42a] transition-colors text-right"
                />
                <button className="absolute right-0 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="text-[#c7c42a]" />
                </button>
             </div>
          </div>
        </div>
        
        <div className="mt-40 pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-end gap-10 opacity-20">
           <p className="text-[8px] font-bold uppercase tracking-[0.8em] italic">© 2024 VECTOR_X PROTOCOLS. NO DATA RETAINED.</p>
           <div className="text-[14vw] font-black italic tracking-[-0.1em] uppercase leading-none select-none select-none translate-y-20">AFFALTERBACH</div>
        </div>
      </footer>
    </div>
  );
}

