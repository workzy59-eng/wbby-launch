import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '₹1,499/-',
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
      color: 'bg-[#E6FF00]/5 border-[#E6FF00]/20 rounded-[3.5rem] shadow-[0_0_30px_rgba(230,255,0,0.05)]',
      stripeLink: 'https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07'
    },
    {
      name: 'Standard',
      price: '₹3,499/-',
      description: 'Everything in Basic + SEO optimization, blog/content updates, analytics reports, faster support.',
      features: [
        'Everything in Basic',
        'SEO optimization',
        'Blog/content updates',
        'Analytics reports',
        'Faster support',
        'Custom Design'
      ],
      color: 'bg-[#E6FF00] border-[#E6FF00] shadow-[0_0_50px_rgba(230,255,0,0.3)] text-black',
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_28E28q5is4j29Lmgu3bAs08'
    },
    {
      name: 'Premium',
      price: '₹9,999/-',
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
      color: 'bg-[#E6FF00]/5 border-[#E6FF00]/20 rounded-[3.5rem] shadow-[0_0_30px_rgba(230,255,0,0.05)]',
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
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-12 rounded-[3.5rem] border flex flex-col h-full transition-all duration-500 hover:scale-[1.02] ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black text-[#E6FF00] rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-xl border border-[#E6FF00]/20">
                  Most Popular
                </div>
              )}

              <div className="mb-10">
                <h3 className={`text-3xl font-black uppercase italic tracking-tighter mb-4 ${plan.popular ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-black tracking-tighter ${plan.popular ? 'text-black' : 'text-[#E6FF00]'}`}>{plan.price}</span>
                </div>
                <p className={`mt-6 text-sm font-medium italic leading-relaxed ${plan.popular ? 'text-black/60' : 'text-white/50'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 flex-1 mb-12">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${plan.popular ? 'bg-black/10 text-black' : 'bg-[#E6FF00]/10 text-[#E6FF00]'}`}>
                      <Check size={14} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest group-hover:brightness-125 transition-all ${plan.popular ? 'text-black/70' : 'text-white/70'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(plan.stripeLink)}
                className={`w-full py-6 rounded-2xl font-black text-xl uppercase italic flex items-center justify-center gap-4 transition-all ${
                  plan.popular 
                    ? 'bg-black text-white shadow-2xl hover:scale-[1.05]' 
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
