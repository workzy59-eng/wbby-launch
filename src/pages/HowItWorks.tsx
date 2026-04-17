import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, MessageSquare, Code, Layout, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    icon: MessageSquare,
    title: 'Submit Request',
    description: 'Tell us about your business, your goals, and any specific features you need. Our onboarding form makes it easy to share your vision.',
    details: [
      'Fill out a simple business questionnaire',
      'Choose your industry template',
      'Upload your logo and brand assets',
      'Select your preferred color palette'
    ]
  },
  {
    icon: Code,
    title: 'We Build',
    description: 'Our expert developers and designers get to work immediately. We craft your custom website with speed and precision.',
    details: [
      'Custom UI/UX design implementation',
      'Mobile responsiveness optimization',
      'SEO-friendly structure setup',
      'Performance tuning for fast loading'
    ]
  },
  {
    icon: Layout,
    title: 'You Review',
    description: 'We provide a live preview of your website. You can check every detail and request any final tweaks to make it perfect.',
    details: [
      'Live staging environment access',
      'Collaborative feedback loop',
      'Unlimited minor revisions',
      'Final content verification'
    ]
  },
  {
    icon: Rocket,
    title: 'Launch',
    description: 'Once you are happy, we launch your site to the world. We handle all the technical details so you can focus on your business.',
    details: [
      'Domain mapping and SSL setup',
      'Global CDN deployment',
      'Search engine submission',
      'Post-launch support access'
    ]
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-black font-sans text-white py-32 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1 bg-[#cfcb11] text-black rounded-full text-[10px] font-black uppercase tracking-widest italic"
            >
              The Process
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]"
            >
              How It <br />
              <span className="text-[#cfcb11]">Works.</span>
            </motion.h1>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/40 hover:text-[#cfcb11] transition-colors font-black uppercase text-xs tracking-widest italic"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div id="process-steps" className="space-y-32">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col lg:flex-row items-center gap-20 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 space-y-10">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-8"
                >
                  <div className="w-24 h-24 bg-[#cfcb11] rounded-[2.5rem] flex items-center justify-center text-black shadow-[0_0_50px_rgba(207,203,17,0.3)] group-hover:rotate-12 transition-transform duration-500">
                    <step.icon size={48} />
                  </div>
                  <div className="text-8xl font-black text-white/5 uppercase italic tracking-tighter leading-none">0{i + 1}</div>
                </motion.div>
                
                <div className="space-y-8">
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">{step.title}</h2>
                  <p className="text-2xl text-white/50 font-medium leading-relaxed italic max-w-2xl">
                    {step.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {step.details.map((detail, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (idx * 0.1) }}
                      className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#cfcb11]/10 flex items-center justify-center text-[#cfcb11] group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? 5 : -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                className="flex-1 w-full"
              >
                <div className="aspect-[4/3] bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden relative group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#cfcb11]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 z-10" />
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={`https://images.unsplash.com/photo-${[
                      '1519389950473-47ba0277781c',
                      '1498050108023-c5249f4df085',
                      '1522202176988-66273c2fd55f',
                      '1460925895917-afdab827c52f'
                    ][i]}?q=80&w=1200`} 
                    alt={step.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-10 left-10 z-20">
                    <div className="px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#cfcb11]">
                      Phase 0{i + 1}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 text-center space-y-12"
        >
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight">
            Ready to start the <br />
            <span className="text-[#cfcb11]">journey with us?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/auth" 
              className="px-12 py-6 bg-[#cfcb11] text-black rounded-2xl font-black uppercase italic text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(207,203,17,0.2)]"
            >
              Start Now
            </Link>
            <Link 
              to="/pricing" 
              className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase italic text-xl hover:bg-white/10 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
