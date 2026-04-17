import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function Careers() {
  const roles = [
    {
      title: 'Developer',
      icon: Code2,
      desc: 'Build high-performance websites for startups and small businesses. Work with React, TypeScript, and modern stacks.',
      path: '/join-developer',
      perks: ['Remote Work', 'Project-based Pay', 'Flexible Hours']
    },
    {
      title: 'Sales / CS',
      icon: TrendingUp,
      desc: 'Help businesses grow by connecting them with professional web solutions. Handle client inquiries and close deals.',
      path: '/join-sales',
      perks: ['High Commission', 'Lead Support', 'Performance Bonuses']
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#cfcb11] selection:text-black">
      <SEO 
        title="Join WebbyLaunch Team | Careers" 
        description="Work with WebbyLaunch as a Developer or Sales Executive. Build the future of the web with us."
      />

      <section className="relative pt-40 pb-20 px-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#cfcb11]/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#cfcb11]"
          >
            Careers
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none"
          >
            Join the <br />
            <span className="text-[#cfcb11]">WebbyLaunch Team.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto font-medium italic"
          >
            Work with us as a Developer or Sales Executive and help us build the future of the web for small businesses.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-8 hover:border-[#cfcb11]/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#cfcb11]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#cfcb11]/10 transition-all" />
              
              <div className="w-16 h-16 bg-[#cfcb11]/10 rounded-2xl flex items-center justify-center text-[#cfcb11]">
                <role.icon size={32} />
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">{role.title}</h3>
                <p className="text-white/40 text-lg font-medium italic leading-relaxed">
                  {role.desc}
                </p>
              </div>

              <div className="space-y-4">
                {role.perks.map(perk => (
                  <div key={perk} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/60">
                    <CheckCircle2 size={16} className="text-[#cfcb11]" />
                    {perk}
                  </div>
                ))}
              </div>

              <Link 
                to={role.path}
                className="inline-flex items-center gap-3 bg-[#cfcb11] text-black px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(207,203,17,0.2)]"
              >
                Apply Now
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 px-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
              Interview <span className="text-[#cfcb11]">Process.</span>
            </h2>
            <p className="text-white/40 text-lg font-medium italic">
              Shortlisted candidates will be invited for an interview. Selection is based on skills, communication, and professionalism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Apply', desc: 'Fill out the application form with your details.' },
              { step: '02', title: 'Review', desc: 'Our team reviews your portfolio and experience.' },
              { step: '03', title: 'Interview', desc: 'A quick call to discuss your skills and fit.' }
            ].map((s, i) => (
              <div key={i} className="space-y-4 p-8 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="text-4xl font-black text-[#cfcb11] italic">{s.step}</div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter">{s.title}</h4>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
