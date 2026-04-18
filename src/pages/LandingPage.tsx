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
  User
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
      transition={{ duration: 0.5 }}
      className="bg-black"
    >
      <SEO />
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c7c42a]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c7c42a]/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] text-white uppercase italic">
              Get Your Business<br />
              <span className="text-[#c7c42a]">Online in 24 Hours.</span>
            </h1>

            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium text-white/60 leading-relaxed">
              Stop losing customers to competitors with better websites. We build your premium, high-converting site in record time so you can start selling immediately.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to={user ? "/onboarding" : "/auth"} 
                className="group relative bg-[#c7c42a] text-black px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(199,196,42,0.3)] flex items-center gap-3"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/join-developer" 
                className="group relative bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
              >
                Join as Dev
                <Briefcase size={18} className="text-[#c7c42a]" />
              </Link>
              <Link 
                to="/join-sales" 
                className="group relative bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
              >
                Join as Sales
                <User size={18} className="text-[#c7c42a]" />
              </Link>
            </div>
          </motion.div>
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
              <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
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
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Experience</h2>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-tight">
                  Interactive <br />
                  <span className="text-[#c7c42a]">Live Demos.</span>
                </h3>
              </div>
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
                <div className="bg-black/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 px-10 bg-black/20 relative overflow-hidden">
        {/* Crazy Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#c7c42a]/20 rounded-full animate-rotate-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#c7c42a]/10 rounded-full animate-rotate-glow [animation-direction:reverse]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Showcase</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Crazy <span className="text-[#c7c42a]">Portfolios.</span>
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
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
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
                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-[#c7c42a]/30 transition-all perspective-1000"
              >
                {/* Holographic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#c7c42a]/10 via-transparent to-#c7c42a/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" />
                
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
                  {/* Live Badge removed as requested */}
                </div>
                <div className="p-10 space-y-6 relative z-30">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] mb-2 block">{item.category}</span>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                    <p className="text-white/40 text-xs font-medium mt-2">{item.description}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link 
                      to={item.link} 
                      className="w-full py-4 bg-[#c7c42a] text-black rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(199,196,42,0.2)]"
                    >
                      <Eye size={14} /> Enter Experience
                    </Link>
                    {/* AI Analysis button removed as requested */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem -> Solution Section */}
      <section className="py-32 px-10 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-red-500">The Problem</h2>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white">
                  Traditional Agency <br />
                  <span className="text-red-500/50">Slows You Down.</span>
                </h3>
              </div>
              <div className="space-y-6">
                {[
                  { icon: X, text: "Wait 3 months for a simple landing page", color: "text-red-500" },
                  { icon: X, text: "Pay ₹50,000+ upfront with zero guarantee", color: "text-red-500" },
                  { icon: X, text: "Complex tech talk that confuses you", color: "text-red-500" },
                  { icon: X, text: "No support after the site goes live", color: "text-red-500" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className={`w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-lg font-bold text-white/60 italic">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Webby Solution</h2>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white">
                  We Build. <br />
                  <span className="text-[#c7c42a]">You Grow.</span>
                </h3>
              </div>
              <div className="space-y-6">
                {[
                  { icon: CheckCircle2, text: "Your site live in just 24-48 hours", color: "text-[#c7c42a]" },
                  { icon: CheckCircle2, text: "Transparent monthly plans with no risk", color: "text-[#c7c42a]" },
                  { icon: CheckCircle2, text: "Zero tech knowledge required from you", color: "text-[#c7c42a]" },
                  { icon: CheckCircle2, text: "Lifetime maintenance and expert support", color: "text-[#c7c42a]" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-[#c7c42a]/5 p-6 rounded-2xl border border-[#c7c42a]/10">
                    <div className={`w-10 h-10 rounded-full bg-[#c7c42a]/10 flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-lg font-black text-white italic">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
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
      <section id="how-it-works" className="py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Process</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                How It <span className="text-[#c7c42a]">Works.</span>
              </h3>
            </div>
            <a 
              href="#process-steps" 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              View Full Process
            </a>
          </div>

          <div id="process-steps" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-8 group hover:border-[#c7c42a]/30 transition-all"
              >
                <div className="w-16 h-16 bg-[#c7c42a] rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_30px_rgba(199,196,42,0.2)] group-hover:scale-110 transition-transform">
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Why Choose Us</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight">
                Built for <span className="text-[#c7c42a]">Speed</span> & Performance.
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
                  <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-xl flex items-center justify-center text-[#c7c42a] shrink-0">
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
            <div className="aspect-square bg-gradient-to-br from-[#c7c42a]/20 to-transparent rounded-[3rem] border border-white/10 p-8">
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
                    <div className="w-12 h-12 bg-[#c7c42a] rounded-full flex items-center justify-center text-black mx-auto">
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
            <div className="flex items-center justify-center gap-4">
              <span className={`text-xs font-black uppercase tracking-widest transition-colors ${billingType === 'one-time' ? 'text-white' : 'text-white/40'}`}>One-Time</span>
              <button 
                onClick={() => setBillingType(billingType === 'one-time' ? 'subscription' : 'one-time')}
                className="w-16 h-8 bg-white/10 rounded-full p-1 relative transition-all"
              >
                <div className={`w-6 h-6 bg-[#c7c42a] rounded-full transition-all ${billingType === 'subscription' ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-black uppercase tracking-widest transition-colors ${billingType === 'subscription' ? 'text-white' : 'text-white/40'}`}>Subscription</span>
            </div>
            
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              No hidden costs. Domain included for first year. Transparent pricing.
            </p>
            <div className="flex items-center justify-center gap-2 pt-4">
              <Shield size={14} className="text-[#c7c42a]" />
              {/* Removed 100% Money Back Guarantee */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Starter Launch */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="pricing-glow-card p-1 rounded-[3.5rem]"
            >
              <div className="bg-[#0B0B0B] border border-white/10 p-12 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden group hover:border-[#c7c42a]/30 transition-all flex flex-col h-full">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Basic</h4>
                  <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-black italic text-[#c7c42a]/60">₹</span>
                    <span className="text-6xl font-black tracking-tighter text-[#c7c42a]">
                      {billingType === 'one-time' ? '5,000' : '999'}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest ml-2 text-white/40">{billingType === 'one-time' ? 'Once' : '/mo'}</span>
                  </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">+ ₹1,999 setup cost</div>
                  </div>
                </div>
                  <ul className="space-y-6 text-left flex-1">
                  {[
                    '1–3 Pages Website',
                    'Basic Design',
                    'Mobile Responsive',
                    'Hosting Included',
                    'Free SEO Setup',
                    'Domain (1st Year Free)'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                      <CheckCircle2 size={18} className="text-[#c7c42a]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={user ? "/onboarding" : "/auth"}
                  className="block w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Business Pro */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="pricing-glow-card p-1 rounded-[3.5rem]"
            >
              <div className="bg-[#c7c42a] border-[#c7c42a] p-12 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden shadow-[0_0_50px_rgba(199,196,42,0.3)] group hover:scale-[1.02] transition-all flex flex-col h-full text-black">
                <div className="absolute top-0 right-0 bg-black text-[#c7c42a] px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest border-l border-b border-[#c7c42a]/20">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Standard</h4>
                  <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-black italic text-white/40">₹</span>
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {billingType === 'one-time' ? '15,000' : '5,999'}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest ml-2 text-white/40">{billingType === 'one-time' ? 'Once' : '/mo'}</span>
                  </div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">+ ₹2,999 setup cost</div>
                  </div>
                </div>
                  <ul className="space-y-6 text-left flex-1">
                  {[
                    '5–7 Pages Website',
                    'Premium Design',
                    'Free SEO Setup',
                    'Meeting System',
                    'Priority Support',
                    'Domain (1st Year Free)',
                    'Custom Email Setup'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/70">
                      <CheckCircle2 size={18} className="text-white" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={user ? "/onboarding" : "/auth"}
                  className="block w-full py-6 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl text-center"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Enterprise Elite */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="pricing-glow-card p-1 rounded-[3.5rem]"
            >
              <div className="bg-[#0B0B0B] border border-[#c7c42a]/30 p-12 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden group hover:border-[#c7c42a] transition-all flex flex-col h-full">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter text-[#c7c42a]">Custom Pro</h4>
                  <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-black italic text-[#c7c42a]/60">₹</span>
                    <span className="text-6xl font-black tracking-tighter text-[#c7c42a]">
                      {billingType === 'one-time' ? '30,000' : '9,999'}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest ml-2 text-white/40">{billingType === 'one-time' ? 'Once' : '/mo'}</span>
                  </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">+ ₹4,999 setup cost</div>
                  </div>
                </div>
                  <ul className="space-y-6 text-left flex-1">
                  {[
                    'Full Custom Website',
                    'Admin Dashboard',
                    'Free SEO Setup',
                    'Meetings + Chat System',
                    'Fast Support',
                    'Domain (1st Year Free)',
                    'Advanced Analytics'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                      <CheckCircle2 size={18} className="text-[#c7c42a]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={user ? "/onboarding" : "/auth"}
                  className="block w-full py-6 bg-[#c7c42a] text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all text-center shadow-[0_0_30px_rgba(199,196,42,0.2)]"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="py-32 px-10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter">Compare <span className="text-[#c7c42a]">Features.</span></h3>
          </div>
          
          <div className="overflow-x-auto">
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

      {/* Ready to be our Next Success Story? */}
      <section 
        className="py-32 px-10 relative overflow-hidden bg-black group"
        onMouseMove={handleMouseMove}
      >
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(199, 196, 42, 0.15), transparent 40%)`
          }}
        />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Your Turn</h2>
            <h3 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-white">
              Get Your Business <br />
              <span className="text-[#c7c42a]">Online in 24 Hours.</span>
            </h3>
            <p className="text-white/60 text-xl max-w-2xl mx-auto font-medium italic">
              Modern, fast, and scalable websites with powerful dashboards. Delivered in 3–7 days with zero hassle.
            </p>
            <div className="pt-8">
              <Link 
                to="/onboarding"
                className="inline-block bg-[#c7c42a] text-black px-12 py-5 rounded-full font-black text-xl uppercase italic hover:scale-105 transition-all shadow-[0_0_50px_rgba(199, 196, 42, 0.3)]"
              >
                Start Your Journey
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Webby Launch Section */}
      <section className="py-32 px-10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Advantage</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              Why <span className="text-[#c7c42a]">Webby Launch?</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Affordable Plans", value: "Starting from ₹1499/month", desc: "Premium quality at startup-friendly prices." },
              { title: "Fast Delivery", value: "3–7 Days", desc: "Get your business online in record time." },
              { title: "Mobile-First", value: "80% Mobile Users", desc: "Optimized for the devices your customers use most." },
              { title: "SEO-Ready", value: "Day 1 Optimization", desc: "Built-in structure to rank higher on Google." },
              { title: "Trust Backed", value: "Money Back Guarantee", desc: "Not satisfied? We'll refund your setup cost." },
              { title: "Ongoing Support", value: "Updates & Help", desc: "We're here for you even after the launch." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-4 hover:border-[#c7c42a]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#c7c42a] rounded-full" />
                  <h4 className="text-xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                </div>
                <p className="text-2xl font-black text-[#c7c42a] tracking-tighter uppercase italic">{item.value}</p>
                <p className="text-white/40 text-sm font-medium italic">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Join Our Team Section */}
        <section className="py-32 px-10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#c7c42a] rounded-full blur-[120px] opacity-10"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-#c7c42a rounded-full blur-[120px] opacity-10"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                  <div className="inline-block px-6 py-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a] italic">
                    Careers
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.8]">
                    Build the <br />
                    <span className="text-[#c7c42a]">Future</span> of Web.
                  </h2>
                  <p className="text-xl text-white/40 font-medium italic leading-relaxed">
                    We're looking for talented developers and sales experts to join our mission of putting every Indian business online.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link 
                    to="/join-developer"
                    className="group bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-[#c7c42a] transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-xl flex items-center justify-center text-[#c7c42a] group-hover:bg-black/10 group-hover:text-black mb-6 transition-all">
                      <Code size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter group-hover:text-black transition-all">Join as Developer</h3>
                    <p className="text-white/40 text-sm font-medium italic mt-2 group-hover:text-black/60 transition-all">Build premium UIs</p>
                  </Link>
                  
                  <Link 
                    to="/join-sales"
                    className="group bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-[#c7c42a] transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-xl flex items-center justify-center text-[#c7c42a] group-hover:bg-black/10 group-hover:text-black mb-6 transition-all">
                      <Phone size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter group-hover:text-black transition-all">Join as Sales</h3>
                    <p className="text-white/40 text-sm font-medium italic mt-2 group-hover:text-black/60 transition-all">Earn high commissions</p>
                  </Link>
                </div>
              </div>
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
