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
      className="min-h-screen bg-black font-sans text-white selection:bg-[#cfcb11] selection:text-black py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-[#cfcb11] italic"
          >
            Pricing Plans
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8]"
          >
            Simple <br />
            <span className="text-[#cfcb11]">Affordable</span> Plans.
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 pt-6"
          >
            <Shield size={14} className="text-[#cfcb11]" />
            {/* Removed 100% Money Back Guarantee */}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-6 pt-10"
          >
            <div className="flex items-center gap-3 px-6 py-2 bg-[#cfcb11]/10 border border-[#cfcb11]/20 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#cfcb11]">Only 5 project slots left this month</span>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
              <button 
                onClick={() => setBillingType('one-time')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingType === 'one-time' ? 'bg-[#cfcb11] text-black' : 'text-white/40 hover:text-white'}`}
              >
                One-Time
              </button>
              <button 
                onClick={() => setBillingType('subscription')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingType === 'subscription' ? 'bg-[#cfcb11] text-black' : 'text-white/40 hover:text-white'}`}
              >
                Subscription
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-1 rounded-[3.5rem] transition-all duration-500 hover:scale-[1.02] flex flex-col h-full pricing-glow-card`}
            >
              <div className={`pricing-glow-card-inner p-12 rounded-[3.5rem] border flex flex-col h-full bg-[#0B0B0B] ${plan.popular ? 'border-[#cfcb11]' : 'border-white/10'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#cfcb11] text-black rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-[0_0_20px_rgba(207,203,17,0.5)] z-20">
                    Most Popular
                  </div>
                )}

                <div className="mb-10">
                  <h3 className={`text-3xl font-black uppercase italic tracking-tighter mb-4 ${plan.popular ? 'text-[#cfcb11]' : 'text-white'}`}>{plan.name} Website</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic text-[#cfcb11]">₹</span>
                    <span className={`text-7xl font-black tracking-tighter relative z-10 text-[#cfcb11] ${plan.price.includes('15,000') ? 'drop-shadow-[0_0_15px_rgba(207,203,17,0.5)]' : ''}`}>
                      {plan.price.replace('₹', '')}
                    </span>
                    {plan.period && (
                      <span className={`text-sm font-black uppercase tracking-widest ml-2 ${plan.popular ? 'text-white/40' : 'text-white/40'}`}>{plan.period}</span>
                    )}
                  </div>
                  <p className={`mt-6 text-sm font-medium italic leading-relaxed text-white/50`}>
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 flex-1 mb-12">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[#cfcb11]/10 text-[#cfcb11]`}>
                        <Check size={14} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest group-hover:brightness-125 transition-all text-white/70`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                      <Shield size={12} /> Secure Payment via Stripe
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Instant confirmation</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">We will contact you within 24 hours</div>
                  </div>

                  <button 
                    onClick={() => handleSubscribe(plan.stripeLink)}
                    className={`w-full py-6 rounded-2xl font-black text-xl uppercase italic flex items-center justify-center gap-4 transition-all ${
                      plan.popular 
                        ? 'bg-[#cfcb11] text-black shadow-[0_0_30px_rgba(207,203,17,0.3)] hover:scale-[1.05]' 
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Get Started <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center max-w-2xl mx-auto">
          <p className="text-white/40 text-sm font-medium italic leading-relaxed">
            {billingType === 'one-time' 
              ? "This is a one-time website development service. 7 days of free support is included after delivery. Any further updates or maintenance require a separate support plan."
              : "One-time plans include only website development with limited support. Subscription plans include ongoing maintenance and updates."
            }
          </p>
        </div>

        <div className="mt-32 text-center">
          <div className="p-12 bg-black/20 backdrop-blur-3xl rounded-[4rem] border border-white/5 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#cfcb11] rounded-full blur-[120px] opacity-10"></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">Need help choosing a plan?</h2>
            <p className="text-white/50 mb-10 max-w-xl mx-auto font-medium italic">
              If your project requires specialized features or enterprise-level infrastructure, let's talk.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href={`mailto:${PROFESSIONAL_EMAIL}?subject=Pricing Inquiry&body=Hi WebbyLaunch, I have a question about your pricing plans.`}
                className="px-12 py-5 bg-[#cfcb11] text-black rounded-full font-black text-xl uppercase italic hover:scale-105 transition-all inline-flex items-center gap-4"
              >
                Email Us <Sparkles size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
