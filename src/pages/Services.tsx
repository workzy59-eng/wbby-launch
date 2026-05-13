import React from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  LayoutDashboard, 
  ShoppingBag, 
  TrendingUp, 
  LifeBuoy, 
  CheckCircle2, 
  Store, 
  Rocket, 
  User, 
  GraduationCap, 
  Activity as ZapIcon, 
  IndianRupee, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  MousePointer2
} from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { PROFESSIONAL_EMAIL } from '../constants';

export default function Services() {
  const services = [
    { 
      icon: Code2, 
      title: 'Website Development', 
      desc: 'Custom websites for businesses, portfolios, and startups. Fast, responsive, and modern.',
      featured: false
    },
    { 
      icon: LayoutDashboard, 
      title: 'Custom Dashboards', 
      desc: 'Admin panels, client dashboards, and user management systems built for real business use.',
      featured: true,
      badge: 'Most Powerful'
    },
    { 
      icon: ShoppingBag, 
      title: 'E-Commerce Solutions', 
      desc: 'Online stores with product management, payments, and order tracking.',
      featured: false
    },
    { 
      icon: TrendingUp, 
      title: 'SEO & Optimization', 
      desc: 'Optimize your website for Google ranking, speed, and performance.',
      featured: false
    },
    { 
      icon: LifeBuoy, 
      title: 'Maintenance & Support', 
      desc: 'Monthly updates, bug fixes, and ongoing technical support.',
      featured: false
    }
  ];

  const whatYouGet = [
    'Mobile Responsive Design',
    'Fast Loading Speed',
    'SEO Ready Structure',
    'Secure Hosting',
    'Ongoing Support'
  ];

  const whoIsThisFor = [
    { icon: Store, title: 'Small Businesses' },
    { icon: Rocket, title: 'Startups' },
    { icon: User, title: 'Freelancers' },
    { icon: GraduationCap, title: 'Students' }
  ];

  const whyChooseUs = [
    { icon: ZapIcon, title: 'Fast Delivery', desc: '3–10 days' },
    { icon: IndianRupee, title: 'Affordable Pricing', desc: 'Starting ₹1,499' },
    { icon: MessageSquare, title: 'Direct Communication', desc: '24/7 Support' },
    { icon: LayoutDashboard, title: 'Smart Dashboard Systems', desc: 'Built-in' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#050505] selection:bg-[#c7c42a] selection:text-black overflow-x-hidden technical-grid"
    >
      <SEO title="Service Protocols – Premium Infrastructure by WebbyLaunch" />

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <span className="text-xs font-black uppercase tracking-[0.8em] text-[#c7c42a] animate-marquee">Engineering Excellence</span>
            <h1 className="text-7xl md:text-[12vw] font-black uppercase italic tracking-tighter leading-[0.75] animate-slam-in">
              Digital <br />
              <span className="text-[#c7c42a]">Armor.</span>
            </h1>
            <p className="max-w-3xl mx-auto text-white/30 text-2xl md:text-3xl font-medium leading-tight italic">
              We deploy hyper-performance infrastructure. <span className="text-white">Precision engineered</span> for high-stakes business environments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-12">
              <Link 
                to="/pricing" 
                className="group relative flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all"
              >
                Pricing Specifications
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                to="/auth" 
                className="bg-[#c7c42a] text-black px-16 py-8 font-black uppercase italic text-sm tracking-widest hover:scale-110 active:scale-95 transition-all shadow-[0_30px_60px_rgba(199,196,42,0.1)]"
              >
                Iniate Build
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative p-12 rounded-[3rem] border transition-all duration-500 flex flex-col h-full bg-[#0a0a0a] border-white/10 hover:border-[#c7c42a]/30 hover:scale-[1.02] ${
                  service.featured ? 'shadow-[0_0_50px_rgba(199,196,42,0.1)]' : ''
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-4 left-10 bg-[#c7c42a] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                    Premium Feature
                  </div>
                )}

                <div className="space-y-8 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${
                    service.featured ? 'bg-[#c7c42a] text-black' : 'bg-[#c7c42a]/10 text-[#c7c42a] group-hover:bg-[#c7c42a] group-hover:text-black'
                  }`}>
                    <service.icon size={32} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{service.title}</h3>
                    <p className="text-white/40 text-sm font-medium leading-relaxed italic">{service.desc}</p>
                  </div>
                </div>

                <div className="pt-10">
                  <Link 
                    to="/auth"
                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      service.featured 
                        ? 'bg-[#c7c42a] text-black hover:scale-[1.02]' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    Select Module <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Section */}
      <section className="py-64 px-10 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Standard Runtime</span>
            <h2 className="text-6xl md:text-[8rem] font-black uppercase italic tracking-tighter leading-[0.75]">
              Core <br />
              <span className="text-white/10">Invariants.</span>
            </h2>
            <p className="text-white/20 text-2xl font-medium italic leading-tight">
              Every build is verified against our <span className="text-white">High-Speed Protocol</span>. Zero compromise on structural integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whatYouGet.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] hover:border-[#c7c42a]/30 transition-all group"
              >
                <div className="text-[#c7c42a] group-hover:scale-110 transition-transform mb-6">
                  <ShieldCheck size={32} />
                </div>
                <span className="text-xl font-black uppercase italic tracking-tighter text-white">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-32 px-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto text-center space-y-32">
          <div className="space-y-4">
             <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Target Sectors</span>
            <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter">
              The <span className="text-white/10">Clientele.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whoIsThisFor.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#0a0a0a] border border-white/10 p-16 rounded-[3rem] space-y-10 hover:bg-white/10 transition-all group cursor-default"
              >
                <div className="w-24 h-24 bg-[#c7c42a]/5 border border-[#c7c42a]/10 rounded-full flex items-center justify-center text-[#c7c42a] mx-auto group-hover:scale-110 transition-all">
                  <item.icon size={48} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Entry Section */}
      <section className="py-64 px-10 relative overflow-hidden bg-[#050505] technical-grid border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <span className="text-xs font-black uppercase tracking-[0.8em] text-[#c7c42a]">Terminal Command</span>
          <h2 className="text-6xl md:text-[8vw] font-black text-white uppercase italic tracking-tighter leading-[0.75] animate-slam-in">
            Execute Your <br />
            <span className="text-[#c7c42a]">Digital Strategy.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-8">
            <Link 
              to="/auth" 
              className="bg-[#c7c42a] text-black px-24 py-8 font-black uppercase italic text-sm tracking-widest hover:scale-110 active:scale-95 transition-all shadow-[0_30px_60px_rgba(199,196,42,0.1)]"
            >
              Initiate
            </Link>
            <a 
              href={`mailto:${PROFESSIONAL_EMAIL}`}
              className="text-xs font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all underline underline-offset-8"
            >
              Consult
            </a>
          </div>
        </div>
      </section>

      {/* Footer Space */}
      <div className="h-20" />
    </motion.div>
  );
}
