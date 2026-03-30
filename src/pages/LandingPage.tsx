import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function LandingPage({ user }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#4A5D4E] text-white font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[#E6FF00] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xs tracking-widest">W-E-B-i-L-A-U-N-C-H</span>
            </div>
            <div className="text-2xl font-bold tracking-tighter">WebbyLaunch</div>
          </div>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {['Home', 'Portfolio', 'About', 'Pricing', 'Contact'].map((item) => (
            <a key={item} href={item === 'Home' ? '#' : `#${item.toLowerCase()}`} className="hover:text-[#E6FF00] transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-[#E6FF00] transition-all">Dashboard</Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-bold uppercase tracking-widest hover:text-[#E6FF00] transition-all">Login</Link>
              <Link to="/onboarding" className="bg-[#E6FF00] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(230,255,0,0.2)]">Get Started</Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="px-6 py-32 max-w-7xl mx-auto text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E6FF00]/5 rounded-full blur-[120px] -z-10"
        />
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl md:text-[10rem] font-bold tracking-tighter mb-8 leading-[0.85]"
        >
          We build.<br />You focus.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-medium"
        >
          Premium websites crafted by expert developers.<br />Fast delivery. Zero hassle.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/onboarding" className="bg-[#E6FF00] text-black px-10 py-5 rounded-2xl text-lg font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(230,255,0,0.15)]">
            Start Your Project <ArrowRight size={20} />
          </Link>
          <a href="#portfolio" className="bg-[#5E7162] border border-white/10 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/5 transition-all">
            View Portfolio
          </a>
        </motion.div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6FF00]">Portfolio</span>
              </div>
              <h2 className="text-6xl font-bold tracking-tighter mb-6">Our Work</h2>
              <p className="text-white/40 text-lg font-medium">We don't just build websites; we build digital experiences that convert visitors into customers.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#5E7162] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#E6FF00] hover:text-black transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#5E7162] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#E6FF00] hover:text-black transition-all group">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                title: "Vanguard Realty", 
                category: "Luxury Real Estate", 
                image: "https://images.unsplash.com/photo-1600585154340-be6199f74009?auto=format&fit=crop&q=80&w=1200",
                desc: "High-end property listings with immersive virtual tours.",
                link: "/portfolio/vanguard"
              },
              { 
                title: "Global Autos", 
                category: "Automobiles", 
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
                desc: "Next-generation automotive performance and design.",
                link: "/portfolio/autos"
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer bg-[#5E7162] p-4 rounded-[2.5rem] border border-white/10 hover:border-[#E6FF00]/30 transition-all"
                onClick={() => item.link !== "#" && (window.location.href = item.link)}
              >
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-6 bg-[#4A5D4E]">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6FF00]">{item.category}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-32 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="text-[#E6FF00] text-xs font-bold uppercase tracking-[0.3em]">About WebbyLaunch</div>
            <h2 className="text-6xl font-bold tracking-tighter leading-tight">We build the future of the web, one pixel at a time.</h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed">WebbyLaunch is a premium design and development agency dedicated to creating high-performance digital experiences. We combine minimalist aesthetics with cutting-edge technology to help businesses thrive in the digital age.</p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="text-4xl font-bold text-[#E6FF00]">50+</div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/20">Projects Done</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#E6FF00]">12k+</div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/20">Happy Clients</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-[#5E7162] rounded-[3rem] overflow-hidden border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200" 
                alt="Office" 
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-32 max-w-7xl mx-auto">
        <div className="bg-[#5E7162] rounded-[3rem] p-12 md:p-20 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6FF00]/5 rounded-full blur-[80px] -z-10" />
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold tracking-tighter mb-12">Transparent Pricing</h2>
            <div className="space-y-8 mb-12">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <span className="text-xl font-bold">Website Development</span>
                  <p className="text-sm text-white/40">Full custom build with expert design.</p>
                </div>
                <span className="text-4xl font-bold text-[#E6FF00]">₹9999</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <span className="text-xl font-bold">Maintenance</span>
                  <p className="text-sm text-white/40">Hosting, security, and 24/7 support.</p>
                </div>
                <span className="text-4xl font-bold text-[#E6FF00]">₹499/mo</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/onboarding" className="w-full sm:w-auto bg-[#E6FF00] text-black px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.15)]">
                Get Started
              </Link>
              <p className="text-white/40 font-bold text-sm uppercase tracking-widest">No hidden charges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 py-32 max-w-7xl mx-auto border-t border-white/5">
        <div className="bg-white/5 rounded-[3rem] p-12 md:p-20 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h2 className="text-6xl font-bold tracking-tighter">Let's build<br />something great.</h2>
              <p className="text-white/40 text-lg font-medium">Ready to start your next project? Get in touch with our team of experts and let's make it happen.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xl font-bold">
                  <div className="w-12 h-12 rounded-full bg-[#E6FF00]/10 flex items-center justify-center text-[#E6FF00]">
                    <CheckCircle2 size={24} />
                  </div>
                  hello@webbylaunch.com
                </div>
                <div className="flex items-center gap-4 text-xl font-bold">
                  <div className="w-12 h-12 rounded-full bg-[#E6FF00]/10 flex items-center justify-center text-[#E6FF00]">
                    <CheckCircle2 size={24} />
                  </div>
                  +91 98765 43210
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Name" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#E6FF00] outline-none transition-all" />
                <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#E6FF00] outline-none transition-all" />
              </div>
              <textarea placeholder="Message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#E6FF00] outline-none transition-all resize-none"></textarea>
              <button className="w-full bg-[#E6FF00] text-black py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(230,255,0,0.1)]">Send Message</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-20 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-[#E6FF00] rounded flex items-center justify-center">
              <span className="text-black font-black text-[8px] tracking-tighter">W-E-B-i-L-A-U-N-C-H</span>
            </div>
            <div className="text-xl font-bold tracking-tighter">WebbyLaunch</div>
          </div>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/10">
            © 2026 WebbyLaunch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
