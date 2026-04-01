import { motion } from 'motion/react';
import { Play, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Gym() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">
      {/* Banner */}
      <div className="bg-[#FF4D00] text-black py-2 text-center overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block font-black uppercase italic tracking-widest text-sm"
        >
          THE JUBLIE GYM • PUSH YOUR LIMITS • JOIN THE ELITE • THE JUBLIE GYM • PUSH YOUR LIMITS • JOIN THE ELITE • THE JUBLIE GYM • PUSH YOUR LIMITS • JOIN THE ELITE
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="px-10 py-8 flex justify-between items-center border-b border-white/10">
        <div className="text-2xl font-black italic tracking-tighter uppercase">JUBLIE<span className="text-[#FF4D00]">GYM</span></div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-60">
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Home</a>
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Programs</a>
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Trainers</a>
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Back to Hub
          </Link>
          <button className="bg-[#FF4D00] text-black px-8 py-3 rounded-full font-black uppercase italic text-xs hover:scale-105 transition-all">Member Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-10">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#FF4D00]/20 z-0" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-[2px] bg-[#FF4D00]"></div>
                <span className="text-[#FF4D00] font-black uppercase tracking-[0.3em] text-xs">Elite Fitness Club</span>
              </div>
              <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
                PUSH YOUR <br />
                <span className="text-transparent border-t-2 border-b-2 border-white/20 py-2">LIMITS</span> WITH US
              </h1>
              <p className="text-white/60 text-lg italic leading-relaxed max-w-lg">
                From beginner to advanced, experience workouts designed to help you achieve peak performance and exceed your fitness goals.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8"
            >
              <button className="bg-[#FF4D00] text-black px-12 py-6 rounded-full font-black uppercase italic text-xl flex items-center gap-4 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,77,0,0.3)]">
                Join Now <ArrowRight size={24} />
              </button>
              <button className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Play size={24} fill="currentColor" />
                </div>
                <span className="font-black uppercase italic tracking-widest text-sm">Watch Video</span>
              </button>
            </motion.div>

            <div className="flex flex-wrap gap-3 pt-10">
              {['Personal Training', 'Strength', 'Group Classes', 'Swimming', 'Cardio', 'Functional'].map(tag => (
                <span key={tag} className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 relative group">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920" 
                alt="Athlete" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-black italic uppercase">1.7k+</div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Positive Reviews</div>
                  </div>
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="text-2xl font-black italic tracking-tighter uppercase">JUBLIE<span className="text-[#FF4D00]">GYM</span></div>
            <p className="text-white/40 text-sm italic leading-relaxed">
              Premium fitness experience designed for those who demand the best.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Contact</h4>
            <div className="space-y-4 text-sm font-bold text-white/60 italic">
              <p>support@webbylaunch.com</p>
              <p>+1 (555) 000-0000</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Social</h4>
            <div className="flex gap-4">
              <Instagram size={20} className="text-white/40 hover:text-[#FF4D00] transition-colors cursor-pointer" />
              <Facebook size={20} className="text-white/40 hover:text-[#FF4D00] transition-colors cursor-pointer" />
              <Twitter size={20} className="text-white/40 hover:text-[#FF4D00] transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[#FF4D00] flex-1" />
              <button className="bg-[#FF4D00] text-black px-4 py-2 rounded-lg font-black uppercase italic text-[10px]">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
