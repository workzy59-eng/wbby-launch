import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PROFESSIONAL_EMAIL } from '../constants';
import { useRegion } from '../context/RegionContext';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const { pricing: globalPricing, currency, symbol, gateway, paymentLinks, country } = useRegion();
  
  const oneTimePlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: globalPricing.basic,
      period: 'One-Time',
      description: '1–3 pages website. Perfect for small businesses starting their digital journey.',
      features: [
        '1–3 Pages Website',
        'Simple Design',
        'Mobile Responsive',
        'Contact Form',
        '7 Days Support'
      ],
      stripeLink: 'https://buy.stripe.com/test_eVqcN45is5n6bTudhRbAs0a'
    },
    {
      id: 'standard',
      name: 'Standard',
      price: globalPricing.standard,
      period: 'One-Time',
      description: '4–7 pages website. Modern UI/UX and better performance for growing brands.',
      features: [
        '4–7 Pages Website',
        'Modern UI/UX',
        'Mobile Responsive',
        'Basic SEO',
        'Fast Performance',
        '7 Days Support'
      ],
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_6oU6oGdOY8zi7Deb9JbAs0b'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: globalPricing.premium,
      period: 'One-Time',
      description: 'Full custom website. Advanced UI/UX and full optimization for established businesses.',
      features: [
        'Full Custom Website',
        'Advanced UI/UX',
        'Mobile Responsive',
        'SEO Optimization',
        'Basic Admin Dashboard',
        'Priority Delivery',
        '7 Days Support'
      ],
      stripeLink: 'https://buy.stripe.com/test_8x2eVc9yI02M4r21z9bAs0c'
    }
  ];

  const plans = oneTimePlans;

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = (planId: string, stripeLink: string) => {
    const el = document.getElementById('custom-engineering-btn');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Enhance focus engagement visually
      el.classList.add('ring-4', 'ring-[#c7c42a]', 'scale-105');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[#c7c42a]', 'scale-105');
      }, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#050505] selection:bg-[#c7c42a] selection:text-black py-40 px-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.6em] text-[#c7c42a]"
          >
            Pricing Architecture
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-[10vw] font-black tracking-tighter uppercase italic leading-[0.75]"
          >
            The <span className="text-[#c7c42a]">Investment.</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-12 pt-10"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Limited Throughput: 5 Slots Remaining</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative group bg-[#0a0a0a] border-white/10 p-12 rounded-[3.5rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col h-full ${
                plan.popular ? 'border-[#c7c42a]/50 shadow-[0_0_80px_rgba(199,196,42,0.1)]' : 'hover:border-[#c7c42a]/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#c7c42a] text-black px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest italic shadow-xl">
                  Most Deployed
                </div>
              )}
              
              <div className="space-y-12 flex-1">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${plan.popular ? 'text-[#c7c42a]' : 'text-white/40'}`}>{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif italic text-white/10">{currency}</span>
                    <span className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-white/20 italic ml-2">{plan.period}</span>
                  </div>

                  <p className="text-base font-medium italic text-white/30 leading-relaxed max-w-xs">{plan.description}</p>
                </div>

                <div className="w-12 h-px bg-white/10" />

                <ul className="space-y-5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-bold uppercase italic tracking-tighter text-white/40 group-hover:text-white/60 transition-colors">
                      <div className="w-1 h-1 bg-[#c7c42a]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-16 space-y-8">
                <div className="flex flex-col gap-2 text-left opacity-30 text-[10px] font-black uppercase tracking-widest italic group-hover:opacity-60 transition-opacity">
                  <span className="flex items-center gap-2"> <Check size={10} /> Secure Node via {gateway}</span>
                  <span className="flex items-center gap-2"> <Check size={10} /> 52hr Direct Channel Entry</span>
                </div>
                <button 
                  onClick={() => handleSubscribe(plan.id, plan.stripeLink)}
                  className={`w-full py-8 text-center font-black uppercase italic text-sm tracking-widest transition-all rounded-2xl ${plan.popular ? 'bg-[#c7c42a] text-black shadow-[0_30px_60px_rgba(199,196,42,0.1)]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                >
                  Initiate Build
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Indian Web Design Market Analysis & Comparison */}
        <div className="my-32 border-t border-b border-white/5 py-24 space-y-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Market Intelligence</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
              Website Development & Design Costs in India
            </h2>
            <p className="text-white/40 font-medium italic text-sm">
              An analytical breakdown of traditional agency pricing models vs. WebbyLaunch's hyper-performance rapid delivery protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            {/* Column 1: Website Development & Design Costs in India */}
            <div className="bg-[#080808] border border-white/5 p-8 md:p-12 rounded-[2.5rem] space-y-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                <span className="text-[#c7c42a]">01 /</span> Market Pricing Benchmark
              </h3>
              <p className="text-white/50 text-sm font-medium italic leading-relaxed font-sans">
                When auditing traditional website development and design costs in India, companies are typically encountered with tiered estimates that stretch over several weeks or months. Here is how the Indian development sector typically bills projects:
              </p>

              <div className="space-y-4 divide-y divide-white/5 pt-4">
                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Basic Template Websites</h4>
                    <p className="text-xs text-white/30 italic">Minimal custom UI, standard themes, slow hosting setup.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#c7c42a] text-lg font-black tracking-tight">₹10,000 – ₹40,000</span>
                    <p className="text-[10px] text-white/20 uppercase font-bold">Average Indian Cost</p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Advanced Custom Corporate Sites</h4>
                    <p className="text-xs text-white/30 italic">Tailored layouts, modern optimization, multi-sectional pages.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#c7c42a] text-lg font-black tracking-tight">₹40,000 – ₹1,50,000</span>
                    <p className="text-[10px] text-white/20 uppercase font-bold">Average Indian Cost</p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">E-commerce & Custom SaaS Platforms</h4>
                    <p className="text-xs text-white/30 italic">Secure payment integrations, data-driven catalogs, back-office panels.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#c7c42a] text-lg font-black tracking-tight">₹2,00,000+</span>
                    <p className="text-[10px] text-white/20 uppercase font-bold">Average Indian Cost</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-xs text-white/60 font-medium italic leading-relaxed">
                  <strong className="text-[#c7c42a] uppercase tracking-wider">The WebbyLaunch Protocol:</strong> We deliver industry-disrupting premium performance within 52 hours. By bypassing traditional bloated administrative workflows, we offer premium global design at transparent, modular regional rates that provide 5x the speed and value of standard domestic firms.
                </p>
              </div>
            </div>

            {/* Column 2: Best Affordable Web Agencies in India */}
            <div className="bg-[#080808] border border-white/5 p-8 md:p-12 rounded-[2.5rem] space-y-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                <span className="text-[#c7c42a]">02 /</span> Best Affordable Web Agencies in India
              </h3>
              <p className="text-white/50 text-sm font-medium italic leading-relaxed font-sans">
                Reputable IT companies and developers in India frequently offer affordable design packages. Prominent domestic agencies such as <span className="text-white font-semibold">Webclick Digital</span>, <span className="text-white font-semibold">WPWeb Infotech</span>, <span className="text-white font-semibold">FODUU</span>, and <span className="text-white font-semibold">Syspree</span> have been historically sought. Here is how WebbyLaunch redefines affordable digital transformation:
              </p>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-[#c7c42a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">Guaranteed 52-Hour Real-Time Delivery</h4>
                    <p className="text-xs text-white/40 italic">Traditional Indian web agencies usually take 3 to 6 weeks. We use a structured, accelerated development paradigm to host your finished custom site in days.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-[#c7c42a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">No Hidden Retainers or Maintenance Costs</h4>
                    <p className="text-xs text-white/40 italic">We establish full domain, code repository, and host ownership handovers on day one, saving you from mandatory monthly locks common in older agency contracts.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-[#c7c42a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">Next-Gen React & Tailwind CSS Stack</h4>
                    <p className="text-xs text-white/40 italic">Rather than outdated WordPress page builders prone to slow load speeds, we construct high-conversion, responsive single-page web environments designed to convert visitors instantly.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Global Standards, Fair Pricing</span>
                <span className="text-[#c7c42a] text-xs font-black uppercase italic tracking-widest animate-pulse">Select Your Plan Above</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive UPI Payment Section */}
        <div className="my-32 bg-[#080808] border border-white/5 p-8 md:p-16 rounded-[3rem] space-y-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-t from-[#c7c42a]/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="text-center space-y-4 max-w-2xl mx-auto relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Instant Settlement Node</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
              UPI Direct Pay
            </h2>
            <p className="text-white/40 font-medium italic text-sm">
              Tap below to initiate deep-linked mobile banking apps. Zero transactional surcharges. Real-time workspace deployment.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            {/* Merged payment block matching exact user HTML/CSS requirements */}
            <div className="bg-black/40 border border-white/5 p-8 rounded-2xl md:p-12 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#c7c42a]/10 flex items-center justify-center text-[#c7c42a] shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Verified Peer Authenticator</h4>
                    <p className="text-xs text-white/40 italic">Merchant: Shivam Tiwari (8726490079@goaxb)</p>
                  </div>
                </div>
                <div className="bg-[#c7c42a]/10 border border-[#c7c42a]/20 px-4 py-2 rounded-full">
                  <span className="text-[10px] font-black uppercase text-[#c7c42a] tracking-widest block font-mono">Status: Secure Ready</span>
                </div>
              </div>

              {/* Exact HTML Code block provided */}
              <div style={{display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center', marginTop:'30px'}}>
                <a href="upi://pay?pa=8726490079@goaxb&pn=Shivam%20Tiwari&am=1999&cu=INR"
                   className="upi-btn dark">
                   Pay ₹1,999
                </a>

                <a href="upi://pay?pa=8726490079@goaxb&pn=Shivam%20Tiwari&am=4999&cu=INR"
                   className="upi-btn blue">
                   Pay ₹4,999
                </a>

                <a href="upi://pay?pa=8726490079@goaxb&pn=Shivam%20Tiwari&am=9999&cu=INR"
                   className="upi-btn green">
                   Pay ₹9,999
                </a>
              </div>

              {/* Exact CSS provided, rendered cleanly inside scoping block */}
              <style dangerouslySetInnerHTML={{__html: `
                .upi-btn {
                  text-decoration: none !important;
                  color: white !important;
                  padding: 18px 35px !important;
                  border-radius: 16px !important;
                  font-size: 20px !important;
                  font-weight: 700 !important;
                  display: inline-block !important;
                  transition: all .3s ease !important;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                }

                .upi-btn:hover {
                  transform: translateY(-4px) scale(1.03) !important;
                  box-shadow: 0 15px 30px rgba(199,196,42,0.15) !important;
                }

                .dark {
                  background: #111827 !important;
                  border: 1px solid rgba(255,255,255,0.05) !important;
                }

                .blue {
                  background: #2563eb !important;
                }

                .green {
                  background: #059669 !important;
                }

                @media(max-width:768px){
                  .upi-btn {
                    width: 100% !important;
                    text-align: center !important;
                  }
                }
              `}} />

              {/* Cross-platform safety guide for desktop users */}
              <div className="pt-6 text-center">
                <p className="text-xs text-white/30 italic">
                  * Mobile clients will trigger BHIM, Google Pay, PhonePe, or Paytm automatically. Desktop clients can utilize manual verification transfer.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center border-t border-white/5 pt-32">
            <div className="space-y-8">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Transparency</span>
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">Execution <br /><span className="text-white/10">Protocols.</span></h2>
              <p className="text-xl text-white/30 font-medium italic leading-tight">
                Architected for speed. Full documentation and ownership transfer upon final balance clearance. 7-day post-launch optimization window included.
              </p>
            </div>
            
            <div className="p-16 bg-[#0a0a0a] border border-white/10 rounded-[4rem] text-center space-y-12">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Custom <span className="text-[#c7c42a]">Engineering?</span></h3>
              <p className="text-white/40 font-medium italic">For projects requiring dedicated clusters, AI integrations, or custom ERP logic.</p>
              <a 
                href={`mailto:${PROFESSIONAL_EMAIL}`}
                id="custom-engineering-btn"
                className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-12 py-5 font-black uppercase tracking-widest italic hover:bg-[#c7c42a] hover:text-black transition-all"
              >
                Inquire <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
