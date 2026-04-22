import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PROFESSIONAL_EMAIL } from '../constants';

export default function Pricing() {
  const [billingType, setBillingType] = useState<'one-time' | 'subscription'>('one-time');

  const oneTimePlans = [
    {
      name: 'Basic',
      price: '₹5,000',
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
      name: 'Standard',
      price: '₹15,000',
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
      name: 'Pro',
      price: '₹30,000',
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

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: '₹999',
      period: '/mo',
      description: 'Hosting and basic support to keep your website running smoothly.',
      features: [
        'Hosting Included',
        'Basic Support',
        'Security Updates',
        'Monthly Backups'
      ],
      stripeLink: 'https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07'
    },
    {
      name: 'Standard',
      price: '₹5,999',
      period: '/mo',
      description: 'Maintenance, updates, and priority support for active businesses.',
      features: [
        'Everything in Basic',
        'Ongoing Maintenance',
        'Content Updates',
        'Priority Support',
        'Performance Optimization'
      ],
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_28E28q5is4j29Lmgu3bAs08'
    },
    {
      name: 'Pro',
      price: '₹9,999',
      period: '/mo',
      description: 'Full support and priority updates for enterprise-level needs.',
      features: [
        'Everything in Standard',
        'Full Support',
        'Priority Updates',
        'Monthly Performance Review',
        'Dedicated Manager'
      ],
      stripeLink: 'https://buy.stripe.com/test_eVqeVccKU9Dm2iU2DdbAs09'
    }
  ];

  const plans = billingType === 'one-time' ? oneTimePlans : subscriptionPlans;

  const navigate = useNavigate();

  const handleSubscribe = (stripeLink: string) => {
    if (stripeLink) {
      window.location.href = stripeLink;
    } else {
      navigate('/auth');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#050505] selection:bg-[#c7c42a] selection:text-black py-40 px-10 technical-grid"
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
            <div className="flex items-center gap-8 border-b border-white/10 pb-8">
              <button 
                onClick={() => setBillingType('one-time')}
                className={`text-xs font-black uppercase tracking-widest transition-all px-8 py-2 relative ${billingType === 'one-time' ? 'text-[#c7c42a]' : 'text-white/20 hover:text-white'}`}
              >
                One-Time
                {billingType === 'one-time' && <motion.div layoutId="billing-active" className="absolute -bottom-px left-0 w-full h-px bg-[#c7c42a]" />}
              </button>
              <button 
                onClick={() => setBillingType('subscription')}
                className={`text-xs font-black uppercase tracking-widest transition-all px-8 py-2 relative ${billingType === 'subscription' ? 'text-[#c7c42a]' : 'text-white/20 hover:text-white'}`}
              >
                Subscription
                {billingType === 'subscription' && <motion.div layoutId="billing-active" className="absolute -bottom-px left-0 w-full h-px bg-[#c7c42a]" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Limited Throughput: 3 Slots Remaining</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden mb-32">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`bg-[#050505] p-16 space-y-12 flex flex-col justify-between relative group ${plan.popular ? 'z-10 bg-[#0a0a0a]' : ''}`}
            >
              {plan.popular && <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />}
              
              <div className="space-y-12">
                <div className="flex justify-between items-start">
                  <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${plan.popular ? 'text-[#c7c42a]' : 'text-white/40'}`}>{plan.name}</h3>
                  {plan.popular && <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#c7c42a] px-2 py-1 border border-[#c7c42a]/30 italic">Primary Choice</span>}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif italic text-white/10">₹</span>
                  <span className="text-9xl font-black tracking-tighter text-white">
                    {plan.price.replace('₹', '')}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-white/20 italic ml-2">{plan.period}</span>
                </div>

                <p className="text-base font-medium italic text-white/30 leading-relaxed max-w-xs">{plan.description}</p>

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
                  <span className="flex items-center gap-2"> <Check size={10} /> Secure Node via Stripe</span>
                  <span className="flex items-center gap-2"> <Check size={10} /> 24hr Direct Channel Entry</span>
                </div>
                <button 
                  onClick={() => handleSubscribe(plan.stripeLink)}
                  className={`w-full py-8 text-center font-black uppercase italic text-sm tracking-widest transition-all ${plan.popular ? 'bg-[#c7c42a] text-black shadow-[0_30px_60px_rgba(199,196,42,0.1)]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                >
                  Initiate Build
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center border-t border-white/5 pt-32">
            <div className="space-y-8">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Transparency</span>
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">Execution <br /><span className="text-white/10">Protocols.</span></h2>
              <p className="text-xl text-white/30 font-medium italic leading-tight">
                {billingType === 'one-time' 
                  ? "Architected for speed. Full documentation and ownership transfer upon final balance clearance. 7-day post-launch optimization window included."
                  : "Continuous integration models include primary maintenance, monthly architectural reviews, and high-priority optimization cycles."
                }
              </p>
            </div>
            
            <div className="p-16 bg-[#0a0a0a] border border-white/10 technical-grid text-center space-y-12">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Custom <span className="text-[#c7c42a]">Engineering?</span></h3>
              <p className="text-white/40 font-medium italic">For projects requiring dedicated clusters, AI integrations, or custom ERP logic.</p>
              <a 
                href={`mailto:${PROFESSIONAL_EMAIL}`}
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
