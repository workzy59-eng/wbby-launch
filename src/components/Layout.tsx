import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail, MapPin, ChevronRight, MessageCircle, Smartphone, Briefcase, Settings as Settings2, Instagram } from 'lucide-react';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import NavHeader from './ui/nav-header';
import { APP_NAME, PROFESSIONAL_EMAIL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user, profile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/developer-dashboard') ||
    location.pathname.startsWith('/sales-dashboard') ||
    location.pathname.startsWith('/onboarding') ||
    location.pathname.startsWith('/messages');
  const isPortfolio = location.pathname.startsWith('/portfolio');

  if (isDashboard || isPortfolio) return <>{children}</>;

  const navItems = [
    { name: 'Home', path: '/', icon: Menu },
    { name: 'About', path: '/about', icon: Menu },
    { name: 'Services', path: '/services', icon: Menu },
    { name: 'Pricing', path: '/pricing', icon: Menu },
    { name: 'Blog', path: '/blog', icon: Menu },
    { name: 'Docs', path: '/docs', icon: Menu },
  ];

  const bottomNavItems = [
    { name: 'Home', path: '/dashboard', icon: Smartphone },
    { name: 'Chat', path: '/dashboard?chat=true', icon: MessageCircle },
    { name: 'Project', path: '/dashboard', icon: Briefcase },
    { name: 'Settings', path: '/settings', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#c7c42a] selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 pointer-events-none">
        <div className="bg-[#111] border border-white/5 rounded-2xl px-8 py-4 flex items-center justify-between shadow-2xl pointer-events-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl italic tracking-tighter">{APP_NAME[0]}</span>
            </div>
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              {APP_NAME}
            </div>
          </Link>

          <div className="hidden lg:block">
            <NavHeader />
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-[#c7c42a] transition-all">Dashboard</Link>
            ) : (
              <Link to="/auth" className="bg-[#c7c42a] text-black px-8 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)]">Get Started</Link>
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
                <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className="hover:text-[#c7c42a] transition-colors">{item.name}</Link>
              ))}
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="text-[#c7c42a]">Login</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>{children}</main>

      {/* Mobile Bottom Navigation */}
      {user && (
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between z-50 pb-safe">
          {bottomNavItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 ${location.pathname === item.path ? 'text-black' : 'text-gray-400'}`}
            >
              <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 pt-32 pb-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl italic tracking-tighter">{APP_NAME[0]}</span>
              </div>
              <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
                {APP_NAME}
              </div>
            </div>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Professional website development for small businesses in India. Get your business online in 52 hours with zero hassle.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/webbylaunch/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#c7c42a] hover:text-black transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#c7c42a]">Quick Links</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-white/40">
              {navItems.slice(0, 6).map((item) => (
                <Link key={item.name} to={item.path} className="hover:text-white transition-colors">{item.name}</Link>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#c7c42a]">Legal</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-white/40">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#c7c42a]">Contact</h4>
            <div className="space-y-6">
              <a 
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${PROFESSIONAL_EMAIL}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#c7c42a] group-hover:text-black transition-all">
                  <Mail size={18} />
                </div>
                <span className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">{PROFESSIONAL_EMAIL}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            © 2024 {APP_NAME}. Premium Website solutions.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Made in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
