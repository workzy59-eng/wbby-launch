import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  Star, 
  Users, 
  Globe, 
  Layout, 
  MessageSquare, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { PROFESSIONAL_EMAIL, APP_NAME, HYPHENATED_NAME } from '../constants';

interface LandingPageProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function LandingPage({ user }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#4A5D4E] text-white font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Glassmorphism Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Webby<span className="text-[#E6FF00]">Launch</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            {['Features', 'About Us', 'Pricing', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#E6FF00] transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link 
              to="/auth" 
              state={{ role: 'developer' }}
              className="hidden md:block text-[10px] font-black uppercase tracking-widest text-[#E6FF00] border border-[#E6FF00]/20 px-4 py-2 rounded-full hover:bg-[#E6FF00] hover:text-black transition-all"
            >
              Join as Developer
            </Link>
            {user ? (
              <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-[#E6FF00] transition-all">Dashboard</Link>
            ) : (
              <Link to="/auth" className="bg-[#E6FF00] text-black px-8 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">Get Started</Link>
            )}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden pt-32 px-10"
          >
            <div className="flex flex-col gap-8 text-2xl font-bold tracking-tighter">
              {['About Us', 'Services', 'Pricing', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setIsMenuOpen(false)} className="hover:text-[#E6FF00] transition-colors">{item}</a>
              ))}
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="text-[#E6FF00]">Login</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Hero Section - Matched to Image */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#4A5D4E]">
        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter mb-8 leading-[0.85] text-white">
              Premium Web<br />Development.
            </h1>

            <p className="text-2xl md:text-3xl max-w-3xl mx-auto mb-16 font-medium text-white/70 leading-relaxed">
              WebbyLaunch provides expert custom web design services and premium website development for small businesses in India and beyond. Fast delivery. Zero hassle.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8">
              <Link to="/onboarding" className="bg-[#E6FF00] text-black px-16 py-6 rounded-3xl text-2xl font-black flex items-center gap-4 hover:scale-105 transition-all shadow-[0_0_50px_rgba(230,255,0,0.3)]">
                Start Your Project <ArrowRight size={32} />
              </Link>
              <Link to="/portfolio/autos" className="px-16 py-6 rounded-3xl text-2xl font-black border-2 border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
                View Portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-10 bg-white text-black relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-black" />
                <span className="text-xs font-bold uppercase tracking-[0.4em]">Our Services</span>
              </div>
              <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                Solutions for the <span className="text-white bg-black px-4">Modern Web</span>
              </h2>
            </div>
            <p className="text-xl font-medium opacity-50 max-w-md">
              We combine cutting-edge technology with premium design to build digital experiences that drive growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: 'Web Development', desc: 'Custom high-performance websites built with React and Tailwind.' },
              { icon: Layout, title: 'Admin Dashboards', desc: 'Powerful management systems to track your business metrics.' },
              { icon: MessageSquare, title: 'Messaging System', desc: 'Real-time communication tools for seamless client interaction.' },
              { icon: Search, title: 'SEO Optimization', desc: 'Strategic search engine optimization to boost your online visibility.' }
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-[#f5f5f5] border border-black/5 hover:bg-[#E6FF00] transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-all">
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{f.title}</h3>
                <p className="font-medium opacity-50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-32 px-10 bg-[#f5f5f5] text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" alt="Team" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-[#E6FF00] p-12 rounded-[3rem] shadow-2xl hidden md:block">
              <div className="text-7xl font-black tracking-tighter italic">10+</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-60">Years of Excellence</div>
            </div>
          </div>
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-black" />
              <span className="text-xs font-bold uppercase tracking-[0.4em]">Who We Are</span>
            </div>
            <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
              Crafting Digital <span className="text-[#E6FF00] bg-black px-4">Masterpieces</span>
            </h2>
            <p className="text-xl font-medium opacity-60 leading-relaxed">
              At WebbyLaunch, we don't just build websites; we create digital identities. Our mission is to empower businesses with the tools they need to thrive in an ever-evolving digital landscape.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-black uppercase italic mb-2">Our Mission</h4>
                <p className="text-sm opacity-50">To deliver premium web solutions that exceed expectations and drive real business results.</p>
              </div>
              <div>
                <h4 className="text-xl font-black uppercase italic mb-2">Our Vision</h4>
                <p className="text-sm opacity-50">To be the global leader in custom web development for small and medium enterprises.</p>
              </div>
            </div>
            <button className="bg-black text-white px-12 py-5 rounded-2xl text-lg font-black uppercase italic hover:scale-105 transition-all">
              Learn More About Us
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 bg-[#f5f5f5] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-[1px] bg-black" />
              <span className="text-xs font-bold uppercase tracking-[0.4em]">Pricing</span>
              <div className="w-12 h-[1px] bg-black" />
            </div>
            <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
              Simple <span className="text-[#E6FF00] bg-black px-4">Premium</span> Pricing
            </h2>
            <p className="text-xl font-medium opacity-50">
              One simple plan for everything you need to launch and grow your digital presence.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="bg-white p-16 rounded-[4rem] border border-black/5 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <div className="absolute top-0 right-0 bg-[#E6FF00] px-10 py-3 rounded-bl-[2rem] text-[10px] font-black uppercase tracking-widest">Most Popular</div>
              
              <div className="mb-12">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">The Launch Plan</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black tracking-tighter">$899</span>
                  <span className="text-xl font-bold opacity-30 uppercase tracking-widest">/month</span>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {[
                  'Custom React Website',
                  'Dedicated Developer',
                  'Admin Dashboard Access',
                  'Real-time Messaging',
                  'SEO Optimization',
                  '24/7 Premium Support',
                  'Unlimited Updates'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#E6FF00] flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-bold uppercase italic text-sm tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/auth" className="block w-full bg-black text-white py-6 rounded-2xl text-center font-black uppercase italic text-xl hover:bg-[#E6FF00] hover:text-black transition-all shadow-2xl">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-10 bg-white text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-black" />
              <span className="text-xs font-bold uppercase tracking-[0.4em]">Contact Us</span>
            </div>
            <h2 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
              Let's Start Your <span className="text-white bg-black px-4">Journey</span>
            </h2>
            <div className="space-y-8">
              <div className="flex items-center gap-6 group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#E6FF00] transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Email Us</div>
                  <div className="text-xl font-black italic">{PROFESSIONAL_EMAIL}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#E6FF00] transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Call Us</div>
                  <div className="text-xl font-black italic">+1 (555) 755-7689</div>
                </div>
              </div>
              <div className="flex items-center gap-6 group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#E6FF00] transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Visit Us</div>
                  <div className="text-xl font-black italic">Silicon Valley, CA, USA</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-12 md:p-20 rounded-[4rem] border border-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6FF00]/20 rounded-full blur-[100px] -z-0" />
            <form className="relative z-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-white border border-black/5 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-white border border-black/5 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-white border border-black/5 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Your Message</label>
                <textarea placeholder="Tell us about your project..." rows={4} className="w-full bg-white border border-black/5 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all resize-none font-bold"></textarea>
              </div>
              <button className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase italic text-lg hover:scale-[1.02] transition-all shadow-2xl">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 bg-black text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 bg-[#E6FF00] rounded flex items-center justify-center">
                  <span className="text-black font-black text-[8px] tracking-tighter">{HYPHENATED_NAME}</span>
                </div>
                <div className="text-2xl font-bold tracking-tighter">{APP_NAME}</div>
              </div>
              <p className="text-sm opacity-40 leading-relaxed">
                Premium web development solutions for businesses that demand excellence. Fast, secure, and stunning.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#E6FF00] mb-8">Navigation</h4>
              <ul className="space-y-4 text-sm font-bold opacity-40">
                {['About Us', 'Services', 'Portfolio', 'Pricing', 'Contact'].map(item => (
                  <li key={item}><a href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#E6FF00] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#E6FF00] mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-bold opacity-40">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                  <li key={item}><a href="#" className="hover:text-[#E6FF00] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#E6FF00] mb-8">Newsletter</h4>
              <div className="relative">
                <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-[#E6FF00] outline-none transition-all text-sm" />
                <button className="absolute right-2 top-2 bottom-2 bg-[#E6FF00] text-black px-4 rounded-lg">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-20">
              © 2026 {APP_NAME}. All rights reserved.
            </div>
            <div className="flex gap-6">
              {['Twitter', 'Instagram', 'LinkedIn'].map(s => (
                <a key={s} href="#" className="text-[10px] font-bold uppercase tracking-widest opacity-20 hover:opacity-100 hover:text-[#E6FF00] transition-all">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
