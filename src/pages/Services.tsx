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
  Zap, 
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
    { icon: Zap, title: 'Fast Delivery', desc: '3–10 days' },
    { icon: IndianRupee, title: 'Affordable Pricing', desc: 'Starting ₹1,499' },
    { icon: MessageSquare, title: 'Direct Communication', desc: '24/7 Support' },
    { icon: LayoutDashboard, title: 'Smart Dashboard Systems', desc: 'Built-in' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black font-sans text-white selection:bg-[#cfcb11] selection:text-black overflow-x-hidden"
    >
      <SEO title="Our Services – Premium Web Solutions by WebbyLaunch" />

      {/* Sticky CTA */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 z-50 hidden md:block"
      >
        <Link 
          to="/auth" 
          className="bg-[#cfcb11] text-black px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 shadow-[0_0_30px_rgba(207,203,17,0.3)] hover:scale-105 transition-all"
        >
          <MousePointer2 size={18} />
          Get Started
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#cfcb11]/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              We Build Websites That <br />
              <span className="text-[#cfcb11]">Bring You Clients</span>, <br />
              Not Just Design
            </h1>
            <p className="max-w-2xl mx-auto text-white/60 text-lg md:text-xl font-medium leading-relaxed italic">
              Modern, fast, and scalable websites with powerful dashboards and support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link 
                to="/pricing" 
                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 hover:border-[#cfcb11]/30 transition-all group"
              >
                View Pricing
              </Link>
              <Link 
                to="/auth" 
                className="w-full sm:w-auto bg-[#cfcb11] text-black px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(207,203,17,0.2)]"
              >
                Get Started Now
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
                className={`group relative p-10 rounded-[3rem] border transition-all duration-500 flex flex-col h-full ${
                  service.featured 
                    ? 'bg-white/10 border-[#cfcb11]/30 shadow-[0_0_50px_rgba(207,203,17,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:border-[#cfcb11]/30'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-4 left-10 bg-[#cfcb11] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                    {service.badge}
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${
                  service.featured ? 'bg-[#cfcb11] text-black' : 'bg-[#cfcb11]/10 text-[#cfcb11] group-hover:bg-[#cfcb11] group-hover:text-black'
                }`}>
                  <service.icon size={32} />
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{service.title}</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed italic">{service.desc}</p>
                </div>

                <div className="pt-10">
                  <a 
                    href={`mailto:${PROFESSIONAL_EMAIL}`}
                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      service.featured 
                        ? 'bg-[#cfcb11] text-black hover:scale-[1.02]' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    Email Us <ArrowRight size={14} />
                  </a>
                </div>

                {service.featured && (
                  <div className="absolute inset-0 rounded-[3rem] bg-[#cfcb11]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-2xl" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-32 px-10 bg-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#cfcb11]/5 rounded-full blur-[100px] -ml-48" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              What You Get With <br />
              <span className="text-[#cfcb11]">Every Project</span>
            </h2>
            <p className="text-white/40 text-lg font-medium italic leading-relaxed max-w-lg">
              We don't just build websites; we build business tools. Every project comes with these standard features to ensure your success.
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
                className="flex items-center gap-4 p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-[#cfcb11]/30 transition-all group"
              >
                <div className="text-[#cfcb11] group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-sm font-black uppercase italic tracking-tighter">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto text-center space-y-20">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
            Who Is This <span className="text-[#cfcb11]">For?</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {whoIsThisFor.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-6 hover:bg-white/10 transition-all group cursor-default"
              >
                <div className="w-20 h-20 bg-[#cfcb11]/10 rounded-full flex items-center justify-center text-[#cfcb11] mx-auto group-hover:scale-110 transition-transform">
                  <item.icon size={40} />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#cfcb11]/5 rounded-full blur-[100px] -mr-48 -mb-48" />
            
            <div className="relative z-10 space-y-20">
              <div className="text-center space-y-4">
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
                  Why Choose <span className="text-[#cfcb11]">WebbyLaunch?</span>
                </h2>
                <p className="text-white/40 font-medium italic">The difference is in the details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {whyChooseUs.map((item, idx) => (
                  <div key={idx} className="space-y-4 text-center">
                    <div className="text-[#cfcb11] flex justify-center">
                      <item.icon size={48} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black uppercase italic tracking-tighter">{item.title}</h4>
                      <p className="text-[#cfcb11] text-xs font-black uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-10">
        <div className="max-w-5xl mx-auto relative">
          <div className="bg-[#cfcb11] rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden shadow-[0_0_100px_rgba(207,203,17,0.15)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent)]" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black text-black uppercase italic tracking-tighter leading-none">
                Have a project in mind? <br />
                Let's build something amazing.
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Link 
                  to="/auth" 
                  className="w-full sm:w-auto bg-black text-white px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                >
                  Get Started Now
                </Link>
                <a 
                  href={`mailto:${PROFESSIONAL_EMAIL}`}
                  className="w-full sm:w-auto bg-white text-black px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Space */}
      <div className="h-20" />
    </motion.div>
  );
}
