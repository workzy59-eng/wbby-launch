import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FirebaseUser } from '../firebase';
import { SystemSettings, UserProfile } from '../types';
import { getSystemSettings } from '../services/database';
import { 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  Shield, 
  Zap, 
  Smartphone, 
  Search, 
  Layout as LayoutIcon,
  MessageCircle,
  Eye,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';
import { TestimonialCarousel, type Testimonial } from '../components/ui/testimonial';
import { ButtonColorful } from '../components/ui/button-colorful';

interface LandingPageProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function LandingPage({ user, profile }: LandingPageProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    getSystemSettings().then(s => {
      if (s) setSettings(s);
    });
  }, []);

  const portfolios = [
    { 
      title: 'Car Business', 
      category: 'Auto Speed UI', 
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop', 
      link: '/portfolio/autos',
      description: 'Premium showroom experience for car dealerships.'
    },
    { 
      title: 'Gym & Fitness', 
      category: 'Iron Pulse UI', 
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop', 
      link: '/portfolio/gym',
      description: 'High-energy landing page for fitness centers.'
    },
    { 
      title: 'Cargo Logistics', 
      category: 'Cargo Flow UI', 
      image: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=800&auto=format&fit=crop', 
      link: '/portfolio/cargo',
      description: 'Efficient tracking and management for logistics.'
    }
  ];

  const testimonialCards: Testimonial[] = [
    { 
      id: 1, 
      name: 'Rahul Sharma', 
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', 
      description: 'Got my gym website in 2 days. Super smooth! The design is top-notch and my clients love it.' 
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', 
      description: 'QUICWEB made our logistics portal look professional. The tracking feature is a game changer.' 
    },
    { 
      id: 3, 
      name: 'Amit Verma', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', 
      description: 'The Auto Speed UI is exactly what I needed for my showroom. Fast, clean, and mobile responsive.' 
    },
    { 
      id: 4, 
      name: 'Sneha Reddy', 
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop', 
      description: 'My online boutique took off after QUICWEB built my site. The payment integration is flawless and secure.' 
    },
    { 
      id: 5, 
      name: 'Vikram Singh', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', 
      description: 'Professional and fast. I can now showcase my real estate properties with high-quality galleries that load instantly.' 
    },
    { 
      id: 6, 
      name: 'Ananya Gupta', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', 
      description: 'The digital menu and reservation system have made my restaurant operations so much easier. Highly recommend QUICWEB!' 
    },
    { 
      id: 7, 
      name: 'Rajesh Kumar', 
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop', 
      description: 'Clean, professional, and exactly what I needed for my legal consultancy firm. The appointment booking feature is great.' 
    },
    { 
      id: 8, 
      name: 'Meera Iyer', 
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop', 
      description: 'As a tutor, I needed a platform to share resources. QUICWEB delivered a perfect portal in record time.' 
    },
    { 
      id: 9, 
      name: 'Karan Malhotra', 
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop', 
      description: 'My photography portfolio looks stunning. The dark theme really makes my photos pop. Great work by the team!' 
    },
    { 
      id: 10, 
      name: 'Pooja Sharma', 
      avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&auto=format&fit=crop', 
      description: 'The booking system for my salon is so intuitive. My clients find it very easy to schedule their appointments now.' 
    }
  ];

  const steps = [
    { title: 'Submit Request', description: 'Tell us about your business and requirements.' },
    { title: 'We Build', description: 'Our experts craft your custom website in 24-48 hours.' },
    { title: 'You Review', description: 'Check the preview and request any final tweaks.' },
    { title: 'Get Access', description: 'Launch your professional website to the world.' }
  ];

  return (
    <div className="bg-black">
      <SEO />
      
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919876543210" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all group"
      >
        <MessageCircle size={32} className="fill-white text-[#25D366]" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-xl">
          Chat with us on WhatsApp
        </span>
      </a>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E6FF00]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E6FF00]/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] text-white uppercase italic">
              Launch Your Business<br />
              <span className="text-[#E6FF00]">in 24 Hours.</span>
            </h1>

            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium text-white/60 leading-relaxed">
              QUICWEB builds premium, mobile-first websites for modern businesses. No coding. No stress. We build it for you while you focus on growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="group relative bg-[#E6FF00] text-black px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(230,255,0,0.3)] flex items-center gap-3"
                >
                  Go to Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  to="/auth" 
                  className="group relative bg-[#E6FF00] text-black px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(230,255,0,0.3)] flex items-center gap-3"
                >
                  Start Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <a 
                href="#portfolio" 
                className="flex items-center justify-center"
              >
                <ButtonColorful label="View Demo" className="h-14 px-10 rounded-2xl text-sm font-black uppercase tracking-widest" />
              </a>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 px-10 bg-black/20 relative overflow-hidden">
        {/* Crazy Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#E6FF00]/20 rounded-full animate-rotate-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#E6FF00]/10 rounded-full animate-rotate-glow [animation-direction:reverse]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">The Showcase</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Crazy <span className="text-[#E6FF00]">Portfolios.</span>
              </h3>
            </div>
            <div className="max-w-md space-y-4">
              <p className="text-white/40 text-sm font-medium leading-relaxed">
                We don't just build websites; we build digital experiences that defy gravity. Check out our industry-leading designs.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Joined by 500+ users</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolios.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  rotateX: 2,
                  rotateY: 2,
                  z: 20
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-[#E6FF00]/30 transition-all perspective-1000"
              >
                {/* Holographic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#E6FF00]/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" />
                
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    width="400"
                    height="300"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Live Badge */}
                  <div className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse z-30">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    Live Preview
                  </div>
                </div>
                <div className="p-10 space-y-6 relative z-30">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E6FF00] mb-2 block">{item.category}</span>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                    <p className="text-white/40 text-xs font-medium mt-2">{item.description}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link 
                      to={item.link} 
                      className="w-full py-4 bg-[#E6FF00] text-black rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(230,255,0,0.2)]"
                    >
                      <Eye size={14} /> Enter Experience
                    </Link>
                    <button className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Sparkles size={14} /> AI Analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-black/10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-10">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-black italic tracking-tighter uppercase">Trusted by 50+ businesses</span>
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold tracking-tighter">FITNESS FIRST</span>
              <span className="text-xl font-bold tracking-tighter">AUTO HUB</span>
              <span className="text-xl font-bold tracking-tighter">GLOBAL CARGO</span>
              <span className="text-xl font-bold tracking-tighter">TECH FLOW</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">The Process</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                How It <span className="text-[#E6FF00]">Works.</span>
              </h3>
            </div>
            <Link 
              to="/how-it-works" 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              View Full Process
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-8 group hover:border-[#E6FF00]/30 transition-all"
              >
                <div className="w-16 h-16 bg-[#E6FF00] rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_30px_rgba(230,255,0,0.2)] group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">{step.title}</h4>
                  <p className="text-white/40 text-xs font-medium leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-10 bg-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Why Choose Us</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight">
                Built for <span className="text-[#E6FF00]">Speed</span> & Performance.
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: Zap, title: 'Fast Delivery', desc: 'Get your site in 24-48 hours.' },
                { icon: Smartphone, title: 'Responsive', desc: 'Perfect on every device.' },
                { icon: Search, title: 'SEO Ready', desc: 'Rank higher on Google.' },
                { icon: LayoutIcon, title: 'Custom UI', desc: 'Unique design for your brand.' }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#E6FF00]/10 rounded-xl flex items-center justify-center text-[#E6FF00] shrink-0">
                    <feature.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black uppercase italic tracking-tighter text-sm">{feature.title}</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-[#E6FF00]/20 to-transparent rounded-[3rem] border border-white/10 p-8">
              <div className="w-full h-full bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop" 
                  alt="Dashboard Preview" 
                  width="600"
                  height="600"
                  loading="lazy"
                  className="w-full h-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center space-y-4 max-w-xs">
                    <div className="w-12 h-12 bg-[#E6FF00] rounded-full flex items-center justify-center text-black mx-auto">
                      <CheckCircle2 size={24} />
                    </div>
                    <h5 className="font-black uppercase italic tracking-tighter">Project Completed</h5>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your website is ready for launch.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Success Stories</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Trusted by <span className="text-[#E6FF00]">50+ Businesses.</span>
              </h3>
            </div>
            <Link 
              to="/testimonials" 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Read All Stories
            </Link>
          </div>

          <div className="flex justify-center scale-110 md:scale-125 py-20">
            <TestimonialCarousel testimonials={testimonialCards} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Pricing</h2>
            <Link to="/auth">
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic hover:text-[#E6FF00] transition-colors cursor-pointer">
                Simple <span className="text-[#E6FF00]">Affordable</span> Plans.
              </h3>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Starter Launch */}
            <div className="bg-white/5 border border-[#E6FF00]/30 p-12 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden group hover:border-[#E6FF00]/50 transition-all flex flex-col shadow-[0_0_40px_rgba(230,255,0,0.15)]">
              <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Starter Launch</h4>
                <div className="flex items-end justify-center gap-2 relative group/price">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#E6FF00] via-transparent to-[#E6FF00] rounded-full opacity-20 blur-xl animate-rotate-glow group-hover/price:opacity-40 transition-opacity" />
                  <span className="text-6xl font-black tracking-tighter text-[#E6FF00] relative z-10">₹{(settings?.pricing?.starter || 1499).toLocaleString()}/-</span>
                </div>
              </div>
              <ul className="space-y-6 text-left flex-1">
                {[
                  'Custom Domain Setup',
                  'Fast 48h Delivery',
                  'Mobile Responsive Design',
                  'Basic SEO Optimization',
                  'Real-time Chat Support',
                  'Project Dashboard Access'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                    <CheckCircle2 size={18} className="text-[#E6FF00]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center"
              >
                Get Started
              </a>
            </div>

            {/* Business Pro */}
            <div className="bg-[#E6FF00] border-[#E6FF00] p-12 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden shadow-[0_0_50px_rgba(230,255,0,0.3)] group hover:scale-[1.02] transition-all flex flex-col text-black">
              <div className="absolute top-0 right-0 bg-black text-[#E6FF00] px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest border-l border-b border-[#E6FF00]/20">
                Most Popular
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Business Pro</h4>
                <div className="flex items-end justify-center gap-2 relative group/price">
                  <div className="absolute -inset-4 bg-gradient-to-r from-black via-transparent to-black rounded-full opacity-0 blur-xl animate-rotate-glow group-hover/price:opacity-20 transition-opacity" />
                  <span className="text-6xl font-black tracking-tighter relative z-10">₹{(settings?.pricing?.pro || 3499).toLocaleString()}/-</span>
                </div>
              </div>
              <ul className="space-y-6 text-left flex-1">
                {[
                  'Custom Domain Setup',
                  'Priority 24h Delivery',
                  'Mobile Responsive Design',
                  'Advanced SEO Optimization',
                  'Real-time Chat Support',
                  'Project Dashboard Access',
                  'Custom Email Setup',
                  'Performance Reports'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-black/70">
                    <CheckCircle2 size={18} className="text-black" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="https://buy.stripe.com/test_28E28q5is4j29Lmgu3bAs08" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-6 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl text-center"
              >
                Start Pro Project
              </a>
            </div>

            {/* Enterprise Elite */}
            <div className="bg-white/5 border border-[#E6FF00]/30 p-12 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden group hover:border-[#E6FF00]/50 transition-all flex flex-col shadow-[0_0_40px_rgba(230,255,0,0.15)]">
              <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Enterprise Elite</h4>
                <div className="flex items-end justify-center gap-2 relative group/price">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#E6FF00] via-transparent to-[#E6FF00] rounded-full opacity-20 blur-xl animate-rotate-glow group-hover/price:opacity-40 transition-opacity" />
                  <span className="text-6xl font-black tracking-tighter text-[#E6FF00] relative z-10">₹{(settings?.pricing?.enterprise || 9999).toLocaleString()}/-</span>
                </div>
              </div>
              <ul className="space-y-6 text-left flex-1">
                {[
                  'Everything in Business Pro',
                  'Custom Web App Features',
                  'E-commerce Integration',
                  'Dedicated Account Manager',
                  '1 Year Free Maintenance',
                  'Premium Hosting Included'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                    <CheckCircle2 size={18} className="text-[#E6FF00]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="https://buy.stripe.com/test_eVqeVccKU9Dm2iU2DdbAs09" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center"
              >
                Go Elite
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#E6FF00] z-0" />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-black uppercase italic leading-[0.85]">
            Ready to launch<br />your website?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/auth" 
              className="bg-black text-white px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              Start Now
            </Link>
            <Link 
              to="/contact" 
              className="bg-white/20 backdrop-blur-md text-black border border-black/10 px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/30 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
