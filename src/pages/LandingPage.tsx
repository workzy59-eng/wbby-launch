import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FirebaseUser } from '../firebase';
import { SystemSettings, UserProfile } from '../types';
import { getSystemSettings } from '../services/database';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Shield, 
  Zap, 
  Smartphone, 
  Search, 
  Layout as LayoutIcon,
  MessageCircle,
  Eye,
  ExternalLink,
  Plus,
  Minus,
  MapPin,
  Video,
  X,
  ShieldCheck,
  Code,
  Phone,
  Briefcase,
  User,
  Clock
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
        title: 'Luxury Resorts', 
        category: 'Azure Haven UI', 
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop', 
        link: '/portfolio/resort',
        description: 'Ultra-premium hospitality experience for luxury resorts.'
      },
      { 
        title: 'Gym & Fitness', 
        category: 'Iron Pulse UI', 
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop', 
        link: '/portfolio/gym',
        description: 'High-energy, aggressive aesthetic for elite fitness centers.'
      },
      { 
        title: 'Designer Clothing', 
        category: 'Urban Thread UI', 
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop', 
        link: '/portfolio/clothing',
        description: 'Boutique e-commerce experience for luxury streetwear and high-fashion.'
      }
    ];

  const testimonialCards: Testimonial[] = [
    { 
      id: 1, 
      name: 'Rahul Sharma', 
      description: 'Got my gym website in 2 days. Super smooth! The design is top-notch and my clients love it.' 
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      description: 'WebbyLaunch made our logistics portal look professional. The tracking feature is a game changer.' 
    },
    { 
      id: 3, 
      name: 'Amit Verma', 
      description: 'The Auto Speed UI is exactly what I needed for my showroom. Fast, clean, and mobile responsive.' 
    },
    { 
      id: 4, 
      name: 'Sneha Reddy', 
      description: 'My online boutique took off after WebbyLaunch built my site. The payment integration is flawless and secure.' 
    },
    { 
      id: 5, 
      name: 'Vikram Singh', 
      description: 'Professional and fast. I can now showcase my real estate properties with high-quality galleries that load instantly.' 
    },
    { 
      id: 6, 
      name: 'Ananya Gupta', 
      description: 'The digital menu and reservation system have made my restaurant operations so much easier. Highly recommend WebbyLaunch!' 
    },
    { 
      id: 7, 
      name: 'Rajesh Kumar', 
      description: 'Clean, professional, and exactly what I needed for my legal consultancy firm. The appointment booking feature is great.' 
    },
    { 
      id: 8, 
      name: 'Meera Iyer', 
      description: 'As a tutor, I needed a platform to share resources. WebbyLaunch delivered a perfect portal in record time.' 
    },
    { 
      id: 9, 
      name: 'Karan Malhotra', 
      description: 'My photography portfolio looks stunning. The dark theme really makes my photos pop. Great work by the team!' 
    },
    { 
      id: 10, 
      name: 'Pooja Sharma', 
      description: 'The booking system for my salon is so intuitive. My clients find it very easy to schedule their appointments now.' 
    }
  ];

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const steps = [
    { title: 'Submit Request', description: 'Tell us about your business and requirements.' },
    { title: 'We Build', description: 'Our experts craft your custom website in 24-48 hours.' },
    { title: 'You Review', description: 'Check the preview and request any final tweaks.' },
    { title: 'Get Access', description: 'Launch your professional website to the world.' }
  ];

  const faqs = [
    {
      question: "What services do you offer?",
      answer: "We provide complete website solutions including design, development, hosting setup, and basic SEO to help your business grow online."
    },
    {
      question: "How long does it take to build a website?",
      answer: "Most websites are completed within 5–10 days, depending on features and how quickly you provide content."
    },
    {
      question: "Do I need to pay in advance?",
      answer: "Yes. We require an advance payment to start the project. This ensures commitment and allows us to begin work immediately."
    },
    {
      question: "What is included in the monthly subscription?",
      answer: "Our plans include website maintenance, hosting support, updates, and technical assistance so you don’t have to worry about anything."
    },
    {
      question: "Can I upgrade or change my plan later?",
      answer: "Absolutely! You can upgrade or switch plans anytime based on your business needs."
    },
    {
      question: "Will my website be mobile-friendly?",
      answer: "Yes, all websites we build are fully responsive and work perfectly on mobile, tablet, and desktop."
    },
    {
      question: "Do you provide SEO services?",
      answer: "Yes, we include basic SEO setup to help your website get indexed on search engines and improve visibility."
    },
    {
      question: "What if I need changes after the website is completed?",
      answer: "We offer revisions and ongoing updates as part of your subscription. Extra custom features may have additional charges."
    },
    {
      question: "What happens if I miss a monthly payment?",
      answer: "If payment is delayed, your website services may be temporarily paused until the payment is completed."
    },
    {
      question: "Why should I choose your service?",
      answer: "We provide affordable pricing, fast delivery, modern designs, and ongoing support—making it easy for any business to go online without hassle."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingType, setBillingType] = useState<'one-time' | 'subscription'>('one-time');

  const locations = [
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Chennai', slug: 'chennai' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#c7c42a] selection:text-black"
    >
      <SEO />
      
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex flex-col items-center justify-center overflow-hidden technical-grid">
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#c7c42a]/20 rounded-full blur-[200px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#c7c42a]/10 rounded-full blur-[180px]" 
          />
        </div>

        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-block px-6 py-2 bg-[#c7c42a] text-black text-[10px] font-black uppercase tracking-[0.6em] transform -skew-x-12 mb-12 italic shadow-[0_0_40px_rgba(199,196,42,0.4)]"
          >
            Elite Software Forge
          </motion.div>

          <div className="relative mb-12">
            <h1 className="text-[14vw] md:text-[16vw] font-black leading-[0.75] tracking-tighter uppercase italic flex flex-col">
              <motion.span 
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
              >
                Hyper
              </motion.span>
              <motion.span 
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
                className="text-[#c7c42a] relative"
              >
                Speed<span className="hidden md:inline">.</span>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute -bottom-4 left-0 w-full h-2 bg-white/10 origin-left" 
                />
              </motion.span>
            </h1>
            
            <div className="absolute -right-24 top-0 hidden 2xl:block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 border-2 border-dashed border-[#c7c42a]/30 rounded-full flex items-center justify-center"
              >
                 <div className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] text-center px-4 -rotate-[inherit]">
                    Bespoke <br /> Deployment
                 </div>
              </motion.div>
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl md:text-3xl max-w-3xl mx-auto mb-16 font-medium text-white/40 leading-tight italic"
          >
            Elevate your presence with <span className="text-white">Industrial-Grade Web Infrastructure</span>. Ready in under 48 hours.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Link 
              to={user ? "/onboarding" : "/auth"} 
              className="group relative bg-[#c7c42a] text-black px-16 py-6 font-black uppercase italic text-2xl tracking-tighter hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(199,196,42,0.2)] flex items-center gap-4"
            >
              Get Access Now
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <div className="flex gap-4">
              <a href="https://discord.gg/EDZb5Aefb" target="_blank" rel="noopener noreferrer" className="p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-full group">
                <Briefcase size={20} className="text-[#c7c42a] group-hover:scale-125 transition-transform" />
              </a>
              <Link to="/join-sales" className="p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-full group">
                <User size={20} className="text-[#c7c42a] group-hover:scale-125 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Marquee Section */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-white/10 bg-black/50 py-6 backdrop-blur-xl">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-12 px-12">
                <span className="text-2xl font-black italic tracking-tighter uppercase text-white/20 flex items-center gap-4">
                  High Performance <Zap size={20} className="text-[#c7c42a]" />
                </span>
                <span className="text-2xl font-black italic tracking-tighter uppercase text-white/20 flex items-center gap-4">
                  Mobile Optimized <Smartphone size={20} className="text-[#c7c42a]" />
                </span>
                <span className="text-2xl font-black italic tracking-tighter uppercase text-white/20 flex items-center gap-4">
                  24 Hour Delivery <Clock size={20} className="text-[#c7c42a]" />
                </span>
                <span className="text-2xl font-black italic tracking-tighter uppercase text-white/20 flex items-center gap-4">
                  Secure Systems <ShieldCheck size={20} className="text-[#c7c42a]" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Cloud Section */}
      <section className="py-20 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Trusted by Industry Leaders</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['FITNESS FIRST', 'AUTO HUB', 'GLOBAL CARGO', 'TECH FLOW', 'ZENITH RETAIL', 'NEXUS APPS'].map((logo, i) => (
              <span key={i} className="text-2xl font-black italic tracking-tighter uppercase text-white hover:text-[#c7c42a] transition-colors cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo / Preview Section */}
      <section id="demo" className="py-32 px-10 bg-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#c7c42a]/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative aspect-video bg-[#050505] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" 
                  alt="Live Demo" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-20 h-20 bg-[#c7c42a] rounded-full flex items-center justify-center text-black shadow-[0_0_50px_rgba(199,196,42,0.4)] group-hover:scale-110 transition-transform cursor-pointer">
                    <Zap size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 z-20 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Experience</span>
                  </div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">Interactive Dashboard UI</h4>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Experience</h2>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-tight">
                  Interactive <br />
                  <span className="text-[#c7c42a]">Live Demos.</span>
                </h3>
              </motion.div>
              <p className="text-white/40 text-lg font-medium italic leading-relaxed">
                Don't just take our word for it. Experience the speed, smoothness, and premium feel of our websites yourself. We build for the future.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <h5 className="text-[#c7c42a] font-black italic tracking-tighter">99.9%</h5>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Uptime Guaranteed</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <h5 className="text-[#c7c42a] font-black italic tracking-tighter">&lt; 1s</h5>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Load Time</p>
                </div>
              </div>
              <button 
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-[#c7c42a] text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(199,196,42,0.2)]"
              >
                Explore All Demos <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Meeting System Highlight */}
      <section className="py-32 px-10 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-transparent p-16 md:p-24 rounded-[4rem] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c7c42a]/5 rounded-full blur-[100px]" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Collaboration</h2>
                  <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-tight">
                    Professional <br />
                    <span className="text-[#c7c42a]">Meeting System.</span>
                  </h3>
                </div>
                <p className="text-white/40 text-lg font-medium italic leading-relaxed">
                  Stay connected with our built-in scheduling system. Join Zoom/Google Meet sessions, and track project progress in real-time.
                </p>
                <div className="space-y-4">
                  {[
                    "One-click Zoom/Google Meet integration",
                    "Real-time countdown to next meeting",
                    "Instant rescheduling & notifications",
                    "Direct chat with your dedicated admin"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-[#c7c42a]" />
                      <span className="text-sm font-bold text-white/60 italic">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Upcoming Meeting</div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">Project Kickoff</h4>
                    </div>
                    <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
                      <Video size={24} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <div className="text-3xl font-black italic tracking-tighter">14:20</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Time Left</div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <div className="text-3xl font-black italic tracking-tighter">Today</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Date</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                        const el = document.getElementById('pricing');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-5 bg-[#c7c42a] text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)]"
                  >
                    Join Now
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section 
        id="portfolio" 
        className="py-32 px-10 bg-[#050505] relative overflow-hidden technical-grid"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-32">
            <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-[0.6em] text-[#c7c42a]">Industry Standards</span>
              <h3 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">
                 <span className="font-serif italic text-white/20 block text-4xl md:text-6xl mb-4 tracking-normal normal-case">Featured</span>
                 Digital <span className="text-[#c7c42a]">Assets.</span>
              </h3>
            </div>
            <div className="max-w-md">
              <p className="text-white/40 text-lg font-medium italic leading-relaxed">
                We believe in architectural honesty. Our builds are optimized for performance, conversion, and surgical precision.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {portfolios.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group relative bg-[#050505] p-px overflow-hidden"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute inset-0 p-12 flex flex-col justify-end transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] mb-4">{item.category}</span>
                    <h4 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">{item.title}</h4>
                    <p className="text-white/40 text-sm font-medium italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.description}</p>
                    
                    <Link 
                      to={item.link} 
                      className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors"
                    >
                      Enter Experience <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem -> Solution Section */}
      <section className="py-32 px-10 bg-[#050505] relative overflow-hidden technical-grid border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-[#0a0a0a] border border-white/5 p-16 md:p-24 space-y-12 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-red-500">Industry Friction</span>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight italic">
                  Traditional <br />
                  <span className="text-white/10">Methodology.</span>
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Wait 3 months for a simple landing page",
                  "Pay ₹50,000+ upfront with zero guarantee",
                  "Complex tech talk that confuses you",
                  "No support after the site goes live"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-5 h-px bg-red-500/30 group-hover:w-8 transition-all" />
                    <span className="text-sm font-medium text-white/30 italic uppercase tracking-widest">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-[#c7c42a] p-16 md:p-24 space-y-12 flex flex-col justify-between transform lg:translate-y-12"
            >
              <div className="space-y-6 text-black">
                <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40">The Breakthrough</span>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight italic">
                  The Webby <br />
                  <span>Velocity.</span>
                </h3>
              </div>
              <div className="space-y-4 text-black">
                {[
                  "Your site live in just 24-48 hours",
                  "Transparent monthly plans with no risk",
                  "Zero tech knowledge required from you",
                  "Lifetime maintenance and expert support"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-5 h-px bg-black/30 group-hover:w-8 transition-all" />
                    <span className="text-lg font-black uppercase tracking-tight italic">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
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
      <section 
        id="how-it-works" 
        className="py-32 px-10 bg-[#050505]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <span className="text-xs font-black uppercase tracking-[0.6em] text-[#c7c42a]">The Methodology</span>
            <h3 className="text-7xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.8] mt-8">
              Surgical <span className="text-[#c7c42a]">Execution.</span>
            </h3>
          </div>

          <div id="process-steps" className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-[#050505] p-16 md:p-24 relative group overflow-hidden"
              >
                <div className="absolute top-12 left-12 text-[120px] font-serif italic font-black text-white/[0.03] leading-none select-none group-hover:text-[#c7c42a]/10 transition-colors">
                  0{idx + 1}
                </div>
                <div className="relative z-10 space-y-8">
                  <h4 className="text-4xl font-black uppercase italic tracking-tighter">{step.title}</h4>
                  <p className="text-white/40 text-lg font-medium italic leading-relaxed">{step.description}</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c7c42a] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section - Hardware feel */}
      <section className="py-32 px-10 bg-[#0a0a0a] technical-grid relative border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-16">
            <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a] px-4 py-1.2 border border-[#c7c42a]/30 inline-block">Specialist Build</span>
              <h3 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] text-white">
                Technical <br />
                <span className="text-[#c7c42a]/50">Superiority.</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {[
                { icon: Zap, title: '24h Delivery', desc: 'Surgical deployment in hours, not months.' },
                { icon: Smartphone, title: 'Ultra-Fluid', desc: 'Psychologically optimized mobile UX.' },
                { icon: Search, title: 'SEO Engine', desc: 'Engineered for search visibility.' },
                { icon: LayoutIcon, title: 'Custom DNA', desc: 'Every build coded from the ground up.' }
              ].map((feature, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-[#c7c42a] animate-pulse" />
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-white">{feature.title}</h4>
                  </div>
                  <p className="text-white/30 text-sm font-medium italic leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#c7c42a]/5 blur-[80px] rounded-full" />
            <div className="relative aspect-square border border-white/10 p-4 rounded-3xl bg-[#111]">
              <div className="w-full h-full bg-black rounded-2xl overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200" 
                  alt="Tech" 
                  className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                   <div className="w-full h-full border border-white/5 flex flex-col items-center justify-center space-y-6 bg-black/60 backdrop-blur-xl">
                      <div className="text-[10px] font-mono tracking-[0.5em] text-[#c7c42a]">STATUS: OPTIMIZED</div>
                      <div className="w-48 h-px bg-white/10" />
                      <div className="text-center">
                        <div className="text-6xl font-black italic tracking-tighter text-white">99+</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-white/30">Google PageSpeed</div>
                      </div>
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Success Stories</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Trusted by <span className="text-[#c7c42a]">50+ Businesses.</span>
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

          {/* Ready to be next success story */}
          <motion.div 
            onMouseMove={handleMouseMove}
            className="mt-32 p-20 rounded-[4rem] bg-white/5 border border-white/10 relative overflow-hidden group text-center"
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(199,196,42,0.15), transparent 40%)`
              }}
            />
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                Ready to be our <br />
                <span className="text-[#c7c42a]">Next Success Story?</span>
              </h2>
              <p className="text-xl text-white/40 font-medium italic max-w-2xl mx-auto">
                Join hundreds of businesses that have transformed their digital presence with Webbylaunch.
              </p>
              <Link 
                to="/auth"
                className="inline-flex px-12 py-6 bg-[#c7c42a] text-black rounded-2xl font-black uppercase italic text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(199,196,42,0.2)]"
              >
                Start Your Journey
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-24">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Pricing</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Simple <span className="text-[#c7c42a]">Affordable</span> Plans.
              </h3>
              <div className="flex flex-col items-center gap-4 pt-6">
                <div className="flex items-center gap-3 px-6 py-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Only 5 project slots left this month</span>
                </div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">
                  Launch Offer: Free Meeting + Free SEO Setup included in all plans
                </p>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-8 py-8">
              <button 
                onClick={() => setBillingType('one-time')}
                className={`text-xs font-black uppercase tracking-widest transition-all px-6 py-2 border-b-2 ${billingType === 'one-time' ? 'text-[#c7c42a] border-[#c7c42a]' : 'text-white/20 border-transparent hover:text-white/40'}`}
              >
                One-Time
              </button>
              <button 
                onClick={() => setBillingType('subscription')}
                className={`text-xs font-black uppercase tracking-widest transition-all px-6 py-2 border-b-2 ${billingType === 'subscription' ? 'text-[#c7c42a] border-[#c7c42a]' : 'text-white/20 border-transparent hover:text-white/40'}`}
              >
                Subscription
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Only 5 project slots left this month</span>
               </div>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic opacity-60">
                  Launch Offer: Free Meeting + Free SEO Setup included in all plans
               </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden max-w-7xl mx-auto">
            {[
              { 
                name: 'Basic', 
                price: billingType === 'one-time' ? '5,000' : '999', 
                features: ['1–3 Pages Website', 'Basic Design', 'Mobile Responsive', 'Hosting Included', 'Free SEO Setup', 'Domain (1st Year Free)'],
                popular: false,
                color: 'text-white/40'
              },
              { 
                name: 'Standard', 
                price: billingType === 'one-time' ? '15,000' : '5,999', 
                features: ['5–7 Pages Website', 'Premium Design', 'Free SEO Setup', 'Meeting System', 'Priority Support', 'Domain (1st Year Free)', 'Custom Email Setup'],
                popular: true,
                color: 'text-[#c7c42a]'
              },
              { 
                name: 'Custom', 
                price: billingType === 'one-time' ? '30,000' : '9,999', 
                features: ['Full Custom Website', 'Admin Dashboard', 'Free SEO Setup', 'Meetings + Chat System', 'Fast Support', 'Domain (1st Year Free)', 'Advanced Analytics'],
                popular: false,
                color: 'text-white'
              }
            ].map((plan, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`bg-[#050505] p-16 space-y-12 flex flex-col justify-between relative group ${plan.popular ? 'z-10 bg-[#0a0a0a]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
                )}
                
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-2xl font-black uppercase italic tracking-tighter ${plan.color}`}>{plan.name}</h4>
                    {plan.popular && <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#c7c42a] px-2 py-1 border border-[#c7c42a]/30">Popular Choice</span>}
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-serif italic text-white/20">₹</span>
                    <span className="text-8xl font-black tracking-tighter text-white">{plan.price}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white/20 ml-2 italic">{billingType === 'one-time' ? 'Fixed' : '/mo'}</span>
                  </div>

                  <div className="w-12 h-px bg-white/10" />

                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/40 italic uppercase tracking-tighter group-hover:text-white/60 transition-colors">
                        <div className="w-1 h-1 bg-[#c7c42a]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  to={user ? "/onboarding" : "/auth"}
                  className={`block w-full py-6 text-center font-black uppercase italic text-sm tracking-widest transition-all ${plan.popular ? 'bg-[#c7c42a] text-black border border-black shadow-[0_20px_50px_rgba(199,196,42,0.1)]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                >
                  Configure Stack
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="py-32 px-10 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
             <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Specification</span>
            <h3 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mt-4">Feature <span className="text-white/10">Matrix.</span></h3>
          </div>
          
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Feature</th>
                  <th className="py-8 px-6 text-center text-[10px] font-black uppercase tracking-widest text-white/40">Basic</th>
                  <th className="py-8 px-6 text-center text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Standard</th>
                  <th className="py-8 px-6 text-center text-[10px] font-black uppercase tracking-widest text-white/40">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Website Pages", basic: "1–3", standard: "5–7", pro: "Unlimited" },
                  { name: "Custom Design", basic: "Basic", standard: "Premium", pro: "Elite Custom" },
                  { name: "Mobile Responsive", basic: true, standard: true, pro: true },
                  { name: "SEO Optimization", basic: "Basic", standard: "Advanced", pro: "Full Strategy" },
                  { name: "Meeting System", basic: false, standard: true, pro: true },
                  { name: "Direct Chat Support", basic: true, standard: true, pro: true },
                  { name: "Custom Email", basic: false, standard: "2 Accounts", pro: "Unlimited" },
                  { name: "Admin Dashboard", basic: false, standard: false, pro: true },
                  { name: "E-commerce", basic: false, standard: false, pro: "Optional" },
                  { name: "Maintenance", basic: "Monthly", standard: "Priority", pro: "24/7 Dedicated" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-6 px-6 text-sm font-bold text-white/60 italic">{row.name}</td>
                    <td className="py-6 px-6 text-center">
                      {typeof row.basic === 'boolean' ? (row.basic ? <CheckCircle2 size={16} className="mx-auto text-[#c7c42a]" /> : <X size={16} className="mx-auto text-white/10" />) : <span className="text-xs font-black uppercase text-white/40">{row.basic}</span>}
                    </td>
                    <td className="py-6 px-6 text-center bg-[#c7c42a]/5">
                      {typeof row.standard === 'boolean' ? (row.standard ? <CheckCircle2 size={16} className="mx-auto text-[#c7c42a]" /> : <X size={16} className="mx-auto text-white/10" />) : <span className="text-xs font-black uppercase text-[#c7c42a]">{row.standard}</span>}
                    </td>
                    <td className="py-6 px-6 text-center">
                      {typeof row.pro === 'boolean' ? (row.pro ? <CheckCircle2 size={16} className="mx-auto text-[#c7c42a]" /> : <X size={16} className="mx-auto text-white/10" />) : <span className="text-xs font-black uppercase text-white/40">{row.pro}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        className="py-64 px-10 relative overflow-hidden bg-[#050505] technical-grid border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <span className="text-xs font-black uppercase tracking-[0.8em] text-[#c7c42a]">The Final Entry</span>
            <h3 className="text-[10vw] md:text-[12vw] font-black tracking-tighter uppercase leading-[0.75] italic text-white animate-slam-in">
              Ready <span className="text-[#c7c42a]">to Build?</span>
            </h3>
            <p className="text-white/30 text-2xl max-w-2xl mx-auto font-medium italic leading-tight">
              We are currently accepting <span className="text-white"> 3 new project slots </span> for this week. Guaranteed 24-hour turnaround.
            </p>
            <div className="pt-12">
              <Link 
                to="/auth"
                className="group relative inline-flex items-center gap-6 bg-[#c7c42a] text-black px-24 py-8 font-black text-2xl uppercase italic hover:scale-110 active:scale-95 transition-all shadow-[0_30px_60px_rgba(199,196,42,0.2)]"
              >
                Launch Now
                <ArrowRight size={28} className="group-hover:translate-x-4 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advantage Section */}
      <section className="py-32 px-10 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-32">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Edge</span>
            <h3 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
              Strategic <br />
              <span className="text-white/10">Advantage.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Affordable Plans", value: "Starting from ₹1499/mo", desc: "Premium engineering at startup-friendly scale." },
              { title: "Fast Delivery", value: "3–7 Days", desc: "From concept to deployment in under a week." },
              { title: "Mobile-First", value: "80% Reach", desc: "Engineered for the mobile-first Indian ecosystem." },
              { title: "SEO-Ready", value: "Index Ready", desc: "Built with search performance in every line of code." },
              { title: "Trust Backed", value: "Risk Neutral", desc: "Satisfaction guaranteed or setup cost reversed." },
              { title: "Ongoing Support", value: "Continuous", desc: "Long-term partnership beyond the initial launch." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#0a0a0a] p-12 space-y-6 rounded-[2.5rem] border border-white/5 hover:border-[#c7c42a]/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#c7c42a]" />
                  <h4 className="text-lg font-black uppercase italic tracking-tighter text-white/40 group-hover:text-white transition-colors">{item.title}</h4>
                </div>
                <p className="text-3xl font-black text-[#c7c42a] tracking-tighter uppercase italic leading-none">{item.value}</p>
                <p className="text-white/20 text-xs font-medium italic leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-32 px-10 bg-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <div className="w-24 h-24 rounded-full bg-[#c7c42a]/10 border border-[#c7c42a]/20 mx-auto flex items-center justify-center text-[#c7c42a]">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-[#c7c42a]">A Message from the Founder</h3>
            <p className="text-xl text-white/60 font-medium italic leading-relaxed">
              "I started WebbyLaunch because I saw too many small businesses getting overcharged for slow, outdated websites. Our mission is simple: high-converting, premium digital presences delivered in days, not months. We don't just build websites; we build growth engines."
            </p>
            <div className="pt-4">
              <p className="text-sm font-black uppercase tracking-widest text-white">SAI ROSHAN</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Founder, WebbyLaunch</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-10 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Questions</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              Common <span className="text-[#c7c42a]">FAQs.</span>
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-black uppercase italic tracking-tighter">{faq.question}</span>
                  {openFaq === idx ? <Minus className="text-[#c7c42a]" /> : <Plus className="text-[#c7c42a]" />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-6"
                    >
                      <p className="text-white/60 font-medium italic leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local SEO Section */}
      <section className="py-20 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Serving Businesses Across India</h4>
          <div className="flex flex-wrap justify-center gap-6">
            {locations.map((loc) => (
              <Link 
                key={loc.slug} 
                to={`/web-development-${loc.slug}`}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#c7c42a] hover:text-black transition-all"
              >
                <MapPin size={12} />
                {loc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
