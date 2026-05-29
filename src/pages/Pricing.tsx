import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Globe, Zap, Shield, Server, Code2, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PROFESSIONAL_EMAIL } from '../constants';

/* ─── Plan Data ──────────────────────────────────────────────────── */

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    icon: Zap,
    tagline: 'Essential launch node.',
    description: '1-3 pages high-speed landing website. Custom domain setup, secure lead capture, and fully responsive layouts.',
    features: [
      '1–3 Pages High-Speed Site',
      'Industrial Cyber-Chic Design',
      'Mobile & Tablet Responsive',
      'Secure Lead Capture Forms',
      '7 Days Priority Launch Support',
    ],
    inr: { total: 9999, advance: 1999, balance: 8000 },
    usd: { total: 129, advance: 29, balance: 100 },
    gbp: { total: 99, advance: 22, balance: 77 },
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    icon: Shield,
    tagline: 'Advanced growth node.',
    description: '4-7 pages fully animated website. Premium UI/UX art direction, ultra-fast CDN nodes, and core web vitals optimization.',
    features: [
      '4–7 Pages Animated Site',
      'Premium UI/UX Art Direction',
      'Ultra-Fast Global CDN Nodes',
      'Core Web Vitals Optimized',
      'Professional SEO Foundation',
      '7 Days Priority Launch Support',
    ],
    inr: { total: 19999, advance: 4999, balance: 15000 },
    usd: { total: 249, advance: 59, balance: 190 },
    gbp: { total: 189, advance: 45, balance: 144 },
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    tagline: 'Complete digital fortress.',
    description: 'Unlimited custom pages, bespoke admin panel, secure payment gateway, elite animations, and priority flight support.',
    features: [
      'Unlimited Custom Pages',
      'Elite Interactive Animations',
      'High-Conversion Copy Setup',
      'Custom Admin Control Panel',
      'Payment Gateway Integration',
      '24/7 Dedicated Support Node',
      'Priority Flight Queue Delivery',
    ],
    inr: { total: 39999, advance: 9999, balance: 30000 },
    usd: { total: 499, advance: 119, balance: 380 },
    gbp: { total: 379, advance: 90, balance: 289 },
    popular: false,
  },
];

type Region = 'india' | 'international';

const DOMAIN_HOSTING = {
  india: { price: 4999, currency: '₹', label: 'INR' },
  international: { price: 59, currency: '$', label: 'USD' },
};

/* ─── Component ─────────────────────────────────────────────────── */

export default function Pricing() {
  const [region, setRegion] = useState<Region>('india');
  const navigate = useNavigate();

  const isIndia = region === 'india';
  const currSymbol = isIndia ? '₹' : '$';
  const dh = DOMAIN_HOSTING[region];

  const formatNum = (n: number, ind: boolean) =>
    ind
      ? n.toLocaleString('en-IN')
      : n.toLocaleString('en-US');

  const getPricing = (plan: typeof PLANS[0]) =>
    isIndia ? plan.inr : plan.usd;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#050505] selection:bg-[#c7c42a] selection:text-black py-40 px-6 md:px-10"
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Hero Header ── */}
        <div className="text-center space-y-8 mb-20">
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

          {/* Live slots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">
              Limited Throughput: 5 Slots Remaining
            </span>
          </motion.div>

          {/* Region Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-0 mt-6"
          >
            <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1">
              {(['india', 'international'] as Region[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    region === r
                      ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Globe size={12} />
                  {r === 'india' ? '🇮🇳 India (₹ INR)' : '🌍 International ($)'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Domain & Hosting Add-on Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <div className="bg-[#c7c42a]/5 border border-[#c7c42a]/20 rounded-2xl px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Server size={18} className="text-[#c7c42a]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#c7c42a] block mb-1">
                  Domain & Hosting Add-on — 1 Year
                </span>
                <p className="text-sm text-white/50 font-medium leading-relaxed">
                  If WebbyLaunch registers &amp; hosts your site on our premium cloud servers, an additional{' '}
                  <span className="text-white font-black">
                    {dh.currency}{formatNum(dh.price, isIndia)} ({dh.label})
                  </span>{' '}
                  is added to your advance payment. You can also provide your own domain &amp; hosting at no extra charge.
                </p>
              </div>
            </div>
            <span className="text-[#c7c42a] text-xl font-black font-mono shrink-0">
              +{dh.currency}{formatNum(dh.price, isIndia)}
            </span>
          </div>
        </motion.div>

        {/* ── Payment Structure Note ── */}
        <div className="mb-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', label: 'Advance Payment', desc: '25% of plan + Domain/Hosting (if applicable). Paid to start the project.', color: 'border-[#c7c42a]/30 bg-[#c7c42a]/5' },
            { step: '02', label: 'Build Phase', desc: 'Our team begins engineering your site. 52-hour rapid delivery protocol activated.', color: 'border-white/10 bg-white/[0.02]' },
            { step: '03', label: 'Balance on Delivery', desc: 'Remaining 75% paid upon project completion and your full approval.', color: 'border-white/10 bg-white/[0.02]' },
          ].map((s) => (
            <div key={s.step} className={`border rounded-2xl px-6 py-5 space-y-2 ${s.color}`}>
              <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em]">Step {s.step}</span>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">{s.label}</h4>
              <p className="text-xs text-white/40 font-medium leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Plan Cards ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={region}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {PLANS.map((plan, i) => {
              const p = getPricing(plan);
              const PlanIcon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className={`relative group bg-[#0a0a0a] p-10 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col h-full ${
                    plan.popular
                      ? 'border-[#c7c42a]/50 shadow-[0_0_80px_rgba(199,196,42,0.1)]'
                      : 'border-white/10 hover:border-[#c7c42a]/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#c7c42a] text-black px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest italic shadow-xl whitespace-nowrap">
                      Most Deployed
                    </div>
                  )}

                  <div className="space-y-8 flex-1">
                    {/* Plan header */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${plan.popular ? 'bg-[#c7c42a]/10 border-[#c7c42a]/30' : 'bg-white/5 border-white/10'}`}>
                          <PlanIcon size={22} className={plan.popular ? 'text-[#c7c42a]' : 'text-white/40'} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${plan.popular ? 'text-[#c7c42a]' : 'text-white/20'}`}>
                          One-Time
                        </span>
                      </div>

                      <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${plan.popular ? 'text-[#c7c42a]' : 'text-white/50'}`}>
                        {plan.name}
                      </h3>

                      {/* Price block */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-serif italic text-white/20">{currSymbol}</span>
                          <span className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                            {formatNum(p.total, isIndia)}
                          </span>
                        </div>
                        {/* Advance + Balance breakdown */}
                        <div className="flex items-center gap-3 flex-wrap pt-1">
                          <span className="inline-flex items-center gap-1.5 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-full px-3 py-1 text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-[#c7c42a] rounded-full" />
                            {currSymbol}{formatNum(p.advance, isIndia)} advance
                          </span>
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            + {currSymbol}{formatNum(p.balance, isIndia)} on delivery
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-medium italic text-white/30 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Features */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-bold uppercase italic tracking-tight text-white/40 group-hover:text-white/60 transition-colors">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${plan.popular ? 'bg-[#c7c42a]/10 border-[#c7c42a]/20 text-[#c7c42a]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="pt-10 space-y-5">
                    <div className="flex flex-col gap-1.5 text-left opacity-30 text-[10px] font-black uppercase tracking-widest italic group-hover:opacity-60 transition-opacity">
                      <span className="flex items-center gap-2"><Check size={10} /> Secure Node via UPI / QR / Card</span>
                      <span className="flex items-center gap-2"><Check size={10} /> 52hr Direct Channel Entry</span>
                    </div>
                    <button
                      onClick={() => navigate(`/onboarding?plan=${plan.id}`)}
                      className={`w-full py-6 text-center font-black uppercase italic text-sm tracking-widest transition-all rounded-2xl flex items-center justify-center gap-3 ${
                        plan.popular
                          ? 'bg-[#c7c42a] text-black shadow-[0_20px_60px_rgba(199,196,42,0.15)] hover:scale-[1.02]'
                          : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:scale-[1.02]'
                      }`}
                    >
                      Initiate Build <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── Custom Engineering Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 md:p-16 overflow-hidden hover:border-[#c7c42a]/20 transition-all duration-500 group">
            {/* Background glow */}
            <div className="absolute -right-40 -top-40 w-96 h-96 bg-[#c7c42a]/5 rounded-full blur-[100px] group-hover:bg-[#c7c42a]/10 transition-colors duration-700" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center">
                    <Code2 size={26} className="text-[#c7c42a]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">Custom Engineering</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-tight">
                  Beyond <br /><span className="text-[#c7c42a]">The Standard.</span>
                </h2>
                <p className="text-white/40 font-medium italic leading-relaxed">
                  Complex, tailored systems require a dedicated engineering consultation. Custom pricing based on scope, complexity, and delivery timeline.
                </p>
                <ul className="space-y-3">
                  {[
                    'SaaS Platforms & Dashboards',
                    'E-commerce & Custom Cart Systems',
                    'AI Agent / API Integrations',
                    'Custom ERP & CRM Logic',
                    'Dedicated Server Cluster Setup',
                    'Mobile App (React Native)',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold uppercase italic text-white/40 group-hover:text-white/60 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} className="text-[#c7c42a]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6 flex flex-col items-start md:items-end">
                <div className="text-right space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block">Starting from</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-serif italic text-white/20">{currSymbol}</span>
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {isIndia ? '59,999' : '799'}
                    </span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white/30 block">Custom Quote · One-Time</span>
                </div>
                <a
                  href={`mailto:${PROFESSIONAL_EMAIL}`}
                  id="custom-engineering-btn"
                  className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-10 py-5 font-black uppercase tracking-widest italic hover:bg-[#c7c42a] hover:text-black hover:border-[#c7c42a] transition-all rounded-2xl text-sm"
                >
                  Request Consultation <ArrowRight size={18} />
                </a>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-right max-w-xs">
                  Response within 24hrs · NDA Available on Request
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Market Analysis Section ── */}
        <div className="my-32 border-t border-b border-white/5 py-24 space-y-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Market Intelligence</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
              Website Development &amp; Design Costs in India
            </h2>
            <p className="text-white/40 font-medium italic text-sm">
              An analytical breakdown of traditional agency pricing models vs. WebbyLaunch's hyper-performance rapid delivery protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            {/* Column 1 */}
            <div className="bg-[#080808] border border-white/5 p-8 md:p-12 rounded-[2.5rem] space-y-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                <span className="text-[#c7c42a]">01 /</span> Market Pricing Benchmark
              </h3>
              <p className="text-white/50 text-sm font-medium italic leading-relaxed font-sans">
                When auditing traditional website development and design costs in India, companies are typically encountered with tiered estimates that stretch over several weeks or months. Here is how the Indian development sector typically bills projects:
              </p>
              <div className="space-y-4 divide-y divide-white/5 pt-4">
                {[
                  { title: 'Basic Template Websites', sub: 'Minimal custom UI, standard themes, slow hosting setup.', price: '₹10,000 – ₹40,000' },
                  { title: 'Advanced Custom Corporate Sites', sub: 'Tailored layouts, modern optimization, multi-sectional pages.', price: '₹40,000 – ₹1,50,000' },
                  { title: 'E-commerce & Custom SaaS Platforms', sub: 'Secure payment integrations, data-driven catalogs, back-office panels.', price: '₹2,00,000+' },
                ].map((row) => (
                  <div key={row.title} className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-white">{row.title}</h4>
                      <p className="text-xs text-white/30 italic">{row.sub}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#c7c42a] text-lg font-black tracking-tight">{row.price}</span>
                      <p className="text-[10px] text-white/20 uppercase font-bold">Average Indian Cost</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-xs text-white/60 font-medium italic leading-relaxed">
                  <strong className="text-[#c7c42a] uppercase tracking-wider">The WebbyLaunch Protocol:</strong> We deliver industry-disrupting premium performance within 52 hours. By bypassing traditional bloated administrative workflows, we offer premium global design at transparent, modular regional rates that provide 5x the speed and value of standard domestic firms.
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="bg-[#080808] border border-white/5 p-8 md:p-12 rounded-[2.5rem] space-y-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                <span className="text-[#c7c42a]">02 /</span> Best Affordable Web Agencies in India
              </h3>
              <p className="text-white/50 text-sm font-medium italic leading-relaxed font-sans">
                Reputable IT companies and developers in India frequently offer affordable design packages. Prominent domestic agencies such as{' '}
                <span className="text-white font-semibold">Webclick Digital</span>,{' '}
                <span className="text-white font-semibold">WPWeb Infotech</span>,{' '}
                <span className="text-white font-semibold">FODUU</span>, and{' '}
                <span className="text-white font-semibold">Syspree</span> have been historically sought. Here is how WebbyLaunch redefines affordable digital transformation:
              </p>
              <div className="space-y-5">
                {[
                  {
                    title: 'Guaranteed 52-Hour Real-Time Delivery',
                    desc: 'Traditional Indian web agencies usually take 3 to 6 weeks. We use a structured, accelerated development paradigm to host your finished custom site in days.',
                  },
                  {
                    title: 'No Hidden Retainers or Maintenance Costs',
                    desc: 'We establish full domain, code repository, and host ownership handovers on day one, saving you from mandatory monthly locks common in older agency contracts.',
                  },
                  {
                    title: 'Next-Gen React & Tailwind CSS Stack',
                    desc: 'Rather than outdated WordPress page builders prone to slow load speeds, we construct high-conversion, responsive single-page web environments designed to convert visitors instantly.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-[#c7c42a]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">{item.title}</h4>
                      <p className="text-xs text-white/40 italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Global Standards, Fair Pricing</span>
                <span className="text-[#c7c42a] text-xs font-black uppercase italic tracking-widest animate-pulse">Select Your Plan Above</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Execution Protocols ── */}
        <div className="space-y-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center border-t border-white/5 pt-32">
            <div className="space-y-8">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Transparency</span>
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">
                Execution <br /><span className="text-white/10">Protocols.</span>
              </h2>
              <p className="text-xl text-white/30 font-medium italic leading-tight">
                Architected for speed. Full documentation and ownership transfer upon final balance clearance. 7-day post-launch optimization window included.
              </p>
            </div>
            <div className="p-16 bg-[#0a0a0a] border border-white/10 rounded-[4rem] text-center space-y-12">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                Custom <span className="text-[#c7c42a]">Engineering?</span>
              </h3>
              <p className="text-white/40 font-medium italic">
                For projects requiring dedicated clusters, AI integrations, or custom ERP logic.
              </p>
              <a
                href={`mailto:${PROFESSIONAL_EMAIL}`}
                className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-12 py-5 font-black uppercase tracking-widest italic hover:bg-[#c7c42a] hover:text-black transition-all rounded-2xl"
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
