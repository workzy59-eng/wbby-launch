import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Star, Zap, Shield, Smartphone, Search, Layout as LayoutIcon } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter Launch',
      price: '₹899',
      period: '/ month',
      description: 'Perfect for new businesses and startups.',
      features: [
        'Custom Domain Setup',
        'Fast 48h Delivery',
        'Mobile Responsive Design',
        'Basic SEO Optimization',
        'Real-time Chat Support',
        'Project Dashboard Access'
      ],
      button: 'Get Started',
      popular: false
    },
    {
      name: 'Business Pro',
      price: '₹1,499',
      period: '/ month',
      description: 'Advanced features for growing businesses.',
      features: [
        'Custom Domain Setup',
        'Priority 24h Delivery',
        'Mobile Responsive Design',
        'Advanced SEO Optimization',
        'Real-time Chat Support',
        'Project Dashboard Access',
        'Custom Email Setup',
        'Monthly Performance Reports'
      ],
      button: 'Start Pro Project',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large-scale projects.',
      features: [
        'Everything in Business Pro',
        'Dedicated Project Manager',
        'Custom Backend Integration',
        'API Development',
        'Unlimited Revisions',
        '24/7 Priority Support'
      ],
      button: 'Contact for Quote',
      popular: false
    }
  ];

  return (
    <div className="pt-40 pb-20 px-10">
      <SEO title="Pricing Plans – Affordable Web Development by WebbyLaunch" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
            Simple <span className="text-[#E6FF00]">Pricing.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-lg font-medium leading-relaxed">
            Choose the plan that fits your business needs. No hidden costs. No stress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative bg-white/5 border ${plan.popular ? 'border-[#E6FF00]/50 shadow-[0_0_50px_rgba(230,255,0,0.1)]' : 'border-white/10'} p-12 rounded-[3rem] flex flex-col space-y-10 group hover:border-[#E6FF00]/30 transition-all`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[#E6FF00] text-black px-8 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tighter text-[#E6FF00]">{plan.price}</span>
                  <span className="text-white/40 font-bold uppercase tracking-widest text-xs mb-2">{plan.period}</span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                    <CheckCircle2 size={18} className="text-[#E6FF00]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link 
                to="/auth" 
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-center transition-all ${
                  plan.popular 
                    ? 'bg-[#E6FF00] text-black shadow-[0_0_30px_rgba(230,255,0,0.2)] hover:scale-[1.02]' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.button}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center space-y-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {[
              { q: 'How long does it take?', a: 'Standard projects are delivered within 24-48 hours after we receive all your requirements.' },
              { q: 'Can I request revisions?', a: 'Yes, all plans include revisions to ensure you are 100% satisfied with the final result.' },
              { q: 'Do I need to pay upfront?', a: 'No, you can submit your request and we will start building. Access is unlocked after approval.' },
              { q: 'Is hosting included?', a: 'Yes, we provide secure hosting solutions for all our business launch plans.' }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
                <h4 className="font-black uppercase italic tracking-tighter text-sm text-[#E6FF00]">{faq.q}</h4>
                <p className="text-white/40 text-xs font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
