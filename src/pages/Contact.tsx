import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, Shield, Globe } from 'lucide-react';
import SEO from '../components/SEO';
import { PROFESSIONAL_EMAIL } from '../constants';
import SmartInternationalForm from '../components/SmartInternationalForm';

export default function Contact() {
  return (
    <div className="pt-32 pb-20 px-6 sm:px-10 bg-black min-h-screen">
      <SEO 
        title="Contact WebbyLaunch – Premium Website Solutions" 
        description="Connect with WebbyLaunch for high-performance international web development. Smart form with country-based validation and localized pricing."
        type="business"
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-6 py-2 rounded-full border border-[#c7c42a]/30 bg-[#c7c42a]/5 text-[#c7c42a] text-[10px] font-black uppercase tracking-[0.4em]"
          >
            Project Protocol
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85]"
          >
            Ready to <span className="text-[#c7c42a]">Launch?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/40 text-lg font-medium leading-relaxed italic"
          >
            Experience our smart recruitment & project initiation system. <br className="hidden md:block" />
            Automatic region detection, localized pricing, and secure payment integrations.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Main Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl shadow-black shadow-[inset_0_0_100px_rgba(255,255,255,0.02)]"
          >
            <div className="p-2 sm:p-2">
              <SmartInternationalForm />
            </div>
          </motion.div>

          {/* Sidebar Information */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4 space-y-8"
          >
            {/* Direct Contact */}
            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Mail size={120} />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-[#c7c42a]">Direct Terminal</h3>
              <div className="space-y-4 relative z-10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Inquiry Pipeline</p>
                <a 
                  href={`mailto:${PROFESSIONAL_EMAIL}`}
                  className="block text-2xl font-black italic tracking-tighter text-white hover:text-[#c7c42a] transition-all break-all"
                >
                  {PROFESSIONAL_EMAIL}
                </a>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/60">
                <Clock size={14} className="text-[#c7c42a]" />
                Response: &lt; 2 Hours
              </div>
            </div>

            {/* Trust Markers */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#c7c42a]/10 text-[#c7c42a]">
                  <Shield size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Encrypted Data</h4>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-tight leading-relaxed italic">End-to-end security for all architectural project filings.</p>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#c7c42a]/10 text-[#c7c42a]">
                  <Globe size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Global Nodes</h4>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-tight leading-relaxed italic">Operational infrastructure in India, USA, and United Kingdom.</p>
                </div>
              </div>
            </div>

            {/* Interactive Card */}
            <div className="p-10 bg-gradient-to-br from-[#c7c42a] to-[#a8a523] rounded-[2.5rem] space-y-6 shadow-2xl shadow-[#c7c42a]/20">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">Fast-Track <br />Protocol</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-black/60 leading-relaxed italic">
                 Deploy your vision in record time. Our elite development squad is ready to synchronize with your business goals.
               </p>
               <div className="pt-4">
                 <div className="px-6 py-4 bg-black/10 rounded-2xl flex items-center justify-between border border-black/5">
                   <span className="text-[10px] font-black uppercase tracking-widest text-black">Status</span>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-900 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-black">Active</span>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
