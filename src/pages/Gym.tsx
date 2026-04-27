import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Play, ArrowRight, Instagram, Facebook, Twitter, Zap, Target, Flame, Trophy, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';

export default function Gym() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.2], [0, -5]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">
      {/* Dynamic Cursor Blur */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF4D00]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF4D00]/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Extreme Banner Marquee */}
      <div className="bg-[#FF4D00] text-black py-3 text-center overflow-hidden whitespace-nowrap sticky top-0 z-[100] shadow-2xl">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="inline-block font-black uppercase italic tracking-[0.3em] text-xs"
        >
          THE JUBILEE GYM • PUSH YOUR LIMITS • JOIN THE ELITE • FORGING CHAMPIONS • NO EXCUSES • DOMINATE THE DAY • THE JUBILEE GYM • PUSH YOUR LIMITS • JOIN THE ELITE
        </motion.div>
      </div>

      {/* Navbar with Glass Effect */}
      <nav className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-[90] backdrop-blur-md bg-black/20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-2"
        >
          <div className="w-12 h-12 bg-[#FF4D00] flex items-center justify-center rounded-xl shadow-[0_0_30px_rgba(255,77,0,0.3)]">
            <Zap className="text-black fill-black" size={28} />
          </div>
          JUBLIE<span className="text-[#FF4D00]">GYM</span>
        </motion.div>
        
        <div className="hidden lg:flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
          {['Programs', 'Philosophy', 'Trainers', 'Foundry'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#FF4D00] hover:tracking-[0.6em] transition-all duration-500">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="hidden sm:flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
            <ArrowRight size={12} className="rotate-180" />
            Back to Webby
          </Link>
          <button className="bg-[#FF4D00] text-black px-10 py-4 rounded-xl font-black uppercase italic text-xs hover:scale-105 hover:rotate-1 transition-all shadow-[0_0_40px_rgba(255,77,0,0.3)]">
            Ascend Now
          </button>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <motion.section 
        style={{ scale: heroScale, opacity: heroOpacity, rotate: heroRotate }}
        className="relative min-h-[90vh] flex items-center px-10 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920" 
            alt="Gym Background" 
            className="w-full h-full object-cover opacity-20 brightness-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10 w-full">
          <div className="space-y-16">
            <div className="space-y-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-[1px] bg-gradient-to-r from-[#FF4D00] to-transparent"
              />
              <motion.h1 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="text-[clamp(4rem,15vw,12rem)] font-black tracking-tighter uppercase italic leading-[0.75]"
              >
                LEVEL <br />
                <span className="text-transparent font-outline-2 text-[#FF4D00] drop-shadow-[0_0_20px_rgba(255,77,0,0.4)]">UNLOCKED.</span>
              </motion.h1>
              <p className="text-white/40 text-2xl font-medium italic leading-relaxed max-w-xl">
                The world's most aggressive training sanctuary. Engineered for those who see pain as fuel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-12">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-20 py-10 bg-[#FF4D00] text-black font-black uppercase italic text-3xl overflow-hidden rounded-2xl shadow-[0_30px_100px_rgba(255,77,0,0.4)]"
              >
                <span className="relative z-10">Start Training</span>
                <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo" />
              </motion.button>
              
              <div className="flex -space-x-8">
                {[1,2,3,4].map(i => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.2, zIndex: 10, rotate: i % 2 === 0 ? 5 : -5 }}
                    className="w-20 h-20 rounded-2xl border-4 border-black bg-zinc-900 overflow-hidden shadow-2xl relative cursor-crosshair"
                  >
                    <img src={`https://i.pravatar.cc/150?img=${i+44}`} alt="Warrior" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-[5rem] overflow-hidden border border-[#FF4D00]/20 relative shadow-[0_0_150px_rgba(255,77,0,0.1)] group">
              <motion.img 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 10, repeat: Infinity }}
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200" 
                alt="Elite Training" 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:grayscale-0 grayscale-[0.8]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              
              {/* Float Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 -left-10 bg-black/80 backdrop-blur-2xl border border-[#FF4D00]/30 p-8 rounded-[2rem] shadow-4xl"
              >
                <Target size={32} className="text-[#FF4D00] mb-4" />
                <div className="text-4xl font-black italic">94%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Efficiency Rate</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -right-10 bg-[#FF4D00] text-black p-8 rounded-[3rem] shadow-4xl"
              >
                <Activity size={32} className="mb-4" />
                <div className="text-4xl font-black italic">184</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Heart Rate</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Breakdown */}
      <section className="py-40 px-10 border-y border-white/5 bg-zinc-950/50 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-16 relative z-10">
          {[
            { value: '500+', label: 'Elite Athletes', icon: Users },
            { value: '24/7', label: 'Combat Ready', icon: Flame },
            { value: '98%', label: 'Success Rate', icon: Trophy },
            { value: '15+', label: 'World Trainers', icon: Zap }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl mx-auto flex items-center justify-center mb-8 group-hover:bg-[#FF4D00] group-hover:text-black transition-all duration-500 group-hover:rotate-12">
                <stat.icon size={32} />
              </div>
              <div className="text-7xl font-black italic tracking-tighter mb-2 group-hover:text-[#FF4D00] transition-colors">{stat.value}</div>
              <div className="text-xs font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-colors">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grid Features */}
      <section id="programs" className="py-40 px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
            <div className="space-y-6">
               <span className="text-[#FF4D00] font-black uppercase tracking-[0.6em] text-xs">The Foundry</span>
               <h2 className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter uppercase italic leading-none">
                 CHOOSE YOUR <br />
                 <span className="text-[#FF4D00]">WEAPON.</span>
               </h2>
            </div>
            <p className="text-white/40 text-xl font-medium italic max-w-md leading-relaxed">
              Every program is a protocol designed for specific operational results. Select your objective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'The Iron protocol', desc: 'Max output strength engineering for total body dominance.', icon: '💪' },
              { title: 'Hyper-Burn', desc: 'Reactive oxygen processing to incinerate body fat instantly.', icon: '🔥' },
              { title: 'Mind Shield', desc: 'Elite psychological calibration and high-level mobility.', icon: '🧘' },
              { title: 'Strike Unit', desc: 'Advanced kinetic combat training for modern guardians.', icon: '🥊' },
              { title: 'Hydro-Static', desc: 'Fluid dynamic conditioning in our private aquatic lab.', icon: '🏊' },
              { title: 'Tactical Flex', desc: 'Multi-planar movement mastery for absolute versatility.', icon: '🏋️' }
            ].map((p, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -20, scale: 1.02 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative h-[450px] p-12 rounded-[4rem] bg-white/5 border border-white/10 flex flex-col justify-between group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF4D00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-7xl mb-12 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700">{p.icon}</div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-6 group-hover:text-[#FF4D00] transition-colors">{p.title}</h3>
                  <p className="text-white/40 font-medium italic leading-relaxed group-hover:text-white/80 transition-all">{p.desc}</p>
                </div>
                <button className="absolute bottom-12 right-12 w-16 h-16 bg-[#FF4D00] text-black rounded-full flex items-center justify-center opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <ArrowRight size={24} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Testimonial Section */}
      <section className="py-40 bg-white text-black overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-5">
           <Zap size={500} />
        </div>
        <div className="flex flex-nowrap gap-20 overflow-x-auto px-10 no-scrollbar">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="min-w-[800px] space-y-12">
                <div className="text-[10vw] font-black italic tracking-tighter uppercase leading-none text-black/10 select-none">
                   TRANSFORMATION_{i}
                </div>
                <p className="text-5xl font-black tracking-tighter italic uppercase max-w-4xl">
                  "The most intense environment I've ever experienced. JublieGym didn't just change my body, it re-wired my entire mindset towards success."
                </p>
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-2xl bg-black" />
                   <div>
                      <p className="text-xl font-black uppercase">JAMES VOLKOV</p>
                      <p className="text-xs font-black uppercase tracking-widest opacity-40">Pro Bodybuilder</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Dark Pricing */}
      <section id="pricing" className="py-40 px-10 bg-black relative">
        <div className="max-w-[1400px] mx-auto text-center mb-32 space-y-8">
           <span className="text-[#FF4D00] font-black uppercase tracking-[1em] text-xs">Select tier</span>
           <h2 className="text-9xl font-black tracking-tighter uppercase italic">COMMITMENT.</h2>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { name: 'Standard', price: '49', features: ['24/7 Deployment Access', 'Base Equipment', 'Public Foundry', 'Standard Protocol'] },
              { name: 'Tactical', price: '99', features: ['Priority Status', 'Personal Strategist', 'Combat Classes', 'Recovery Lab'], popular: true },
              { name: 'Elite', price: '199', features: ['Private Terminal', 'Zero Latency Support', 'Total Bio-Optimization', 'Founders Access'] }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={`p-16 rounded-[5rem] border ${plan.popular ? 'bg-[#FF4D00] text-black border-[#FF4D00]' : 'bg-zinc-900 text-white border-white/5'} flex flex-col justify-between relative overflow-hidden group shadow-3xl`}
              >
                {plan.popular && <div className="absolute top-10 right-10 bg-black text-[#FF4D00] px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">Recommended</div>}
                <div className="space-y-16">
                  <h3 className="text-5xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                  <div className="flex items-baseline gap-4">
                    <span className="text-9xl font-black tracking-tighter leading-none">${plan.price}</span>
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">/MO</span>
                  </div>
                  <ul className="space-y-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-6">
                        <div className={`w-3 h-3 rounded-full ${plan.popular ? 'bg-black' : 'bg-[#FF4D00]'}`} />
                        <span className="text-sm font-black uppercase italic tracking-tighter opacity-80">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={`w-full py-10 mt-20 rounded-[2rem] font-black uppercase italic text-2xl transition-all shadow-2xl ${plan.popular ? 'bg-black text-white hover:scale-105' : 'bg-[#FF4D00] text-black hover:bg-white'}`}>
                  Join The Order
                </button>
              </motion.div>
            ))}
        </div>
      </section>

      {/* Extreme Footer */}
      <footer className="px-10 py-40 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black opacity-[0.02] italic tracking-tighter select-none">JUBLIE</div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24 relative z-10">
          <div className="lg:col-span-5 space-y-12">
            <div className="text-6xl font-black italic tracking-tighter uppercase">JUBLIE<span className="text-[#FF4D00]">GYM</span></div>
            <p className="text-white/20 text-2xl font-medium italic leading-relaxed max-w-md">
              Elevating human performance through aggressive engineering and psychological resilience.
            </p>
            <div className="flex gap-8">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.a 
                  key={i}
                  whileHover={{ y: -10, color: '#FF4D00' }}
                  href="#" 
                  className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 border border-white/5 transition-all"
                >
                  <Icon size={32} />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-10">
            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#FF4D00]">Divisions</h4>
            <div className="flex flex-col gap-6 text-xl font-bold italic text-white/20">
              <a href="#" className="hover:text-white transition-colors">Combat</a>
              <a href="#" className="hover:text-white transition-colors">Performance</a>
              <a href="#" className="hover:text-white transition-colors">Recovery</a>
              <a href="#" className="hover:text-white transition-colors">Mindset</a>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#FF4D00]">Intel Brief</h4>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="YOUR_EMAIL_ADDRESS" 
                className="w-full bg-white/5 border-b-2 border-white/10 rounded-none px-0 py-8 text-2xl font-black italic uppercase italic tracking-tighter focus:outline-none focus:border-[#FF4D00] transition-colors placeholder:text-white/5" 
              />
              <button className="absolute right-0 bottom-8 text-[#FF4D00] font-black uppercase italic tracking-widest text-xs hover:tracking-[0.5em] transition-all">Submit</button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">© 2026 Jubilee Protocol Systems. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
