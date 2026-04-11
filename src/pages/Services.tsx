import React from 'react';
import { motion } from 'motion/react';
import { Zap, Smartphone, Search, Layout as LayoutIcon, Shield, Globe, MessageSquare, BarChart3 } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    { 
      icon: LayoutIcon, 
      title: 'Custom Web Design', 
      desc: 'Unique, high-conversion designs tailored to your specific business niche and brand identity.' 
    },
    { 
      icon: Smartphone, 
      title: 'Mobile Responsive', 
      desc: 'Your website will look and function perfectly on all devices, from smartphones to desktops.' 
    },
    { 
      icon: Search, 
      title: 'SEO Optimization', 
      desc: 'Built-in SEO best practices to help your business rank higher on Google search results.' 
    },
    { 
      icon: Zap, 
      title: 'Fast Performance', 
      desc: 'Lightning-fast load times to ensure your visitors stay engaged and convert into customers.' 
    },
    { 
      icon: Shield, 
      title: 'Secure Hosting', 
      desc: 'Reliable and secure hosting solutions to keep your business data and website safe.' 
    },
    { 
      icon: MessageSquare, 
      title: 'Real-time Chat', 
      desc: 'Integrated chat systems to help you communicate with your customers instantly.' 
    },
    { 
      icon: BarChart3, 
      title: 'Analytics Ready', 
      desc: 'Track your website performance and visitor behavior with built-in analytics tools.' 
    },
    { 
      icon: Globe, 
      title: 'Domain Setup', 
      desc: 'We handle the technical side of domain registration and DNS configuration for you.' 
    }
  ];

  return (
    <div className="pt-40 pb-20 px-10">
      <SEO title="Our Services – Premium Mobile-First Web Solutions by WebbyLaunch" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
            Our <span className="text-[#E6FF00]">Services.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-lg font-medium leading-relaxed">
            We provide end-to-end web development solutions designed to help your business grow and succeed in the digital landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-6 hover:border-[#E6FF00]/30 transition-all group">
              <div className="w-14 h-14 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00] group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                <service.icon size={28} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{service.title}</h3>
                <p className="text-white/40 text-xs font-medium leading-relaxed">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-24 text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
            Need a custom solution?<br />
            <span className="text-[#E6FF00]">Let's talk about it.</span>
          </h2>
          <Link 
            to="/contact" 
            className="inline-block bg-[#E6FF00] text-black px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
