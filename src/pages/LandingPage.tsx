import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
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
  MessageCircle
} from 'lucide-react';
import SEO from '../components/SEO';

interface LandingPageProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function LandingPage({ user, profile }: LandingPageProps) {
  const portfolios = [
    { 
      title: 'Car Business', 
      category: 'Auto Speed UI', 
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200', 
      link: '/portfolio/autos',
      description: 'Premium showroom experience for car dealerships.'
    },
    { 
      title: 'Gym & Fitness', 
      category: 'Iron Pulse UI', 
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200', 
      link: '/portfolio/gym',
      description: 'High-energy landing page for fitness centers.'
    },
    { 
      title: 'Logistics', 
      category: 'Cargo Flow UI', 
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200', 
      link: '/portfolio/cargo',
      description: 'Efficient tracking and management for logistics.'
    }
  ];

  const testimonials = [
    { name: 'Rahul Sharma', role: 'Gym Owner', text: 'Got my gym website in 2 days. Super smooth! The design is top-notch and my clients love it.', rating: 5 },
    { name: 'Priya Patel', role: 'Logistics Manager', text: 'WebbyLaunch made our logistics portal look professional. The tracking feature is a game changer.', rating: 5 },
    { name: 'Amit Verma', role: 'Car Dealer', text: 'The Auto Speed UI is exactly what I needed for my showroom. Fast, clean, and mobile responsive.', rating: 5 }
  ];

  const steps = [
    { title: 'Submit Request', description: 'Tell us about your business and requirements.' },
    { title: 'We Build', description: 'Our experts craft your custom website in 24-48 hours.' },
    { title: 'You Review', description: 'Check the preview and request any final tweaks.' },
    { title: 'Get Access', description: 'Launch your professional website to the world.' }
  ];

  return (
    <div className="bg-[#4A5D4E]">
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
      <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E6FF00]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E6FF00]/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <span className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E6FF00]">Limited slots available today</span>
            </div>

            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] text-white uppercase italic">
              Get Your Business Website<br />
              <span className="text-[#E6FF00]">in 24 Hours.</span>
            </h1>

            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium text-white/60 leading-relaxed">
              We build professional websites for small businesses. No coding. No stress. We build it for you while you focus on your business.
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
                className="px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3"
              >
                View Demo
              </a>
            </div>

            <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Trusted by 50+ Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} />
                <span className="text-xs font-black uppercase tracking-widest">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Secure & Fast</span>
              </div>
            </div>
          </motion.div>
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

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 px-10 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Our Portfolio</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Choose Your <span className="text-[#E6FF00]">Industry.</span>
              </h3>
            </div>
            <p className="max-w-md text-white/40 text-sm font-medium leading-relaxed">
              We specialize in high-conversion websites for specific niches. Select a template that fits your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolios.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-[#E6FF00]/30 transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-10 space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E6FF00] mb-2 block">{item.category}</span>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                    <p className="text-white/40 text-xs font-medium mt-2">{item.description}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link 
                      to={item.link} 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      View Demo
                    </Link>
                    <Link 
                      to="/auth" 
                      className="w-full py-4 bg-[#E6FF00] text-black rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                      Get This Website
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">The Process</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              How It <span className="text-[#E6FF00]">Works.</span>
            </h3>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl space-y-6 text-center lg:text-left"
                >
                  <div className="w-16 h-16 bg-[#E6FF00] rounded-2xl flex items-center justify-center text-black font-black text-2xl mx-auto lg:mx-0 shadow-[0_0_30px_rgba(230,255,0,0.2)]">
                    {idx + 1}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{step.title}</h4>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426" 
                  alt="Dashboard Preview" 
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
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Success Stories</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              Trusted by <span className="text-[#E6FF00]">50+ Businesses.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] space-y-8">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#E6FF00] text-[#E6FF00]" />
                  ))}
                </div>
                <p className="text-lg font-medium leading-relaxed italic text-white/80">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#E6FF00] font-black">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic tracking-tighter text-sm">{t.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Pricing</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              Simple <span className="text-[#E6FF00]">Affordable</span> Plans.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Starter Launch */}
            <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center space-y-10 relative overflow-hidden group hover:border-[#E6FF00]/30 transition-all">
              <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Starter Launch</h4>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-6xl font-black tracking-tighter text-[#E6FF00]">₹1,499/-</span>
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
              <Link 
                to="/auth" 
                className="block w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Business Pro */}
            <div className="bg-white/5 border-2 border-[#E6FF00]/30 p-12 rounded-[3rem] text-center space-y-10 relative overflow-hidden shadow-[0_0_50px_rgba(230,255,0,0.1)] group hover:border-[#E6FF00]/50 transition-all">
              <div className="absolute top-0 right-0 bg-[#E6FF00] text-black px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                Most Popular
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Business Pro</h4>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-6xl font-black tracking-tighter text-[#E6FF00]">₹1,499/-</span>
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
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                    <CheckCircle2 size={18} className="text-[#E6FF00]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                to="/auth" 
                className="block w-full py-6 bg-[#E6FF00] text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]"
              >
                Start Pro Project
              </Link>
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
