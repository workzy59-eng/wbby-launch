import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, Mail, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user, profile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  if (isDashboard) return <>{children}</>;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/#portfolio' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-[#4A5D4E] text-white font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4 flex items-center justify-between shadow-2xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E6FF00] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xl italic tracking-tighter">W</span>
            </div>
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Webby<span className="text-[#E6FF00]">Launch</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`hover:text-[#E6FF00] transition-colors ${location.pathname === item.path ? 'text-[#E6FF00] opacity-100' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-[#E6FF00] transition-all">Dashboard</Link>
            ) : (
              <Link to="/auth" className="bg-[#E6FF00] text-black px-8 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">Get Started</Link>
            )}
            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl lg:hidden pt-32 px-10"
          >
            <div className="flex flex-col gap-8 text-2xl font-bold tracking-tighter">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className="hover:text-[#E6FF00] transition-colors">{item.name}</Link>
              ))}
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="text-[#E6FF00]">Login</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-3xl border-t border-white/5 pt-32 pb-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E6FF00] rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-xl italic tracking-tighter">W</span>
              </div>
              <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
                Webby<span className="text-[#E6FF00]">Launch</span>
              </div>
            </div>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Professional website development for small businesses in India. Get your business online in 24-48 hours with zero hassle.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#E6FF00] hover:text-black transition-all">
                  <span className="text-[10px] font-black uppercase tracking-tighter">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#E6FF00]">Quick Links</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-white/40">
              {navItems.slice(0, 5).map((item) => (
                <Link key={item.name} to={item.path} className="hover:text-white transition-colors">{item.name}</Link>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#E6FF00]">Legal</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-white/40">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#E6FF00]">Contact</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                  <Mail size={18} />
                </div>
                <span className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">hello@webbylaunch.com</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                  <Phone size={18} />
                </div>
                <span className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            © 2026 WebbyLaunch. Professional Website Development.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Made in India</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-500">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
