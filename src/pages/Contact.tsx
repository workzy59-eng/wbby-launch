import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { PROFESSIONAL_EMAIL } from '../constants';

export default function Contact() {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('sent'), 1500);
  };

  return (
    <div className="pt-40 pb-20 px-10">
      <SEO title="Contact WebbyLaunch – Get Your Website Built Today" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
            Let's Start Your <span className="text-[#E6FF00]">Project.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-lg font-medium leading-relaxed">
            Have a question? Ready to launch? We're here to help you every step of the way.
          </p>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-8">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Get in Touch</h2>
            <p className="text-white/40 leading-relaxed mx-auto max-w-md">
              Reach out directly via Email. We typically respond within 2 hours.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="w-24 h-24 bg-[#E6FF00]/10 border border-[#E6FF00]/20 rounded-3xl flex items-center justify-center text-[#E6FF00] shadow-[0_0_50px_rgba(230,255,0,0.1)]">
              <Mail size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/20">Email Us</h4>
              <a 
                href={`mailto:${PROFESSIONAL_EMAIL}`}
                className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white hover:text-[#E6FF00] transition-colors"
              >
                {PROFESSIONAL_EMAIL}
              </a>
            </div>
            
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                <h5 className="text-[#E6FF00] font-black uppercase italic tracking-tighter">Fast Response</h5>
                <p className="text-white/40 text-xs font-medium italic">We reply to all inquiries within 2 hours during business hours.</p>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                <h5 className="text-[#E6FF00] font-black uppercase italic tracking-tighter">Expert Support</h5>
                <p className="text-white/40 text-xs font-medium italic">Direct access to our development and design team.</p>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                <h5 className="text-[#E6FF00] font-black uppercase italic tracking-tighter">Global Reach</h5>
                <p className="text-white/40 text-xs font-medium italic">Serving businesses across India and beyond.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
