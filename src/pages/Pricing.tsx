import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '₹1,499',
      description: 'Hosting & maintenance, minor text/image updates, backups, email support.',
      features: [
        '5 Pages Website',
        'Basic SEO',
        'Mobile Responsive',
        'Free Hosting',
        'Minor text/image updates',
        'Backups',
        'Email Support'
      ],
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      stripeLink: 'https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07'
    },
    {
      name: 'Standard',
      price: '₹1,499',
      description: 'Everything in Basic + SEO optimization, blog/content updates, analytics reports, faster support.',
      features: [
        'Everything in Basic',
        'SEO optimization',
        'Blog/content updates',
        'Analytics reports',
        'Faster support',
        'Custom Design'
      ],
      color: 'bg-[#E6FF00]/10 text-[#E6FF00] border-[#E6FF00]/20',
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_28E28q5is4j29Lmgu3bAs08'
    },
    {
      name: 'Premium',
      price: '₹1,499',
      description: 'Everything in Standard + E-commerce support, AI features integration, priority support, monthly performance review.',
      features: [
        'Everything in Standard',
        'Unlimited Pages',
        'Advanced SEO',
        'E-commerce support',
        'AI features integration',
        'Priority support',
        'Monthly performance review'
      ],
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      stripeLink: 'https://buy.stripe.com/test_eVqeVccKU9Dm2iU2DdbAs09'
    }
  ];

  const handleSubscribe = (link: string) => {
    window.location.href = link;
  };

  return (
    <div className="min-h-screen bg-[#064E3B] font-sans text-white selection:bg-[#E6FF00] selection:text-[#064E3B] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-[#E6FF00] italic"
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
            <span className="text-[#E6FF00]">Transparent</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/40 max-w-2xl mx-auto font-medium italic"
          >
            Choose the plan that fits your business goals. Secure payments powered by Stripe. Subscription renews monthly. Cancel anytime.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-12 rounded-[3rem] border flex flex-col h-full transition-all duration-500 hover:scale-[1.02] ${
                plan.popular ? 'bg-white/5 border-[#E6FF00]/30 shadow-[0_0_50px_rgba(230,255,0,0.1)]' : 'bg-black/20 border-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#E6FF00] text-black rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-white/40 font-bold uppercase tracking-widest text-xs">/ month</span>
                </div>
                <p className="mt-6 text-white/50 text-sm font-medium italic leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 flex-1 mb-12">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${plan.popular ? 'bg-[#E6FF00]/10 text-[#E6FF00]' : 'bg-white/5 text-white/40'}`}>
                      <Check size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(plan.stripeLink)}
                className={`w-full py-6 rounded-2xl font-black text-xl uppercase italic flex items-center justify-center gap-4 transition-all ${
                  plan.popular 
                    ? 'bg-[#E6FF00] text-black shadow-[0_0_30px_rgba(230,255,0,0.2)] hover:scale-[1.05]' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                Subscribe Now <ArrowRight size={24} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <div className="p-12 bg-black/20 backdrop-blur-3xl rounded-[4rem] border border-white/5 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E6FF00] rounded-full blur-[120px] opacity-10"></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">Need a custom solution?</h2>
            <p className="text-white/50 mb-10 max-w-xl mx-auto font-medium italic">
              If your project requires specialized features or enterprise-level infrastructure, let's talk.
            </p>
            <Link 
              to="/dashboard?chat=true"
              className="px-12 py-5 bg-white/5 border border-white/10 rounded-full font-black text-xl uppercase italic text-[#E6FF00] hover:bg-[#E6FF00] hover:text-black transition-all inline-flex items-center gap-4"
            >
              Contact Support <Sparkles size={24} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
